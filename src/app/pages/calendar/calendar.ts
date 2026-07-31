import {
  Component,
  ChangeDetectionStrategy,
  input,
  signal,
  computed,
  inject,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CalendarEventsService } from './calendar-events.service';
import { CalendarEvent, CalendarEventType } from './calendar-event.model';

type CalendarMode = 'monthly' | 'weekly' | 'daily';
type CalendarFilter = | 'all'| 'live' | 'assignments' | 'quizzes';

interface DayCell {
  num: number;
  date: Date;
  isToday: boolean;
}

@Component({
  selector: 'app-calendar-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './calendar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarPage implements OnInit, OnDestroy {
  private readonly eventsService = inject(CalendarEventsService);
  private readonly fb = inject(FormBuilder);

  /** Optional parent app/state ref — only used for cross-tab navigation
   *  (e.g. jumping to "live-classes" or "assignments" view). Calendar
   *  logic itself no longer depends on it. */
  app = input<any>();

  navigateTo(view: string): void {
    this.app()?.state?.activeView?.set(view);
  }

  // ---------------- Live clock ----------------
  currentDateTime = signal(new Date());
  private clockInterval!: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.clockInterval = setInterval(() => this.currentDateTime.set(new Date()), 1000);
    this.eventsService.loadForMonth(this.activeYear(), this.activeMonth());
  }

  ngOnDestroy(): void {
    clearInterval(this.clockInterval);
  }

  currentTime(): string {
    return this.currentDateTime().toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  }

  currentDate(): string {
    return this.currentDateTime().toLocaleDateString('en-US', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
  }

  // ---------------- Mode + filter ----------------
  calendarMode = signal<CalendarMode>('monthly');
  calendarFilterType = signal<CalendarFilter>('all');

  // ---------------- Month grid ----------------
  activeMonth = signal(new Date().getMonth());
  activeYear = signal(new Date().getFullYear());
  selectedDate = signal(new Date());

  monthName(): string {
    return new Date(this.activeYear(), this.activeMonth()).toLocaleString('en-US', { month: 'long' });
  }

  emptyDays = computed(() => {
    const firstDay = new Date(this.activeYear(), this.activeMonth(), 1).getDay();
    return Array(firstDay === 0 ? 6 : firstDay - 1);
  });

  calendarDays = computed<DayCell[]>(() => {
    const totalDays = new Date(this.activeYear(), this.activeMonth() + 1, 0).getDate();
    const today = new Date();
    const days: DayCell[] = [];
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(this.activeYear(), this.activeMonth(), i);
      days.push({
        num: i,
        date,
        isToday:
          today.getDate() === i &&
          today.getMonth() === this.activeMonth() &&
          today.getFullYear() === this.activeYear(),
      });
    }
    return days;
  });

  previousMonth(): void {
    if (this.activeMonth() === 0) {
      this.activeMonth.set(11);
      this.activeYear.update(y => y - 1);
    } else {
      this.activeMonth.update(m => m - 1);
    }
    this.eventsService.loadForMonth(this.activeYear(), this.activeMonth());
  }

  nextMonth(): void {
    if (this.activeMonth() === 11) {
      this.activeMonth.set(0);
      this.activeYear.update(y => y + 1);
    } else {
      this.activeMonth.update(m => m + 1);
    }
    this.eventsService.loadForMonth(this.activeYear(), this.activeMonth());
  }

  goToday(): void {
    const today = new Date();
    this.activeMonth.set(today.getMonth());
    this.activeYear.set(today.getFullYear());
    this.selectedDate.set(today);
  }

  selectDay(day: DayCell): void {
    this.selectedDate.set(day.date);
  }

  isSelected(day: DayCell): boolean {
    return this.isSameDay(day.date, this.selectedDate());
  }

  private isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth() === b.getMonth() &&
           a.getDate() === b.getDate();
  }

  // ---------------- Events ----------------
  private readonly allEvents = this.eventsService.events;

  filteredCalendarEvents = computed(() => {
    const filter = this.calendarFilterType();
    return this.allEvents().filter(e => filter === 'all' || e.type === filter);
  });

  eventsForDate(date: Date): CalendarEvent[] {
    return this.filteredCalendarEvents().filter(e => this.isSameDay(e.date, date));
  }

  selectedDayEvents = computed(() => this.eventsForDate(this.selectedDate()));

  // ---------------- Weekly view (real Mon–Sun of selected week) ----------------
  weekDates = computed<Date[]>(() => {
    const base = new Date(this.selectedDate());
    const dayIdx = base.getDay(); // 0=Sun..6=Sat
    const mondayOffset = dayIdx === 0 ? -6 : 1 - dayIdx;
    const monday = new Date(base);
    monday.setDate(base.getDate() + mondayOffset);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  });

  weekRangeLabel(): string {
    const week = this.weekDates();
    const start = week[0];
    const end = week[6];
    const startLabel = start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    const endLabel = end.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    return `${startLabel} – ${endLabel}`;
  }
  eventForm = this.fb.nonNullable.group({
  title: ['', [Validators.required, Validators.minLength(3)]],
  day: [new Date().getDate(), [Validators.required]],
  time: ['', [Validators.required]],
  type: ['live' as CalendarEventType, Validators.required],
  instructor: ['', Validators.required],
});

  // ---------------- Daily view ----------------
  readonly hourSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
  ];

  eventsForHour(hour: string): CalendarEvent[] {
    const prefix = hour.substring(0, 5); // "09:00"
    return this.selectedDayEvents().filter(e => e.time.startsWith(prefix));
  }

  previousDay(): void {
    const d = new Date(this.selectedDate());
    d.setDate(d.getDate() - 1);
    this.selectedDate.set(d);
  }

  nextDay(): void {
    const d = new Date(this.selectedDate());
    d.setDate(d.getDate() + 1);
    this.selectedDate.set(d);
  }

  // ---------------- Add-event form ----------------
  // eventForm = this.fb.nonNullable.group({
  //   title: ['', [Validators.required, Validators.minLength(3)]],
  //   day: [new Date().getDate(), [Validators.required, Validators.min(1), Validators.max(31)]],
  //   time: ['', [Validators.required, Validators.pattern(/^\d{2}:\d{2}\s(AM|PM)$/)]],
  //   // type: ['live' as CalendarEventType, [Validators.required]],
  //   instructor: ['', [Validators.required]],
  // });

  addEventSubmit(): void {
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      return;
    }
    const value = this.eventForm.getRawValue();
    const maxDay = new Date(this.activeYear(), this.activeMonth() + 1, 0).getDate();
    const safeDay = Math.min(Math.max(value.day, 1), maxDay);
    const eventDate = new Date(this.activeYear(), this.activeMonth(), safeDay);

    this.eventsService.addEvent({
      title: value.title,
      date: eventDate,
      time: value.time,
      type: value.type,
      instructor: value.instructor,
    });

    this.eventForm.reset({
      title: '',
      day: this.selectedDate().getDate(),
      time: '',
      type: 'live',
      instructor: '',
    });
  }
}