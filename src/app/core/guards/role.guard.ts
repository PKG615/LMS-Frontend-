import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/auth.model';

/**
 * Role-based route guard factory. Mirrors the backend's
 * `authorize(...)` middleware (src/middlewares/role.middleware.ts).
 * Not wired into `app.routes.ts` yet — see the note in `auth.guard.ts`.
 *
 * Usage once routing exists:
 *   { path: 'admin', component: AdminWorkspace, canActivate: [roleGuard(['admin'])] }
 */
export function roleGuard(allowedRoles: UserRole[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const user = auth.user();

    if (user && allowedRoles.includes(user.role)) {
      return true;
    }

    router.navigate(['/']);
    return false;
  };
}
