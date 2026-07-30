import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';

/**
 * POST /api/notifications/broadcast — instructor or admin only.
 * Recipient user ids are pasted comma-separated (the backend takes an
 * explicit `recipientUserIds` array; there's no "all students" or
 * "all enrolled in course X" shortcut endpoint today, so bulk
 * targeting has to be resolved client-side from another list, e.g. an
 * instructor's enrolled-students view, before pasting ids here).
 */
@Component({
  selector: 'app-broadcast-composer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './broadcast-composer.html',
})
export class BroadcastComposerComponent {
  private readonly notificationService = inject(NotificationService);
  private readonly authService = inject(AuthService);

  readonly currentUser = this.authService.user;

  recipientIdsInput = signal<string>('');
  subject = signal<string>('');
  body = signal<string>('');
  sending = signal<boolean>(false);
  result = signal<{ ok: boolean; message: string } | null>(null);

  isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }

  send(): void {
    const recipientUserIds = this.recipientIdsInput()
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (!recipientUserIds.length || !this.subject().trim() || !this.body().trim()) {
      this.result.set({ ok: false, message: 'Recipient ids, subject, and message are all required.' });
      return;
    }
    this.sending.set(true);
    this.result.set(null);
    this.notificationService.broadcastAnnouncement({ recipientUserIds, subject: this.subject(), body: this.body() }).subscribe({
      next: () => {
        this.sending.set(false);
        this.result.set({ ok: true, message: 'Announcement queued for delivery.' });
        this.recipientIdsInput.set('');
        this.subject.set('');
        this.body.set('');
      },
      error: (err: unknown) => {
        this.sending.set(false);
        this.result.set({
          ok: false,
          message: (err as { error?: { message?: string } })?.error?.message ?? 'Broadcast failed.',
        });
      },
    });
  }

  retryFailed(): void {
    this.notificationService.retryFailedNotifications().subscribe({
      next: () => this.result.set({ ok: true, message: 'Retry triggered for failed notifications.' }),
      error: (err: unknown) => {
        this.result.set({
          ok: false,
          message: (err as { error?: { message?: string } })?.error?.message ?? 'Retry failed.',
        });
      },
    });
  }
}
