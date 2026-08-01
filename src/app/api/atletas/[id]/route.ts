import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { editarAtletaSchema } from "@/lib/validations";
import { hashPassword } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const atleta = await prisma.atleta.findUnique({
    where: { id: params.id },
    include: {
      usuario: { select: { username: true, correo: true, estado: true, ultimaConexion: true } },
      estadisticas: true,
      asignaciones: {
        include: { entrenamiento: true },
        orderBy: { creadoEn: "desc" },
        take: 10,
      },
    },
  });

  if (!atleta) return NextResponse.json({ error: "Atleta no encontrado" }, { status: 404 });
  return NextResponse.json({ atleta });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);

  // Acciones rápidas de estado (suspender / reactivar)
  if (body?.accion === "suspender" || body?.accion === "reactivar") {
    const atleta = await prisma.atleta.findUnique({ where: { id: params.id } });
    if (!atleta) return NextResponse.json({ error: "Atleta no encontrado" }, { status: 404 });

    await prisma.usuario.update({
      where: { id: atleta.usuarioId },
      data: { estado: body.accion === "suspender" ? "SUSPENDIDO" : "ACTIVO" },
    });
    return NextResponse.json({ ok: true });
  }

  // Cambio de contraseña
  if (body?.nuevaPassword) {
    if (typeof body.nuevaPassword !== "string" || body.nuevaPassword.length < 8) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 });
    }
    const atleta = await prisma.atleta.findUnique({ where: { id: params.id } });
    if (!atleta) return NextResponse.json({ error: "Atleta no encontrado" }, { status: 404 });

    const passwordHash = await hashPassword(body.nuevaPassword);
    await prisma.usuario.update({ where: { id: atleta.usuarioId }, data: { passwordHash } });
    return NextResponse.json({ ok: true });
  }

  const parsed = editarAtletaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const data = parsed.data;

  const atleta = await prisma.atleta.update({
    where: { id: params.id },
    data: {
      nombre: data.nombre,
      apellidos: data.apellidos,
      edad: data.edad,
      sexo: data.sexo,
      pesoKg: data.pesoKg,
      estaturaCm: data.estaturaCm,
      fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : undefined,
      telefono: data.telefono,
      ciudad: data.ciudad,
      objetivoDeportivo: data.objetivoDeportivo,
      nivel: data.nivel,
      observacionesMedicas: data.observacionesMedicas,
      contactoEmergenciaNombre: data.contactoEmergenciaNombre,
      contactoEmergenciaTelefono: data.contactoEmergenciaTelefono,
    },
  });

  if (data.correo) {
    await prisma.usuario.update({ where: { id: atleta.usuarioId }, data: { correo: data.correo } });
  }

  return NextResponse.json({ atleta });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const atleta = await prisma.atleta.findUnique({ where: { id: params.id } });
  if (!atleta) return NextResponse.json({ error: "Atleta no encontrado" }, { status: 404 });

  // Eliminar el usuario elimina en cascada al atleta (ver schema.prisma)
  await prisma.usuario.delete({ where: { id: atleta.usuarioId } });

  return NextResponse.json({ ok: true });
}
