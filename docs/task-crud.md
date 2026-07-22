# Feature: Task CRUD (Gestión de Tareas)

## Rama: `feature/task-crud`

## Descripción

Implementa el almacenamiento en memoria y la lógica de negocio completa para las tareas del sistema de gestión de proyectos de software. La capa de datos usa un arreglo en memoria (`Task[]`) gestionado por `TasksService`.

## Archivos clave

| Archivo | Rol |
|---------|-----|
| `src/tasks/tasks.service.ts` | Lógica CRUD con in-memory storage |
| `src/tasks/entities/task.entity.ts` | Entidad GraphQL `Task` |
| `src/tasks/dto/create-task.input.ts` | Input de creación |
| `src/tasks/dto/update-task.input.ts` | Input de actualización (parcial) |
| `src/tasks/enums/task-status.enum.ts` | Enum de estados: BACKLOG, TODO, IN_PROGRESS, DONE |

## Estructura de la entidad `Task`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `ID` (UUID) | Identificador único generado automáticamente |
| `title` | `String` | Título de la tarea |
| `description` | `String` | Descripción detallada |
| `status` | `TaskStatus` | Estado actual de la tarea |
| `tags` | `[String]` | Etiquetas dinámicas |
| `createdAt` | `DateTime` | Fecha de creación (generada en servidor) |
| `assignedTo` | `String` | Usuario responsable de la tarea |
| `projectId` | `String` | Proyecto al que pertenece la tarea |

## Métodos del servicio

### `findAll(): Task[]`
Retorna todas las tareas almacenadas en memoria.

### `findOne(id: string): Task`
Busca una tarea por UUID. Lanza `NotFoundException` si no existe.

### `create(input: CreateTaskInput): Task`
Crea una nueva tarea con:
- `id` generado con `uuid/v4`
- `status` por defecto: `BACKLOG`
- `tags` por defecto: `[]`
- `createdAt` = `new Date()`

### `update(input: UpdateTaskInput): Task`
Actualiza solo los campos definidos en el input. Lanza `NotFoundException` si la tarea no existe.

### `remove(id: string): boolean`
Elimina la tarea del arreglo. Retorna `true` si fue exitoso. Lanza `NotFoundException` si no existe.

## Decorador aplicado

Cada método usa `@LogExecutionTime()` para registrar el tiempo de ejecución (ver [aop.md](./aop.md)).

## Commit

```
feat: implement Task CRUD with in-memory storage and JSDoc
```
