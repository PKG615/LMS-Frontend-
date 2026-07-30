/** Mirrors backend `src/modules/internship/internship.types.ts`. */
export type InternshipLocation = 'remote' | 'onsite' | 'hybrid';
export type InternshipStatus = 'open' | 'closed';
export type ApplicationStage = 'applied' | 'screening' | 'interview' | 'offer' | 'accepted' | 'rejected';

export interface IInternship {
  _id: string;
  title: string;
  companyName: string;
  companyLogoUrl?: string;
  domain: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  duration: string;
  stipendMin: number;
  stipendMax: number;
  location: InternshipLocation;
  city?: string;
  postedBy: string;
  applicationDeadline: string;
  status: InternshipStatus;
  totalApplications: number;
  averageRating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
}

export interface IInternshipApplication {
  _id: string;
  studentId: string;
  internshipId: string;
  resumeUrl: string;
  coverLetter?: string;
  stage: ApplicationStage;
  appliedOn: string;
  stageUpdatedOn: string;
  reviewerNotes?: string;
}

export interface CreateInternshipDto {
  title: string;
  companyName: string;
  companyLogoUrl?: string;
  domain: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  duration: string;
  stipendMin: number;
  stipendMax: number;
  location: InternshipLocation;
  city?: string;
  applicationDeadline: string;
}

export type UpdateInternshipDto = Partial<CreateInternshipDto>;

export interface ApplyToInternshipDto {
  resumeUrl: string;
  coverLetter?: string;
}

export interface StageChangeDto {
  stage: ApplicationStage;
  reviewerNotes?: string;
}

/** Query params for GET /api/internships */
export interface InternshipFilters {
  domain?: string;
  location?: InternshipLocation;
  status?: InternshipStatus;
  searchTerm?: string;
  postedBy?: string;
  page?: number;
  pageSize?: number;
}

export interface PipelineView {
  stage: ApplicationStage;
  applications: IInternshipApplication[];
}
