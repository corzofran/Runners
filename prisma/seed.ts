import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminUsername = process.env.ADMIN_USERNAME ?? "corzo.fran";
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || adminPassword.length < 8) {
    throw new Error(
      "ADMIN_PASSWORD no está definido (o es demasiado corto) en tus variables de entorno. " +
        "Define una contraseña segura de al menos 8 caracteres antes de correr el seed."
    );
  }

  const rolAdmin = await prisma.rol.upsert({
    where: { nombre: "ADMINISTRADOR" },
    update: {},
    create: { nombre: "ADMINISTRADOR" },
  });

  await prisma.rol.upsert({
    where: { nombre: "ATLETA" },
    update: {},
    create: { nombre: "ATLETA" },
  });

  const existing = await prisma.usuario.findUnique({ where: { username: adminUsername } });
  if (existing) {
    console.log(`El usuario administrador "${adminUsername}" ya existe. No se modificó.`);
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.usuario.create({
    data: {
      username: adminUsername,
      passwordHash,
      rolId: rolAdmin.id,
      estado: "ACTIVO",
    },
  });

  console.log(`Usuario administrador creado: ${admin.username} (id: ${admin.id})`);
  console.log("Recuerda: la contraseña nunca se guarda en el repositorio, solo en tus variables de entorno.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
