import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Route guard for router-based navigation. `app.routes.ts` in this
 * project doesn't currently declare any routes (the shell in `app.ts`
 * switches views manually via signals), so this guard is not wired up
 * yet — add it to a route's `canActivate` array once real routing is
 * introduced, e.g.:
 *
 *   { path: 'dashboard', component: LearnerWorkspace, canActivate: [authGuard] }
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
