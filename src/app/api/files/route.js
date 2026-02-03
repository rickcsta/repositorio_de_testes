import B2 from "backblaze-b2";

const b2 = new B2({
  applicationKeyId: process.env.B2_KEY_ID,
  applicationKey: process.env.B2_APP_KEY,
});

export async function GET() {
  try {
    // Autentica no Backblaze
    await b2.authorize();

    // Lista arquivos da pasta PRIVADO
    const { data: dataPrivado } = await b2.listFileNames({
      bucketId: process.env.B2_BUCKET_ID,
      prefix: "privado/",
      maxFileCount: 100,
    });

    // Lista arquivos da pasta PUBLIC
    const { data: dataPublic } = await b2.listFileNames({
      bucketId: process.env.B2_BUCKET_ID,
      prefix: "publico/",
      maxFileCount: 100,
    });

    // Retorna ambos os arrays separados
    return Response.json({
      privado: dataPrivado.files || [],
      publico: dataPublic.files || [],
    });

  } catch (err) {
    console.error("Erro ao listar arquivos:", err);
    return Response.json({ privado: [], publico: [] });
  }
}
