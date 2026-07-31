export type CalendarEventType = 'live' | 'assignments' | 'quizzes';

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;        // e.g. "02:00 PM"
  type: CalendarEventType;
  instructor: string;
}