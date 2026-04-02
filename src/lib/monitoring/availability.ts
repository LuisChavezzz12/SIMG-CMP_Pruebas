import { db } from "../db"; // Importa tu instancia de base de datos
import { monitoreoInAuditoria } from "../schema/schema";
import { sql } from "drizzle-orm";

export async function registrarHeartbeat() {
    const inicio = performance.now();
    
    try {
        // Ping ultra rápido a Neon
        await db.execute(sql`SELECT 1`);
        const fin = performance.now();
        const latencia = (fin - inicio).toFixed(2);

        // Registro de éxito
        await db.insert(monitoreoInAuditoria).values({
            tipoEvento: 'HEARTBEAT',
            valor: latencia.toString(),
            metadatos: { estado: 'online', msg: 'Conexión exitosa con Neon' }
        });

        return { online: true, ms: latencia };
    } catch (error) {
        // Registro de fallo
        await db.insert(monitoreoInAuditoria).values({
            tipoEvento: 'HEARTBEAT',
            valor: "0",
            metadatos: { 
                estado: 'offline', 
                error: error instanceof Error ? error.message : 'Error desconocido' 
            }
        });

        return { online: false, error };
    }
}