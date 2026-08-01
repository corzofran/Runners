import { Topbar } from "@/components/layout/topbar";
import { ChatPanel } from "@/components/shared/chat-panel";
import { requireAtleta } from "@/lib/session";

export default async function MensajesAtletaPage() {
  const session = await requireAtleta();
  return (
    <div>
      <Topbar titulo="Mensajes" subtitulo="Chat con tu entrenador" />
      <div className="p-6 lg:p-8">
        <ChatPanel miUsuarioId={session.sub} />
      </div>
    </div>
  );
}
