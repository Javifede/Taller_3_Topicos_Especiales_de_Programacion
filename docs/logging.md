# Feature: Logging

## Rama: `feature/logging`

## Descripción

Implementa el sistema de logging del servidor usando dos mecanismos complementarios:

1. **`LoggingInterceptor`** – Interceptor global que registra el tiempo de ejecución de cada handler usando el Logger nativo de NestJS.
2. **`HttpExceptionFilter`** – Filtro de excepciones HTTP que captura errores y los registra con nivel `error`.

## Archivos

| Archivo | Descripción |
|---------|-------------|
| `src/common/interceptors/logging.interceptor.ts` | Logging de duración de handlers |
| `src/common/filters/http-exception.filter.ts` | Captura y log de excepciones HTTP |

---

## `LoggingInterceptor`

### Comportamiento

1. Obtiene el nombre del handler con `context.getHandler().name`.
2. Obtiene el nombre de la clase con `context.getClass().name`.
3. Captura el tiempo inicial con `Date.now()`.
4. Deja pasar la ejecución con `next.handle()`.
5. Usa el operador `tap` de RxJS para observar la respuesta **sin modificarla**.
6. Al finalizar, registra: `ClassName.handlerName ejecutado en Xms`.

### Diferencia con `AopInterceptor`

| Característica | `LoggingInterceptor` | `AopInterceptor` |
|----------------|---------------------|------------------|
| Modifica respuesta | ❌ No | ✅ Sí (envuelve en `{data, timestamp}`) |
| Operador RxJS | `tap` | `map` |
| Propósito | Métricas de tiempo | Aspecto Before/After + transformación |

### Ejemplo de salida

```
[LoggingInterceptor] TasksResolver.findAll ejecutado en 3ms
[LoggingInterceptor] TasksResolver.createTask ejecutado en 5ms
```

### Registro global

```typescript
// app.module.ts
{
  provide: APP_INTERCEPTOR,
  useClass: LoggingInterceptor,
}
```

---

## `HttpExceptionFilter`

### Comportamiento

1. Captura excepciones de tipo `HttpException` (y subclases como `NotFoundException`).
2. Obtiene el status HTTP con `exception.getStatus()`.
3. Obtiene el mensaje con `exception.message`.
4. Registra con `logger.error()` incluyendo el stack trace.
5. Envía una respuesta JSON con `{ statusCode, message, timestamp }`.

### Ejemplo de salida en consola

```
[HttpExceptionFilter] ERROR HttpException: 404 – Task with id "xyz" not found
```

### Registro global

```typescript
// main.ts
app.useGlobalFilters(new HttpExceptionFilter());
```

### Cuándo se activa

- Al solicitar `task(id: "id-inexistente")` → `NotFoundException` (404)
- Ante inputs inválidos capturados por `ValidationPipe` → `BadRequestException` (400)

## Commit

```
feat: implement logging interceptor and exception filter
```
