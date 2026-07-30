import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedResult } from '../models/api-response.model';
import {
  ApplyToInternshipDto,
  CreateInternshipDto,
  IInternship,
  IInternshipApplication,
  InternshipFilters,
  PipelineView,
  StageChangeDto,
  UpdateInternshipDto,
} from '../models/internship.model';

function toHttpParams<T extends object>(filters: T): HttpParams {
  let params = new HttpParams();
  for (const [key, value] of Object.entries(filters as Record<string, unknown>)) {
    if (value !== undefined && value !== null && value !== '') {
      params = params.set(key, String(value));
    }
  }
  return params;
}

/** Matches every route in backend `src/modules/internship/internship.routes.ts`. */
@Injectable({ providedIn: 'root' })
export class InternshipService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/internships`;

  list(filters: InternshipFilters): Observable<PaginatedResult<IInternship>> {
    return this.http
      .get<ApiResponse<PaginatedResult<IInternship>>>(this.baseUrl, { params: toHttpParams(filters) })
      .pipe(map((res) => res.data));
  }

  getById(id: string): Observable<IInternship> {
    return this.http.get<ApiResponse<IInternship>>(`${this.baseUrl}/${id}`).pipe(map((res) => res.data));
  }

  create(dto: CreateInternshipDto): Observable<IInternship> {
    return this.http.post<ApiResponse<IInternship>>(this.baseUrl, dto).pipe(map((res) => res.data));
  }

  update(id: string, dto: UpdateInternshipDto): Observable<IInternship> {
    return this.http.put<ApiResponse<IInternship>>(`${this.baseUrl}/${id}`, dto).pipe(map((res) => res.data));
  }

  close(id: string): Observable<IInternship> {
    return this.http
      .patch<ApiResponse<IInternship>>(`${this.baseUrl}/${id}/close`, {})
      .pipe(map((res) => res.data));
  }

  getPipeline(id: string): Observable<PipelineView[]> {
    return this.http
      .get<ApiResponse<PipelineView[]>>(`${this.baseUrl}/${id}/pipeline`)
      .pipe(map((res) => res.data));
  }

  applyToInternship(id: string, dto: ApplyToInternshipDto): Observable<IInternshipApplication> {
    return this.http
      .post<ApiResponse<IInternshipApplication>>(`${this.baseUrl}/${id}/apply`, dto)
      .pipe(map((res) => res.data));
  }

  getMyApplications(): Observable<IInternshipApplication[]> {
    return this.http
      .get<ApiResponse<IInternshipApplication[]>>(`${this.baseUrl}/applications/me`)
      .pipe(map((res) => res.data));
  }

  moveApplicationStage(applicationId: string, dto: StageChangeDto): Observable<IInternshipApplication> {
    return this.http
      .patch<ApiResponse<IInternshipApplication>>(`${this.baseUrl}/applications/${applicationId}/stage`, dto)
      .pipe(map((res) => res.data));
  }
}