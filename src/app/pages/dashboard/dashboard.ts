/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, SlicePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { LmsState } from '../../state';
import { LearningAnalytics } from '../../shared/learning-analytics/learning-analytics';
import { LearningAnalyticsChart } from '../../shared/learning-analytics-chart/learning-analytics-chart';

@Component({
  selector: 'app-dashboard-page',
  imports: [CommonModule, MatIconModule, SlicePipe, LearningAnalytics, LearningAnalyticsChart],
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  app = input.required<any>();

  get state(): LmsState {
    return this.app().state;
  }

  get dashboardTab(): any {
    return this.app().dashboardTab;
  }

  get selectedPlayerCourseId(): any {
    return this.app().selectedPlayerCourseId;
  }

  pendingAssignmentsCount(): number {
    return this.app().pendingAssignmentsCount();
  }

  wishlistCourses(): any[] {
    return this.app().wishlistCourses();
  }

  recentlyViewedCourses(): any[] {
    return this.app().recentlyViewedCourses();
  }

  activeHoveredSkill(): string {
    return this.app().activeHoveredSkill();
  }

  activeHoveredProficiency(): string {
    return this.app().activeHoveredProficiency();
  }

  getThemeColor(): string {
    return this.app().getThemeColor();
  }

  navigateTo(viewId: string): void {
    this.app().navigateTo(viewId);
  }

  hoverSkill(skill: string, level: string): void {
    this.app().hoverSkill(skill, level);
  }

  remindMe(title: string): void {
    this.app().remindMe(title);
  }
}
