import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

/**
 * NOTA IMPORTANTE PARA PRODUCCIÓN (Railway):
 * El sistema de archivos de Railway es efímero — cualquier archivo guardado en disco
 * se pierde en cada nuevo deploy o reinicio del contenedor. Para producción, sustituye
 * este handler por una subida directa a almacenamiento persistente (Cloudflare R2,
 * AWS S3, o Supabase Storage) y guarda solo la URL resultante en el modelo `Archivo`.
 * Esta ruta queda funcional para desarrollo local mientras tanto.
 */

const TIPOS_PERMITIDOS: Record<string, "PDF" | "VIDEO" | "IMAGEN"> = {
  "application/pdf": "PDF",
  "video/mp4": "VIDEO",
  "video/quicktime": "VIDEO",
  "image/png": "IMAGEN",
  "image/jpeg": "IMAGEN",
  "image/webp": "IMAGEN",
};

const MAX_BYTES = 25 * 1024 * 1024; // 25MB

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const entrenamientoId = formData.get("entrenamientoId") as string | null;
  const asignacionId = formData.get("asignacionId") as string | null;

  if (!file) return NextResponse.json({ error: "No se envió ningún archivo" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "El archivo supera 25MB" }, { status: 413 });

  const tipo = TIPOS_PERMITIDOS[file.type];
  if (!tipo) return NextResponse.json({ error: "Tipo de archivo no permitido" }, { status: 415 });

  const bytes = Buffer.from(await file.arrayBuffer());
  const nombreArchivo = `${randomUUID()}-${file.name}`.replace(/\s+/g, "-");
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, nombreArchivo), bytes);

  const archivo = await prisma.archivo.create({
    data: {
      tipo,
      url: `/uploads/${nombreArchivo}`,
      nombre: file.name,
      entrenamientoId: entrenamientoId || null,
      asignacionId: asignacionId || null,
      subidoPorId: session.sub,
    },
  });

  return NextResponse.json({ archivo }, { status: 201 });
}
