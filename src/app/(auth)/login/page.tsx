"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";
import { Zap, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    setServerError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.error ?? "No se pudo iniciar sesión");
        return;
      }
      const redirect = params.get("redirect");
      router.push(redirect || json.redirect);
      router.refresh();
    } catch {
      setServerError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-brand-red/10 blur-[120px]" />

      <div className="relative w-full max-w-sm animate-fade-up">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-red shadow-glow">
            <Zap className="h-6 w-6 text-white" fill="white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Bienvenido de vuelta</h1>
          <p className="mt-1 text-sm text-gray-500">Entra con tu usuario y contraseña asignados</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="glass-card space-y-4 p-6">
          {serverError && (
            <div className="rounded-xl border border-brand-red/20 bg-brand-red/10 px-3 py-2 text-sm text-brand-red-light">
              {serverError}
            </div>
          )}

          <div>
            <Label htmlFor="username">Usuario</Label>
            <Input id="username" placeholder="corzo.fran" autoComplete="username" {...register("username")} />
            <FieldError message={errors.username?.message} />
          </div>

          <div>
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <FieldError message={errors.password?.message} />
          </div>

          <div className="flex justify-end">
            <Link href="/recuperar-password" className="text-xs font-medium text-gray-500 hover:text-brand-red-light">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-600">
          ¿Eres nuevo en el equipo?{" "}
          <Link href="/registro" className="font-medium text-brand-red-light hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
