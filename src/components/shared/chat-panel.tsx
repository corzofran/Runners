"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Send, Paperclip, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

type Conversacion = { usuarioId: string; nombre: string; noLeidos: number };
type Mensaje = {
  id: string;
  emisorId: string;
  contenido: string;
  archivoUrl?: string | null;
  archivoTipo?: string | null;
  creadoEn: string;
};

export function ChatPanel({ miUsuarioId }: { miUsuarioId: string }) {
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [activa, setActiva] = useState<Conversacion | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [texto, setTexto] = useState("");
  const [enviandoArchivo, setEnviandoArchivo] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cargarConversaciones = useCallback(async () => {
    const res = await fetch("/api/mensajes");
    if (res.ok) {
      const json = await res.json();
      setConversaciones(json.conversaciones ?? []);
    }
  }, []);

  const cargarHilo = useCallback(async (usuarioId: string) => {
    const res = await fetch(`/api/mensajes?con=${usuarioId}`);
    if (res.ok) setMensajes((await res.json()).mensajes ?? []);
  }, []);

  useEffect(() => {
    cargarConversaciones();
    const t = setInterval(cargarConversaciones, 8000);
    return () => clearInterval(t);
  }, [cargarConversaciones]);

  useEffect(() => {
    if (!activa) return;
    cargarHilo(activa.usuarioId);
    const t = setInterval(() => cargarHilo(activa.usuarioId), 4000);
    return () => clearInterval(t);
  }, [activa, cargarHilo]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [mensajes]);

  async function enviar() {
    if (!texto.trim() || !activa) return;
    const contenido = texto.trim();
    setTexto("");
    setMensajes((prev) => [
      ...prev,
      { id: `temp-${Date.now()}`, emisorId: miUsuarioId, contenido, creadoEn: new Date().toISOString() },
    ]);
    await fetch("/api/mensajes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receptorId: activa.usuarioId, contenido }),
    });
    cargarHilo(activa.usuarioId);
  }

  async function enviarArchivo(file: File) {
    if (!activa) return;
    setEnviandoArchivo(true);
    const fd = new FormData();
    fd.append("receptorId", activa.usuarioId);
    fd.append("contenido", "");
    fd.append("file", file);
    await fetch("/api/mensajes", { method: "POST", body: fd });
    await cargarHilo(activa.usuarioId);
    setEnviandoArchivo(false);
  }

  return (
    <div className="grid grid-cols-1 gap-0 overflow-hidden rounded-2xl border border-white/[0.08] md:grid-cols-[280px_1fr]" style={{ height: "70vh" }}>
      <div className="overflow-y-auto border-r border-white/[0.08] bg-white/[0.02]">
        {conversaciones.length === 0 && <p className="p-4 text-sm text-gray-500">Sin conversaciones aún.</p>}
        {conversaciones.map((c) => (
          <button
            key={c.usuarioId}
            onClick={() => setActiva(c)}
            className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors ${
              activa?.usuarioId === c.usuarioId ? "bg-brand-red/10 text-white" : "text-gray-300 hover:bg-white/[0.05]"
            }`}
          >
            <span className="truncate">{c.nombre}</span>
            {c.noLeidos > 0 && (
              <span className="ml-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-red px-1 text-[10px] font-bold text-white">
                {c.noLeidos}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-col bg-base-dark">
        {!activa ? (
          <div className="flex flex-1 items-center justify-center text-sm text-gray-500">
            Selecciona una conversación
          </div>
        ) : (
          <>
            <div className="border-b border-white/[0.08] px-4 py-3 text-sm font-medium text-white">{activa.nombre}</div>
            <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto p-4">
              {mensajes.map((m) => {
                const esMio = m.emisorId === miUsuarioId;
                return (
                  <div key={m.id} className={`flex ${esMio ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] overflow-hidden rounded-2xl text-sm ${
                        esMio ? "bg-brand-red text-white" : "bg-white/[0.06] text-gray-200"
                      }`}
                    >
                      {m.archivoUrl && m.archivoTipo === "IMAGEN" && (
                        <a href={m.archivoUrl} target="_blank" rel="noopener noreferrer">
                          <img src={m.archivoUrl} alt="Evidencia enviada" className="max-h-64 w-full object-cover" />
                        </a>
                      )}
                      {m.archivoUrl && m.archivoTipo === "PDF" && (
                        <a
                          href={m.archivoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3.5 py-2.5 underline"
                        >
                          <FileText className="h-4 w-4 shrink-0" /> Ver documento PDF
                        </a>
                      )}
                      {m.contenido && !(m.archivoTipo === "IMAGEN" && m.contenido === "📷 Foto") && (
                        <p className="px-3.5 py-2">{m.contenido}</p>
                      )}
                    </div>
                  </div>
                );
              })}
              {enviandoArchivo && <p className="text-center text-xs text-gray-500">Enviando archivo...</p>}
            </div>
            <div className="flex items-center gap-2 border-t border-white/[0.08] p-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) enviarArchivo(file);
                  e.target.value = "";
                }}
              />
              <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} title="Enviar evidencia">
                <Paperclip className="h-4 w-4" />
              </Button>
              <input
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && enviar()}
                placeholder="Escribe un mensaje..."
                className="input-field flex-1"
              />
              <Button size="icon" onClick={enviar}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
