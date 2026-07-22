import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Interceptor de AOP (Programación Orientada a Aspectos) para NestJS.
 *
 * Implementa el patrón de aspecto "Before / After" alrededor de cada handler:
 * - **Before**: registra un log con el nombre del método antes de ejecutarlo.
 * - **After**: registra un log con el nombre del método y envuelve la
 *   respuesta en un objeto `{ data, timestamp }`.
 *
 * @remarks
 * Este interceptor se registra globalmente en {@link AppModule} mediante el
 * token `APP_INTERCEPTOR`, por lo que aplica a todos los resolvers y
 * controladores de la aplicación.
 *
 * @example
 * Respuesta envuelta:
 * ```json
 * {
 *   "data": { "id": "abc", "title": "Mi tarea" },
 *   "timestamp": "2026-06-20T12:00:00.000Z"
 * }
 * ```
 */
@Injectable()
export class AopInterceptor implements NestInterceptor {
  /** Logger interno para registrar los mensajes de AOP. */
  private readonly logger = new Logger(AopInterceptor.name);

  /**
   * Intercepta la ejecución de un handler y aplica el aspecto Before/After.
   *
   * @param {ExecutionContext} context - Contexto de ejecución que provee información
   *   sobre la clase y el método que se está invocando.
   * @param {CallHandler} next - Manejador que permite continuar con la ejecución
   *   del handler original.
   * @returns {Observable<{ data: unknown; timestamp: string }>} Observable con la
   *   respuesta envuelta en el objeto AOP estándar.
   */
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<{ data: unknown; timestamp: string }> {
    const methodName = context.getHandler().name;
    const className = context.getClass().name;

    // Aspecto "Before": log previo a la ejecución
    this.logger.log(`[AOP] Before: ${className}.${methodName}`);

    return next.handle().pipe(
      map((data) => {
        // Aspecto "After": log posterior a la ejecución
        this.logger.log(`[AOP] After: ${className}.${methodName}`);

        // Envolver la respuesta en el objeto AOP estándar
        return {
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
