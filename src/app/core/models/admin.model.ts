/** Mirrors backend `src/modules/admin/admin.types.ts`. */
export interface PlatformOverview {
  users: {
    total: number;
    byRole: Record<string, number>;
  };
  courses: {
    total: number;
    byStatus: Record<string, number>;
  };
  enrollments: {
    total: number;
  };
  internships: {
    total: number;
    byStatus: Record<string, number>;
    totalApplications: number;
  };
}

export interface RevenueReport {
  month: number;
  year: number;
  totalRevenue: number;
  paidEnrollmentCount: number;
}

export interface TopCourseEntry {
  id: string;
  title: string;
  totalEnrollments: number;
  averageRating: number;
}

/** Query params for GET /api/admin/analytics/revenue */
export interface RevenueReportQuery {
  month?: number;
  year?: number;
}

/** Query params for GET /api/admin/analytics/top-courses */
export interface TopCoursesQuery {
  limit?: number;
}
