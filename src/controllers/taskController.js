import * as taskService from "../services/taskService.js";

export async function getAllTasks(req, res) {
    console.log("Obteniendo todas las tareas");
    try {
        const tasks = await taskService.getAllTasks();
        res.status(200).json({
            success: true,
            data: tasks
        });
    } catch (error) {
        console.error("Error al obtener tareas:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message
        });
    }
}

export async function createTask(req, res) {
    try {
        const taskInfo = req.body;
        const createdBy = req.user?.email || req.user?.id || "unknown";

        if (!taskInfo || !taskInfo.title) {
            return res.status(400).json({ success: false, message: "title es requerido" });
        }

        const result = await taskService.createTask(taskInfo, createdBy);

        return res.status(201).json({
            success: true,
            message: "Tarea creada exitosamente",
            data: { id: result.insertedId }
        });
    } catch (error) {
        console.error("Error al crear tarea:", error);
        return res.status(500).json({ success: false, message: "Error interno del servidor", error: error.message });
    }
}

export async function deleteTask(req, res) {
    try {
        const { id } = req.params;
        const result = await taskService.deleteTask(id);
        return res.status(200).json({ success: true, message: "Tarea eliminada correctamente" });
    } catch (error) {
        console.error("Error al eliminar tarea:", error);
        if (error.message === "Tarea no encontrada") {
            return res.status(404).json({ success: false, message: error.message });
        }
        return res.status(500).json({ success: false, message: "Error interno del servidor", error: error.message });
    }
}

export async function updateTask(req, res) {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (!updates || Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: "Debe enviar al menos un campo para actualizar"
            });
        }

        const result = await taskService.updateTask(id, updates);

        return res.status(200).json({
            success: true,
            message: "Tarea actualizada correctamente",
            data: { modifiedCount: result.modifiedCount }
        });
    } catch (error) {
        console.error("Error al actualizar tarea:", error);
        if (error.message === "Tarea no encontrada") {
            return res.status(404).json({ success: false, message: error.message });
        }
        return res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message
        });
    }
}