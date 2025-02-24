import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs';
import { ClassConstructor, plainToInstance } from 'class-transformer';

@Injectable()
export class TransformMultipleDataInterceptor implements NestInterceptor {
  constructor(
    private readonly classToUseRec: Record<string, ClassConstructor<unknown>>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((data) => {
        const res = {};
        Object.entries(data).forEach(([key, value]) => {
          const classToUse = this.classToUseRec[key];
          res[key] = plainToInstance(classToUse, value);
        });

        return res;
      }),
    );
  }
}
