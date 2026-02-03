"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [filesPrivado, setFilesPrivado] = useState([]);
  const [filesPublico, setFilesPublico] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // listar arquivos das duas pastas
  async function loadFiles() {
    const res = await fetch("/api/files");
    const data = await res.json();

    // separa os arrays recebidos do backend
    setFilesPrivado(data.privado || []);
    setFilesPublico(data.publico || []);
  }

  useEffect(() => {
    loadFiles();
  }, []);

  // upload múltiplo
  async function upload() {
    if (!selectedFiles.length) return;

    setLoading(true);

    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append("file", file);

      await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
    }

    setLoading(false);
    setSelectedFiles([]);
    loadFiles();
  }

  // download
  function download(fileName) {
    window.open(`/api/download?file=${encodeURIComponent(fileName)}`);
  }

  // delete
  async function remove(file) {
    await fetch("/api/delete", {
      method: "DELETE",
      body: JSON.stringify({
        fileId: file.fileId,
        fileName: file.fileName,
      }),
    });

    loadFiles();
  }

  return (
    <main style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>Backblaze B2 — CRUD Básico</h1>

      <hr />

      {/* UPLOAD */}
      <h3>Upload</h3>
      <input
        type="file"
        multiple
        onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
      />
      <button onClick={upload} disabled={loading || selectedFiles.length === 0}>
        Enviar arquivos
      </button>
      {loading && <p>Enviando...</p>}

      <hr />

      {/* LISTA DE ARQUIVOS PRIVADOS */}
      <h3>Arquivos Privados</h3>
      {filesPrivado.length === 0 && <p>Nenhum arquivo privado.</p>}
      <ul>
        {filesPrivado.map(file => (
          <li key={file.fileId} style={{ marginBottom: 10 }}>
            {file.fileName.split("/").pop()}

            <button
              style={{ marginLeft: 10 }}
              onClick={() => download(file.fileName)}
            >
              Download
            </button>

            <button
              style={{ marginLeft: 5 }}
              onClick={() => remove(file)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      <hr />

      {/* LISTA DE ARQUIVOS PÚBLICOS */}
      <h3>Arquivos Públicos</h3>
      {filesPublico.length === 0 && <p>Nenhum arquivo público.</p>}
      <ul>
        {filesPublico.map(file => (
          <li key={file.fileId} style={{ marginBottom: 10 }}>
            {file.fileName.split("/").pop()}

            <button
              style={{ marginLeft: 10 }}
              onClick={() => download(file.fileName)}
            >
              Download
            </button>

            <button
              style={{ marginLeft: 5 }}
              onClick={() => remove(file)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
