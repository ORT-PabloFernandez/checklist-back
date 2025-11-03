import express from "express";
import { 
    getAllExecutions, 
    getExecutionById, 
    createExecution, 
    updateExecution,
    completeExecution 
} from "../controllers/executionController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// GET /api/executions - Obtener todas las ejecuciones (con filtros opcionales)
router.get("/", getAllExecutions);

// GET /api/executions/:id - Obtener una ejecución específica
router.get("/:id", getExecutionById);

// POST /api/executions - Crear una nueva ejecución (iniciar)
router.post("/", createExecution);

// PUT /api/executions/:id - Actualizar una ejecución
router.put("/:id", updateExecution);

// POST /api/executions/:id/complete - Completar una ejecución
router.post("/:id/complete", completeExecution);

export default router;
