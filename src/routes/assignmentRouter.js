import express from "express";
import { 
    getAllAssignments, 
    getAssignmentById, 
    createAssignment, 
    updateAssignment,
    getMyAssignments, 
    deleteAssignment
} from "../controllers/assignmentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireSupervisor } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// GET /api/assignments - Obtener todas las asignaciones (con filtros opcionales)
router.get("/", getAllAssignments);

// GET /api/assignments/my - Obtener mis asignaciones
router.get("/my", getMyAssignments);

// GET /api/assignments/:id - Obtener una asignación específica
router.get("/:id", getAssignmentById);

// POST /api/assignments - Crear una nueva asignación
router.post("/", createAssignment);

// PUT /api/assignments/:id - Actualizar una asignación
router.put("/:id", updateAssignment);

//
router.delete("/:id", requireSupervisor, deleteAssignment);

export default router;
