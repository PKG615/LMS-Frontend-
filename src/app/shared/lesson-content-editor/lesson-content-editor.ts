import { ChangeDetectionStrategy, Component, OnChanges, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseService } from '../../core/services/course.service';
import { ILesson, IQuizQuestion } from '../../core/models/course.model';

/**
 * Content authoring surface for a single lesson — wraps every
 * lesson-level route in `src/modules/course/lesson-content.routes.ts`
 * (nested under course.routes.ts): video/pdf/thumbnail upload,
 * rich-text save, quiz builder, free-preview toggle, autosave, and
 * publish.
 */
@Component({
  selector: 'app-lesson-content-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './lesson-content-editor.html',
})
export class LessonContentEditorComponent implements OnChanges {
  courseId = input.required<string>();
  moduleId = input.required<string>();
  lesson = input.required<ILesson>();
  lessonChanged = output<ILesson>();

  private readonly courseService = inject(CourseService);

  textDraft = signal<string>('');
  uploading = signal<boolean>(false);
  saving = signal<boolean>(false);
  error = signal<string | null>(null);

  quizPassingScore = signal<number>(70);
  quizTimeLimit = signal<number>(10);
  newQuestion = signal<string>('');
  newOptions = signal<string[]>(['', '', '', '']);
  newCorrectIndex = signal<number>(0);

  ngOnChanges(): void {
    this.textDraft.set(this.lesson().textContent ?? '');
    this.quizPassingScore.set(this.lesson().quiz?.passingScore ?? 70);
    this.quizTimeLimit.set(this.lesson().quiz?.timeLimitMinutes ?? 10);
  }

  private emitUpdated(updated: ILesson): void {
    this.lessonChanged.emit(updated);
  }

  onFileSelected(event: Event, kind: 'video' | 'pdf' | 'thumbnail'): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploading.set(true);
    this.error.set(null);

    const upload$ =
      kind === 'video'
        ? this.courseService.uploadVideo(this.courseId(), this.moduleId(), this.lesson()._id, file)
        : kind === 'pdf'
          ? this.courseService.uploadPdf(this.courseId(), this.moduleId(), this.lesson()._id, file)
          : this.courseService.uploadThumbnail(this.courseId(), this.moduleId(), this.lesson()._id, file);

    upload$.subscribe({
      next: (updated) => {
        this.uploading.set(false);
        this.emitUpdated(updated);
      },
      error: (err: unknown) => {
        this.uploading.set(false);
        this.error.set((err as { error?: { message?: string } })?.error?.message ?? 'Upload failed.');
      },
    });
    input.value = '';
  }

  saveText(): void {
    this.saving.set(true);
    this.courseService.saveText(this.courseId(), this.moduleId(), this.lesson()._id, { content: this.textDraft() }).subscribe({
      next: (updated) => {
        this.saving.set(false);
        this.emitUpdated(updated);
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.error.set((err as { error?: { message?: string } })?.error?.message ?? 'Could not save text.');
      },
    });
  }

  /** Debounced autosave — call from a (input) handler with a simple timeout wrapper in the template, or on blur. */
  autoSaveDraft(): void {
    this.courseService
      .autoSaveDraft(this.courseId(), this.moduleId(), this.lesson()._id, { textContent: this.textDraft() })
      .subscribe({ next: (updated) => this.emitUpdated(updated), error: () => undefined });
  }

  toggleFreePreview(): void {
    this.courseService.toggleFreePreview(this.courseId(), this.moduleId(), this.lesson()._id).subscribe({
      next: (updated) => this.emitUpdated(updated),
      error: (err: unknown) => this.error.set((err as { error?: { message?: string } })?.error?.message ?? 'Could not toggle preview.'),
    });
  }

  publishLesson(): void {
    this.courseService.publishLesson(this.courseId(), this.moduleId(), this.lesson()._id).subscribe({
      next: (updated) => this.emitUpdated(updated),
      error: (err: unknown) => this.error.set((err as { error?: { message?: string } })?.error?.message ?? 'Could not publish lesson.'),
    });
  }

  setOptionText(index: number, value: string): void {
    this.newOptions.update((opts) => {
      const next = [...opts];
      next[index] = value;
      return next;
    });
  }

  addQuizQuestion(): void {
    const question = this.newQuestion().trim();
    const options = this.newOptions().map((o) => o.trim()).filter(Boolean);
    if (!question || options.length < 2) {
      this.error.set('A question needs text and at least 2 non-empty options.');
      return;
    }
    const dto: Omit<IQuizQuestion, '_id'> = {
      question,
      type: 'single',
      options: options.map((text, i) => ({ text, isCorrect: i === this.newCorrectIndex() })),
      points: 1,
      order: (this.lesson().quiz?.questions.length ?? 0) + 1,
    };
    this.courseService.addQuizQuestion(this.courseId(), this.moduleId(), this.lesson()._id, dto).subscribe({
      next: (updated) => {
        this.emitUpdated(updated);
        this.newQuestion.set('');
        this.newOptions.set(['', '', '', '']);
        this.newCorrectIndex.set(0);
      },
      error: (err: unknown) => this.error.set((err as { error?: { message?: string } })?.error?.message ?? 'Could not add question.'),
    });
  }

  deleteQuizQuestion(questionId: string | undefined): void {
    if (!questionId) return;
    this.courseService.deleteQuizQuestion(this.courseId(), this.moduleId(), this.lesson()._id, questionId).subscribe({
      next: (updated) => this.emitUpdated(updated),
      error: (err: unknown) => this.error.set((err as { error?: { message?: string } })?.error?.message ?? 'Could not delete question.'),
    });
  }

  saveQuizSettings(): void {
    const existingQuestions = (this.lesson().quiz?.questions ?? []).map(({ _id, ...rest }) => rest);
    this.courseService
      .saveQuiz(this.courseId(), this.moduleId(), this.lesson()._id, {
        passingScore: this.quizPassingScore(),
        timeLimitMinutes: this.quizTimeLimit(),
        questions: existingQuestions,
      })
      .subscribe({
        next: (updated) => this.emitUpdated(updated),
        error: (err: unknown) => this.error.set((err as { error?: { message?: string } })?.error?.message ?? 'Could not save quiz settings.'),
      });
  }
}
