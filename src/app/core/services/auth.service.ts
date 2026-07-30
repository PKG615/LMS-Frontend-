import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  ForgotPasswordPayload,
  LoginPayload,
  LoginResult,
  RefreshResult,
  RegisterPayload,
  ResetPasswordPayload,
  SafeUser,
} from '../models/auth.model';

/**
 * Central authentication service — the single source of truth for
 * "who is logged in" on the client.
 *
 * Token strategy (matches the backend's design in
 * src/modules/auth/auth.controller.ts):
 *  - The short-lived JWT **access token** is kept in memory only
 *    (never localStorage/sessionStorage, to reduce XSS exposure) and
 *    attached to outgoing requests by `core/interceptors/auth.interceptor.ts`.
 *  - The long-lived **refresh token** lives in an httpOnly, secure
 *    cookie set directly by the backend (`refreshToken`, see
 *    `setRefreshCookie` in auth.controller.ts) — JS never touches it.
 *    Every request that needs it (`/auth/login`, `/auth/refresh-token`,
 *    `/auth/logout`) must be sent with `withCredentials: true`.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  private readonly _accessToken = signal<string | null>(null);
  private readonly _user = signal<SafeUser | null>(null);
  private readonly _initialized = signal(false);

  readonly accessToken = this._accessToken.asReadonly();
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly initialized = this._initialized.asReadonly();

  register(payload: RegisterPayload): Observable<SafeUser> {
    return this.http
      .post<ApiResponse<SafeUser>>(`${this.baseUrl}/register`, payload)
      .pipe(map((res) => res.data));
  }

  login(payload: LoginPayload): Observable<LoginResult> {
    return this.http
      .post<ApiResponse<LoginResult>>(`${this.baseUrl}/login`, payload, { withCredentials: true })
      .pipe(
        map((res) => res.data),
        tap((result) => {
          this._accessToken.set(result.accessToken);
          this._user.set(result.user);
        })
      );
  }

  /**
   * Redeems the httpOnly refresh cookie for a new access token.
   * Called once on app bootstrap (see `initializeAuth` provider in
   * app.config.ts) to silently restore a session after a page reload,
   * and again by the auth interceptor whenever a request 401s.
   */
  refreshToken(): Observable<RefreshResult | null> {
    return this.http
      .post<ApiResponse<RefreshResult>>(`${this.baseUrl}/refresh-token`, {}, { withCredentials: true })
      .pipe(
        map((res) => res.data),
        tap((result) => this._accessToken.set(result.accessToken)),
        catchError(() => {
          this._accessToken.set(null);
          this._user.set(null);
          return of(null);
        })
      );
  }

  /** Fetches the current user profile — used after a token refresh to repopulate `user()`. */
  getMe(): Observable<SafeUser> {
    return this.http.get<ApiResponse<SafeUser>>(`${this.baseUrl}/me`).pipe(
      map((res) => res.data),
      tap((user) => this._user.set(user))
    );
  }

  logout(): Observable<void> {
    return this.http
      .post<ApiResponse<null>>(`${this.baseUrl}/logout`, {}, { withCredentials: true })
      .pipe(
        map(() => void 0),
        tap(() => {
          this._accessToken.set(null);
          this._user.set(null);
        })
      );
  }

  forgotPassword(payload: ForgotPasswordPayload): Observable<void> {
    return this.http
      .post<ApiResponse<null>>(`${this.baseUrl}/forgot-password`, payload)
      .pipe(map(() => void 0));
  }

  resetPassword(payload: ResetPasswordPayload): Observable<void> {
    return this.http
      .post<ApiResponse<null>>(`${this.baseUrl}/reset-password`, payload)
      .pipe(map(() => void 0));
  }

  /**
   * Called once at app startup. Attempts a silent refresh so a user
   * with a still-valid refresh cookie stays logged in across reloads,
   * without ever putting the access token in persistent storage.
   */
  bootstrap(): Observable<void> {
    return this.refreshToken().pipe(
      map((result) => {
        this._initialized.set(true);
        return result;
      }),
      map(() => void 0),
      // If refresh succeeded we still need the user profile.
      tap(() => {
        if (this._accessToken()) {
          this.getMe().subscribe({ error: () => undefined });
        }
      })
    );
  }

  /** GET /auth/users/:id — instructor/admin only (e.g. resolving an applicant's identity in the pipeline view). */
  getUserById(id: string): Observable<SafeUser> {
    return this.http.get<ApiResponse<SafeUser>>(`${this.baseUrl}/users/${id}`).pipe(map((res) => res.data));
  }

  /** Used internally by the auth interceptor to set a freshly-refreshed token. */
  setAccessToken(token: string | null): void {
    this._accessToken.set(token);
  }
}
