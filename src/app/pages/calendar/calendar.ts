/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { LmsState } from '../../state';

@Component({
  selector: 'app-calendar-page',
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './calendar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarPage {
  app = input.required<any>();

  get state(): LmsState {
    return this.app().state;
  }

  get calendarMode(): any {
    return this.app().calendarMode;
  }

  get calendarFilterType(): any {
    return this.app().calendarFilterType;
  }

  get calendarDays(): any[] {
    return this.app().calendarDays;
  }

  get selectedCalendarDay(): any {
    return this.app().selectedCalendarDay;
  }

  get eventForm(): any {
    return this.app().eventForm;
  }

  filteredCalendarEvents(): any[] {
    return this.app().filteredCalendarEvents();
  }

  selectedDayEvents(): any[] {
    return this.app().selectedDayEvents();
  }

  addEventSubmit(): void {
    this.app().addEventSubmit();
  }
}
