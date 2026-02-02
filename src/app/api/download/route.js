// Importa o SDK oficial do Backblaze B2
import B2 from "backblaze-b2";

// Cria a instância do cliente B2 com as credenciais
// ⚠️ Essas variáveis vêm do .env.local e não podem ir pro frontend
const b2 = new B2({
  applicationKeyId: process.env.B2_KEY_ID, // ID da Application Key
  applicationKey: process.env.B2_APP_KEY,  // Application Key (segredo)
});

// Handler da rota GET (/api/download)
export async function GET(req) {

  // Extrai os parâmetros da URL
  // Ex: /api/download?file=photos/123.jpg
  const { searchParams } = new URL(req.url);

  // Obtém o nome do arquivo a ser baixado
  const fileName = searchParams.get("file");

  // Se o nome do arquivo não foi informado, retorna erro
  if (!fileName) {
    return Response.json(
      { error: "Arquivo não informado" },
      { status: 400 }
    );
  }

  // Autentica na API do Backblaze B2
  // Obrigatório antes de qualquer operação
  await b2.authorize();

  // Faz o download do arquivo pelo nome
  // responseType "arraybuffer" retorna o binário bruto
  const { data } = await b2.downloadFileByName({
    bucketName: process.env.B2_BUCKET_NAME, // Nome do bucket
    fileName,                               // Caminho completo do arquivo
    responseType: "arraybuffer",            // Retorna como Buffer/ArrayBuffer
  });

  // Retorna o arquivo como resposta HTTP
  // Content-Disposition força o download no navegador
  return new Response(data, {
    headers: {
      "Content-Disposition": `attachment; filename="${fileName.split("/").pop()}"`,
    },
  });
}
