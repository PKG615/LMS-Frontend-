import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ReviewService } from '../../core/services/review.service';
import { AuthService } from '../../core/services/auth.service';
import { IReview, ReviewTargetType } from '../../core/models/review.model';

/**
 * Self-contained, embeddable reviews panel — wraps every route in
 * `src/modules/review/review.routes.ts`. Drop it into any detail page
 * with `[targetType]` + `[targetId]`, e.g.:
 *   <app-reviews [targetType]="'course'" [targetId]="course.id" />
 */
@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reviews.html',
})
export class ReviewsComponent implements OnInit {
  targetType = input.required<ReviewTargetType>();
  targetId = input.required<string>();

  private readonly reviewService = inject(ReviewService);
  private readonly authService = inject(AuthService);

  reviews = signal<IReview[]>([]);
  averageRating = signal<number>(0);
  total = signal<number>(0);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  myRating = signal<number>(5);
  myComment = signal<string>('');
  submitting = signal<boolean>(false);
  editingId = signal<string | null>(null);

  readonly currentUser = this.authService.user;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.reviewService.list({ targetType: this.targetType(), targetId: this.targetId(), page: 1, pageSize: 20 }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.reviews.set(res.data);
        this.averageRating.set(res.averageRating);
        this.total.set(res.total);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.error.set((err as { error?: { message?: string } })?.error?.message ?? 'Could not load reviews.');
      },
    });
  }

  myExistingReview(): IReview | undefined {
    const user = this.currentUser();
    if (!user) return undefined;
    return this.reviews().find((r) => r.studentId === user.id);
  }

  startEdit(review: IReview): void {
    this.editingId.set(review._id);
    this.myRating.set(review.rating);
    this.myComment.set(review.comment);
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.myRating.set(5);
    this.myComment.set('');
  }

  submit(): void {
    if (!this.currentUser()) return;
    if (!this.myComment().trim()) return;
    this.submitting.set(true);

    const editing = this.editingId();
    const action = editing
      ? this.reviewService.update(editing, { rating: this.myRating(), comment: this.myComment() })
      : this.reviewService.add({
          targetType: this.targetType(),
          targetId: this.targetId(),
          rating: this.myRating(),
          comment: this.myComment(),
        });

    action.subscribe({
      next: () => {
        this.submitting.set(false);
        this.cancelEdit();
        this.load();
      },
      error: (err: unknown) => {
        this.submitting.set(false);
        this.error.set((err as { error?: { message?: string } })?.error?.message ?? 'Could not submit review.');
      },
    });
  }

  delete(review: IReview): void {
    this.reviewService.delete(review._id).subscribe({
      next: () => this.load(),
      error: (err: unknown) => {
        this.error.set((err as { error?: { message?: string } })?.error?.message ?? 'Could not delete review.');
      },
    });
  }

  stars(count: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1).map((n) => (n <= Math.round(count) ? 1 : 0));
  }
}
