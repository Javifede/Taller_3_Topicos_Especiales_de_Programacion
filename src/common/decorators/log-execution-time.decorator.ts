export function LogExecutionTime(): MethodDecorator {
  return (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: unknown[]) {
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
