// src/routes/checkout.routes.js
import express from "express";
import { pool } from "../config/db.js";
import { authRequired } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authRequired, async (req, res) => {
  const userId = req.user.id;

  try {
    // 1. Obtener carrito del usuario
    const [carrito] = await pool.query(
      `SELECT c.producto_id, c.cantidad, p.precio
       FROM carrito c
       JOIN productos p ON p.id = c.producto_id
       WHERE c.usuario_id = ?`,
      [userId]
    );

    if (carrito.length === 0) {
      return res.status(400).json({ message: "El carrito está vacío" });
    }

    // 2. Calcular total
    const total = carrito.reduce(
      (acc, item) => acc + item.precio * item.cantidad,
      0
    );

    // 3. Crear pedido
    const [pedido] = await pool.query(
      "INSERT INTO pedidos (usuario_id, total, estado) VALUES (?, ?, 'pendiente')",
      [userId, total]
    );

    const pedidoId = pedido.insertId;

    // 4. Guardar detalles del pedido
    const detalleQueries = carrito.map((item) =>
      pool.query(
        `INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, precio)
         VALUES (?, ?, ?, ?)`,
        [pedidoId, item.producto_id, item.cantidad, item.precio]
      )
    );

    await Promise.all(detalleQueries);

    // 5. Vaciar carrito
    await pool.query("DELETE FROM carrito WHERE usuario_id = ?", [userId]);

    res.json({
      message: "Pedido generado correctamente",
      pedidoId,
      total
    });

  } catch (err) {
    console.error("❌ Error en checkout:", err);
    res.status(500).json({ message: "Error en servidor" });
  }
});

export default router;
