import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { ICourseProgress, UpdateLessonProgressDto, UpdateLessonProgressResult } from '../models/progress.model';

/** Matches every route in backend `src/modules/progress/progress.routes.ts`. All require auth. */
@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/progress`;

  getCourseProgress(courseId: string): Observable<ICourseProgress> {
    return this.http.get<ApiResponse<ICourseProgress>>(`${this.baseUrl}/${courseId}`).pipe(map((res) => res.data));
  }

  updateLessonProgress(courseId: string, dto: UpdateLessonProgressDto): Observable<UpdateLessonProgressResult> {
    return this.http
      .patch<ApiResponse<UpdateLessonProgressResult>>(`${this.baseUrl}/${courseId}/lesson`, dto)
      .pipe(map((res) => res.data));
  }
}
