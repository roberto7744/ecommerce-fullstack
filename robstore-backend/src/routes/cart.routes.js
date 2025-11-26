// src/routes/cart.routes.js
import express from "express";
import { pool } from "../config/db.js";
import { authRequired } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Agregar al carrito
router.post("/", authRequired, async (req, res) => {
  try {
    const { producto_id, cantidad } = req.body;
    const userId = req.user.id;

    if (!producto_id || !cantidad) {
      return res.status(400).json({ message: "producto_id y cantidad son obligatorios" });
    }

    // Ver si ya existe ese producto en el carrito
    const [existe] = await pool.query(
      "SELECT id, cantidad FROM carrito WHERE usuario_id = ? AND producto_id = ?",
      [userId, producto_id]
    );

    if (existe.length > 0) {
      // Si ya existe, solo aumentar cantidad
      await pool.query(
        "UPDATE carrito SET cantidad = cantidad + ? WHERE id = ?",
        [cantidad, existe[0].id]
      );

      return res.json({ message: "Cantidad actualizada en el carrito" });
    }

    // Insertar nuevo item
    await pool.query(
      "INSERT INTO carrito (usuario_id, producto_id, cantidad) VALUES (?, ?, ?)",
      [userId, producto_id, cantidad]
    );

    res.json({ message: "Producto agregado al carrito" });

  } catch (err) {
    console.error("❌ Error al agregar al carrito:", err);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// Obtener carrito del usuario
router.get("/", authRequired, async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT c.id, c.cantidad, p.nombre, p.precio 
       FROM carrito c
       JOIN productos p ON p.id = c.producto_id
       WHERE c.usuario_id = ?`,
      [userId]
    );

    res.json(rows);

  } catch (err) {
    console.error("❌ Error al obtener carrito:", err);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

export default router;
