import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { crearAtletaSchema } from "@/lib/validations";
import { hashPassword } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const q = req.nextUrl.searchParams.get("q")?.trim();
  const nivel = req.nextUrl.searchParams.get("nivel");

  const atletas = await prisma.atleta.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { nombre: { contains: q, mode: "insensitive" } },
                { apellidos: { contains: q, mode: "insensitive" } },
                { ciudad: { contains: q, mode: "insensitive" } },
              ],
            }
          : {},
        nivel ? { nivel: nivel as any } : {},
      ],
    },
    include: {
      usuario: { select: { username: true, estado: true, ultimaConexion: true } },
      estadisticas: true,
    },
    orderBy: { creadoEn: "desc" },
  });

  return NextResponse.json({ atletas });
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = crearAtletaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const data = parsed.data;

  const existente = await prisma.usuario.findUnique({ where: { username: data.username } });
  if (existente) {
    return NextResponse.json({ error: "Ese nombre de usuario ya está en uso" }, { status: 409 });
  }

  const rolAtleta = await prisma.rol.findUnique({ where: { nombre: "ATLETA" } });
  if (!rolAtleta) {
    return NextResponse.json({ error: "Rol ATLETA no configurado. Corre el seed." }, { status: 500 });
  }

  const passwordHash = await hashPassword(data.password);

  const atleta = await prisma.$transaction(async (tx) => {
    const usuario = await tx.usuario.create({
      data: {
        username: data.username,
        correo: data.correo || null,
        passwordHash,
        rolId: rolAtleta.id,
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

  return NextResponse.json({ atleta }, { status: 201 });
}
