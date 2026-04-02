import { pgTable, pgSchema, foreignKey, serial, varchar, text, integer, date, numeric, boolean, unique, timestamp, index, jsonb} from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const clinica = pgSchema("clinica");
export const seguridad = pgSchema("seguridad");
export const academia = pgSchema("academia");
export const auditoria = pgSchema("auditoria");


export const cursosInAcademia = academia.table("cursos", {
	idCurso: serial("id_curso").primaryKey().notNull(),
	tituloCurso: varchar("titulo_curso", { length: 200 }).notNull(),
	descripcion: text(),
	idInstructor: integer("id_instructor"),
	categoria: varchar({ length: 50 }),
	fechaInicio: date("fecha_inicio"),
	fechaFin: date("fecha_fin"),
	horario: varchar({ length: 50 }),
	modalidad: varchar({ length: 20 }),
	dirigidoA: varchar("dirigido_a", { length: 50 }),
	cupoMaximo: integer("cupo_maximo"),
	ubicacion: varchar({ length: 150 }),
	costo: numeric({ precision: 10, scale:  2 }).default('0.00'),
	urlImagenPortada: text("url_imagen_portada"),
	activo: boolean().default(true),
	cuposOcupados: integer("cupos_ocupados").default(0),
}, (table) => [
	foreignKey({
			columns: [table.idInstructor],
			foreignColumns: [medicosInClinica.idMedico],
			name: "cursos_id_instructor_fkey"
		}),
]);

export const academiaInfantilInAcademia = academia.table("academia_infantil", {
	idGuia: serial("id_guia").primaryKey().notNull(),
	tituloGuia: varchar("titulo_guia", { length: 255 }).notNull(),
	descripcionCorta: text("descripcion_corta"),
	idAutor: integer("id_autor"),
	fechaPublicacion: date("fecha_publicacion").default(sql`CURRENT_DATE`),
	urlImagen: text("url_imagen"),
	etiquetas: text(),
	descripcionLarga: text("descripcion_larga"),
	activo: boolean().default(true),
}, (table) => [
	foreignKey({
			columns: [table.idAutor],
			foreignColumns: [medicosInClinica.idMedico],
			name: "academia_infantil_id_autor_fkey"
		}),
]);

export const publicacionesInAcademia = academia.table("publicaciones", {
	idPublicacion: serial("id_publicacion").primaryKey().notNull(),
	tituloNoticia: varchar("titulo_noticia", { length: 255 }).notNull(),
	resumenBajada: text("resumen_bajada"),
	idAutor: integer("id_autor"),
	fechaPublicacion: date("fecha_publicacion").default(sql`CURRENT_DATE`),
	etiquetas: text(),
	urlImagen: text("url_imagen"),
	contenidoCompleto: text("contenido_completo"),
	activo: boolean().default(true),
}, (table) => [
	foreignKey({
			columns: [table.idAutor],
			foreignColumns: [medicosInClinica.idMedico],
			name: "publicaciones_id_autor_fkey"
		}),
]);

export const usuariosInSeguridad = seguridad.table("usuarios", {
	id: serial().primaryKey().notNull(),
	nombre: text().notNull(),
	apellidoPaterno: text().notNull(),
	apellidoMaterno: text(),
	edad: integer().notNull(),
	sexo: text().notNull(),
	telefono: text().notNull(),
	correo: text().notNull(),
	contrasena: text().notNull(),
	rolId: integer("rol_id").notNull(),
	resetToken: text("reset_token"),
	resetTokenExpiry: timestamp("reset_token_expiry", { mode: 'string' }),
	intentosFallidos: integer("intentos_fallidos").default(0),
	bloqueadoHasta: timestamp("bloqueado_hasta", { mode: 'string' }),
	versionToken: integer("version_token").default(1),
	mfaHabilitado: boolean("mfa_habilitado").default(false),
	secretoMfa: text("secreto_mfa"),
	activo: boolean().default(true),
}, (table) => [
	foreignKey({
			columns: [table.rolId],
			foreignColumns: [rolesInSeguridad.id],
			name: "usuarios_rol_id_roles_id_fk"
		}),
	unique("usuarios_correo_unique").on(table.correo),
]);

