import * as executionService from "../services/executionService.js";

export async function getAllExecutions(req, res) {
    try {
        const { assignmentId, collaboratorEmail } = req.query;
        const filters = {};
        
        if (assignmentId) filters.assignmentId = assignmentId;
        if (collaboratorEmail) filters.collaboratorEmail = collaboratorEmail;
        
        const executions = await executionService.getAllExecutions(filters);
        
        res.status(200).json({
            success: true,
            data: executions,
            count: executions.length
        });
    } catch (error) {
        console.error("Error al obtener ejecuciones:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message
        });
    }
}

export async function getExecutionById(req, res) {
    try {
        const { id } = req.params;
        const execution = await executionService.getExecutionById(id);
        
        res.status(200).json({
            success: true,
            data: execution
        });
    } catch (error) {
        console.error("Error al obtener ejecución:", error);
        
        if (error.message === "Ejecución no encontrada") {
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

export async function createExecution(req, res) {
    try {
        const { assignmentId } = req.body;
        
        // Validaciones básicas
        if (!assignmentId) {
            return res.status(400).json({
                success: false,
                message: "AssignmentId es requerido"
            });
        }
        
        const executionInfo = { assignmentId };
        const result = await executionService.createExecution(executionInfo, req.user.email, req.user.name);
        
        res.status(201).json({
            success: true,
            message: "Ejecución iniciada exitosamente",
            data: { id: result.insertedId }
        });
    } catch (error) {
        console.error("Error al crear ejecución:", error);
        
        // Errores de validación y permisos
        if (error.message.includes("requerido") || error.message.includes("no encontrada") ||
            error.message.includes("permisos") || error.message.includes("completada") ||
            error.message.includes("progreso")) {
            const statusCode = error.message.includes("permisos") ? 403 : 400;
            return res.status(statusCode).json({
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

export async function updateExecution(req, res) {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const result = await executionService.updateExecution(id, updateData, req.user.email);
        
        res.status(200).json({
            success: true,
            message: "Ejecución actualizada exitosamente"
        });
    } catch (error) {
        console.error("Error al actualizar ejecución:", error);
        
        // Errores de validación y permisos
        if (error.message.includes("no encontrada") || error.message.includes("permisos") ||
            error.message.includes("completada") || error.message.includes("debe")) {
            const statusCode = error.message.includes("permisos") ? 403 : 400;
            return res.status(statusCode).json({
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

export async function completeExecution(req, res) {
    try {
        const { id } = req.params;
        const { responses, notes, location } = req.body;
        
        const completionInfo = { responses, notes, location };
        const result = await executionService.completeExecution(id, completionInfo, req.user.email);
        
        res.status(200).json({
            success: true,
            message: "Ejecución completada exitosamente"
        });
    } catch (error) {
        console.error("Error al completar ejecución:", error);
        
        // Errores de validación y permisos
        if (error.message.includes("no encontrada") || error.message.includes("permisos") ||
            error.message.includes("completada") || error.message.includes("requeridas") ||
            error.message.includes("debe")) {
            const statusCode = error.message.includes("permisos") ? 403 : 400;
            return res.status(statusCode).json({
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
