import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedResult } from '../models/api-response.model';
import {
  AddQuizQuestionDto,
  AutoSaveDraftDto,
  CreateCourseDto,
  CreateLessonDto,
  CreateModuleDto,
  CourseFilters,
  ICourse,
  ILesson,
  IModule,
  ReorderLessonsDto,
  SaveQuizDto,
  SaveTextContentDto,
  UpdateCourseDto,
} from '../models/course.model';

function toHttpParams<T extends object>(filters: T): HttpParams {
  let params = new HttpParams();
  for (const [key, value] of Object.entries(filters as Record<string, unknown>)) {
    if (value !== undefined && value !== null && value !== '') {
      params = params.set(key, String(value));
    }
  }
  return params;
}

/** Matches every route in backend `src/modules/course/course.routes.ts`. */
@Injectable({ providedIn: 'root' })
export class CourseService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/courses`;

  list(filters: CourseFilters): Observable<PaginatedResult<ICourse>> {
    return this.http
      .get<ApiResponse<PaginatedResult<ICourse>>>(this.baseUrl, { params: toHttpParams(filters) })
      .pipe(map((res) => res.data));
  }

  getBySlug(slug: string): Observable<ICourse> {
    return this.http.get<ApiResponse<ICourse>>(`${this.baseUrl}/slug/${slug}`).pipe(map((res) => res.data));
  }

  getById(id: string): Observable<ICourse> {
    return this.http.get<ApiResponse<ICourse>>(`${this.baseUrl}/${id}`).pipe(map((res) => res.data));
  }

  create(dto: CreateCourseDto): Observable<ICourse> {
    return this.http.post<ApiResponse<ICourse>>(this.baseUrl, dto).pipe(map((res) => res.data));
  }

  update(id: string, dto: UpdateCourseDto): Observable<ICourse> {
    return this.http.put<ApiResponse<ICourse>>(`${this.baseUrl}/${id}`, dto).pipe(map((res) => res.data));
  }

  publish(id: string): Observable<ICourse> {
    return this.http
      .patch<ApiResponse<ICourse>>(`${this.baseUrl}/${id}/publish`, {})
      .pipe(map((res) => res.data));
  }

  archive(id: string): Observable<ICourse> {
    return this.http
      .patch<ApiResponse<ICourse>>(`${this.baseUrl}/${id}/archive`, {})
      .pipe(map((res) => res.data));
  }

  getModules(courseId: string): Observable<IModule[]> {
    return this.http
      .get<ApiResponse<IModule[]>>(`${this.baseUrl}/${courseId}/modules`)
      .pipe(map((res) => res.data));
  }

  addModule(courseId: string, dto: CreateModuleDto): Observable<IModule> {
    return this.http
      .post<ApiResponse<IModule>>(`${this.baseUrl}/${courseId}/modules`, dto)
      .pipe(map((res) => res.data));
  }

  addLesson(courseId: string, moduleId: string, dto: CreateLessonDto): Observable<ILesson> {
    return this.http
      .post<ApiResponse<ILesson>>(`${this.baseUrl}/${courseId}/modules/${moduleId}/lessons`, dto)
      .pipe(map((res) => res.data));
  }

  removeLesson(courseId: string, moduleId: string, lessonId: string): Observable<void> {
    return this.http
      .delete<ApiResponse<null>>(`${this.baseUrl}/${courseId}/modules/${moduleId}/lessons/${lessonId}`)
      .pipe(map(() => void 0));
  }

  private lessonUrl(courseId: string, moduleId: string, lessonId: string): string {
    return `${this.baseUrl}/${courseId}/modules/${moduleId}/lessons/${lessonId}`;
  }

  uploadVideo(courseId: string, moduleId: string, lessonId: string, file: File): Observable<ILesson> {
    const form = new FormData();
    form.append('video', file);
    return this.http
      .post<ApiResponse<ILesson>>(`${this.lessonUrl(courseId, moduleId, lessonId)}/upload/video`, form)
      .pipe(map((res) => res.data));
  }

  uploadPdf(courseId: string, moduleId: string, lessonId: string, file: File): Observable<ILesson> {
    const form = new FormData();
    form.append('pdf', file);
    return this.http
      .post<ApiResponse<ILesson>>(`${this.lessonUrl(courseId, moduleId, lessonId)}/upload/pdf`, form)
      .pipe(map((res) => res.data));
  }

  uploadThumbnail(courseId: string, moduleId: string, lessonId: string, file: File): Observable<ILesson> {
    const form = new FormData();
    form.append('thumbnail', file);
    return this.http
      .post<ApiResponse<ILesson>>(`${this.lessonUrl(courseId, moduleId, lessonId)}/upload/thumbnail`, form)
      .pipe(map((res) => res.data));
  }

  saveText(courseId: string, moduleId: string, lessonId: string, dto: SaveTextContentDto): Observable<ILesson> {
    return this.http
      .patch<ApiResponse<ILesson>>(`${this.lessonUrl(courseId, moduleId, lessonId)}/text`, dto)
      .pipe(map((res) => res.data));
  }

  saveQuiz(courseId: string, moduleId: string, lessonId: string, dto: SaveQuizDto): Observable<ILesson> {
    return this.http
      .patch<ApiResponse<ILesson>>(`${this.lessonUrl(courseId, moduleId, lessonId)}/quiz`, dto)
      .pipe(map((res) => res.data));
  }

  addQuizQuestion(courseId: string, moduleId: string, lessonId: string, dto: AddQuizQuestionDto): Observable<ILesson> {
    return this.http
      .post<ApiResponse<ILesson>>(`${this.lessonUrl(courseId, moduleId, lessonId)}/quiz/question`, dto)
      .pipe(map((res) => res.data));
  }

  deleteQuizQuestion(courseId: string, moduleId: string, lessonId: string, questionId: string): Observable<ILesson> {
    return this.http
      .delete<ApiResponse<ILesson>>(`${this.lessonUrl(courseId, moduleId, lessonId)}/quiz/question/${questionId}`)
      .pipe(map((res) => res.data));
  }

  toggleFreePreview(courseId: string, moduleId: string, lessonId: string): Observable<ILesson> {
    return this.http
      .patch<ApiResponse<ILesson>>(`${this.lessonUrl(courseId, moduleId, lessonId)}/free-preview`, {})
      .pipe(map((res) => res.data));
  }

  reorderLessons(courseId: string, moduleId: string, dto: ReorderLessonsDto): Observable<IModule> {
    return this.http
      .patch<ApiResponse<IModule>>(`${this.baseUrl}/${courseId}/modules/${moduleId}/lessons/reorder`, dto)
      .pipe(map((res) => res.data));
  }

  autoSaveDraft(courseId: string, moduleId: string, lessonId: string, dto: AutoSaveDraftDto): Observable<ILesson> {
    return this.http
      .patch<ApiResponse<ILesson>>(`${this.lessonUrl(courseId, moduleId, lessonId)}/autosave`, dto)
      .pipe(map((res) => res.data));
  }

  publishLesson(courseId: string, moduleId: string, lessonId: string): Observable<ILesson> {
    return this.http
      .patch<ApiResponse<ILesson>>(`${this.lessonUrl(courseId, moduleId, lessonId)}/publish`, {})
      .pipe(map((res) => res.data));
  }

  /** Returns a short-lived signed URL for `/api/stream/...` (see backend `stream.routes.ts`). */
  getStreamUrl(courseId: string, moduleId: string, lessonId: string, resolution?: string): Observable<{ url: string }> {
    const params = resolution ? new HttpParams().set('resolution', resolution) : undefined;
    return this.http
      .get<ApiResponse<{ url: string }>>(`${this.lessonUrl(courseId, moduleId, lessonId)}/stream-url`, { params })
      .pipe(map((res) => res.data));
  }
}