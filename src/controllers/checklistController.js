import * as checklistService from "../services/checklistService.js";

export async function getAllChecklists(req, res) {
    try {
        const checklists = await checklistService.getAllChecklists();
        res.status(200).json({
            success: true,
            data: checklists,
            count: checklists.length
        });
    } catch (error) {
        console.error("Error al obtener checklists:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message
        });
    }
}

export async function getChecklistById(req, res) {
    try {
        const { id } = req.params;
        const checklist = await checklistService.getChecklistById(id);
        
        res.status(200).json({
            success: true,
            data: checklist
        });
    } catch (error) {
        console.error("Error al obtener checklist:", error);
        
        if (error.message === "Checklist no encontrado") {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message
        });
    }
}

export async function createChecklist(req, res) {
    try {
        const checklistInfo = req.body;
        const createdBy = req.user.email; // Viene del middleware de autenticación
        
        const result = await checklistService.createChecklist(checklistInfo, createdBy);
        
        res.status(201).json({
            success: true,
            message: "Checklist creado exitosamente",
            data: { id: result.insertedId }
        });
    } catch (error) {
        console.error("Error al crear checklist:", error);
        
        // Errores de validación
        if (error.message.includes("requeridos") || error.message.includes("inválido") || error.message.includes("debe")) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message
        });
    }
}

export async function updateChecklist(req, res) {
    try {
        const { id } = req.params;
        const updateInfo = req.body;
        
        await checklistService.updateChecklist(id, updateInfo);
        
        res.status(200).json({
            success: true,
            message: "Checklist actualizado exitosamente"
        });
    } catch (error) {
        console.error("Error al actualizar checklist:", error);
        
        if (error.message === "Checklist no encontrado") {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        
        // Errores de validación
        if (error.message.includes("requeridos") || error.message.includes("inválido") || error.message.includes("debe")) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message
        });
    }
}
