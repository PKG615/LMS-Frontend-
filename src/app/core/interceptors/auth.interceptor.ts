import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Functional HTTP interceptor (Angular 15+ style, registered via
 * `provideHttpClient(withInterceptors([authInterceptor]))` in
 * app.config.ts).
 *
 * Responsibilities, matching the backend's contract:
 *  1. Attach `Authorization: Bearer <accessToken>` to every request
 *     (backend/src/middlewares/auth.middleware.ts expects exactly this
 *     header shape; requests without it hit `optionalAuthenticate`
 *     routes as anonymous, or `authenticate` routes get a 401).
 *  2. On a 401 response (access token expired/invalid), transparently
 *     redeem the httpOnly refresh cookie via `/api/auth/refresh-token`
 *     and retry the original request exactly once. If the refresh
 *     itself fails, the user is genuinely logged out.
 *
 * Never attaches the token to the refresh-token call itself, to avoid
 * an infinite retry loop.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.accessToken();

  const authedReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authedReq).pipe(
    catchError((error: unknown) => {
      const isAuthEndpoint = req.url.includes('/auth/login') || req.url.includes('/auth/refresh-token');

      if (error instanceof HttpErrorResponse && error.status === 401 && !isAuthEndpoint) {
        return authService.refreshToken().pipe(
          switchMap((result) => {
            if (!result) {
              return throwError(() => error);
            }
            const retriedReq = req.clone({
              setHeaders: { Authorization: `Bearer ${result.accessToken}` },
            });
            return next(retriedReq);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
