/** Mirrors backend `src/modules/certificate/certificate.types.ts`. */
export interface ICertificate {
  _id: string;
  studentId: string;
  courseId: string;
  studentName: string;
  courseTitle: string;
  certificateNumber: string;
  issuedOn: string;
  filePath: string;
  createdAt: string;
}

export interface CertificateVerificationResult {
  valid: boolean;
  certificateNumber: string;
  studentName?: string;
  courseTitle?: string;
  issuedOn?: string;
}