export const rolesInSeguridad = seguridad.table("roles", {
	id: serial().primaryKey().notNull(),
	nombre: text().notNull(),
}, (table) => [
	unique("roles_nombre_unique").on(table.nombre),
]);

export const backupsInAuditoria = auditoria.table("backups", {
	id: serial().primaryKey().notNull(),
	fecha: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	tipo: varchar({ length: 20 }).notNull(),
	"tamaño": varchar("tamaño", { length: 20 }),
	archivoUrl: text("archivo_url"),
	estado: varchar({ length: 20 }).default('exitoso'),
}, (table) => [
	index("idx_backups_fecha").using("btree", table.fecha.desc().nullsFirst().op("timestamp_ops")),
	index("idx_backups_tipo").using("btree", table.tipo.asc().nullsLast().op("text_ops")),
]);

export const intentosRecuperacionInAuditoria = auditoria.table("intentos_recuperacion", {
	id: serial().primaryKey().notNull(),
	identificador: text().notNull(),
	conteo: integer().default(0),
	ultimoIntento: timestamp("ultimo_intento", { mode: 'string' }).defaultNow(),
	bloqueadoHasta: timestamp("bloqueado_hasta", { mode: 'string' }),
});

export const nosotrosInClinica = clinica.table("nosotros", {
	id: serial().primaryKey().notNull(),
	mision: text().notNull(),
	vision: text().notNull(),
	valores: text().array().notNull(),
	nuestraHistoria: text("nuestra_historia").notNull(),
	compromiso: text().notNull(),
	urlImagen: text("url_imagen").default('/pediatric-illustration.png'),
});

export const medicosInClinica = clinica.table("medicos", {
	idMedico: serial("id_medico").primaryKey().notNull(),
	nombres: varchar({ length: 100 }).notNull(),
	apellidoPaterno: varchar("apellido_paterno", { length: 100 }).notNull(),
	apellidoMaterno: varchar("apellido_materno", { length: 100 }),
	especialidad: varchar({ length: 100 }),
	hospitalClinica: varchar("hospital_clinica", { length: 150 }),
	direccion: text(),
	urlFoto: varchar("url_foto", { length: 255 }),
	activo: boolean().default(true),
});

export const serviciosInClinica = clinica.table("servicios", {
	idServicio: serial("id_servicio").primaryKey().notNull(),
	tituloServicio: varchar("titulo_servicio", { length: 150 }).notNull(),
	descripcion: text(),
	ubicacion: varchar({ length: 200 }),
	urlImage: text("url_image"),
	textoAlt: varchar("texto_alt", { length: 150 }),
	disenoTipo: varchar("diseno_tipo", { length: 20 }).default('vertical'),
	activo: boolean().default(true),
});

export const monitoreoInAuditoria = auditoria.table("monitoreo", {
    id: serial().primaryKey().notNull(),
    tipoEvento: varchar("tipo_evento", { length: 50 }).notNull(), // 'HEARTBEAT', 'LATENCY', 'SECURITY'
    valor: numeric({ precision: 10, scale: 2 }), // Para latencia en ms o tamaño en MB
    metadatos: jsonb("metadatos"), // Aquí guardaremos el error o info extra
    usuarioId: integer("usuario_id"), // Para el punto 4 (Seguridad/Auditoría)
    fechaCreacion: timestamp("fecha_creacion").defaultNow(),
}, (table) => [
    foreignKey({
        columns: [table.usuarioId],
        foreignColumns: [usuariosInSeguridad.id],
        name: "monitoreo_usuario_id_fk"
    }),
    index("idx_monitoreo_tipo").on(table.tipoEvento),
    index("idx_monitoreo_fecha").on(table.fechaCreacion),
]);