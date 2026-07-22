# Feature: GraphQL API

## Rama: `feature/graphql-setup`

## Descripción

Configura y expone la API GraphQL usando NestJS Apollo Driver en modo "code first" (generación automática del schema). El schema se genera en `src/schema.gql` al compilar.

## Configuración en `AppModule`

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
  sortSchema: true,
})
```

## Archivo de schema generado: `src/schema.gql`

```graphql
type Query {
  task(id: String!): Task!
  tasks: [Task!]!
}

type Mutation {
  createTask(createTaskInput: CreateTaskInput!): Task!
  updateTask(updateTaskInput: UpdateTaskInput!): Task!
  removeTask(id: String!): Boolean!
}
```

## Resolver: `TasksResolver`

| Operación | Tipo | Descripción |
|-----------|------|-------------|
| `tasks` | Query | Lista todas las tareas |
| `task(id)` | Query | Retorna una tarea por ID |
| `createTask(input)` | Mutation | Crea una nueva tarea |
| `updateTask(input)` | Mutation | Actualiza campos de una tarea |
| `removeTask(id)` | Mutation | Elimina una tarea |

## Ejemplos de uso (GraphQL Playground)

### Consultar todas las tareas
```graphql
query {
  tasks {
    id
    title
    description
    status
    tags
    assignedTo
    projectId
    createdAt
  }
}
```

### Crear una tarea
```graphql
mutation {
  createTask(createTaskInput: {
    title: "Implementar autenticación"
    description: "Agregar JWT al proyecto"
    assignedTo: "mario@email.com"
    projectId: "proyecto-alpha"
    status: TODO
    tags: ["auth", "backend"]
  }) {
    id
    title
    status
    createdAt
  }
}
```

### Actualizar una tarea
```graphql
mutation {
  updateTask(updateTaskInput: {
    id: "uuid-aqui"
    status: IN_PROGRESS
    tags: ["auth", "backend", "jwt"]
  }) {
    id
    title
    status
    tags
  }
}
```

### Eliminar una tarea
```graphql
mutation {
  removeTask(id: "uuid-aqui")
}
```

## Acceso al Playground

Una vez levantado el servidor:
```
http://localhost:3000/graphql
```

## Commit

```
feat: connect GraphQL resolver to task service with JSDoc
```
