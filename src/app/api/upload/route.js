// Importa o SDK oficial do Backblaze B2
import B2 from "backblaze-b2";

// Cria a instância do cliente B2 usando as credenciais
// ⚠️ Essas variáveis vêm do .env.local e NUNCA vão pro frontend
const b2 = new B2({
  applicationKeyId: process.env.B2_KEY_ID,   // ID da Application Key
  applicationKey: process.env.B2_APP_KEY,    // Application Key (segredo)
});

// Handler da rota POST (/api/upload)
export async function POST(req) {

  // Lê os dados enviados como multipart/form-data
  // (usado para upload de arquivos)
  const formData = await req.formData();

  // Recupera o arquivo enviado com a chave "file"
  const file = formData.get("file");

  // Se nenhum arquivo foi enviado, retorna erro
  if (!file) {
    return Response.json(
      { error: "Arquivo não enviado" },
      { status: 400 }
    );
  }

  // Autentica na API do Backblaze B2
  // Necessário antes de qualquer operação
  await b2.authorize();

  // Solicita uma URL temporária de upload para o bucket
  // O B2 exige essa etapa antes de enviar arquivos
  const { data: uploadUrl } = await b2.getUploadUrl({
    bucketId: process.env.B2_BUCKET_ID, // ID do bucket de destino
  });

  // Converte o arquivo recebido para Buffer
  // O SDK do B2 trabalha com Buffer, não com Blob
  const buffer = Buffer.from(await file.arrayBuffer());

  // Faz o upload do arquivo para o Backblaze
  const { data } = await b2.uploadFile({
    uploadUrl: uploadUrl.uploadUrl,              // URL temporária de upload
    uploadAuthToken: uploadUrl.authorizationToken, // Token de autorização
    fileName: `photos/${Date.now()}-${file.name}`, // Caminho + nome do arquivo
    data: buffer,                                // Conteúdo do arquivo
    contentType: file.type,                      // Tipo MIME (image/jpeg, etc)
  });

  // Retorna sucesso para o frontend
  // Esses dados podem ser usados para listar ou salvar no banco
  return Response.json({
    ok: true,
    fileId: data.fileId,     // ID único do arquivo no B2
    fileName: data.fileName, // Nome/caminho salvo no bucket
  });
}
