/** Mirrors backend `src/modules/auth/auth.types.ts` (`UserRole`, `SafeUser`). */
export type UserRole = 'student' | 'instructor' | 'admin';

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  isEmailVerified: boolean;
}

/** POST /api/auth/register body */
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: Exclude<UserRole, 'admin'>; // admin cannot self-register (see auth.validator.ts)
}

/** POST /api/auth/login body */
export interface LoginPayload {
  email: string;
  password: string;
}

/** POST /api/auth/forgot-password body */
export interface ForgotPasswordPayload {
  email: string;
}

/** POST /api/auth/reset-password body */
export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}

/** data payload of POST /api/auth/login response */
export interface LoginResult {
  user: SafeUser;
  accessToken: string;
  expiresIn: string;
}

/** data payload of POST /api/auth/refresh-token response */
export interface RefreshResult {
  accessToken: string;
  expiresIn: string;
}
