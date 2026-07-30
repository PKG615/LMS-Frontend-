import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../core/services/notification.service';
import { INotification } from '../../core/models/notification.model';

/**
 * Live notification list backed by `GET /api/notifications/me`.
 * The backend models notifications as a one-way sent log (email
 * receipts), not an interactive inbox — there is no "mark as read"
 * endpoint, so this component is read-only by design (see gap #6 in
 * the architecture spec). It's additive to the existing mock
 * notification center UI, not a replacement for it.
 */
@Component({
  selector: 'app-notification-inbox',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notification-inbox.html',
})
export class NotificationInboxComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);

  notifications = signal<INotification[]>([]);
  total = signal<number>(0);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  page = signal<number>(1);
  readonly pageSize = 10;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.notificationService.getMyNotifications({ page: this.page(), pageSize: this.pageSize }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.notifications.set(res.data);
        this.total.set(res.total);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.error.set((err as { error?: { message?: string } })?.error?.message ?? 'Could not load notifications.');
      },
    });
  }

  nextPage(): void {
    if (this.page() * this.pageSize < this.total()) {
      this.page.update((p) => p + 1);
      this.load();
    }
  }

  prevPage(): void {
    if (this.page() > 1) {
      this.page.update((p) => p - 1);
      this.load();
    }
  }

  statusIcon(status: INotification['status']): string {
    if (status === 'sent') return 'mark_email_read';
    if (status === 'failed') return 'error_outline';
    return 'schedule_send';
  }
}
