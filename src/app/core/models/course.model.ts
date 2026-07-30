/** Mirrors backend `src/modules/course/course.types.ts`. */
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type CourseStatus = 'draft' | 'published' | 'archived';
export type LessonType = 'video' | 'pdf' | 'quiz' | 'text';

export interface IQuizOption {
  text: string;
  isCorrect: boolean;
}

export interface IQuizQuestion {
  _id?: string;
  question: string;
  type: 'single' | 'multiple' | 'true_false';
  options: IQuizOption[];
  explanation?: string;
  points: number;
  order: number;
}

export interface IQuiz {
  title?: string;
  passingScore: number;
  timeLimitMinutes: number;
  questions: IQuizQuestion[];
}

export interface IVideoRendition {
  resolution: '1080p' | '720p' | '480p';
  file: string;
}

export interface IVideoMeta {
  originalFile?: string;
  durationSeconds: number;
  transcodeStatus: 'pending' | 'processing' | 'completed' | 'failed';
  renditions: IVideoRendition[];
}

export interface ILesson {
  _id: string;
  title: string;
  type: LessonType;
  contentUrl?: string;
  duration?: number;
  order: number;
  isFreePreview: boolean;
  textContent?: string;
  pdfFile?: string;
  thumbnailFile?: string;
  video?: IVideoMeta;
  quiz?: IQuiz;
  status: 'draft' | 'published';
  lastAutoSavedAt?: string;
}

export interface IModule {
  _id: string;
  courseId: string;
  title: string;
  order: number;
  lessons: ILesson[];
}

export interface ICourse {
  _id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  thumbnailUrl?: string;
  category: string;
  level: CourseLevel;
  language: string;
  instructorId: string;
  price: number;
  discountPrice?: number;
  currency: string;
  totalLessons: number;
  totalEnrollments: number;
  averageRating: number;
  totalReviews: number;
  status: CourseStatus;
  prerequisites: string[];
  learningOutcomes: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseDto {
  title: string;
  description: string;
  shortDescription: string;
  category: string;
  level: CourseLevel;
  language: string;
  price: number;
  discountPrice?: number;
  currency?: string;
  prerequisites?: string[];
  learningOutcomes?: string[];
  tags?: string[];
  thumbnailUrl?: string;
}

export type UpdateCourseDto = Partial<CreateCourseDto>;

export interface CreateModuleDto {
  title: string;
  order: number;
}

export interface CreateLessonDto {
  title: string;
  type: LessonType;
  contentUrl?: string;
  duration?: number;
  order: number;
  isFreePreview?: boolean;
}

export interface SaveTextContentDto {
  content: string;
}

export interface SaveQuizDto {
  title?: string;
  passingScore: number;
  timeLimitMinutes: number;
  questions: Omit<IQuizQuestion, '_id'>[];
}

export type AddQuizQuestionDto = Omit<IQuizQuestion, '_id'>;

export interface ReorderLessonsDto {
  lessons: { lessonId: string; order: number }[];
}

export interface AutoSaveDraftDto {
  title?: string;
  textContent?: string;
  isFreePreview?: boolean;
  order?: number;
}

/** Query params for GET /api/courses */
export interface CourseFilters {
  category?: string;
  level?: CourseLevel;
  status?: CourseStatus;
  searchTerm?: string;
  instructorId?: string;
  page?: number;
  pageSize?: number;
}
