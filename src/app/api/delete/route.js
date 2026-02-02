// Importa o SDK oficial do Backblaze B2
import B2 from "backblaze-b2";

// Cria a instância do cliente B2 com as credenciais
// ⚠️ Variáveis vêm do .env.local e nunca vão pro frontend
const b2 = new B2({
  applicationKeyId: process.env.B2_KEY_ID, // ID da Application Key
  applicationKey: process.env.B2_APP_KEY,  // Application Key (segredo)
});

// Handler da rota DELETE (/api/delete)
export async function DELETE(req) {

  // Lê o corpo da requisição (JSON)
  // Espera receber: { fileId, fileName }
  const { fileId, fileName } = await req.json();

  // Validação básica dos dados recebidos
  if (!fileId || !fileName) {
    return Response.json(
      { error: "Dados inválidos" },
      { status: 400 }
    );
  }

  // Autentica na API do Backblaze B2
  // Obrigatório antes de qualquer operação
  await b2.authorize();

  // Remove uma versão específica do arquivo
  // No B2, deletar exige fileId + fileName
  await b2.deleteFileVersion({
    fileId,   // ID único do arquivo no B2
    fileName, // Caminho/nome do arquivo no bucket
  });

  // Retorna sucesso para o frontend
  return Response.json({ ok: true });
}
