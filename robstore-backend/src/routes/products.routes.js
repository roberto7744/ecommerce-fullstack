// src/routes/products.routes.js
import { Router } from "express";
import { getProducts, createProduct } from "../controllers/products.controller.js";
import { authRequired } from "../middlewares/auth.middleware.js";

const router = Router();

// GET /api/products  -> público
router.get("/", getProducts);

// POST /api/products -> protegido (usuario logueado)
router.post("/", authRequired, createProduct);

export default router;
