# Colección Postman - Checklist Backend API

Colección completa para probar el backend del sistema de checklists.

## 📁 Archivos incluidos

- `Checklist-Backend.postman_collection.json` — Colección con todos los endpoints
- `Checklist-Backend.postman_environment.json` — Variables de entorno
- `README.md` — Este archivo

## 🚀 Configuración inicial

1. Abrir Postman → **Import** → seleccionar ambos archivos JSON
2. Seleccionar el environment **"Checklist Backend Environment"**
3. Iniciar el servidor:

```bash
npm run dev
```

> El servidor corre en **http://localhost:5000**

### Variables de entorno

| Variable | Valor |
|----------|-------|
| `base_url` | `http://localhost:5000` |
| `admin_email` | `admin@checklist.com` |
| `admin_password` | `admin123` |
| `supervisor_email` | `supervisor@ort.edu.ar` |
| `collaborator_email` | `Nestor.Wilke@ejemplo.com` |
| `collaborator_password` | `pass123` |

---

## 🔐 Roles y permisos

### Admin (`admin@checklist.com` / `admin123`)
| Recurso | GET | POST | PUT/PATCH | DELETE |
|---------|-----|------|-----------|--------|
| Users | ✅ | ✅ | — | — |
| Checklists | ✅ | ✅ | ✅ | — |
| Tasks | ✅ | ✅ | ✅ | ✅ |
| Assignments | ✅ | ✅ | ✅ | ✅ |
| Executions | ✅ | ✅ | ✅ (PATCH) | — |

### Supervisor (`supervisor@ort.edu.ar`)
Mismos permisos que Admin.

### Colaborador (`Nestor.Wilke@ejemplo.com` / `pass123`)
| Recurso | Permitido |
|---------|-----------|
| GET /api/assignments/my | ✅ Ver sus asignaciones |
| POST /api/executions | ✅ Iniciar ejecución propia |
| PUT /api/executions/:id | ✅ Guardar progreso (solo las propias) |
| POST /api/executions/:id/complete | ✅ Completar ejecución propia |
| POST/PUT/DELETE checklists | ❌ 403 |
| POST/PATCH/DELETE tasks | ❌ 403 |
| POST/DELETE assignments | ❌ 403 |
| PATCH executions/:id | ❌ 403 |

---

## 🧪 Flujo de pruebas recomendado

### Paso 1 — Autenticación
1. **Login Admin** → guarda `jwt_token` automáticamente
2. **Login Supervisor** → guarda `jwt_token`
3. **Login Colaborador** → guarda `jwt_token`

### Paso 2 — Checklists (con token Admin/Supervisor)
1. **Get All Checklists** → copiar un `_id` para usarlo después
2. **Get Checklist by ID**
3. **Create Checklist**
4. **Update Checklist**

### Paso 3 — Tasks (con token Admin/Supervisor)
1. **Get All Tasks**
2. **Create Task**
3. **Update Task** (PATCH con `status`)
4. **Delete Task**

### Paso 4 — Assignments (con token Admin/Supervisor)
1. **Get All Assignments**
2. **Get My Assignments** (cambia a token colaborador)
3. **Create Assignment** — requiere `checklistId`, `collaboratorEmail`, `title`
4. **Update Assignment Status**
5. **Delete Assignment**

### Paso 5 — Executions (flujo completo)
Con token **Colaborador**:
1. **Create Execution** — body: `{ "assignmentId": "<id>" }`
2. **Update Execution** — guardar respuestas parciales
3. **Complete Execution** — enviar todas las respuestas

Con token **Admin/Supervisor**:
4. **Change Execution Status** (PATCH) — marcar como `reviewed`

### Paso 6 — Pruebas de seguridad
1. **Unauthorized Access** — sin token → 401
2. **Role-Based Access** — colaborador intentando crear checklist → 403
3. **Invalid Login** → 401

---

## � Bodies de referencia

### Create Assignment
```json
{
  "checklistId": "CHECKLIST_ID_HERE",
  "collaboratorEmail": "Nestor.Wilke@ejemplo.com",
  "collaboratorName": "Nestor Wilke",
  "title": "Inspección semanal",
  "description": "Descripción opcional",
  "priority": "high"
}
```

> `dueDate` es opcional. Si se omite, no se almacena (requerido por schema de Atlas).

### Create Execution
```json
{
  "assignmentId": "ASSIGNMENT_ID_HERE"
}
```

### Update Execution (guardar progreso)
```json
{
  "responses": [
    { "itemId": "1", "value": "Correcta" },
    { "itemId": "2", "value": 1250 }
  ],
  "notes": "Revisión parcial completada"
}
```

### Complete Execution
```json
{
  "responses": [
    { "itemId": "1", "value": "Correcta" },
    { "itemId": "2", "value": 1250 },
    { "itemId": "3", "value": "Sin fugas" },
    { "itemId": "4", "value": "Abiertas" }
  ],
  "notes": "Inspección completada sin anomalías"
}
```

### Change Execution Status (Admin/Supervisor)
```json
{ "status": "reviewed" }
```

---

## 🔧 Obtener IDs para pruebas

1. Ejecutar **Get All Checklists** → copiar un `_id`
2. Ejecutar **Create Assignment** con ese `checklistId`
3. Copiar el `id` de la respuesta → usar en **Create Execution**
4. Copiar el `id` de la ejecución → usar en Update/Complete/PATCH

---

## 🐛 Solución de problemas

| Error | Causa | Solución |
|-------|-------|----------|
| 401 | Token ausente o expirado | Ejecutar login de nuevo |
| 403 | Rol sin permisos | Usar Admin/Supervisor para esa operación |
| 400 | Datos inválidos o regla de negocio | Revisar el mensaje de error en la respuesta |
| 404 | ID no existe | Obtener IDs frescos con los GETs |
| 500 | Error del servidor | Revisar logs del servidor (`npm run dev`) |

---

## 📊 Datos de prueba disponibles

### Colaboradores
| Email | Password | Nombre |
|-------|----------|--------|
| `Nestor.Wilke@ejemplo.com` | `pass123` | Nestor Wilke |
| `Adele.Vance@ejemplo.com` | `pass123` | Adele Vance |
| `Alex.Wilber@ejemplo.com` | `pass123` | Alex Wilber |
| `Diego.Siciliani@ejemplo.com` | `pass123` | Diego Siciliani |

### Checklists Oil & Gas pre-cargados
- Inspección diaria de pozo en operación
- Inspección de seguridad en área de pozo
- Mantenimiento preventivo de bomba ESP
