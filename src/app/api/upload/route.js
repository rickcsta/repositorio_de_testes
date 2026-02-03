import B2 from "backblaze-b2";
import sharp from "sharp";
import { readFile } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

const b2 = new B2({
  applicationKeyId: process.env.B2_KEY_ID,
  applicationKey: process.env.B2_APP_KEY,
});

// ----------------------------
// Utils
// ----------------------------
async function getMetaSafe(buf, label = "buffer") {
  try {
    return await sharp(buf, { failOnError: true }).metadata();
  } catch (e) {
    throw new Error(`Falha ao ler metadata de ${label}: ${e.message}`);
  }
}

// ----------------------------
// Load watermark (PNG)
// ----------------------------
async function loadWatermarkImage() {
  const possiblePaths = [
    path.join(process.cwd(), "public", "marca.png"),
    path.join(process.cwd(), "public", "marca-dagua.png"),
    path.join(process.cwd(), "public", "watermark.png"),
    path.join(process.cwd(), "public", "assets", "marca.png"),
    path.join(process.cwd(), "public", "images", "marca.png"),
    path.join(process.cwd(), "marca.png"),
  ];

  for (const filePath of possiblePaths) {
    if (existsSync(filePath)) {
      console.log(`✅ Marca d'água encontrada em: ${filePath}`);
      const buffer = await readFile(filePath);

      // Normaliza pra PNG com alpha (garante formato)
      const normalized = await sharp(buffer, { failOnError: true })
        .ensureAlpha()
        .png()
        .toBuffer();

      const meta = await getMetaSafe(normalized, "watermark(normalized)");
      console.log(`📐 Watermark: ${meta.width}x${meta.height} (${meta.format})`);

      return normalized;
    }
  }

  throw new Error("Marca d'água não encontrada. Coloque um PNG em /public/marca.png");
}

// ----------------------------
// Create single centered watermark overlay (resized to base)
// ----------------------------
async function createCenteredWatermarkOverlay(baseWidth, baseHeight, watermarkPng) {
  baseWidth = Math.floor(Number(baseWidth));
  baseHeight = Math.floor(Number(baseHeight));
  if (!baseWidth || !baseHeight) throw new Error(`Base inválida: ${baseWidth}x${baseHeight}`);

  const baseMin = Math.min(baseWidth, baseHeight);

  // ✅ Marca grande (75% do menor lado). Ajuste se quiser.
  const targetW = Math.max(70, Math.floor(baseMin * 0.75));

  // ✅ NÃO usa premultiply() para evitar incompatibilidade com versões do sharp
  let wm = await sharp(watermarkPng, { failOnError: true })
    .ensureAlpha()
    .resize({ width: targetW, fit: "inside", withoutEnlargement: true })
    .png()
    .toBuffer();

  // Garantia final: nunca maior que base
  const meta = await sharp(wm).metadata();
  if ((meta.width && meta.width > baseWidth) || (meta.height && meta.height > baseHeight)) {
    wm = await sharp(wm)
      .resize({
        width: Math.max(1, baseWidth - 10),
        height: Math.max(1, baseHeight - 10),
        fit: "inside",
        withoutEnlargement: true,
      })
      .png()
      .toBuffer();
  }

  return wm;
}

