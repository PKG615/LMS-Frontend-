import { Injectable, signal } from '@angular/core';
import { CalendarEvent } from './calendar-event.model';

@Injectable({
  providedIn: 'root'
})
export class CalendarEventsService {

  readonly events = signal<CalendarEvent[]>([]);

  loadForMonth(year: number, month: number): void {
    // TODO: Load events
  }

  addEvent(event: Omit<CalendarEvent, 'id'>): void {
    this.events.update(events => [
      ...events,
      {
        ...event,
        id: crypto.randomUUID()
      }
    ]);
  }
}