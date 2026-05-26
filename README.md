# API SISTEMA DE CHECKLISTS

## Descripción

API REST desarrollada con Node.js, Express y MongoDB Atlas para la gestión de checklists operativos. Permite crear templates de checklists, asignarlos a colaboradores y hacer seguimiento completo de su ejecución con control de acceso por roles.

## Características principales

- 🔐 **Autenticación JWT** - Todos los endpoints están protegidos
- � **Roles: Admin / Supervisor / Colaborador** - Permisos diferenciados por rol
- 📋 **Checklists** - Templates reutilizables con ítems configurables
- 🗂️ **Assignments** - Asignación de checklists a colaboradores
- ⚡ **Executions** - Ejecución y seguimiento del progreso en tiempo real
- 🏗️ **Arquitectura en capas** - Routes → Controllers → Services → Data

## Instalación y configuración

```bash
# 1. Instalar dependencias
npm install

# 2. Crear archivo .env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=tu_jwt_secret_aqui
PORT=5000

# 3. Ejecutar
npm run dev   # desarrollo con auto-reload
npm start     # producción
```

> El servidor corre en **http://localhost:5000**

## Estructura del proyecto

```
src/
├── controllers/    # Lógica HTTP (request/response)
├── services/       # Lógica de negocio y validaciones
├── data/           # Acceso a MongoDB
├── middleware/     # authMiddleware, roleMiddleware
├── routes/         # Definición de rutas
└── app.js          # Configuración Express
```

---

## Endpoints

Todos requieren header: `Authorization: Bearer <token>`

### Autenticación y Usuarios

| Método | Ruta | Roles | Descripción |
|--------|------|-------|-------------|
| POST | `/api/users/login` | Público | Login, devuelve JWT |
| POST | `/api/users/register` | Público | Registro (rol colaborador por defecto) |
| GET | `/api/users` | Todos | Listar usuarios |
| GET | `/api/users/:id` | Todos | Obtener usuario por ID |

### Checklists

| Método | Ruta | Roles | Descripción |
|--------|------|-------|-------------|
| GET | `/api/checklists` | Todos | Listar templates |
| GET | `/api/checklists/:id` | Todos | Obtener checklist por ID |
| POST | `/api/checklists` | Admin / Supervisor | Crear nuevo template |
| PUT | `/api/checklists/:id` | Admin / Supervisor | Actualizar template |

### Assignments

| Método | Ruta | Roles | Descripción |
|--------|------|-------|-------------|
| GET | `/api/assignments` | Todos | Listar asignaciones (filtros opcionales) |
| GET | `/api/assignments/my` | Todos | Mis asignaciones (del usuario logueado) |
| GET | `/api/assignments/:id` | Todos | Obtener asignación por ID |
| POST | `/api/assignments` | Admin / Supervisor | Crear asignación |
| PUT | `/api/assignments/:id` | Admin / Supervisor | Actualizar estado |
| DELETE | `/api/assignments/:id` | Admin / Supervisor | Eliminar asignación |

Query params disponibles: `?collaboratorEmail=email&status=pending`

### Executions

| Método | Ruta | Roles | Descripción |
|--------|------|-------|-------------|
| GET | `/api/executions` | Todos | Listar ejecuciones (filtros opcionales) |
| GET | `/api/executions/:id` | Todos | Obtener ejecución por ID |
| POST | `/api/executions` | Colaborador | Iniciar ejecución de una asignación |
| PUT | `/api/executions/:id` | Colaborador (dueño) | Guardar progreso |
| POST | `/api/executions/:id/complete` | Colaborador (dueño) | Marcar como completada |
| PATCH | `/api/executions/:id` | Admin / Supervisor | Cambiar estado (reviewed) |

Query params disponibles: `?assignmentId=id&collaboratorEmail=email`

---

## Flujo completo por rol

### 🔴 Admin (`admin@checklist.com` / `admin123`)

El admin tiene acceso total al sistema.

```
1. POST /api/users/login          → obtener token JWT

2. Gestión de checklists
   GET  /api/checklists           → ver templates disponibles
   POST /api/checklists           → crear nuevo template
   PUT  /api/checklists/:id       → modificar template existente

3. Gestión de asignaciones
   GET    /api/assignments        → ver todas (filtrables)
   POST   /api/assignments        → asignar checklist a colaborador
   PUT    /api/assignments/:id    → cambiar estado (pending → reviewed)
   DELETE /api/assignments/:id    → eliminar asignación

4. Supervisión de ejecuciones
   GET   /api/executions          → ver todas las ejecuciones
   PATCH /api/executions/:id      → marcar ejecución como "reviewed"

5. Gestión de usuarios
   GET /api/users                 → listar usuarios
   GET /api/users/:id             → ver perfil de usuario
```

---

### 🟡 Supervisor (`supervisor@ort.edu.ar`)

El supervisor gestiona el trabajo pero no ejecuta checklists.

