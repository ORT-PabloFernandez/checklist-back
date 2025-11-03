import * as assignmentData from "../data/assignmentData.js";
import * as checklistData from "../data/checklistData.js";

export const getAllAssignments = async (filters = {}) => {
    try {
        return await assignmentData.getAllAssignments(filters);
    } catch (error) {
        throw new Error(`Error al obtener asignaciones: ${error.message}`);
    }
};

export const getAssignmentById = async (id) => {
    try {
        const assignment = await assignmentData.getAssignmentById(id);
        if (!assignment) {
            throw new Error("Asignación no encontrada");
        }
        return assignment;
    } catch (error) {
        throw error;
    }
};

export const createAssignment = async (assignmentInfo, assignedBy) => {
    try {
        // Validaciones de negocio
        if (!assignmentInfo.checklistId || !assignmentInfo.collaboratorEmail || !assignmentInfo.title) {
            throw new Error("ChecklistId, collaboratorEmail y title son requeridos");
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(assignmentInfo.collaboratorEmail)) {
            throw new Error("Formato de email inválido");
        }

        // Verificar que el checklist existe
        const checklist = await checklistData.getChecklistById(assignmentInfo.checklistId);
        if (!checklist) {
            throw new Error("Checklist no encontrado");
        }

        // Validar fecha de vencimiento si se proporciona
        if (assignmentInfo.dueDate) {
            const dueDate = new Date(assignmentInfo.dueDate);
            if (isNaN(dueDate.getTime())) {
                throw new Error("Fecha de vencimiento inválida");
            }
            if (dueDate < new Date()) {
                throw new Error("La fecha de vencimiento no puede ser en el pasado");
            }
        }

        // Validar prioridad
        const validPriorities = ["low", "medium", "high"];
        if (assignmentInfo.priority && !validPriorities.includes(assignmentInfo.priority)) {
            throw new Error("Prioridad inválida. Debe ser: low, medium o high");
        }

        const assignmentData_new = {
            checklistId: assignmentInfo.checklistId,
            checklistTitle: checklist.title,
            collaboratorEmail: assignmentInfo.collaboratorEmail,
            collaboratorName: assignmentInfo.collaboratorName || assignmentInfo.collaboratorEmail,
            title: assignmentInfo.title,
            description: assignmentInfo.description || "",
            dueDate: assignmentInfo.dueDate ? new Date(assignmentInfo.dueDate) : null,
            priority: assignmentInfo.priority || "medium",
            assignedBy: assignedBy
        };

        return await assignmentData.createAssignment(assignmentData_new);
    } catch (error) {
        throw error;
    }
};

export const updateAssignment = async (id, updateInfo) => {
    try {
        // Verificar que la asignación existe
        await getAssignmentById(id);

        // Remover campos que no se deben actualizar
        const { _id, createdAt, assignedBy, checklistId, ...updateData } = updateInfo;

        // Validar prioridad si se está actualizando
        if (updateData.priority) {
            const validPriorities = ["low", "medium", "high"];
            if (!validPriorities.includes(updateData.priority)) {
                throw new Error("Prioridad inválida. Debe ser: low, medium o high");
            }
        }

        // Validar estado si se está actualizando
        if (updateData.status) {
            const validStatuses = ["pending", "in_progress", "completed", "reviewed"];
            if (!validStatuses.includes(updateData.status)) {
                throw new Error("Estado inválido. Debe ser: pending, in_progress, completed o reviewed");
            }
        }

        // Validar fecha de vencimiento si se está actualizando
        if (updateData.dueDate) {
            const dueDate = new Date(updateData.dueDate);
            if (isNaN(dueDate.getTime())) {
                throw new Error("Fecha de vencimiento inválida");
            }
            updateData.dueDate = dueDate;
        }

        const result = await assignmentData.updateAssignment(id, updateData);
        
        if (result.matchedCount === 0) {
            throw new Error("Asignación no encontrada");
        }

        return result;
    } catch (error) {
        throw error;
    }
};

export const getAssignmentsByCollaborator = async (collaboratorEmail) => {
    try {
        if (!collaboratorEmail) {
            throw new Error("Email del colaborador es requerido");
        }

        return await assignmentData.getAssignmentsByCollaborator(collaboratorEmail);
    } catch (error) {
        throw error;
    }
};

export const deleteAssignment = async (id) => {
    try {
        // Verificar que la asignación existe
        await getAssignmentById(id);

        return await assignmentData.deleteAssignment(id);
    } catch (error) {
        throw error;
    }
};
