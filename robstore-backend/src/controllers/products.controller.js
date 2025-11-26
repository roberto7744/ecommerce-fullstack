// src/controllers/products.controller.js
import { pool } from "../config/db.js";

export const getProducts = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, nombre, descripcion, precio, stock FROM productos");
    res.json(rows);
  } catch (err) {
    console.error("Error getProducts:", err);
    res.status(500).json({ message: "Error interno" });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { nombre, descripcion = "", precio = 0, stock = 0 } = req.body;

    if (!nombre || precio == null) {
      return res.status(400).json({ message: "Nombre y precio son obligatorios" });
    }

    const [result] = await pool.query(
      "INSERT INTO productos (nombre, descripcion, precio, stock) VALUES (?, ?, ?, ?)",
      [nombre, descripcion, precio, stock]
    );

    res.status(201).json({ message: "Producto creado", productId: result.insertId });
  } catch (err) {
    console.error("Error createProduct:", err);
    res.status(500).json({ message: "Error interno" });
  }
};