// ----------------------------
// Route
// ----------------------------
export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    console.log("📁 Campos:", Array.from(formData.keys()));
    console.log("📄 Arquivo:", file ? file.name : "não enviado");

    if (!file) {
      return Response.json(
        { error: "Arquivo não enviado", details: "Envie um arquivo usando o campo 'file' no FormData" },
        { status: 400 }
      );
    }

    if (!file.type?.startsWith("image/")) {
      return Response.json(
        { error: "Arquivo deve ser uma imagem", details: `Tipo recebido: ${file.type}` },
        { status: 400 }
      );
    }

    if (file.size > 20 * 1024 * 1024) {
      return Response.json(
        { error: "Arquivo muito grande", details: "Tamanho máximo: 20MB" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // valida input cedo
    const inputMeta = await getMetaSafe(buffer, "input");
    console.log("🧾 Input:", inputMeta.format, inputMeta.width, "x", inputMeta.height);

    if (!inputMeta.width || !inputMeta.height) {
      return Response.json({ error: "Imagem inválida ou corrompida" }, { status: 400 });
    }

    console.log("🔑 Autorizando Backblaze B2...");
    await b2.authorize();

    console.log("💧 Carregando watermark PNG...");
    const watermarkPng = await loadWatermarkImage();

    const timestamp = Date.now();
    const safeName = file.name.replace(/\s+/g, "-");

    // -------------------------------
    // 1) Upload ORIGINAL
    // -------------------------------
    console.log("📤 Upload original...");
    const { data: uploadUrlPrivado } = await b2.getUploadUrl({
      bucketId: process.env.B2_BUCKET_ID,
    });

    const originalFileName = `privado/${timestamp}-${safeName}`;

    await b2.uploadFile({
      uploadUrl: uploadUrlPrivado.uploadUrl,
      uploadAuthToken: uploadUrlPrivado.authorizationToken,
      fileName: originalFileName,
      data: buffer,
      contentType: file.type,
    });

    // -------------------------------
    // 2) Redimensiona (SEM degradar ainda)
    // -------------------------------
    console.log("🔄 Redimensionando...");
    const resizedBuffer = await sharp(buffer, { failOnError: true })
      .rotate()
      .resize({
        width: 1200,
        height: 800,
        fit: "inside",
        withoutEnlargement: true,
      })
      .toBuffer();

    const resizedMeta = await getMetaSafe(resizedBuffer, "resized");
    console.log("📐 Resized:", resizedMeta.width, "x", resizedMeta.height);

    // -------------------------------
    // 3) PIORA A QUALIDADE PRIMEIRO (gera base ruim)
    // -------------------------------
    console.log("🧨 Degradando qualidade (antes da marca d'água)...");
    const degradedBuffer = await sharp(resizedBuffer, { failOnError: true })
      .jpeg({
        quality: 20, // 👈 quanto menor, pior
        chromaSubsampling: "4:2:0",
        mozjpeg: true,
        progressive: false,
      })
      .toBuffer();

    const degradedMeta = await getMetaSafe(degradedBuffer, "degraded");
    console.log("📉 Degraded:", degradedMeta.width, "x", degradedMeta.height);

    // -------------------------------
    // 4) Cria watermark no tamanho do DEGRADADO
    // -------------------------------
    const wmOverlay = await createCenteredWatermarkOverlay(
      degradedMeta.width,
      degradedMeta.height,
      watermarkPng
    );

    // -------------------------------
    // 5) Aplica watermark no centro (DEPOIS da degradação)
    // -------------------------------
    console.log("🖌️ Aplicando watermark central (depois da degradação)...");
    const processedBuffer = await sharp(degradedBuffer, { failOnError: true })
      .composite([
        {
          input: wmOverlay,
          gravity: "center",
          blend: "over",
          opacity: 0.35,
        },
      ])
      // opcional: mantém a saída ruim também
      .jpeg({
        quality: 20,
        chromaSubsampling: "4:2:0",
        mozjpeg: true,
        progressive: false,
      })
      .toBuffer();

    // -------------------------------
    // 6) Upload público
    // -------------------------------
    console.log("📤 Upload público...");
    const { data: uploadUrlPublic } = await b2.getUploadUrl({
      bucketId: process.env.B2_BUCKET_ID,
    });

    const processedFileName = `publico/${timestamp}-${safeName}`;

    await b2.uploadFile({
      uploadUrl: uploadUrlPublic.uploadUrl,
      uploadAuthToken: uploadUrlPublic.authorizationToken,
      fileName: processedFileName,
      data: processedBuffer,
      contentType: "image/jpeg",
    });

    console.log("✅ Uploads concluídos!");

    return Response.json({
      success: true,
      message: "Imagem processada: degradada primeiro e depois marca d'água central",
      data: {
        original: originalFileName,
        processed: processedFileName,
        timestamp,
        order: "degrade -> watermark",
      },
    });
  } catch (error) {
    console.error("❌ Erro no processamento:", error);

    let errorMessage = "Erro interno no servidor";
    let statusCode = 500;

    const msg = String(error.message || "");
    if (msg.includes("authorize")) errorMessage = "Erro de autenticação com Backblaze B2";
    else if (msg.includes("sharp")) errorMessage = "Erro ao processar imagem";
    else if (msg.includes("ENOENT")) errorMessage = "Arquivo não encontrado";
    else if (msg.includes("upload")) errorMessage = "Erro ao fazer upload";
    else if (msg.includes("Marca d'água não encontrada")) {
      errorMessage = "Marca d'água não encontrada";
      statusCode = 500;
    }

    return Response.json(
      {
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: statusCode }
    );
  }
}

export async function GET() {
  return Response.json({
    message: "API de upload de imagens com marca d'água central",
    endpoint: "/api/upload",
    method: "POST",
    required_field: "file",
    watermark_info: "Coloque public/marca.png (PNG com transparência) para usar como marca d'água",
    note: "Ordem: primeiro degrada a qualidade, depois aplica a marca d'água no centro.",
  });
}
