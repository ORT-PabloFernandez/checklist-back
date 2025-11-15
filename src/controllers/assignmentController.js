import * as assignmentService from "../services/assignmentService.js";

export async function getAllAssignments(req, res) {
    try {
        const { collaboratorEmail, status, priority, dueDate } = req.query;
        const filters = {};
        
        if (collaboratorEmail) filters.collaboratorEmail = collaboratorEmail;
        if (status) filters.status = status;
        if (priority) filters.priority = priority;
        if (dueDate) filters.dueDate = dueDate;
        
        const assignments = await assignmentService.getAllAssignments(filters);
        
        res.status(200).json({
            success: true,
            data: assignments,
            count: assignments.length
        });
    } catch (error) {
        console.error("Error al obtener asignaciones:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message
        });
    }
}

export async function getAssignmentById(req, res) {
    try {
        const { id } = req.params;
        const assignment = await assignmentService.getAssignmentById(id);
        
        res.status(200).json({
            success: true,
            data: assignment
        });
    } catch (error) {
        console.error("Error al obtener asignación:", error);
        
        if (error.message === "Asignación no encontrada") {
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

export async function createAssignment(req, res) {
    try {
        const { 
            checklistId, 
            collaboratorEmail, 
            collaboratorName,
            title, 
            description, 
            dueDate,
            priority 
        } = req.body;
        
        // Validaciones básicas
        if (!checklistId || !collaboratorEmail || !title) {
            return res.status(400).json({
                success: false,
                message: "ChecklistId, collaboratorEmail y title son requeridos"
            });
        }
        
        const assignmentInfo = {
            checklistId,
            collaboratorEmail,
            collaboratorName,
            title,
            description,
            dueDate,
            priority
        };
        
        const result = await assignmentService.createAssignment(assignmentInfo, req.user.email);
        
        res.status(201).json({
            success: true,
            message: "Asignación creada exitosamente",
            data: { id: result.insertedId }
        });
    } catch (error) {
        console.error("Error al crear asignación:", error);
        
        // Errores de validación y de negocio
        if (error.message.includes("requeridos") || error.message.includes("inválido") || 
            error.message.includes("no encontrado") || error.message.includes("debe") ||
            error.message.includes("formato")) {
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

export async function updateAssignment(req, res) {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const result = await assignmentService.updateAssignment(id, updateData);
        
        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Asignación no encontrada"
            });
        }
        
        res.status(200).json({
            success: true,
            message: "Asignación actualizada exitosamente"
        });
    } catch (error) {
        console.error("Error al actualizar asignación:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message
        });
    }
}

export async function getMyAssignments(req, res) {
    try {
        const collaboratorEmail = req.user.email; // Viene del middleware de autenticación
        const assignments = await assignmentService.getAssignmentsByCollaborator(collaboratorEmail);
        
        res.status(200).json({
            success: true,
            data: assignments,
            count: assignments.length
        });
    } catch (error) {
        console.error("Error al obtener mis asignaciones:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message
        });
    }
}
