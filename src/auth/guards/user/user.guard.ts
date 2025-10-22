import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class UserGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  handleRequest(err: any, user: any, info: Error, context: ExecutionContext) {
    if(!user) {
      return null;
    }
    return user
  }
}
// export class UserGuard extends AuthGuard('jwt') implements CanActivate {
//   canActivate(
//     context: ExecutionContext,
//   ): boolean | Promise<boolean> | Observable<boolean> {
//     return true;
//   }

//   constructor(private readonly reflector: Reflector) {
//       super();
//   }
  
//   handleRequest(err: any, user: any, info: Error, context: ExecutionContext) {
//       if(!user) {
//         return null;
//       }
//       return user
//     }
// }