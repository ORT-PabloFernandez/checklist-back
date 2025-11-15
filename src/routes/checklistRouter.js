import express from "express";
import { 
    getAllChecklists, 
    getChecklistById, 
    createChecklist, 
    updateChecklist, 
    deleteChecklist
} from "../controllers/checklistController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireSupervisor, requireAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// GET /api/checklists - Obtener todos los checklists
router.get("/", getAllChecklists);

// GET /api/checklists/:id - Obtener un checklist específico
router.get("/:id", getChecklistById);

// POST /api/checklists - Crear un nuevo checklist (solo supervisores y admins)
router.post("/", requireSupervisor, createChecklist);

// PUT /api/checklists/:id - Actualizar un checklist (solo supervisores y admins)
router.put("/:id", requireSupervisor, updateChecklist);

//
router.delete("/:id", requireSupervisor, deleteChecklist);

export default router;
