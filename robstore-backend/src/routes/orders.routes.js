// src/routes/cart.routes.js
import { Router } from "express";
import { pool } from "../config/db.js";
import { authRequired } from "../middlewares/auth.middleware.js";

const router = Router();

// Obtener productos del carrito del usuario
router.get("/", authRequired, async (req, res) => {
  try {
    const userId = req.user.id;

    const [items] = await pool.query(
      `SELECT c.id, c.producto_id, p.nombre, p.precio, c.cantidad
       FROM carrito c
       JOIN productos p ON p.id = c.producto_id
       WHERE c.usuario_id = ?`,
      [userId]
    );

    res.json(items);
  } catch (err) {
    console.error("❌ Error obteniendo carrito:", err);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// Agregar producto al carrito
router.post("/", authRequired, async (req, res) => {
  try {
    const userId = req.user.id;
    const { producto_id, cantidad } = req.body;

    if (!producto_id || !cantidad) {
      return res.status(400).json({ message: "producto_id y cantidad son requeridos" });
    }

    // verificar si ya existe en el carrito
    const [exists] = await pool.query(
      "SELECT id, cantidad FROM carrito WHERE usuario_id = ? AND producto_id = ?",
      [userId, producto_id]
    );

    if (exists.length > 0) {
      // actualizar cantidad
      const nuevaCantidad = exists[0].cantidad + cantidad;
      await pool.query(
        "UPDATE carrito SET cantidad = ? WHERE id = ?",
        [nuevaCantidad, exists[0].id]
      );

      return res.json({ message: "Cantidad actualizada" });
    }

    // si no existe, agregarlo
    await pool.query(
      "INSERT INTO carrito (usuario_id, producto_id, cantidad) VALUES (?, ?, ?)",
      [userId, producto_id, cantidad]
    );

    res.json({ message: "Producto agregado al carrito" });
  } catch (err) {
    console.error("❌ Error agregando al carrito:", err);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// Eliminar un ítem del carrito
router.delete("/:id", authRequired, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await pool.query(
      "DELETE FROM carrito WHERE id = ? AND usuario_id = ?",
      [id, userId]
    );

    res.json({ message: "Ítem eliminado" });
  } catch (err) {
    console.error("❌ Error eliminando ítem:", err);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

export default router;
