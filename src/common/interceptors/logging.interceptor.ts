import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Interceptor de logging para NestJS.
 *
 * Registra en consola el tiempo de ejecución de cada handler invocado,
 * usando el Logger nativo de NestJS. Utiliza el operador `tap` de RxJS para
 * observar la respuesta sin modificarla.
 *
 * El formato del log es:
 * `[LoggingInterceptor] ClassName.handlerName ejecutado en Xms`
 *
 * @remarks
 * Este interceptor se registra globalmente en {@link AppModule} mediante el
 * token `APP_INTERCEPTOR`. A diferencia del {@link AopInterceptor}, este
 * interceptor NO modifica la respuesta; solo observa y registra.
 *
 * @example
 * Salida en consola al llamar `tasks { id title }`:
 * ```
 * [LoggingInterceptor] TasksResolver.findAll ejecutado en 3ms
 * ```
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  /** Logger interno para registrar las métricas de ejecución. */
  private readonly logger = new Logger(LoggingInterceptor.name);

  /**
   * Intercepta la ejecución del handler y mide su tiempo de respuesta.
   *
   * @param {ExecutionContext} context - Contexto de ejecución con información
   *   sobre el handler y la clase que lo contiene.
   * @param {CallHandler} next - Manejador que permite continuar la ejecución
   *   del handler original.
   * @returns {Observable<unknown>} Observable con la respuesta original sin modificar.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const handlerName = context.getHandler().name;
    const className = context.getClass().name;
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const elapsed = Date.now() - start;
        this.logger.log(
          `${className}.${handlerName} ejecutado en ${elapsed}ms`,
        );
      }),
    );
  }
}
