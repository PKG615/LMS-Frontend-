import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedResult } from '../models/api-response.model';
import { BroadcastDto, INotification, MyNotificationsFilters } from '../models/notification.model';

/** Matches every route in backend `src/modules/notification/notification.routes.ts`. All require auth. */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/notifications`;

  getMyNotifications(filters: MyNotificationsFilters = {}): Observable<PaginatedResult<INotification>> {
    let params = new HttpParams();
    if (filters.page) params = params.set('page', filters.page);
    if (filters.pageSize) params = params.set('pageSize', filters.pageSize);
    return this.http
      .get<ApiResponse<PaginatedResult<INotification>>>(`${this.baseUrl}/me`, { params })
      .pipe(map((res) => res.data));
  }

  /** instructor/admin only. */
  broadcastAnnouncement(dto: BroadcastDto): Observable<void> {
    return this.http.post<ApiResponse<null>>(`${this.baseUrl}/broadcast`, dto).pipe(map(() => void 0));
  }

  /** admin only. */
  retryFailedNotifications(): Observable<void> {
    return this.http.post<ApiResponse<null>>(`${this.baseUrl}/retry-failed`, {}).pipe(map(() => void 0));
  }
}
