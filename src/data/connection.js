import { MongoClient } from "mongodb";
const uri = process.env.MONGODB_URI;

if(!uri){
    throw new Error("❌ La variable de entorno MONGODB_URI no esta definida.");    
}

let client;
let db;

export async function connectToDatabase(){
    if(!client){
        try {
            client = new MongoClient(uri);
            await client.connect();
            db = client.db("checklist_system");
            console.log("✅ Conexión a MongoDB establecida");
        } catch (error) {
            console.error("❌  Error conectando a MongoDB", error.message);
            throw error;
        }
    }
    return db;
}

export function getDb() {
    if(!db) {
        throw new Error(
            "Debes conectar a la base de datos primero usando connectToDatabase()"
        );
    }
    return db;
}