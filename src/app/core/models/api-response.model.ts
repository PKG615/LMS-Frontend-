/**
 * Mirrors backend `src/utils/ApiResponse.ts` — every backend endpoint
 * (success path) responds with exactly this envelope.
 */
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

/**
 * Mirrors backend `ApiError` as formatted by
 * `src/middlewares/errorHandler.middleware.ts`.
 */
export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errors: string[];
}

/** Mirrors the paginated shape used by course/enrollment/internship/review list endpoints. */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
