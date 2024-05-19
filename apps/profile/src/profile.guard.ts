import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { AuthenticationService } from '../../authentication/src/authentication.service'; // If AuthenticationService handles JWT validation

@Injectable()
export class ProfileGuard implements CanActivate {
  constructor(private readonly authService: AuthenticationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    try {
      const { authorization }: any = request.headers;
      if (!authorization || !authorization.startsWith('Bearer ')) {
        throw new UnauthorizedException('No authentication token provided');
      }
      const authToken = authorization.split(' ')[1];
      const user = await this.authService.validateToken(authToken);
      if (!user) {
        throw new UnauthorizedException('Invalid token or token expired');
      }
      request.user = user; // Attach user to the request for further use in controllers
      return true;
    } catch (error) {
      console.log('Authentication error:', error.message);
      throw new ForbiddenException(
        'Access denied: ' +
          (error.message || 'Session expired, please sign in again'),
      );
    }
  }
}
