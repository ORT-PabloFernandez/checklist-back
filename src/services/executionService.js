import { ObjectId } from "mongodb";
import * as executionData from "../data/executionData.js";
import * as assignmentData from "../data/assignmentData.js";

export const getAllExecutions = async (filters = {}) => {
    try {
        return await executionData.getAllExecutions(filters);
    } catch (error) {
        throw new Error(`Error al obtener ejecuciones: ${error.message}`);
    }
};

export const getExecutionById = async (id) => {
    try {
        const execution = await executionData.getExecutionById(id);
        if (!execution) {
            throw new Error("Ejecución no encontrada");
        }
        return execution;
    } catch (error) {
        throw error;
    }
};

export const createExecution = async (executionInfo, collaboratorEmail, collaboratorName) => {
    try {
        // Validaciones de negocio
        if (!executionInfo.assignmentId) {
            throw new Error("AssignmentId es requerido");
        }

        // Verificar que la asignación existe
        const assignment = await assignmentData.getAssignmentById(executionInfo.assignmentId);
        if (!assignment) {
            throw new Error("Asignación no encontrada");
        }

        // Verificar que el usuario puede ejecutar esta asignación
        if (assignment.collaboratorEmail !== collaboratorEmail) {
            throw new Error("No tienes permisos para ejecutar esta asignación");
        }

        // Verificar que la asignación está en estado válido para ejecutar
        if (assignment.status === "completed" || assignment.status === "reviewed") {
            throw new Error("Esta asignación ya ha sido completada");
        }

        // Verificar si ya existe una ejecución para esta asignación
        const existingExecutions = await executionData.getExecutionsByAssignment(executionInfo.assignmentId);
        const activeExecution = existingExecutions.find(exec => exec.status === "in_progress");
        
        if (activeExecution) {
            throw new Error("Ya existe una ejecución en progreso para esta asignación");
        }

        const executionData_new = {
            assignmentId: executionInfo.assignmentId,
            checklistTitle: assignment.checklistTitle,
            collaboratorEmail: collaboratorEmail,
            responses: {}
        };

        const result = await executionData.createExecution(executionData_new);

        // Actualizar el estado de la asignación a "in_progress"
        await assignmentData.updateAssignment(executionInfo.assignmentId, { status: "in_progress" });

        return result;
    } catch (error) {
        throw error;
    }
};

export const updateExecution = async (id, updateInfo, collaboratorEmail) => {
    try {
        // Verificar que la ejecución existe y pertenece al usuario
        const execution = await getExecutionById(id);
        
        if (execution.collaboratorEmail !== collaboratorEmail) {
            throw new Error("No tienes permisos para actualizar esta ejecución");
        }

        if (execution.status === "completed" || execution.status === "reviewed") {
            throw new Error("No se puede actualizar una ejecución completada");
        }

        // Remover campos que no se deben actualizar
        const { _id, createdAt, startedAt, collaboratorEmail: _, assignmentId, ...updateData } = updateInfo;

        // Validar y convertir responses si se están actualizando
        if (updateData.responses) {
            if (!Array.isArray(updateData.responses)) {
                throw new Error("Responses debe ser un array");
            }
            // Validar estructura de responses
            for (const response of updateData.responses) {
                if (!response.itemId || response.value === undefined) {
                    throw new Error("Cada respuesta debe tener itemId y value");
                }
            }
            // Convertir array [{itemId, value}] a mapa {itemId: {value, ...}} para el schema de Atlas
            const responsesMap = {};
            for (const r of updateData.responses) {
                responsesMap[r.itemId] = { value: r.value, updatedAt: new Date() };
            }
            updateData.responses = responsesMap;
        }

        // Validar location si se está actualizando
        if (updateData.location) {
            if (typeof updateData.location.latitude !== 'number' || typeof updateData.location.longitude !== 'number') {
                throw new Error("La ubicación debe tener latitude y longitude como números");
            }
        }

        const result = await executionData.updateExecution(id, updateData);
        
        if (result.matchedCount === 0) {
            throw new Error("Ejecución no encontrada");
        }

        return result;
    } catch (error) {
        throw error;
    }
};

export const completeExecution = async (id, completionInfo, collaboratorEmail) => {
    try {
        // Verificar que la ejecución existe y pertenece al usuario
        const execution = await getExecutionById(id);
        
        if (execution.collaboratorEmail !== collaboratorEmail) {
            throw new Error("No tienes permisos para completar esta ejecución");
        }

        if (execution.status === "completed" || execution.status === "reviewed") {
            throw new Error("Esta ejecución ya ha sido completada");
        }

        // Validar que se proporcionen las respuestas requeridas
        if (!completionInfo.responses || !Array.isArray(completionInfo.responses)) {
            throw new Error("Las respuestas son requeridas para completar la ejecución");
        }

        // Validar estructura de responses
        for (const response of completionInfo.responses) {
            if (!response.itemId || response.value === undefined) {
                throw new Error("Cada respuesta debe tener itemId y value");
            }
        }

        // Convertir array [{itemId, value}] a mapa para el schema de Atlas
        const responsesMap = {};
        for (const r of completionInfo.responses) {
            responsesMap[r.itemId] = { value: r.value, valid: true, visible: true, completedAt: new Date() };
        }

        const completionData = {
            responses: responsesMap,
            status: "completed"
        };
        const resolvedNotes = completionInfo.notes || execution.notes || "";
        if (resolvedNotes) completionData.notes = resolvedNotes;
        const resolvedLocation = completionInfo.location || execution.location;
        if (resolvedLocation) completionData.location = resolvedLocation;

        const result = await executionData.completeExecution(id, completionData);

        // Actualizar el estado de la asignación a "completed"
        await assignmentData.updateAssignment(execution.assignmentId, { status: "completed" });

        return result;
    } catch (error) {
        throw error;
    }
};

export const getExecutionsByAssignment = async (assignmentId) => {
    try {
        if (!assignmentId) {
            throw new Error("AssignmentId es requerido");
        }

        return await executionData.getExecutionsByAssignment(assignmentId);
    } catch (error) {
        throw error;
    }
};

export const changeStatus = async (id, update) => {
    if(!update){
        throw new Error('Faltan campo a completar');
    }

    if(!update.status) {
        throw new Error('Status es requerido');
    }

    if (!["in_progress", "completed", "reviewed"].includes(update.status)) {
        throw new Error("Status no valido");
    }
    return await executionData.updateStatus(id, update.status);
}
