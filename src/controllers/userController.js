import {getUsers, getUserById, registerUserService, loginUserService, updateUserRoleService, getNotifications, deleteNotificationsService, updateAvatarService} from "../services/userService.js";
import jwt from "jsonwebtoken";

export const getAllUsers = async (req, res) => {
    try {
        const users = await getUsers();
        res.json(users);
    } catch (error) {
        console.log("Error fetching users: ", error);
        res.status(500).json({message: "Internal server error"});
    }
};

export const loginUserController = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Faltan campos obligatorios (email, password)" });
    }
    try {
        const user = await loginUserService({ email, password });
        // Generar JWT
        const token = jwt.sign(
            { _id: user._id, username: user.username, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );
        //devuelve contrasenia dejar preguntar si es necesario (esta mal que la devuelva)
        res.json({ message: "Login exitoso", user, token });
    } catch (error) {
        if (error.message === "Credenciales inválidas") {
            return res.status(401).json({ message: error.message });
        }
        console.log("Error en login: ", error);
        res.status(500).json({ message: "Error interno en login" });
    }
};

export const registerUserController = async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: "Faltan campos obligatorios (username, email, password)" });
    }
    try {
        const result = await registerUserService({ username, email, password });
        res.status(201).json({ message: "Usuario registrado exitosamente", userId: result.insertedId });
    } catch (error) {
        if (error.message === "El email ya está registrado") {
            return res.status(409).json({ message: error.message });
        }
        console.log("Error registrando usuario: ", error);
        res.status(500).json({ message: "Error interno al registrar usuario" });
    }
};

export const getUser = async (req, res) => {
    try {
        const user = await getUserById(req.params.id);
        if(!user){
            return res.status(404).json({message: "Usuario no encontrado"});
        }
        res.json(user);
    } catch (error) {
        console.log("Error fetching users: ", error);
        res.status(500).json({message: "Internal server error"});
    }
};

export const updateRolUser = async (req, res) => {
    const { role } = req.body;
    const id = req.params.id;
    if (!role) {
        return res.status(400).json({ message: "Faltan campos obligatorios (role)" });
    }
    try {
        const result = await updateUserRoleService({id, role});
        res.status(201).json({ message: "Rol actualizado exitosamente", id: result._id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getNotificationsController = async (req, res) => {
    const id = req.params.id;
    try {
        const result = await getNotifications({id});
        res.status(200).json({ data: result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteNotificationsController = async (req, res) => {
    const id = req.params.id;
    try {
        const ids = req.body.ids;
        const result = await deleteNotificationsService({ids, id});
        res.status(201).json({ data: result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateAvatarController = async (req, res) => {
    const { img } = req.body;
    const id = req.params.id;
    try {
        const result = await updateAvatarService({id, img});
        res.status(201).json({ data: result });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};