import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedResult } from '../models/api-response.model';
import {
  AccessCheckResult,
  EnrollFreeDto,
  IEnrollment,
  InitiatePaymentDto,
  InitiatePaymentResult,
  MyEnrollmentFilters,
  VerifyPaymentDto,
} from '../models/enrollment.model';

/** Matches every route in backend `src/modules/enrollment/enrollment.routes.ts`. All require auth. */
@Injectable({ providedIn: 'root' })
export class EnrollmentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/enrollments`;

  enrollFree(dto: EnrollFreeDto): Observable<IEnrollment> {
    return this.http.post<ApiResponse<IEnrollment>>(`${this.baseUrl}/free`, dto).pipe(map((res) => res.data));
  }

  initiatePayment(dto: InitiatePaymentDto): Observable<InitiatePaymentResult> {
    return this.http
      .post<ApiResponse<InitiatePaymentResult>>(`${this.baseUrl}/payment/initiate`, dto)
      .pipe(map((res) => res.data));
  }

  verifyPayment(dto: VerifyPaymentDto): Observable<IEnrollment> {
    return this.http
      .post<ApiResponse<IEnrollment>>(`${this.baseUrl}/payment/verify`, dto)
      .pipe(map((res) => res.data));
  }

  getMyEnrollments(filters: MyEnrollmentFilters): Observable<PaginatedResult<IEnrollment>> {
    let params = new HttpParams();
    if (filters.status) params = params.set('status', filters.status);
    if (filters.page) params = params.set('page', filters.page);
    if (filters.pageSize) params = params.set('pageSize', filters.pageSize);
    return this.http
      .get<ApiResponse<PaginatedResult<IEnrollment>>>(`${this.baseUrl}/me`, { params })
      .pipe(map((res) => res.data));
  }

  checkAccess(courseId: string): Observable<AccessCheckResult> {
    return this.http
      .get<ApiResponse<AccessCheckResult>>(`${this.baseUrl}/access/${courseId}`)
      .pipe(map((res) => res.data));
  }
}
