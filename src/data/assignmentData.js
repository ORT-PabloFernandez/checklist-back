import { getDb } from "./connection.js";
import { ObjectId } from "mongodb";

const COLLECTION_NAME = "assignments";

export async function getAllAssignments(filters = {}) {
    const db = getDb();
    const query = {};
    
    // Filtrar por email del colaborador si se proporciona
    if (filters.collaboratorEmail) {
        query.collaboratorEmail = filters.collaboratorEmail;
    }
    
    // Filtrar por estado si se proporciona
    if (filters.status) {
        query.status = filters.status;
    }
    
    return await db.collection(COLLECTION_NAME).find(query).toArray();
}

export async function getAssignmentById(id) {
    const db = getDb();
    return await db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) });
}

export async function createAssignment(assignmentData) {
    const db = getDb();
    const result = await db.collection(COLLECTION_NAME).insertOne({
        ...assignmentData,
        status: "pending", // pending, in_progress, completed, reviewed
        createdAt: new Date(),
        updatedAt: new Date()
    });
    return result;
}

export async function updateAssignment(id, updateData) {
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

export async function deleteAssignment(id) {
    const db = getDb();
    return await db.collection(COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) });
}

export async function getAssignmentsByCollaborator(collaboratorEmail) {
    const db = getDb();
    return await db.collection(COLLECTION_NAME).find({ 
        collaboratorEmail: collaboratorEmail 
    }).toArray();
}
