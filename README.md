# API SISTEMA DE CHECKLISTS

## Descripción

API REST desarrollada con Node.js, Express y MongoDB para la gestión de checklists operativos. Este sistema permite crear templates de checklists, asignarlos a colaboradores y realizar el seguimiento de su ejecución.

## Características principales

- 🔐 **Autenticación JWT** - Todos los endpoints están protegidos
- 📋 **Gestión de Checklists** - Crear y administrar templates de checklists
- 👥 **Sistema de Asignaciones** - Asignar checklists a colaboradores específicos
- ⚡ **Ejecución en Tiempo Real** - Seguimiento del progreso de ejecución
- 🏗️ **Arquitectura en Capas** - Separación clara entre rutas, controladores y servicios de datos

## Instalación y configuración

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd checklist-back
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
Crear un archivo `.env` con:
```env
MONGODB_URI=mongodb://localhost:27017/checklist_system
JWT_SECRET=tu_jwt_secret_aqui
PORT=3000
```

4. **Ejecutar el servidor**
```bash
# Desarrollo con auto-reload
npm run dev

# Producción
npm start
```

## Estructura del proyecto

```
src/
├── controllers/     # Lógica de negocio
├── data/           # Servicios de acceso a datos
├── middleware/     # Middleware de autenticación
├── routes/         # Definición de rutas
└── app.js         # Configuración principal
```

## Listado de endpoints implementados

### Endpoints de autenticación y usuarios:
- POST /api/users/register - Registro de nuevos usuarios
- POST /api/users/login - Login de usuarios existentes
- GET /api/users - Obtener todos los usuarios (requiere autenticación)
- GET /api/users/:id - Obtener un usuario específico por ID (requiere autenticación)

### Endpoints de checklists:
- GET /api/checklists - Obtener todos los templates de checklists (requiere autenticación)
- GET /api/checklists/:id - Obtener un checklist específico por ID (requiere autenticación)
- POST /api/checklists - Crear un nuevo template de checklist (requiere autenticación)
- PUT /api/checklists/:id - Actualizar un template de checklist (requiere autenticación)

### Endpoints de asignaciones:
- GET /api/assignments - Obtener todas las asignaciones con filtros opcionales (requiere autenticación)
  - Query params: `?collaboratorEmail=email&status=pending`
- GET /api/assignments/my - Obtener mis asignaciones (requiere autenticación)
- GET /api/assignments/:id - Obtener una asignación específica por ID (requiere autenticación)
- POST /api/assignments - Crear una nueva asignación (requiere autenticación)
- PUT /api/assignments/:id - Actualizar una asignación (requiere autenticación)

### Endpoints de ejecuciones:
- GET /api/executions - Obtener todas las ejecuciones con filtros opcionales (requiere autenticación)
  - Query params: `?assignmentId=id&collaboratorEmail=email`
- GET /api/executions/:id - Obtener una ejecución específica por ID (requiere autenticación)
- POST /api/executions - Iniciar una nueva ejecución (requiere autenticación)
- PUT /api/executions/:id - Actualizar una ejecución en progreso (requiere autenticación)
- POST /api/executions/:id/complete - Completar una ejecución (requiere autenticación)

### Endpoint base:
- GET / - Información de la API y endpoints disponibles

## Modelos de datos

### Checklist Template
```json
{
  "_id": "ObjectId",
  "title": "string",
  "description": "string",
  "items": [
    {
      "id": "string",
      "text": "string",
      "type": "checkbox|text|number|select",
      "required": "boolean",
      "options": ["array"] // solo para type: select
    }
  ],
  "category": "string",
  "createdBy": "string",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Assignment
```json
{
  "_id": "ObjectId",
  "checklistId": "ObjectId",
  "checklistTitle": "string",
  "collaboratorEmail": "string",
  "collaboratorName": "string",
  "title": "string",
  "description": "string",
  "dueDate": "Date",
  "priority": "low|medium|high",
  "status": "pending|in_progress|completed|reviewed",
  "assignedBy": "string",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Execution
```json
{
  "_id": "ObjectId",
  "assignmentId": "ObjectId",
  "assignmentTitle": "string",
  "checklistId": "ObjectId",
  "collaboratorEmail": "string",
  "collaboratorName": "string",
  "responses": [
    {
      "itemId": "string",
      "value": "any",
      "timestamp": "Date"
    }
  ],
  "notes": "string",
  "location": {
    "latitude": "number",
    "longitude": "number",
    "address": "string"
  },
  "status": "in_progress|completed|reviewed",
  "startedAt": "Date",
  "completedAt": "Date",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## Notas técnicas

- Todos los endpoints requieren autenticación JWT mediante header `Authorization: Bearer <token>`
- Los errores se devuelven en formato JSON con estructura consistente
- Se implementa validación de permisos (los colaboradores solo pueden ver/editar sus propias asignaciones)
- Las fechas se manejan en formato ISO 8601
- Se mantiene trazabilidad de quién crea/modifica cada registro