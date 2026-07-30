import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { CertificateVerificationResult, ICertificate } from '../models/certificate.model';

/** Matches every route in backend `src/modules/certificate/certificate.routes.ts`. */
@Injectable({ providedIn: 'root' })
export class CertificateService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/certificates`;

  /** Public — no auth required. */
  verify(certificateNumber: string): Observable<CertificateVerificationResult> {
    return this.http
      .get<ApiResponse<CertificateVerificationResult>>(`${this.baseUrl}/verify/${certificateNumber}`)
      .pipe(map((res) => res.data));
  }

  getMyCertificates(): Observable<ICertificate[]> {
    return this.http.get<ApiResponse<ICertificate[]>>(`${this.baseUrl}/me`).pipe(map((res) => res.data));
  }

  getMyCertificate(courseId: string): Observable<ICertificate> {
    return this.http.get<ApiResponse<ICertificate>>(`${this.baseUrl}/me/${courseId}`).pipe(map((res) => res.data));
  }

  /**
   * Triggers a file download (backend responds with `res.download(...)`,
   * not a JSON envelope) — request as a blob and let the caller create
   * an object URL / anchor click.
   */
  downloadCertificate(courseId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/me/${courseId}/download`, { responseType: 'blob' });
  }
}
