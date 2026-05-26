import { getDb } from "./connection.js";
import { ObjectId, UUID } from "mongodb";
import bcrypt from "bcrypt";
import crypto from "crypto";
export async function findAllUsers() {
    const db = getDb();
    const users = await db.collection("users").find().toArray();
    return users;
}

export async function findUserById(id) {
    const db = getDb();
    const user = await db.collection("users").findOne({_id: new ObjectId(id)});
    return user;
}

// Busca un usuario por email y compara el password usando bcrypt
export async function findByCredentials(email, password) {
    const db = getDb();
    const user = await db.collection("users").findOne({ email });
    if (!user) {
        return null;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return null;
    }
    return user;
}

// Registra un nuevo usuario: hashea el password y lo guarda en la base de datos
export async function registerUser({ username, email, password }) {
    const db = getDb();
    // Verificar si el usuario ya existe
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
        throw new Error("El email ya está registrado");
    }
    // Hashear el password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = {
        username,
        email,
        password: hashedPassword,
        role: "collaborator", // Rol por defecto para nuevos usuarios
        createdAt: new Date(),
        updatedAt: new Date(),
        avatar: null,
        notification: []
    };
    const result = await db.collection("users").insertOne(newUser);
    return result;
}

export async function updateRole(id, role) {
    const db = getDb();
    const result = await db.collection("users").updateOne(
        { _id: new ObjectId(id) },
        { 
            $set: { 
                role: role 
            } 
        }
    );
    return result;
}

export async function createNotification (id, data) {
    const nuevaNotificacion = { 
        id: crypto.randomUUID(),
        assigmentTitle: data.assigmentTitle,
        checklist: data.checklist,
        assigmentDescription: data.assigmentDescription,
        assigmentBy: data.assigmentBy,
        createdAt: new Date(),
        updatedAt: new Date(),
    }
    const db = getDb();
    const result = await db.collection("users").updateOne(
        { _id: new ObjectId(id) },
        { 
            $push: { 
                notification: nuevaNotificacion 
            } 
        }
    );
    return result;
}

export async function deleteNotifications (ids, id) {
    const db = getDb();
    const result = await db.collection("users").updateOne(
        { _id: new ObjectId(id) },
        {
            $pull: {
            notificaciones: {
                id: { $in: ids }  // ← elimina las notificaciones cuyo campo id esté en el array recibido
            }
            }
        }
    );

    return result;
}

export async function updateAvatar(id, img) {
    const db = getDb();
    const result = await db.collection("users").updateOne(
        { _id: new ObjectId(id) },
        { 
            $set: { 
                avatar: img 
            } 
        }
    );
    return result;
}