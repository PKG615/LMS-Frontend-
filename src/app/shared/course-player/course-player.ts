import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../core/services/course.service';
import { ProgressService } from '../../core/services/progress.service';
import { EnrollmentService } from '../../core/services/enrollment.service';
import { ICourseProgress } from '../../core/models/progress.model';
import { ILesson, IModule } from '../../core/models/course.model';

/**
 * Course Player — the piece that turns "enrolled" into "actually
 * learning". Wraps:
 *  - `GET /api/enrollments/access/:courseId` (client-side access gate;
 *    the *real* enforcement is server-side, see the security note below)
 *  - `GET /api/courses/:courseId/modules` (curriculum + lesson content)
 *  - `GET /api/courses/.../lessons/:lessonId/stream-url` (video)
 *  - `GET/PATCH /api/progress/:courseId` (progress + lesson completion)
 *
 * ⚠️ SECURITY NOTE (backend gap, not something the frontend can fix):
 * `lesson-content.controller.ts#getStreamUrl` has a literal `// TODO`
 * admitting it does NOT verify the caller is enrolled before minting a
 * signed video token — any authenticated user can currently stream any
 * paid course's video. This component still performs its own
 * access check and hides player controls from non-enrolled users as
 * defense-in-depth, but that's a client-side convenience only; a
 * determined user could call the API directly. The real fix has to be
 * server-side: check `enrollmentService.assertHasAccess` (or the
 * lesson's `isFreePreview` flag) before calling `generateStreamToken`.
 */
@Component({
  selector: 'app-course-player',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './course-player.html',
})
export class CoursePlayerComponent implements OnInit {
  courseId = input.required<string>();

  private readonly courseService = inject(CourseService);
  private readonly progressService = inject(ProgressService);
  private readonly enrollmentService = inject(EnrollmentService);

  modules = signal<IModule[]>([]);
  progress = signal<ICourseProgress | null>(null);
  selectedModuleId = signal<string | null>(null);
  selectedLessonId = signal<string | null>(null);
  streamUrl = signal<string | null>(null);

  hasAccess = signal<boolean | null>(null); // null = checking
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  quizAnswers = signal<Record<string, number>>({}); // questionId -> selected option index
  quizSubmitted = signal<boolean>(false);
  quizScore = signal<number | null>(null);

  ngOnInit(): void {
    this.enrollmentService.checkAccess(this.courseId()).subscribe({
      next: () => {
        this.hasAccess.set(true);
        this.loadCurriculum();
        this.loadProgress();
      },
      error: () => {
        this.hasAccess.set(false);
      },
    });
  }

  private loadCurriculum(): void {
    this.loading.set(true);
    this.courseService.getModules(this.courseId()).subscribe({
      next: (modules) => {
        this.loading.set(false);
        this.modules.set(modules);
        const firstModule = modules[0];
        const firstLesson = firstModule?.lessons?.[0];
        if (firstModule && firstLesson) {
          this.selectLesson(firstModule, firstLesson);
        }
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.error.set((err as { error?: { message?: string } })?.error?.message ?? 'Could not load the curriculum.');
      },
    });
  }

  private loadProgress(): void {
    this.progressService.getCourseProgress(this.courseId()).subscribe({
      next: (p) => this.progress.set(p),
      error: () => undefined, // no progress record yet is fine — treated as "not started"
    });
  }

  isLessonComplete(lessonId: string): boolean {
    return this.progress()?.lessons.some((l) => l.lessonId === lessonId && l.status === 'completed') ?? false;
  }

  selectLesson(module: IModule, lesson: ILesson): void {
    this.selectedModuleId.set(module._id);
    this.selectedLessonId.set(lesson._id);
    this.streamUrl.set(null);
    this.quizAnswers.set({});
    this.quizSubmitted.set(false);
    this.quizScore.set(null);

    if (lesson.type === 'video') {
      this.courseService.getStreamUrl(this.courseId(), module._id, lesson._id).subscribe({
        next: (res) => this.streamUrl.set(res.url),
        error: (err: unknown) => {
          this.error.set((err as { error?: { message?: string } })?.error?.message ?? 'Could not load video.');
        },
      });
    }
  }

  currentLesson(): ILesson | null {
    const moduleId = this.selectedModuleId();
    const lessonId = this.selectedLessonId();
    if (!moduleId || !lessonId) return null;
    const module = this.modules().find((m) => m._id === moduleId);
    return module?.lessons.find((l) => l._id === lessonId) ?? null;
  }

  markComplete(): void {
    const lesson = this.currentLesson();
    if (!lesson) return;
    this.progressService.updateLessonProgress(this.courseId(), { lessonId: lesson._id, status: 'completed' }).subscribe({
      next: (result) => {
        this.progress.set(result.progress);
        if (result.certificateIssued) {
          this.error.set(null);
          // A certificate was just auto-issued server-side — surface it loudly.
          alert('🎉 Congratulations! You completed the course and your certificate has been issued — check the Certificates page.');
        }
      },
      error: (err: unknown) => {
        this.error.set((err as { error?: { message?: string } })?.error?.message ?? 'Could not update progress.');
      },
    });
  }

  selectQuizAnswer(questionId: string, optionIndex: number): void {
    if (this.quizSubmitted()) return;
    this.quizAnswers.update((a) => ({ ...a, [questionId]: optionIndex }));
  }

  submitQuiz(): void {
    const lesson = this.currentLesson();
    if (!lesson?.quiz) return;
    const answers = this.quizAnswers();
    let earned = 0;
    let possible = 0;
    for (const q of lesson.quiz.questions) {
      possible += q.points;
      const selectedIndex = answers[q._id ?? ''];
      if (selectedIndex !== undefined && q.options[selectedIndex]?.isCorrect) {
        earned += q.points;
      }
    }
    const percent = possible > 0 ? Math.round((earned / possible) * 100) : 0;
    this.quizScore.set(percent);
    this.quizSubmitted.set(true);
    if (percent >= lesson.quiz.passingScore) {
      this.markComplete();
    }
  }
}
