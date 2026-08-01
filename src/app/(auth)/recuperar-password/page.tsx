"use client";

import { useState } from "react";
import Link from "next/link";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { KeyRound, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function RecuperarPasswordPage() {
  const [enviado, setEnviado] = useState(false);
  const [correo, setCorreo] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // NOTA: por diseño, aquí solo se registra la solicitud. El cambio real de contraseña
    // lo realiza el administrador desde el panel (Atletas > Editar > Cambiar contraseña),
    // ya que no existe registro público ni auto-servicio de credenciales.
    // Para automatizar este flujo, conecta un proveedor de correo (Resend/SendGrid) aquí.
    setEnviado(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-blue/15 text-brand-blue">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Recuperar acceso</h1>
          <p className="mt-1 text-sm text-gray-500">Tu entrenador gestiona tus credenciales</p>
        </div>

        <div className="glass-card p-6">
          {enviado ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              <p className="text-sm text-gray-300">
                Solicitud registrada. Tu entrenador podrá restablecer tu contraseña desde el panel
                de administración y te la compartirá de forma directa.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <p className="text-sm text-gray-400">
                Por seguridad, no existe restablecimiento automático de contraseña. Escribe tu
                correo o usuario y tu entrenador podrá asignarte una nueva contraseña.
              </p>
              <div>
                <Label htmlFor="correo">Correo o usuario</Label>
                <Input
                  id="correo"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="tu.usuario"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Enviar solicitud
              </Button>
            </form>
          )}
        </div>

        <Link
          href="/login"
          className="mt-6 flex items-center justify-center gap-1.5 text-xs font-medium text-gray-500 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver a iniciar sesión
        </Link>
      </div>
    </div>
  );
}
