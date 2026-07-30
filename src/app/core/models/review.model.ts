/** Mirrors backend `src/modules/review/review.types.ts`. */
export type ReviewTargetType = 'course' | 'internship';

export interface IReview {
  _id: string;
  studentId: string;
  studentName: string;
  targetType: ReviewTargetType;
  targetId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewDto {
  targetType: ReviewTargetType;
  targetId: string;
  rating: number;
  comment: string;
}

export interface UpdateReviewDto {
  rating?: number;
  comment?: string;
}

/** Query params for GET /api/reviews */
export interface ReviewFilters {
  targetType: ReviewTargetType;
  targetId: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedReviews {
  data: IReview[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  averageRating: number;
}
