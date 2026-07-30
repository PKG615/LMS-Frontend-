import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseService } from '../../core/services/course.service';
import { AuthService } from '../../core/services/auth.service';
import { CourseLevel, CourseStatus, ICourse, ILesson, IModule, LessonType } from '../../core/models/course.model';
import { LessonContentEditorComponent } from '../lesson-content-editor/lesson-content-editor';

/**
 * Instructor course authoring workspace — list/create courses, manage
 * modules & lessons, publish/archive, and delegate per-lesson content
 * authoring to `LessonContentEditorComponent`. Wraps every route in
 * `src/modules/course/course.routes.ts` that isn't already covered by
 * `CoursePlayerComponent` (the student-facing read side).
 */
@Component({
  selector: 'app-course-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, LessonContentEditorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './course-builder.html',
})
export class CourseBuilderComponent implements OnInit {
  private readonly courseService = inject(CourseService);
  private readonly authService = inject(AuthService);

  readonly currentUser = this.authService.user;

  myCourses = signal<ICourse[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  showCreateForm = signal<boolean>(false);
  creating = signal<boolean>(false);
  newCourse = {
    title: '',
    shortDescription: '',
    description: '',
    category: '',
    level: 'beginner' as CourseLevel,
    language: 'English',
    price: 0,
    thumbnailUrl: '',
  };

  selectedCourse = signal<ICourse | null>(null);
  modules = signal<IModule[]>([]);
  newModuleTitle = signal<string>('');
  newLessonTitleByModule = signal<Record<string, string>>({});
  newLessonTypeByModule = signal<Record<string, LessonType>>({});
  editingLessonId = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }

