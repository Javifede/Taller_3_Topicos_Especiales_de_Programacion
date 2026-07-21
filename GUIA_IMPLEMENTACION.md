# Guía de Implementación - Sistema de Gestión de Tareas

## Estructura del Proyecto

```
src/
├── main.ts                            # Punto de entrada (ya implementado)
├── app.module.ts                      # Módulo raíz (ya implementado)
├── tasks/
│   ├── tasks.module.ts                # Módulo de tareas (esqueleto)
│   ├── tasks.resolver.ts              # GraphQL resolver (esqueleto)
│   ├── tasks.service.ts               # Lógica de negocio (esqueleto)
│   ├── dto/
│   │   ├── create-task.input.ts       # DTO para crear (esqueleto)
│   │   └── update-task.input.ts       # DTO para actualizar (esqueleto)
│   ├── entities/
│   │   └── task.entity.ts             # Entidad Task (esqueleto)
│   └── enums/
│       └── task-status.enum.ts        # Enum TaskStatus (esqueleto)
└── common/
    ├── interceptors/
    │   ├── logging.interceptor.ts     # Interceptor de logs (esqueleto)
    │   └── aop.interceptor.ts         # Interceptor AOP (esqueleto)
    ├── decorators/
    │   └── log-execution-time.decorator.ts  # Decorator AOP (esqueleto)
    └── filters/
        └── http-exception.filter.ts   # Filtro de errores (esqueleto)
```

---

## 1. TasksService (`src/tasks/tasks.service.ts`)

### Responsabilidad
Manejar el arreglo en memoria de tareas con operaciones CRUD. Cada tarea se identifica por un UUID único.

### Pseudocódigo

```
CLASE TasksService
  ARREGLO privado tasks = []

  // Listar todas
  FUNCION findAll(): Task[]
    RETORNAR tasks

  // Buscar una por ID
  FUNCION findOne(id: string): Task
    task = tasks.buscar(t => t.id == id)
    SI task NO existe:
      LANZAR NotFoundException("Task con id X no encontrada")
    RETORNAR task

  // Crear tarea
  FUNCION create(input: CreateTaskInput): Task
    task = NUEVA Task()
    task.id = uuidv4()
    task.title = input.title
    task.description = input.description
    task.status = input.status SI existe, SINO usar TaskStatus.BACKLOG
    task.tags = input.tags SI existe, SINO arreglo vacío
    task.createdAt = new Date()
    task.assignedTo = input.assignedTo
    task.projectId = input.projectId
    tasks.agregar(task)
    RETORNAR task

  // Actualizar tarea
  FUNCION update(input: UpdateTaskInput): Task
    task = this.findOne(input.id)  // reusa findOne (lánza error si no existe)
    SI input.title NO es undefined → task.title = input.title
    SI input.description NO es undefined → task.description = input.description
    SI input.status NO es undefined → task.status = input.status
    SI input.tags NO es undefined → task.tags = input.tags
    SI input.assignedTo NO es undefined → task.assignedTo = input.assignedTo
    SI input.projectId NO es undefined → task.projectId = input.projectId
    RETORNAR task

  // Eliminar tarea
  FUNCION remove(id: string): boolean
    índice = tasks.encontrarIndice(t => t.id == id)
    SI índice == -1:
      LANZAR NotFoundException("Task con id X no encontrada")
    tasks.eliminarEn(índice)
    RETORNAR true
```

### Detalles técnicos
- Usa `uuid` (paquete `uuid`) para generar IDs únicos: `import { v4 as uuidv4 } from 'uuid'`
- Usa `NotFoundException` de `@nestjs/common` para errores 404
- El arreglo `tasks` es privado y vive solo en memoria (se reinicia al reiniciar el servidor)

---

## 2. TasksResolver (`src/tasks/tasks.resolver.ts`)

### Responsabilidad
Exponer las operaciones del servicio como queries y mutations GraphQL.

### Pseudocódigo

