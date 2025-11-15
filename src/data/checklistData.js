import { getDb } from "./connection.js";
import { ObjectId } from "mongodb";

const COLLECTION_NAME = "checklists";

export async function getAllChecklists(filter = {}) {
    const db = getDb();
    const query = {};
    if(filter.title) {
        query.title = {$regex: new RegExp(filter.title, "i")};
    }

    if(filter.category) {
        query.category = {$regex: new RegExp(filter.category, "i")};
    }

    return await db.collection(COLLECTION_NAME).find(query).toArray();
}

export async function getChecklistById(id) {
    const db = getDb();
    return await db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) });
}

export async function createChecklist(checklistData) {
    const db = getDb();
    const result = await db.collection(COLLECTION_NAME).insertOne({
        ...checklistData,
        createdAt: new Date(),
        updatedAt: new Date()
    });
    return result;
}

export async function updateChecklist(id, updateData) {
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

export async function deleteChecklist(id) {
    const db = getDb();
    return await db.collection(COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) });
}
