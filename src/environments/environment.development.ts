/**
 * Development environment configuration.
 * Used by `ng serve` (default configuration) and by
 * `ng build --configuration development`.
 *
 * Matches the backend's default PORT (5000, see src/config/env.validator.ts)
 * and the `/api` prefix mounted in src/app.ts.
 */
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
};