```
CLASE TasksResolver
  CONSTRUCTOR(tasksService)

  @Query(devuelve [Task], nombre "tasks")
  FUNCION findAll(): Task[]
    RETORNAR tasksService.findAll()

  @Query(devuelve Task, nombre "task")
  FUNCION findOne(@Args("id") id: string): Task
    RETORNAR tasksService.findOne(id)

  @Mutation(devuelve Task)
  FUNCION createTask(@Args("createTaskInput") input): Task
    RETORNAR tasksService.create(input)

  @Mutation(devuelve Task)
  FUNCION updateTask(@Args("updateTaskInput") input): Task
    RETORNAR tasksService.update(input)

  @Mutation(devuelve Boolean)
  FUNCION removeTask(@Args("id") id: string): boolean
    RETORNAR tasksService.remove(id)
```

### Conceptos GraphQL
- **@Query**: define consultas que obtienen datos (GET)
- **@Mutation**: define operaciones que modifican datos (POST/PUT/DELETE)
- **@Args**: extrae argumentos de la petición GraphQL
- El decorador `@Resolver(() => Task)` asocia este resolver con la entidad Task
- NestJS genera automáticamente el schema GraphQL en `src/schema.gql` basado en los decoradores

---

## 3. LoggingInterceptor (`src/common/interceptors/logging.interceptor.ts`)

### Responsabilidad
Interceptar TODAS las peticiones al servidor y registrar en consola:
- Qué clase controladora/manejó la petición
- Qué método se ejecutó
- Cuánto tiempo tomó

### Pseudocódigo

```
CLASE LoggingInterceptor
  logger = NUEVO Logger("LoggingInterceptor")

  FUNCION intercept(context, next):
    handler = context.getHandler().name     // ej: "findAll", "createTask"
    controller = context.getClass().name     // ej: "TasksResolver"
    ahora = Date.now()

    RETORNAR next.handle().pipe(
      tap(() => {
        elapsed = Date.now() - ahora
        logger.log("$(controller).$(handler) ejecutado en $(elapsed)ms")
      })
    )
```

### Notas importantes
- Usa `tap` de `rxjs` para ejecutar el log sin modificar la respuesta
- `context.getHandler()` devuelve el método manejador actual
- `context.getClass()` devuelve la clase donde está definido el método
- El `Logger` de NestJS ya formatea la salida con timestamp y contexto

---

## 4. AopInterceptor (`src/common/interceptors/aop.interceptor.ts`)

### Responsabilidad
Implementar el patrón AOP (Programación Orientada a Aspectos):
- Ejecutar código ANTES de cada operación
- Ejecutar código DESPUÉS de cada operación
- Envolver la respuesta con metadatos adicionales

### Pseudocódigo

```
CLASE AopInterceptor
  FUNCION intercept(context, next):
    operacion = context.getHandler().name

    // --- BEFORE (código que se ejecuta antes del método) ---
    console.log("[AOP] Antes de ejecutar:", operacion)

    RETORNAR next.handle().pipe(
      map((data) => {
        // --- AFTER (código que se ejecuta después del método) ---
        console.log("[AOP] Después de ejecutar:", operacion)

        // Envuelve la respuesta con metadatos
        RETORNAR {
          data: data,
          timestamp: new Date().toISOString(),
          operation: operacion
        }
      })
    )
```

### Concepto AOP
- **Before advice**: código que corre antes del método target (en el interceptor, antes de next.handle())
- **After advice**: código que corre después del método target (dentro del pipe después de que la respuesta se emite)
- **Around advice**: el interceptor completo actúa como around advice, envolviendo el método
- En NestJS, los interceptores SON la implementación de AOP

---

## 5. LogExecutionTime Decorator (`src/common/decorators/log-execution-time.decorator.ts`)

### Responsabilidad
Decorador de método que mide y registra el tiempo de ejecución de un método específico.
A diferencia del interceptor (que afecta a TODOS los métodos), este decorador se aplica
individualmente a métodos concretos.

### Pseudocódigo

```
FUNCION LogExecutionTime(): MethodDecorator
  RETORNAR (target, propertyKey, descriptor) => {
    metodoOriginal = descriptor.value

    descriptor.value = FUNCION (...args) {
      inicio = Date.now()
      resultado = metodoOriginal.apply(this, args)

      SI resultado es Promise:
        RETORNAR resultado.then(data => {
          elapsed = Date.now() - inicio
          logger.log("$(propertyKey) tomó $(elapsed)ms")
          RETORNAR data
        })

      // Si no es async (síncrono)
      elapsed = Date.now() - inicio
      logger.log("$(propertyKey) tomó $(elapsed)ms")
      RETORNAR resultado

    RETORNAR descriptor
  }
```

