import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { crearAtletaSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/rate-limit";

// Registro público abierto: cualquiera con el link puede enviar su solicitud,
// pero el usuario queda en estado PENDIENTE hasta que un administrador lo apruebe.
// No puede iniciar sesión hasta la aprobación (ver /api/auth/login).
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  const rate = checkRateLimit(`registro:${ip}`, 5, 60_000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Demasiados intentos. Intenta de nuevo en un minuto." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = crearAtletaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const existente = await prisma.usuario.findUnique({ where: { username: data.username } });
  if (existente) {
    return NextResponse.json({ error: "Ese nombre de usuario ya está en uso" }, { status: 409 });
  }

  const rolAtleta = await prisma.rol.findUnique({ where: { nombre: "ATLETA" } });
  if (!rolAtleta) {
    return NextResponse.json({ error: "El sistema aún no está listo para registros. Intenta más tarde." }, { status: 500 });
  }

  const passwordHash = await hashPassword(data.password);

  const atleta = await prisma.$transaction(async (tx) => {
    const usuario = await tx.usuario.create({
      data: {
        username: data.username,
        correo: data.correo || null,
        passwordHash,
        rolId: rolAtleta.id,
        estado: "PENDIENTE",
      },
    });

    const nuevoAtleta = await tx.atleta.create({
      data: {
        usuarioId: usuario.id,
        nombre: data.nombre,
        apellidos: data.apellidos,
        edad: data.edad,
        sexo: data.sexo,
        pesoKg: data.pesoKg,
        estaturaCm: data.estaturaCm,
        fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : null,
        telefono: data.telefono,
        ciudad: data.ciudad,
        objetivoDeportivo: data.objetivoDeportivo,
        nivel: data.nivel,
        observacionesMedicas: data.observacionesMedicas,
        contactoEmergenciaNombre: data.contactoEmergenciaNombre,
        contactoEmergenciaTelefono: data.contactoEmergenciaTelefono,
      },
    });

    await tx.estadistica.create({ data: { atletaId: nuevoAtleta.id } });

    return nuevoAtleta;
  });

  // Notifica a TODOS los administradores (normalmente uno, pero soporta varios)
  const admins = await prisma.usuario.findMany({ where: { rol: { nombre: "ADMINISTRADOR" } } });
  await prisma.notificacion.createMany({
    data: admins.map((admin) => ({
      usuarioId: admin.id,
      tipo: "SISTEMA" as const,
      titulo: "Nueva solicitud de registro",
      mensaje: `${data.nombre} ${data.apellidos} quiere unirse al equipo`,
      enlace: "/admin/atletas?filtro=pendientes",
    })),
  });

  return NextResponse.json({ ok: true, atletaId: atleta.id }, { status: 201 });
}
