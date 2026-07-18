import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class AopInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.getArgByIndex(2)?.req ?? {};
    const operation = context.getHandler().name;

    const before = `[AOP] Before executing ${operation}`;
    console.log(before);

    return next.handle().pipe(
      map((data) => {
        const after = `[AOP] After executing ${operation}`;
        console.log(after);
        return { data, timestamp: new Date().toISOString() };
      }),
    );
  }
}
