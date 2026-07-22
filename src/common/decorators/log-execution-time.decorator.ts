import { Logger } from '@nestjs/common';

/** Logger compartido por el decorador de medición de tiempo. */
const logger = new Logger('LogExecutionTime');

/**
 * Decorador de método que mide y registra el tiempo de ejecución.
 *
 * Implementa un aspecto de rendimiento (AOP) a nivel de método: captura
 * el tiempo antes y después de ejecutar el método original, calcula la
 * diferencia y la registra en consola con el formato:
 * `[LogExecutionTime] NombreMetodo took Xms`.
 *
 * Soporta métodos tanto síncronos como asíncronos (que retornan `Promise`).
 *
 * @returns {MethodDecorator} Decorador que puede aplicarse a cualquier método de clase.
 *
 * @example
 * ```typescript
 * @LogExecutionTime()
 * async findAll(): Promise<Task[]> {
 *   return this.tasks;
 * }
 * // Salida en consola: [LogExecutionTime] findAll took 2ms
 * ```
 */
export function LogExecutionTime(): MethodDecorator {
  return (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    const originalMethod = descriptor.value as (...args: unknown[]) => unknown;
    const methodName = String(propertyKey);

    descriptor.value = function (...args: unknown[]) {
      const start = Date.now();
      const result = originalMethod.apply(this, args);

      // Soporte para métodos asíncronos (retornan Promise)
      if (result instanceof Promise) {
        return result.then((value: unknown) => {
          const elapsed = Date.now() - start;
          logger.log(`${methodName} took ${elapsed}ms`);
          return value;
        });
      }

      // Método síncrono
      const elapsed = Date.now() - start;
      logger.log(`${methodName} took ${elapsed}ms`);
      return result;
    };

    return descriptor;
  };
}
