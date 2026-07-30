/**
 * Production environment configuration.
 * Swapped in automatically by `ng build --configuration production`
 * via the fileReplacements entry in angular.json.
 */
export const environment = {
  production: true,
  // NOTE: this app uses Angular SSR (see src/server.ts / app.config.server.ts).
  // HttpClient's fetch backend needs an ABSOLUTE URL when running on the
  // server (there is no browser "current origin" to resolve a relative
  // path against), so replace this with your real deployed API origin,
  // e.g. 'https://api.yourdomain.com/api'.
  apiUrl: 'https://your-api-domain.example.com/api',
};
