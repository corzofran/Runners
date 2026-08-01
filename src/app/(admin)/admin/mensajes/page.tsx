import { Topbar } from "@/components/layout/topbar";
import { ChatPanel } from "@/components/shared/chat-panel";
import { requireAdmin } from "@/lib/session";

export default async function MensajesAdminPage() {
  const session = await requireAdmin();
  return (
    <div>
      <Topbar titulo="Mensajes" subtitulo="Chat directo con tus atletas" />
      <div className="p-6 lg:p-8">
        <ChatPanel miUsuarioId={session.sub} />
      </div>
    </div>
  );
}
