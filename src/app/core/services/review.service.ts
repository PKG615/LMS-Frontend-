import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { CreateReviewDto, IReview, PaginatedReviews, ReviewFilters, UpdateReviewDto } from '../models/review.model';

/** Matches every route in backend `src/modules/review/review.routes.ts`. Listing is public; writes require auth. */
@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/reviews`;

  list(filters: ReviewFilters): Observable<PaginatedReviews> {
    let params = new HttpParams().set('targetType', filters.targetType).set('targetId', filters.targetId);
    if (filters.page) params = params.set('page', filters.page);
    if (filters.pageSize) params = params.set('pageSize', filters.pageSize);
    return this.http.get<ApiResponse<PaginatedReviews>>(this.baseUrl, { params }).pipe(map((res) => res.data));
  }

  add(dto: CreateReviewDto): Observable<IReview> {
    return this.http.post<ApiResponse<IReview>>(this.baseUrl, dto).pipe(map((res) => res.data));
  }

  update(id: string, dto: UpdateReviewDto): Observable<IReview> {
    return this.http.put<ApiResponse<IReview>>(`${this.baseUrl}/${id}`, dto).pipe(map((res) => res.data));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`).pipe(map(() => void 0));
  }
}
