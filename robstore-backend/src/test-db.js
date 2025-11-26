import { pool } from "./config/db.js";

try {
  const connection = await pool.getConnection();
  console.log("✅ Conectado correctamente a MySQL");
  connection.release();
} catch (error) {
  console.error("❌ Error al conectar a MySQL:", error);
}
