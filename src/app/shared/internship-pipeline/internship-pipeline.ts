import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { InternshipService } from '../../core/services/internship.service';
import { AuthService } from '../../core/services/auth.service';
import { ApplicationStage, IInternshipApplication, PipelineView } from '../../core/models/internship.model';
import { SafeUser } from '../../core/models/auth.model';

const STAGES: ApplicationStage[] = ['applied', 'screening', 'interview', 'offer', 'accepted', 'rejected'];

interface PipelineCard {
  application: IInternshipApplication;
  applicant: SafeUser | null;
}

/**
 * Hiring pipeline Kanban board — wraps
 * `GET /api/internships/:id/pipeline` and
 * `PATCH /api/internships/applications/:applicationId/stage`
 * (instructor/admin only, see internship.routes.ts).
 *
 * Applicant identity is resolved via `GET /auth/users/:id`
 * (instructor/admin-only endpoint — see auth.routes.ts), one call per
 * unique studentId in the pipeline.
 */
@Component({
  selector: 'app-internship-pipeline',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './internship-pipeline.html',
})
export class InternshipPipelineComponent implements OnInit {
  internshipId = input.required<string>();

  private readonly internshipService = inject(InternshipService);
  private readonly authService = inject(AuthService);

  readonly stages = STAGES;
  columns = signal<Record<ApplicationStage, PipelineCard[]>>({
    applied: [], screening: [], interview: [], offer: [], accepted: [], rejected: [],
  });
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  movingId = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.internshipService.getPipeline(this.internshipId()).subscribe({
      next: (views: PipelineView[]) => {
        const allApps = views.flatMap((v) => v.applications);
        const uniqueStudentIds = [...new Set(allApps.map((a) => a.studentId))];

        if (uniqueStudentIds.length === 0) {
          this.setColumns(views, {});
          this.loading.set(false);
          return;
        }

        forkJoin(
          uniqueStudentIds.map((id) => this.authService.getUserById(id).pipe(catchError(() => of(null))))
        ).subscribe((users) => {
          const byId: Record<string, SafeUser | null> = {};
          uniqueStudentIds.forEach((id, i) => (byId[id] = users[i]));
          this.setColumns(views, byId);
          this.loading.set(false);
        });
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.error.set((err as { error?: { message?: string } })?.error?.message ?? 'Could not load the pipeline.');
      },
    });
  }

  private setColumns(views: PipelineView[], applicantsById: Record<string, SafeUser | null>): void {
    const next: Record<ApplicationStage, PipelineCard[]> = {
      applied: [], screening: [], interview: [], offer: [], accepted: [], rejected: [],
    };
    for (const view of views) {
      next[view.stage] = view.applications.map((application) => ({
        application,
        applicant: applicantsById[application.studentId] ?? null,
      }));
    }
    this.columns.set(next);
  }

  moveTo(card: PipelineCard, stage: ApplicationStage): void {
    if (card.application.stage === stage) return;
    this.movingId.set(card.application._id);
    this.internshipService.moveApplicationStage(card.application._id, { stage }).subscribe({
      next: () => {
        this.movingId.set(null);
        this.load();
      },
      error: (err: unknown) => {
        this.movingId.set(null);
        this.error.set((err as { error?: { message?: string } })?.error?.message ?? 'Could not move application.');
      },
    });
  }

  stageLabel(stage: ApplicationStage): string {
    return stage.charAt(0).toUpperCase() + stage.slice(1);
  }
}