  load(): void {
    const me = this.currentUser();
    if (!me) return;
    this.loading.set(true);
    this.error.set(null);
    this.courseService.list({ instructorId: this.isAdmin() ? undefined : me.id, page: 1, pageSize: 50 }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.myCourses.set(res.data);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.error.set((err as { error?: { message?: string } })?.error?.message ?? 'Could not load your courses.');
      },
    });
  }

  createCourse(): void {
    if (!this.newCourse.title || !this.newCourse.category) {
      this.error.set('Title and category are required.');
      return;
    }
    this.creating.set(true);
    this.courseService.create({ ...this.newCourse }).subscribe({
      next: (course) => {
        this.creating.set(false);
        this.showCreateForm.set(false);
        this.myCourses.update((list) => [course, ...list]);
        this.openCourse(course);
      },
      error: (err: unknown) => {
        this.creating.set(false);
        this.error.set((err as { error?: { message?: string } })?.error?.message ?? 'Could not create course.');
      },
    });
  }

  openCourse(course: ICourse): void {
    this.selectedCourse.set(course);
    this.editingLessonId.set(null);
    this.courseService.getModules(course._id).subscribe({
      next: (modules) => this.modules.set(modules),
      error: (err: unknown) => this.error.set((err as { error?: { message?: string } })?.error?.message ?? 'Could not load modules.'),
    });
  }

  backToList(): void {
    this.selectedCourse.set(null);
    this.modules.set([]);
  }

  addModule(): void {
    const course = this.selectedCourse();
    const title = this.newModuleTitle().trim();
    if (!course || !title) return;
    this.courseService.addModule(course._id, { title, order: this.modules().length + 1 }).subscribe({
      next: (module) => {
        this.modules.update((list) => [...list, module]);
        this.newModuleTitle.set('');
      },
      error: (err: unknown) => this.error.set((err as { error?: { message?: string } })?.error?.message ?? 'Could not add module.'),
    });
  }

  lessonTitleFor(moduleId: string): string {
    return this.newLessonTitleByModule()[moduleId] ?? '';
  }

  setLessonTitle(moduleId: string, value: string): void {
    this.newLessonTitleByModule.update((m) => ({ ...m, [moduleId]: value }));
  }

  lessonTypeFor(moduleId: string): LessonType {
    return this.newLessonTypeByModule()[moduleId] ?? 'video';
  }

  setLessonType(moduleId: string, value: LessonType): void {
    this.newLessonTypeByModule.update((m) => ({ ...m, [moduleId]: value }));
  }

  addLesson(module: IModule): void {
    const course = this.selectedCourse();
    const title = this.lessonTitleFor(module._id).trim();
    if (!course || !title) return;
    this.courseService
      .addLesson(course._id, module._id, { title, type: this.lessonTypeFor(module._id), order: module.lessons.length + 1 })
      .subscribe({
        next: (lesson) => {
          this.modules.update((list) =>
            list.map((m) => (m._id === module._id ? { ...m, lessons: [...m.lessons, lesson] } : m))
          );
          this.setLessonTitle(module._id, '');
        },
        error: (err: unknown) => this.error.set((err as { error?: { message?: string } })?.error?.message ?? 'Could not add lesson.'),
      });
  }

  removeLesson(module: IModule, lesson: ILesson): void {
    const course = this.selectedCourse();
    if (!course) return;
    this.courseService.removeLesson(course._id, module._id, lesson._id).subscribe({
      next: () => {
        this.modules.update((list) =>
          list.map((m) => (m._id === module._id ? { ...m, lessons: m.lessons.filter((l) => l._id !== lesson._id) } : m))
        );
        if (this.editingLessonId() === lesson._id) this.editingLessonId.set(null);
      },
      error: (err: unknown) => this.error.set((err as { error?: { message?: string } })?.error?.message ?? 'Could not remove lesson.'),
    });
  }

  moveLesson(module: IModule, lesson: ILesson, direction: -1 | 1): void {
    const course = this.selectedCourse();
    if (!course) return;
    const sorted = [...module.lessons].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex((l) => l._id === lesson._id);
    const swapWith = index + direction;
    if (swapWith < 0 || swapWith >= sorted.length) return;
    [sorted[index].order, sorted[swapWith].order] = [sorted[swapWith].order, sorted[index].order];
    const reorderDto = { lessons: sorted.map((l) => ({ lessonId: l._id, order: l.order })) };
    this.courseService.reorderLessons(course._id, module._id, reorderDto).subscribe({
      next: (updatedModule) => this.modules.update((list) => list.map((m) => (m._id === module._id ? updatedModule : m))),
      error: (err: unknown) => this.error.set((err as { error?: { message?: string } })?.error?.message ?? 'Could not reorder.'),
    });
  }

  selectLessonForEditing(lesson: ILesson): void {
    this.editingLessonId.set(this.editingLessonId() === lesson._id ? null : lesson._id);
  }

  onLessonUpdated(module: IModule, updated: ILesson): void {
    this.modules.update((list) =>
      list.map((m) => (m._id === module._id ? { ...m, lessons: m.lessons.map((l) => (l._id === updated._id ? updated : l)) } : m))
    );
  }

  publishCourse(): void {
    const course = this.selectedCourse();
    if (!course) return;
    this.courseService.publish(course._id).subscribe({
      next: (updated) => this.selectedCourse.set(updated),
      error: (err: unknown) => this.error.set((err as { error?: { message?: string } })?.error?.message ?? 'Could not publish course.'),
    });
  }

  archiveCourse(): void {
    const course = this.selectedCourse();
    if (!course) return;
    this.courseService.archive(course._id).subscribe({
      next: (updated) => this.selectedCourse.set(updated),
      error: (err: unknown) => this.error.set((err as { error?: { message?: string } })?.error?.message ?? 'Could not archive course.'),
    });
  }

  statusBadgeClass(status: CourseStatus): string {
    if (status === 'published') return 'bg-emerald-100 text-emerald-600';
    if (status === 'archived') return 'bg-slate-200 text-slate-600';
    return 'bg-amber-100 text-amber-600';
  }
}
