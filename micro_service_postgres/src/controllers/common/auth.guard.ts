import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { APP_CONFIG, AppConfig } from "../../services/config/app-config";

/** Verifies the JWT access token and attaches its payload to `request.user`. */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    private readonly jwtService: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request.headers.authorization);
    if (!token) {
      throw new UnauthorizedException("Missing authorization header");
    }

    let payload: { type?: string };
    try {
      payload = this.jwtService.verify(token, {
        secret: this.config.TOKEN_SECRET,
      });
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }

    if (payload.type !== "access") {
      throw new UnauthorizedException("Access token required");
    }

    request.user = payload;
    return true;
  }

  /** Accepts both "Bearer <token>" and a raw token. */
  private extractToken(header: unknown): string | undefined {
    if (typeof header !== "string") return undefined;
    const value = header.startsWith("Bearer ") ? header.slice(7) : header;
    return value.trim() || undefined;
  }
}
