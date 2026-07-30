/** Mirrors backend `src/modules/notification/notification.types.ts`. */
export type NotificationChannel = 'email';
export type NotificationType =
  | 'enrollment-confirmed'
  | 'certificate-issued'
  | 'application-stage-changed'
  | 'internship-new-application'
  | 'generic-announcement';
export type NotificationStatus = 'queued' | 'sent' | 'failed';

export interface INotification {
  _id: string;
  recipientUserId: string;
  recipientEmail: string;
  channel: NotificationChannel;
  type: NotificationType;
  subject: string;
  body: string;
  status: NotificationStatus;
  sentAt?: string;
  error?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

/** Query params for GET /api/notifications/me */
export interface MyNotificationsFilters {
  page?: number;
  pageSize?: number;
}

/** POST /api/notifications/broadcast body */
export interface BroadcastDto {
  recipientUserIds: string[];
  subject: string;
  body: string;
}
