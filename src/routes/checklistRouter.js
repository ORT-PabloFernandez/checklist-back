import express from "express";
import { 
    getAllChecklists, 
    getChecklistById, 
    createChecklist, 
    updateChecklist 
} from "../controllers/checklistController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// GET /api/checklists - Obtener todos los checklists
router.get("/", getAllChecklists);

// GET /api/checklists/:id - Obtener un checklist específico
router.get("/:id", getChecklistById);

// POST /api/checklists - Crear un nuevo checklist
router.post("/", createChecklist);

// PUT /api/checklists/:id - Actualizar un checklist
router.put("/:id", updateChecklist);

export default router;
