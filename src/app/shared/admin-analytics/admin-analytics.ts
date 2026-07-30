import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AdminService } from '../../core/services/admin.service';
import { PlatformOverview, RevenueReport, TopCourseEntry } from '../../core/models/admin.model';

/**
 * Live admin analytics — wraps every route in
 * `src/modules/admin/admin.routes.ts` (all admin-role only).
 */
@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-analytics.html',
})
export class AdminAnalyticsComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  overview = signal<PlatformOverview | null>(null);
  revenue = signal<RevenueReport | null>(null);
  topCourses = signal<TopCourseEntry[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  revenueMonth = signal<number>(new Date().getMonth() + 1);
  revenueYear = signal<number>(new Date().getFullYear());
  topCoursesLimit = signal<number>(5);

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading.set(true);
    this.error.set(null);

    this.adminService.getPlatformOverview().subscribe({
      next: (data) => this.overview.set(data),
      error: (err: unknown) => this.setError(err),
    });

    this.loadRevenue();
    this.loadTopCourses();
    this.loading.set(false);
  }

  loadRevenue(): void {
    this.adminService.getRevenueReport({ month: this.revenueMonth(), year: this.revenueYear() }).subscribe({
      next: (data) => this.revenue.set(data),
      error: (err: unknown) => this.setError(err),
    });
  }

  loadTopCourses(): void {
    this.adminService.getTopCourses({ limit: this.topCoursesLimit() }).subscribe({
      next: (data) => this.topCourses.set(data),
      error: (err: unknown) => this.setError(err),
    });
  }

  private setError(err: unknown): void {
    this.error.set((err as { error?: { message?: string } })?.error?.message ?? 'Could not load analytics.');
  }

  roleEntries(): { role: string; count: number }[] {
    const byRole = this.overview()?.users.byRole ?? {};
    return Object.entries(byRole).map(([role, count]) => ({ role, count }));
  }

  courseStatusEntries(): { status: string; count: number }[] {
    const byStatus = this.overview()?.courses.byStatus ?? {};
    return Object.entries(byStatus).map(([status, count]) => ({ status, count }));
  }
}
