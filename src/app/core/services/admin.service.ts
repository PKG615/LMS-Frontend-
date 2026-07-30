import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { PlatformOverview, RevenueReport, RevenueReportQuery, TopCourseEntry, TopCoursesQuery } from '../models/admin.model';

/** Matches every route in backend `src/modules/admin/admin.routes.ts`. Admin role required for all. */
@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/admin/analytics`;

  getPlatformOverview(): Observable<PlatformOverview> {
    return this.http.get<ApiResponse<PlatformOverview>>(`${this.baseUrl}/overview`).pipe(map((res) => res.data));
  }

  getRevenueReport(query: RevenueReportQuery = {}): Observable<RevenueReport> {
    let params = new HttpParams();
    if (query.month) params = params.set('month', query.month);
    if (query.year) params = params.set('year', query.year);
    return this.http
      .get<ApiResponse<RevenueReport>>(`${this.baseUrl}/revenue`, { params })
      .pipe(map((res) => res.data));
  }

  getTopCourses(query: TopCoursesQuery = {}): Observable<TopCourseEntry[]> {
    let params = new HttpParams();
    if (query.limit) params = params.set('limit', query.limit);
    return this.http
      .get<ApiResponse<TopCourseEntry[]>>(`${this.baseUrl}/top-courses`, { params })
      .pipe(map((res) => res.data));
  }
}