### Cómo usarlo
```typescript
@LogExecutionTime()
create(input: CreateTaskInput): Task {
  // NestJS ejecutará esto automáticamente
}
```

### Notas
- Debes manejar tanto métodos síncronos como asíncronos (Promise)
- Usa `Logger` de `@nestjs/common` para los logs
- El decorador NO modifica la firma ni el valor retornado del método original

---

## 6. HttpExceptionFilter (`src/common/filters/http-exception.filter.ts`)

### Responsabilidad
Capturar TODAS las excepciones HTTP que ocurran en el servidor y registrarlas en un log.

### Pseudocódigo

```
CLASE HttpExceptionFilter
  logger = NUEVO Logger("HttpExceptionFilter")

  FUNCION catch(exception: HttpException, host: ArgumentsHost):
    status = exception.getStatus()         // ej: 404, 400, 500
    message = exception.message

    // Registrar el error
    logger.error("HTTP $(status): $(message)")

    // Opcional: registrar en archivo o servicio externo
    // fs.appendFileSync("src/logs/errors.log", "[$(new Date())] $(status): $(message)\n")
```

### Notas
- El filter está registrado globalmente en `main.ts` con `useGlobalFilters()`
- NestJS automáticamente devuelve la respuesta HTTP al cliente; el filter solo sirve para logging
- Si quieres personalizar la respuesta, puedes modificar `host`:
  ```typescript
  const ctx = host.switchToHttp()
  const response = ctx.getResponse<Response>()
  response.status(status).json({ error: message, status })
  ```
  (Opcional, ya que NestJS lo hace por defecto)

---

## 7. Flujo Completo de una Petición

```
Cliente GraphQL
    │
    ▼
HttpExceptionFilter (global - captura errores)
    │
    ▼
AopInterceptor (global - before/after AOP)
    │
    ▼
LoggingInterceptor (global - mide tiempo)
    │
    ▼
TasksResolver (resuelve query/mutation)
    │
    ▼
TasksService (lógica de negocio CRUD)
    │
    ▼
[Respuesta] ───► Cliente
```

---

## 8. Ramas GitFlow y Orden Sugerido

```
main ────► develop ────► feature/task-crud
                        ├──► feature/graphql-setup
                        ├──► feature/aop-implementation
                        └──► feature/logging
```

### Orden sugerido para implementar:

| Paso | Rama | Archivos a implementar |
|------|------|----------------------|
| 1 | `feature/task-crud` | `tasks.service.ts` (CRUD completo) |
| 2 | `feature/graphql-setup` | `tasks.resolver.ts` (conectar con service) |
| 3 | `feature/aop-implementation` | `aop.interceptor.ts`, `log-execution-time.decorator.ts` |
| 4 | `feature/logging` | `logging.interceptor.ts`, `http-exception.filter.ts` |
| 5 | Merge todo a `develop` y luego a `main` | |

---

## 8. Buenas Prácticas (Clean Code)

1. **Nombres descriptivos**: `findAll`, `findOne`, `createTask`, `updateTask`, `removeTask`
2. **Funciones pequeñas**: cada método hace una sola cosa
3. **JSDoc**: documenta cada método público con `/** ... */`
4. **Manejo de errores**: usa excepciones HTTP de NestJS (`NotFoundException`, `BadRequestException`)
5. **Validación**: los DTOs ya tienen decoradores `class-validator`, usa `ValidationPipe`
6. **Logs**: siempre registra errores y tiempo de ejecución para depuración

---

## 9. Ejemplo de JSDoc

```typescript
/**
 * Retrieves all tasks from the in-memory store.
 *
 * @returns {Task[]} Array of all registered tasks
 */
findAll(): Task[] {
  return this.tasks;
}

/**
 * Creates a new task with the provided input data.
 *
 * @param {CreateTaskInput} input - Task creation data
 * @returns {Task} The newly created task with generated UUID
 */
create(input: CreateTaskInput): Task {
  // ...
}
```
