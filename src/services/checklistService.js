import * as checklistData from "../data/checklistData.js";

export const getAllChecklists = async () => {
    try {
        return await checklistData.getAllChecklists();
    } catch (error) {
        throw new Error(`Error al obtener checklists: ${error.message}`);
    }
};

export const getChecklistById = async (id) => {
    try {
        const checklist = await checklistData.getChecklistById(id);
        if (!checklist) {
            throw new Error("Checklist no encontrado");
        }
        return checklist;
    } catch (error) {
        throw error;
    }
};

export const createChecklist = async (checklistInfo, createdBy) => {
    try {
        // Validaciones de negocio
        if (!checklistInfo.title || !checklistInfo.items || !Array.isArray(checklistInfo.items)) {
            throw new Error("Título e items son requeridos. Items debe ser un array.");
        }

        if (checklistInfo.items.length === 0) {
            throw new Error("El checklist debe tener al menos un item.");
        }

        // Validar estructura de items
        for (const item of checklistInfo.items) {
            if (!item.id || !item.text || !item.type) {
                throw new Error("Cada item debe tener id, text y type.");
            }
            if (!["checkbox", "text", "number", "select"].includes(item.type)) {
                throw new Error("Tipo de item inválido. Debe ser: checkbox, text, number o select.");
            }
        }

        const checklistData_new = {
            title: checklistInfo.title,
            description: checklistInfo.description || "",
            items: checklistInfo.items,
            category: checklistInfo.category || "general",
            createdBy: createdBy
        };

        return await checklistData.createChecklist(checklistData_new);
    } catch (error) {
        throw error;
    }
};

export const updateChecklist = async (id, updateInfo) => {
    try {
        // Verificar que el checklist existe
        await getChecklistById(id);

        // Remover campos que no se deben actualizar
        const { _id, createdAt, createdBy, ...updateData } = updateInfo;

        // Validar items si se están actualizando
        if (updateData.items) {
            if (!Array.isArray(updateData.items) || updateData.items.length === 0) {
                throw new Error("Items debe ser un array no vacío.");
            }

            for (const item of updateData.items) {
                if (!item.id || !item.text || !item.type) {
                    throw new Error("Cada item debe tener id, text y type.");
                }
                if (!["checkbox", "text", "number", "select"].includes(item.type)) {
                    throw new Error("Tipo de item inválido. Debe ser: checkbox, text, number o select.");
                }
            }
        }

        const result = await checklistData.updateChecklist(id, updateData);
        
        if (result.matchedCount === 0) {
            throw new Error("Checklist no encontrado");
        }

        return result;
    } catch (error) {
        throw error;
    }
};

export const deleteChecklist = async (id) => {
    try {
        // Verificar que el checklist existe
        await getChecklistById(id);

        return await checklistData.deleteChecklist(id);
    } catch (error) {
        throw error;
    }
};
