# Paso a Paso - Taller Gestión de Tareas

Este documento te guía paso a paso en el orden exacto en que debes trabajar,
especificando **qué hacer**, **en qué rama** y **cuándo hacer commit**.

---

## Convenciones de commits

Usa estos prefijos para mensajes claros:

| Prefijo | Significado |
|---------|-------------|
| `feat:` | Nueva funcionalidad |
| `fix:` | Corrección de bugs |
| `docs:` | Documentación |
| `refactor:` | Cambios en código sin cambiar funcionalidad |
| `chore:` | Tareas de mantenimiento |

---

## Paso 0: Subir la base a GitHub

El proyecto base ya está listo en `main` con todo lo necesario. Lo primero es subirlo a GitHub.

```bash
# 1. Crear un repositorio VACÍO en GitHub (SIN README, SIN .gitignore)
#    y copiar la URL que te dé GitHub

# 2. Conectar tu repositorio local con el remoto
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git

# 3. Subir todas las ramas a GitHub
git push -u origin --all
```

Después de este paso, en GitHub deben aparecer todas las ramas:
`main`, `develop`, `feature/task-crud`, `feature/graphql-setup`,
`feature/aop-implementation`, `feature/logging`.

---

## Paso 1: Implementar CRUD de Tareas

### Rama: `feature/task-crud`

Muévete a la rama:

```bash
git checkout feature/task-crud
```

### Qué hacer

Editar `src/tasks/tasks.service.ts`. Implementar estos 5 métodos:

| Método | Lógica |
|--------|--------|
| `findAll()` | Retornar todas las tareas del arreglo |
| `findOne(id)` | Buscar por ID; lanzar error si no existe |
| `create(input)` | Generar UUID, asignar valores, guardar y retornar |
| `update(input)` | Buscar tarea, actualizar campos, retornar |
| `remove(id)` | Buscar índice, eliminar del arreglo, retornar true |

### Verificar que funciona

```bash
npm run build    # Debe compilar sin errores
```

### Hacer commit

```bash
git add src/tasks/tasks.service.ts
git commit -m "feat: implement Task CRUD with in-memory storage"
```

---

## Paso 2: Conectar GraphQL Resolver

### Rama: `feature/graphql-setup`

```bash
git checkout feature/graphql-setup
```

### Qué hacer

Editar `src/tasks/tasks.resolver.ts`. Solo falta que cada método del resolver
llame correctamente al `tasksService`.

La estructura ya está armada con los decoradores `@Query`, `@Mutation`, `@Args`.
Solo asegúrate de que al hacer `npm run build` se genere el schema GraphQL
en `src/schema.gql`.

### Verificar que funciona

```bash
npm run build
```

Si compila bien, significa que NestJS generó el schema automáticamente.

### Hacer commit

```bash
git add src/tasks/tasks.resolver.ts src/schema.gql
git commit -m "feat: connect GraphQL resolver to task service"
```

---

## Paso 3: Merge parcial a develop

Después de los pasos 1 y 2, integra los cambios a `develop`:

```bash
git checkout develop
git merge feature/task-crud
git merge feature/graphql-setup
```

Si hay conflictos, revísalos y arréglalos. Luego:

```bash
npm run build   # Verificar que sigue compilando
git add .
git commit -m "feat: merge task-crud and graphql-setup into develop"

# Opcional: probar que el servidor funciona
npm run start:dev
# Abrir http://localhost:3000/graphql en el navegador
```

---

## Paso 4: Implementar AOP

### Rama: `feature/aop-implementation`

```bash
git checkout feature/aop-implementation
```

### Qué hacer

Editar estos 2 archivos:

#### `src/common/interceptors/aop.interceptor.ts`

Hacer que el interceptor:
1. Registre en consola `[AOP] Before: NOMBRE_DEL_METODO` antes de ejecutar
2. Deje pasar la ejecución con `next.handle()`
3. Cuando llegue la respuesta, registre `[AOP] After: NOMBRE_DEL_METODO`
4. Envuelva la respuesta en un objeto `{ data, timestamp }`

Usa `map` de `rxjs/operators` para modificar la respuesta.

#### `src/common/decorators/log-execution-time.decorator.ts`

Hacer que el decorador:
1. Capture el tiempo antes de ejecutar el método
2. Ejecute el método original
3. Si el método es asíncrono (retorna Promise), esperar la respuesta
4. Calcule el tiempo transcurrido
5. Registre en consola `NOMBRE_METODO took Xms`
6. Retorne el resultado original (sin modificarlo)

