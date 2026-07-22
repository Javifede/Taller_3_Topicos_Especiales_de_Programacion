import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';

/**
 * Filtro de excepciones HTTP para NestJS.
 *
 * Captura todas las excepciones del tipo {@link HttpException} lanzadas en
 * la aplicación y las registra usando el Logger nativo de NestJS con nivel
 * `error`. Esto incluye excepciones como `NotFoundException` (404),
 * `BadRequestException` (400), etc.
 *
 * @remarks
 * El filtro se registra globalmente en {@link main.ts} mediante
 * `app.useGlobalFilters()`. En un contexto GraphQL, los errores HTTP se
 * manejan directamente por Apollo Driver, pero este filtro actúa como
 * capa de seguridad para el transporte HTTP subyacente.
 *
 * @example
 * Salida en consola al solicitar una tarea inexistente:
 * ```
 * [HttpExceptionFilter] HttpException: 404 – Task with id "xyz" not found
 * ```
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  /** Logger interno para registrar los errores HTTP capturados. */
  private readonly logger = new Logger(HttpExceptionFilter.name);

  /**
   * Maneja la excepción HTTP capturada, registrando el error y enviando
   * una respuesta JSON estandarizada.
   *
   * @param {HttpException} exception - La excepción HTTP lanzada.
   * @param {ArgumentsHost} host - El host de argumentos del contexto actual.
   */
  catch(exception: HttpException, host: ArgumentsHost): void {
    const status = exception.getStatus();
    const message = exception.message;

    this.logger.error(
      `HttpException: ${status} – ${message}`,
      exception.stack,
    );

    // Responder solo si el contexto es HTTP (no aplica directamente en GraphQL)
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<{
      status: (code: number) => { json: (body: unknown) => void };
    }>();

    if (response && typeof response.status === 'function') {
      response.status(status).json({
        statusCode: status,
        message,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
