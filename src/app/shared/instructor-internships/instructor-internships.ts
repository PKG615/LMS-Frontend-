import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { InternshipService } from '../../core/services/internship.service';
import { AuthService } from '../../core/services/auth.service';
import { IInternship } from '../../core/models/internship.model';
import { InternshipPipelineComponent } from '../internship-pipeline/internship-pipeline';

/**
 * Instructor-facing internship posting management — wraps
 * `POST/PUT /api/internships`, `PATCH /:id/close`, and embeds the
 * applicant pipeline Kanban for whichever posting is selected.
 */
@Component({
  selector: 'app-instructor-internships',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, InternshipPipelineComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './instructor-internships.html',
})
export class InstructorInternshipsComponent implements OnInit {
  private readonly internshipService = inject(InternshipService);
  private readonly authService = inject(AuthService);

  postings = signal<IInternship[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  selectedId = signal<string | null>(null);
  showCreateForm = signal<boolean>(false);
  creating = signal<boolean>(false);

  form = {
    title: '',
    companyName: '',
    domain: '',
    description: '',
    duration: '',
    stipendMin: 0,
    stipendMax: 0,
    location: 'remote' as 'remote' | 'onsite' | 'hybrid',
    applicationDeadline: '',
  };

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const me = this.authService.user();
    if (!me) return;
    this.loading.set(true);
    this.error.set(null);
    this.internshipService.list({ postedBy: me.id, page: 1, pageSize: 50 }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.postings.set(res.data);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.error.set((err as { error?: { message?: string } })?.error?.message ?? 'Could not load your postings.');
      },
    });
  }

  create(): void {
    if (!this.form.title || !this.form.companyName || !this.form.domain) return;
    this.creating.set(true);
    this.internshipService
      .create({
        title: this.form.title,
        companyName: this.form.companyName,
        domain: this.form.domain,
        description: this.form.description,
        responsibilities: [],
        requirements: [],
        duration: this.form.duration,
        stipendMin: this.form.stipendMin,
        stipendMax: this.form.stipendMax,
        location: this.form.location,
        applicationDeadline: this.form.applicationDeadline || new Date(Date.now() + 30 * 86400000).toISOString(),
      })
      .subscribe({
        next: () => {
          this.creating.set(false);
          this.showCreateForm.set(false);
          this.load();
        },
        error: (err: unknown) => {
          this.creating.set(false);
          this.error.set((err as { error?: { message?: string } })?.error?.message ?? 'Could not create posting.');
        },
      });
  }

  close(internship: IInternship): void {
    this.internshipService.close(internship._id).subscribe({
      next: () => this.load(),
      error: (err: unknown) => this.error.set((err as { error?: { message?: string } })?.error?.message ?? 'Could not close posting.'),
    });
  }

  viewPipeline(internship: IInternship): void {
    this.selectedId.set(this.selectedId() === internship._id ? null : internship._id);
  }
}
