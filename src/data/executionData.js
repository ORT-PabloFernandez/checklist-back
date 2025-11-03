import { getDb } from "./connection.js";
import { ObjectId } from "mongodb";

const COLLECTION_NAME = "executions";

export async function getAllExecutions(filters = {}) {
    const db = getDb();
    const query = {};
    
    // Filtrar por ID de asignación si se proporciona
    if (filters.assignmentId) {
        query.assignmentId = filters.assignmentId;
    }
    
    // Filtrar por email del colaborador si se proporciona
    if (filters.collaboratorEmail) {
        query.collaboratorEmail = filters.collaboratorEmail;
    }
    
    return await db.collection(COLLECTION_NAME).find(query).toArray();
}

export async function getExecutionById(id) {
    const db = getDb();
    return await db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) });
}

export async function createExecution(executionData) {
    const db = getDb();
    const result = await db.collection(COLLECTION_NAME).insertOne({
        ...executionData,
        status: "in_progress", // in_progress, completed, reviewed
        startedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
    });
    return result;
}

export async function updateExecution(id, updateData) {
    const db = getDb();
    const result = await db.collection(COLLECTION_NAME).updateOne(
        { _id: new ObjectId(id) },
        { 
            $set: { 
                ...updateData, 
                updatedAt: new Date() 
            } 
        }
    );
    return result;
}

export async function completeExecution(id, completionData) {
    const db = getDb();
    const result = await db.collection(COLLECTION_NAME).updateOne(
        { _id: new ObjectId(id) },
        { 
            $set: { 
                ...completionData,
                status: "completed",
                completedAt: new Date(),
                updatedAt: new Date() 
            } 
        }
    );
    return result;
}

export async function getExecutionsByAssignment(assignmentId) {
    const db = getDb();
    return await db.collection(COLLECTION_NAME).find({ 
        assignmentId: assignmentId 
    }).toArray();
}