```
1. POST /api/users/login          → obtener token JWT

2. Gestión de checklists
   GET  /api/checklists           → ver templates
   POST /api/checklists           → crear nuevo template
   PUT  /api/checklists/:id       → modificar template

3. Gestión de asignaciones
   GET    /api/assignments        → ver todas las asignaciones
   POST   /api/assignments        → asignar checklist a colaborador
     Body requerido:
       checklistId       string  (ID del template)
       collaboratorEmail string  (email del colaborador registrado)
       title             string  (título de la asignación)
     Body opcional:
       collaboratorName  string
       description       string
       dueDate           ISO date string
       priority          "low" | "medium" | "high"  (default: "medium")
   PUT    /api/assignments/:id    → cambiar estado de asignación
     Body: { "status": "pending|in_progress|completed|reviewed" }
   DELETE /api/assignments/:id    → eliminar asignación

4. Revisión de ejecuciones
   GET   /api/executions                               → ver todas
   GET   /api/executions?collaboratorEmail=x@x.com    → filtrar
   PATCH /api/executions/:id    → cambiar estado
     Body: { "status": "reviewed" }
```

---

### 🟢 Colaborador (`Nestor.Wilke@ejemplo.com` / `pass123`)

El colaborador solo puede ejecutar las asignaciones que le corresponden.

```
1. POST /api/users/login                → obtener token JWT

2. Ver mis asignaciones
   GET /api/assignments/my             → solo las asignaciones propias
   GET /api/assignments/:id            → detalle de una asignación

3. Iniciar una ejecución
   POST /api/executions
     Body: { "assignmentId": "<id de la asignación>" }
     → Devuelve el ID de la ejecución nueva
     → Cambia el estado de la asignación a "in_progress"

4. Guardar progreso (puede llamarse múltiples veces)
   PUT /api/executions/:id
     Body:
     {
       "responses": [
         { "itemId": "1", "value": "Correcta" },
         { "itemId": "2", "value": 1250 }
       ],
       "notes": "Observaciones parciales"
     }

5. Completar la ejecución
   POST /api/executions/:id/complete
     Body:
     {
       "responses": [
         { "itemId": "1", "value": "Correcta" },
         { "itemId": "2", "value": 1250 },
         { "itemId": "3", "value": "Sin fugas" }
       ],
       "notes": "Ejecución completada sin novedades"
     }
     → Cambia status a "completed"
     → Cambia el estado de la asignación a "completed"

6. Ver sus ejecuciones
   GET /api/executions?collaboratorEmail=Nestor.Wilke@ejemplo.com

❌ Acciones NO permitidas al colaborador:
   - POST/PUT/DELETE /api/checklists     → 403
   - POST/DELETE /api/assignments        → 403
   - PUT /api/executions de otro usuario → 403
   - PATCH /api/executions/:id           → 403
```

---

## Modelos de datos

### Checklist
```json
{
  "_id": "ObjectId",
  "title": "string",
  "description": "string",
  "category": "string",
  "items": [
    {
      "id": "string",
      "text": "string",
      "type": "checkbox | text | number | select",
      "required": true,
      "options": ["array"]
    }
  ],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Assignment
```json
{
  "_id": "ObjectId",
  "checklistId": "string",
  "checklistTitle": "string",
  "collaboratorEmail": "string",
  "collaboratorName": "string",
  "title": "string",
  "description": "string",
  "dueDate": "Date (opcional)",
  "priority": "low | medium | high",
  "status": "pending | in_progress | completed | reviewed",
  "assignedBy": "string (email)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Execution
```json
{
  "_id": "ObjectId",
  "assignmentId": "string",
  "checklistTitle": "string",
  "collaboratorEmail": "string",
  "responses": {
    "<itemId>": {
      "value": "any",
      "valid": true,
      "visible": true,
      "completedAt": "Date"
    }
  },
  "status": "in_progress | completed | reviewed",
  "startedAt": "Date",
  "completedAt": "Date (solo cuando status=completed)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

> **Nota sobre responses:** La API acepta las respuestas como array `[{itemId, value}]` en los endpoints PUT y POST /complete. Internamente se almacenan como objeto `{itemId: {value, valid, visible, completedAt}}`.

---

## Formato de respuestas

**Éxito:**
```json
{ "success": true, "message": "...", "data": { ... } }
```

**Error:**
```json
{ "success": false, "message": "Descripción del error" }
```

**Códigos HTTP:**
- `200` OK / `201` Creado
- `400` Error de validación o regla de negocio
- `401` Sin token o token inválido
- `403` Sin permisos para la operación
- `404` Recurso no encontrado
- `500` Error interno del servidor

## Notas técnicas

- Autenticación: header `Authorization: Bearer <token>`
- Fechas en formato ISO 8601
- MongoDB Atlas con schema validation — no incluir campos `null` en documentos de ejecución
- Los colaboradores solo pueden modificar sus propias ejecuciones (validado por email del token JWT)