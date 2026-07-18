import { Logger } from '@nestjs/common';

const logger = new Logger('ExecutionTime');

export function LogExecutionTime(): MethodDecorator {
  return (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: unknown[]) {
      const start = Date.now();
      const result = originalMethod.apply(this, args);

      if (result instanceof Promise) {
        return result.then((data) => {
          const elapsed = Date.now() - start;
          logger.log(`${String(propertyKey)} took ${elapsed}ms`);
          return data;
        });
      }

      const elapsed = Date.now() - start;
      logger.log(`${String(propertyKey)} took ${elapsed}ms`);
      return result;
    };

    return descriptor;
  };
}
