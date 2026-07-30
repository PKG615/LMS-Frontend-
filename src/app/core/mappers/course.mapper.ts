import type { CatalogCourse } from '../../state';
import { ICourse, IModule } from '../models/course.model';

/**
 * Maps the backend's `ICourse` (see `core/models/course.model.ts`,
 * mirrors `src/modules/course/course.types.ts`) onto the UI's
 * `CatalogCourse` shape (defined in `state.ts`).
 *
 * IMPORTANT — known fidelity gaps (backend simply has no data for
 * these fields today, so they're filled with safe placeholders rather
 * than fabricated content):
 *  - `instructor` / `instructorImage` / `instructorBio`: the backend
 *    only exposes `instructorId`. There is no public "instructor
 *    profile" endpoint a student can call (`GET /auth/users/:id` is
 *    restricted to instructor/admin — see auth.routes.ts), so the
 *    UI cannot currently show a real instructor name for students.
 *    This is a genuine backend gap worth adding a public endpoint for.
 *  - `trailerUrl`, `faq`: no equivalent field exists on the backend
 *    course model at all.
 *  - `reviews`: the backend has a full Review module
 *    (`ReviewService.list({ targetType: 'course', targetId })`) but
 *    it's a separate paginated call — not merged in here to keep this
 *    mapper cheap for list views. Call `ReviewService.list(...)`
 *    separately for a course detail page.
 *  - `syllabus`: left empty by this mapper (list view doesn't need
 *    it). Use `mapModulesToSyllabus()` below once you've also called
 *    `CourseService.getModules(courseId)` for a detail view.
 */
export function mapCourseToCatalogCourse(course: ICourse): CatalogCourse {
  return {
    id: course._id,
    title: course.title,
    status: capitalize(course.status) as 'Draft' | 'Published' | 'Archived',
    instructor: 'Instructor', // see gap note above — backend has no public instructor-name endpoint
    instructorImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    instructorBio: '',
    duration: '',
    category: course.category,
    description: course.description,
    price: course.discountPrice ?? course.price,
    rating: course.averageRating,
    reviewsCount: course.totalReviews,
    level: capitalize(course.level) as 'Beginner' | 'Intermediate' | 'Advanced',
    language: (course.language || 'English') as 'English' | 'Spanish' | 'German' | 'French',
    thumbnail:
      course.thumbnailUrl ||
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    trailerUrl: '',
    outcomes: course.learningOutcomes ?? [],
    requirements: course.prerequisites ?? [],
    faq: [],
    reviews: [],
    syllabus: [],
    relatedCourses: [],
    wishlisted: false,
    recentlyViewed: false,
    viewCount: course.totalEnrollments,
  };
}

/** Converts fetched modules (`CourseService.getModules`) into the UI's syllabus shape. */
export function mapModulesToSyllabus(modules: IModule[]): { title: string; duration: string; lessons: string[] }[] {
  return modules
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((m) => {
      const totalMinutes = m.lessons.reduce((sum, l) => sum + (l.duration ?? 0), 0);
      return {
        title: m.title,
        duration: totalMinutes > 0 ? `${totalMinutes} min` : `${m.lessons.length} lessons`,
        lessons: m.lessons
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((l) => l.title),
      };
    });
}

function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}
