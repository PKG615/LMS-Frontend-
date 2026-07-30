import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CertificateService } from '../../core/services/certificate.service';
import { CertificateVerificationResult } from '../../core/models/certificate.model';

/** GET /api/certificates/verify/:certificateNumber — public, no auth required. */
@Component({
  selector: 'app-certificate-verification',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './certificate-verification.html',
})
export class CertificateVerificationComponent {
  private readonly certificateService = inject(CertificateService);

  certificateNumber = signal<string>('');
  result = signal<CertificateVerificationResult | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  searched = signal<boolean>(false);

  verify(): void {
    const number = this.certificateNumber().trim();
    if (!number) return;
    this.loading.set(true);
    this.error.set(null);
    this.searched.set(true);
    this.certificateService.verify(number).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.result.set(res);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.result.set(null);
        this.error.set((err as { error?: { message?: string } })?.error?.message ?? 'Could not verify certificate.');
      },
    });
  }
}
