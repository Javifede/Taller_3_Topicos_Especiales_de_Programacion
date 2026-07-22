# Documentación del Proyecto – Taller 3

## Sistema de Gestión de Tareas | NestJS + GraphQL

---

## Índice

| Documento | Descripción |
|-----------|-------------|
| [task-crud.md](./task-crud.md) | CRUD de tareas – entidad, servicio, DTOs |
| [graphql-api.md](./graphql-api.md) | API GraphQL – queries, mutations, ejemplos |
| [aop.md](./aop.md) | AOP – interceptor y decorador de tiempo |
| [logging.md](./logging.md) | Logging – interceptor y filtro de excepciones |

---

## Arquitectura General

```
src/
├── app.module.ts            # Módulo raíz (GraphQL + interceptores globales)
├── main.ts                  # Punto de entrada (filtros globales + validación)
├── schema.gql               # Schema GraphQL generado automáticamente
├── tasks/
│   ├── entities/
│   │   └── task.entity.ts   # Entidad Task (ObjectType)
│   ├── dto/
│   │   ├── create-task.input.ts
│   │   └── update-task.input.ts
│   ├── enums/
│   │   └── task-status.enum.ts
│   ├── tasks.module.ts
│   ├── tasks.resolver.ts    # Resolver GraphQL
│   └── tasks.service.ts     # Lógica CRUD en memoria
└── common/
    ├── interceptors/
    │   ├── aop.interceptor.ts
    │   └── logging.interceptor.ts
    ├── decorators/
    │   └── log-execution-time.decorator.ts
    └── filters/
        └── http-exception.filter.ts
```

## Flujo GitFlow

```
main  ●──────────────────────────────────────────────● (release v1.0)
      │                                              ▲
      │                                              │
develop ●────●────────●────────●────────●─────────────● (merge AOP + logging)
          ▲          ▲        ▲        ▲
          │          │        │        │
feature/task-crud ●──┘        │        │
feature/graphql-setup ●───────┘        │
feature/aop-implementation ●───────────┘
feature/logging ●──────────────────────┘
```

## Cómo ejecutar

```bash
# Instalar dependencias
npm install

# Compilar
npm run build

# Iniciar en modo desarrollo
npm run start:dev

# Acceder al playground
# http://localhost:3000/graphql
```

## Estados de la tarea (`TaskStatus`)

| Valor | Descripción |
|-------|-------------|
| `BACKLOG` | Tarea pendiente sin priorizar (default) |
| `TODO` | Tarea lista para iniciar |
| `IN_PROGRESS` | Tarea en desarrollo activo |
| `DONE` | Tarea completada |
