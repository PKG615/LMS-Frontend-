/** Mirrors backend `src/modules/progress/progress.types.ts`. */
export type LessonProgressStatus = 'not-started' | 'in-progress' | 'completed';

export interface ILessonProgress {
  lessonId: string;
  status: LessonProgressStatus;
  watchedSeconds?: number;
  completedOn?: string;
}

export interface ICourseProgress {
  _id: string;
  studentId: string;
  courseId: string;
  lessons: ILessonProgress[];
  overallPercent: number;
  lastLessonId?: string;
  updatedAt: string;
  createdAt: string;
}

/** PATCH /api/progress/:courseId/lesson body */
export interface UpdateLessonProgressDto {
  lessonId: string;
  status: LessonProgressStatus;
  watchedSeconds?: number;
}

/** data payload of PATCH /api/progress/:courseId/lesson response */
export interface UpdateLessonProgressResult {
  progress: ICourseProgress;
  certificateIssued: boolean;
}
