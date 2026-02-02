// Importa o SDK oficial do Backblaze B2
import B2 from "backblaze-b2";

// Cria a instância do cliente B2 com as credenciais
// ⚠️ Essas variáveis vêm do .env.local e não podem ir pro frontend
const b2 = new B2({
  applicationKeyId: process.env.B2_KEY_ID, // ID da Application Key
  applicationKey: process.env.B2_APP_KEY,  // Application Key (segredo)
});

// Handler da rota GET (/api/files)
export async function GET() {
  try {
    // Autentica na API do Backblaze B2
    // Obrigatório antes de qualquer operação
    await b2.authorize();

    // Lista os arquivos do bucket
    const { data } = await b2.listFileNames({
      bucketId: process.env.B2_BUCKET_ID, // ID do bucket
      prefix: "privado/",                  // Lista apenas arquivos dentro da pasta "photos/"
      maxFileCount: 100,                  // Limite de arquivos retornados
    });

    // Retorna somente o array de arquivos
    // Cada item contém: fileId, fileName, contentType, size, etc.
    return Response.json(data.files);

  } catch (err) {
    // Caso ocorra algum erro (credencial, rede, etc)
    console.error("Erro ao listar arquivos:", err);

    // Retorna array vazio para evitar quebrar o frontend
    return Response.json([]);
  }
}
