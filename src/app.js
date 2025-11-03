import express from "express";
import morgan from "morgan";
import userRoutes from "./routes/userRoute.js";
import checklistRoutes from "./routes/checklistRouter.js";
import assignmentRoutes from "./routes/assignmentRouter.js";
import executionRoutes from "./routes/executionRouter.js";

import cors from "cors";

const app = express();

// Middlewars
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

// Rutas
app.use("/api/users", userRoutes);
app.use("/api/checklists", checklistRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/executions", executionRoutes);

// Ruta base
app.get("/", (req, res) => {
    res.json({
        message: "API Sistema de Checklists - 2025",
        version: "1.0.0",
        endpoints: {
            users: "/api/users",
            checklists: "/api/checklists", 
            assignments: "/api/assignments",
            executions: "/api/executions"
        }
    });
});

export default app;