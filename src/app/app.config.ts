import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { AuthService } from './core/services/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // withFetch: uses the platform fetch API instead of XMLHttpRequest,
    // which is required for HttpClient to work under Angular SSR
    // (see app.config.server.ts) and is also the recommended default
    // for zoneless apps.
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    // Silently attempts to redeem the httpOnly refresh-token cookie on
    // every app bootstrap, so a logged-in user stays logged in across
    // full page reloads without ever storing the access token in
    // localStorage. See AuthService.bootstrap() for details.
    provideAppInitializer(() => {
      const authService = inject(AuthService);
      return new Promise<void>((resolve) => {
        authService.bootstrap().subscribe({
          next: () => resolve(),
          error: () => resolve(),
        });
      });
    }),
  ],
};