### Verificar y commitear

```bash
npm run build
git add src/common/interceptors/aop.interceptor.ts src/common/decorators/log-execution-time.decorator.ts
git commit -m "feat: implement AOP interceptor and execution time decorator"
```

---

## Paso 5: Implementar Logging

### Rama: `feature/logging`

```bash
git checkout feature/logging
```

### Qué hacer

Editar estos 2 archivos:

#### `src/common/interceptors/logging.interceptor.ts`

Hacer que el interceptor:
1. Obtenga el nombre del handler (`context.getHandler().name`)
2. Obtenga el nombre de la clase (`context.getClass().name`)
3. Capture el tiempo inicial con `Date.now()`
4. Deje pasar la ejecución con `next.handle()`
5. Cuando termine, calcule el tiempo transcurrido
6. Registre con Logger: `TasksResolver.findAll ejecutado en 5ms`

Usa `tap` de `rxjs` para hacer el log sin alterar la respuesta.

#### `src/common/filters/http-exception.filter.ts`

Hacer que el filtro:
1. Obtenga el status de la excepción (`exception.getStatus()`)
2. Obtenga el mensaje (`exception.message`)
3. Registre con `logger.error()` el error con formato claro

### Verificar y commitear

```bash
npm run build
git add src/common/interceptors/logging.interceptor.ts src/common/filters/http-exception.filter.ts
git commit -m "feat: implement logging interceptor and exception filter"
```

---

## Paso 6: Integración final a develop

```bash
git checkout develop
git merge feature/aop-implementation
git merge feature/logging
```

Resolver conflictos si los hay, luego:

```bash
npm run build
npm run start:dev
# Probar todas las operaciones en http://localhost:3000/graphql
```

Si todo funciona:

```bash
git add .
git commit -m "feat: merge AOP and logging into develop"
```

---

## Paso 7: Publicar a main

```bash
git checkout main
git merge develop
```

```bash
npm run build   # Última verificación
```

```bash
git add .
git commit -m "feat: release v1.0 - task management system"

# Subir TODO a GitHub
git push origin --all
```

---

## Paso 8: Verificar en GitHub

1. Ir a tu repositorio en `https://github.com/TU_USUARIO/TU_REPOSITORIO`
2. Confirmar que la rama `main` tiene todos los archivos
3. Confirmar que NO están subidos `node_modules/` ni `.env` (si hiciste todo bien, el `.gitignore` los bloquea)
4. Revisar que `src/schema.gql` se generó correctamente

---

## Resumen Visual

```
main  ●──────────────────────────────────────────────● (Paso 7)
      │                                              ▲
      │                                              │
develop ●────●────────●────────●────────●─────────────● (Paso 6)
          ▲          ▲        ▲        ▲
          │          │        │        │
feature/  ●──────────┘        │        │
task-crud  (Paso 1)           │        │
                              │        │
feature/  ●───────────────────┘        │
graphql-  (Paso 2)                     │
setup                                  │
                                       │
feature/  ●────────────────────────────┘
aop-      (Paso 4)
impl.
                                       │
feature/  ●────────────────────────────┘
logging   (Paso 5)

Paso 3: merge parcial a develop
Paso 6: merge final a develop
Paso 7: merge develop → main
Paso 8: git push --all
```

---

## Checklist Final

- [ ] ¿Compila con `npm run build`?
- [ ] ¿El servidor corre con `npm run start:dev`?
- [ ] ¿GraphQL playground responde en `http://localhost:3000/graphql`?
- [ ] ¿Puedes ejecutar la query `tasks { id title status }` y obtener datos?
- [ ] ¿Puedes crear una tarea con `createTask`?
- [ ] ¿Puedes actualizar y eliminar tareas?
- [ ] ¿Los interceptores muestran logs en la consola?
- [ ] ¿Los mensajes `[AOP] Before/After` aparecen al hacer peticiones?
- [ ] ¿El filtro captura errores (ej: pedir un ID que no existe)?
- [ ] ¿Los commits tienen mensajes claros con prefijos (`feat:`, `fix:`)?
- [ ] ¿Hay más de un commit en el repositorio (no todo en 1)?
- [ ] ¿`node_modules/` y `.env` NO están en el repositorio de GitHub?
