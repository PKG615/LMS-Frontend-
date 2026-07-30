/** Mirrors backend `src/modules/enrollment/enrollment.types.ts`. */
export type EnrollmentStatus = 'active' | 'completed' | 'expired' | 'cancelled';
export type PaymentStatus = 'not-required' | 'pending' | 'paid' | 'failed';

export interface IEnrollment {
  _id: string;
  studentId: string;
  courseId: string;
  status: EnrollmentStatus;
  paymentStatus: PaymentStatus;
  orderId?: string;
  paymentId?: string;
  amountPaid?: number;
  enrolledOn: string;
  lastAccessedOn: string;
  completedOn?: string;
  progressPercent: number;
  createdAt: string;
  updatedAt: string;
}

/** POST /api/enrollments/free body */
export interface EnrollFreeDto {
  courseId: string;
}

/** POST /api/enrollments/payment/initiate body */
export interface InitiatePaymentDto {
  courseId: string;
}

export interface InitiatePaymentResult {
  enrollmentId: string;
  orderId: string;
  amount: number;
  currency: string;
  razorpayKeyId: string;
}

/** POST /api/enrollments/payment/verify body */
export interface VerifyPaymentDto {
  enrollmentId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

/** Query params for GET /api/enrollments/me */
export interface MyEnrollmentFilters {
  status?: EnrollmentStatus;
  page?: number;
  pageSize?: number;
}

/**
 * GET /api/enrollments/access/:courseId returns the enrollment record
 * itself (enrollmentService.assertHasAccess throws a 403 ApiError if
 * access is not granted, rather than returning a boolean flag).
 */
export type AccessCheckResult = IEnrollment;
