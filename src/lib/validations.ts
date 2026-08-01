import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(3, "El usuario debe tener al menos 3 caracteres"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const crearAtletaSchema = z.object({
  nombre: z.string().min(2, "El nombre es obligatorio"),
  apellidos: z.string().min(2, "Los apellidos son obligatorios"),
  username: z.string().min(3, "El usuario debe tener al menos 3 caracteres"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  correo: z.string().email("Correo inválido").optional().or(z.literal("")),
  edad: z.coerce.number().int().min(5).max(100).optional(),
  sexo: z.enum(["MASCULINO", "FEMENINO", "OTRO"]).optional(),
  pesoKg: z.coerce.number().positive().optional(),
  estaturaCm: z.coerce.number().positive().optional(),
  fechaNacimiento: z.string().optional(),
  telefono: z.string().optional(),
  ciudad: z.string().optional(),
  objetivoDeportivo: z.string().optional(),
  nivel: z.enum(["PRINCIPIANTE", "INTERMEDIO", "AVANZADO", "ELITE"]).default("PRINCIPIANTE"),
  observacionesMedicas: z.string().optional(),
  contactoEmergenciaNombre: z.string().optional(),
  contactoEmergenciaTelefono: z.string().optional(),
});
export type CrearAtletaInput = z.infer<typeof crearAtletaSchema>;

export const editarAtletaSchema = crearAtletaSchema.partial().extend({
  nombre: z.string().min(2).optional(),
  apellidos: z.string().min(2).optional(),
});

export const crearEntrenamientoSchema = z.object({
  titulo: z.string().min(3, "El título es obligatorio"),
  descripcion: z.string().optional(),
  objetivo: z.string().optional(),
  fecha: z.string().min(1, "La fecha es obligatoria"),
  hora: z.string().optional(),
  duracionMin: z.coerce.number().int().positive().optional(),
  distanciaKm: z.coerce.number().positive().optional(),
  ritmoObjetivo: z.string().optional(),
  frecuenciaCardiaca: z.string().optional(),
  series: z.coerce.number().int().positive().optional(),
  repeticiones: z.coerce.number().int().positive().optional(),
  descansoSeg: z.coerce.number().int().positive().optional(),
  indicaciones: z.string().optional(),
  notasEntrenador: z.string().optional(),
  atletaIds: z.array(z.string()).min(1, "Selecciona al menos un atleta o todo el equipo"),
});
export type CrearEntrenamientoInput = z.infer<typeof crearEntrenamientoSchema>;

export const crearEventoSchema = z.object({
  titulo: z.string().min(3),
  tipo: z.enum(["CARRERA", "COMPETENCIA", "ENTRENAMIENTO_GRUPAL", "JUNTA"]),
  fecha: z.string().min(1),
  hora: z.string().optional(),
  lugar: z.string().optional(),
  latitud: z.coerce.number().optional(),
  longitud: z.coerce.number().optional(),
  descripcion: z.string().optional(),
});
export type CrearEventoInput = z.infer<typeof crearEventoSchema>;

export const actualizarAsignacionSchema = z.object({
  estado: z.enum(["PENDIENTE", "EN_PROCESO", "COMPLETADO"]).optional(),
  comentarioAtleta: z.string().optional(),
});
