import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { InternshipService } from '../../core/services/internship.service';
import { IInternship, IInternshipApplication } from '../../core/models/internship.model';

/**
 * Student-facing internship board — wraps `GET /api/internships`,
 * `POST /api/internships/:id/apply`, and `GET /api/internships/applications/me`.
 */
@Component({
  selector: 'app-internship-board',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './internship-board.html',
})
export class InternshipBoardComponent implements OnInit {
  private readonly internshipService = inject(InternshipService);

  internships = signal<IInternship[]>([]);
  myApplications = signal<IInternshipApplication[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  searchTerm = signal<string>('');

  applyingToId = signal<string | null>(null);
  resumeUrl = signal<string>('');
  coverLetter = signal<string>('');
  submittingApplication = signal<boolean>(false);

  ngOnInit(): void {
    this.load();
    this.loadMyApplications();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.internshipService.list({ status: 'open', searchTerm: this.searchTerm() || undefined, page: 1, pageSize: 30 }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.internships.set(res.data);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.error.set((err as { error?: { message?: string } })?.error?.message ?? 'Could not load internships.');
      },
    });
  }

  loadMyApplications(): void {
    this.internshipService.getMyApplications().subscribe({
      next: (apps) => this.myApplications.set(apps),
      error: () => undefined,
    });
  }

  hasApplied(internshipId: string): boolean {
    return this.myApplications().some((a) => a.internshipId === internshipId);
  }

  startApply(internship: IInternship): void {
    this.applyingToId.set(internship._id);
    this.resumeUrl.set('');
    this.coverLetter.set('');
  }

  cancelApply(): void {
    this.applyingToId.set(null);
  }

  submitApplication(internship: IInternship): void {
    if (!this.resumeUrl().trim()) {
      this.error.set('A resume URL is required to apply.');
      return;
    }
    this.submittingApplication.set(true);
    this.internshipService
      .applyToInternship(internship._id, { resumeUrl: this.resumeUrl(), coverLetter: this.coverLetter() || undefined })
      .subscribe({
        next: () => {
          this.submittingApplication.set(false);
          this.applyingToId.set(null);
          this.loadMyApplications();
        },
        error: (err: unknown) => {
          this.submittingApplication.set(false);
          this.error.set((err as { error?: { message?: string } })?.error?.message ?? 'Application failed.');
        },
      });
  }
}
