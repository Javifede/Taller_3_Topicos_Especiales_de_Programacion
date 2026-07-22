# Feature: AOP – Programación Orientada a Aspectos

## Rama: `feature/aop-implementation`

## Descripción

Implementa dos mecanismos de AOP (Aspect-Oriented Programming) en el servidor:

1. **`AopInterceptor`** – Interceptor global que agrega comportamiento transversal (cross-cutting concern) de logging y transformación de respuestas.
2. **`LogExecutionTime` decorator** – Decorador de método que mide el tiempo de ejecución de cada operación del servicio.

## Archivos

| Archivo | Descripción |
|---------|-------------|
| `src/common/interceptors/aop.interceptor.ts` | Interceptor Before/After con envoltorio de respuesta |
| `src/common/decorators/log-execution-time.decorator.ts` | Decorador de medición de tiempo por método |

---

## `AopInterceptor`

### Comportamiento

1. **Before**: Registra `[AOP] Before: ClassName.methodName` antes de ejecutar el handler.
2. Permite la ejecución con `next.handle()`.
3. **After**: Al recibir la respuesta, registra `[AOP] After: ClassName.methodName`.
4. Envuelve la respuesta en: `{ data: <respuesta_original>, timestamp: <ISO_string> }`.

### Ejemplo de salida en consola

```
[AopInterceptor] [AOP] Before: TasksResolver.findAll
[AopInterceptor] [AOP] After: TasksResolver.findAll
```

### Ejemplo de respuesta transformada

```json
{
  "data": {
    "tasks": [
      { "id": "abc", "title": "Mi tarea", "status": "TODO" }
    ]
  },
  "timestamp": "2026-06-20T14:30:00.000Z"
}
```

### Registro global

```typescript
// app.module.ts
{
  provide: APP_INTERCEPTOR,
  useClass: AopInterceptor,
}
```

---

## `LogExecutionTime` decorator

### Comportamiento

1. Captura el tiempo con `Date.now()` antes de ejecutar el método.
2. Ejecuta el método original.
3. Si el método es asíncrono (retorna `Promise`), espera la resolución.
4. Calcula el tiempo transcurrido.
5. Registra: `[LogExecutionTime] nombreMetodo took Xms`.
6. Retorna el resultado original sin modificarlo.

### Uso

```typescript
@LogExecutionTime()
findAll(): Task[] {
  return this.tasks;
}
// Consola: [LogExecutionTime] findAll took 1ms
```

### Aplicación actual

Aplicado a todos los métodos de `TasksService`:
- `findAll()`
- `findOne(id)`
- `create(input)`
- `update(input)`
- `remove(id)`

## Commit

```
feat: implement AOP interceptor and execution time decorator
```
