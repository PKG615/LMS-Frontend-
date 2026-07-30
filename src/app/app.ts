import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function approvedDomainValidator(): ValidatorFn {
  const blockedDisposableDomains = [
    'tempmail.com', 'dispostable.com', 'mailinator.com', '10minutemail.com', 
    'trashmail.com', 'yopmail.com', 'fake.com', 'test.com', 'example.com', 'disposable.com'
  ];
  const allowedSuffixes = [
    '.edu', '.org', '.com', '.io', '.gov', '.net', '.ac.uk', '.edu.in', '.co.uk', '.ai', '.corp', '.dev', '.ac.in', '.edu.au'
  ];

  return (control: AbstractControl): ValidationErrors | null => {
    const email = control.value?.toString().trim().toLowerCase() || '';
    if (!email) return null;

    const parts = email.split('@');
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      return { invalidFormat: true };
    }

    const domain = parts[1];

    if (blockedDisposableDomains.some(disposable => domain === disposable || domain.endsWith('.' + disposable))) {
      return { unapprovedDomain: true };
    }

    const isAllowedSuffix = allowedSuffixes.some(suffix => domain.endsWith(suffix));
    if (!isAllowedSuffix) {
      return { unapprovedDomain: true };
    }

    return null;
  };
}
import { MatIconModule } from '@angular/material/icon';
import { LmsState, Assignment } from './state';
import { AuthService } from './core/services/auth.service';
import { UserRole } from './core/models/auth.model';
import { CertificateService } from './core/services/certificate.service';
import { SidebarLayout } from './layout/sidebar/sidebar';
import { HeaderLayout } from './layout/header/header';
import { FooterLayout } from './layout/footer/footer';
import { LearnerWorkspace } from './learner-workspace';
import { InstructorWorkspace } from './instructor-workspace';
import { AdminWorkspace } from './admin-workspace';
import { CertificateVerificationComponent } from './shared/certificate-verification/certificate-verification';

export interface SidebarItem {
  id: 'dashboard' | 'my-learning' | 'courses-catalog' | 'careers' | 'shopping-cart' | 'wishlist' | 'assignments' | 'calendar' | 'certificates' | 'messages' | 'community' | 'profile' | 'settings' | 'live-classes' | 'notifications' | 'shopping-cart' | 'wishlist' | 'achievements' | 'leaderboard' | 'help-center' | 'error-pages';
  name: string;
  icon: string;
}

export interface ArchiveRecording {
  id: string;
  title: string;
  instructor: string;
  date: string;
  duration: string;
  thumbnail: string;
  views: number;
}

export interface PartnerJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  logoText: string;
  logoBg: string;
  tags: string[];
  description: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    SidebarLayout,
    HeaderLayout,
    FooterLayout,
    LearnerWorkspace,
    InstructorWorkspace,
    AdminWorkspace,
    CertificateVerificationComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  // Inject our global state service
  readonly state = inject(LmsState);
  private readonly authService = inject(AuthService);
  private readonly certificateService = inject(CertificateService);
  authError = signal<string | null>(null);
  authLoading = signal<boolean>(false);

  // Enterprise Workspace & Navigation States
  currentWorkspace = signal<'learner' | 'instructor' | 'admin'>('learner');
  activeInstructorView = signal<string>('overview');
  activeAdminView = signal<string>('dashboard');
  activeReportsView = signal<string>('progress');

  // Dynamic Sidebar selector helper
  dynamicSidebarItems = computed(() => {
    const ws = this.currentWorkspace();
    if (ws === 'learner') {
      return [
        { id: 'dashboard', name: 'Dashboard', icon: 'dashboard' },
        { id: 'my-learning', name: 'My Learning', icon: 'school' },
        { id: 'courses-catalog', name: 'Course Catalog', icon: 'explore' },
        { id: 'careers', name: 'Careers & Jobs', icon: 'work' },
        { id: 'shopping-cart', name: 'Shopping Cart', icon: 'shopping_cart' },
        { id: 'wishlist', name: 'Wishlist', icon: 'favorite' },
        { id: 'assignments', name: 'Assignments', icon: 'assignment' },
        { id: 'live-classes', name: 'Live Classes', icon: 'live_tv' },
        { id: 'calendar', name: 'Calendar', icon: 'calendar_today' },
        { id: 'certificates', name: 'Certificates', icon: 'workspace_premium' },
        { id: 'messages', name: 'Messages', icon: 'forum' },
        { id: 'community', name: 'Community', icon: 'groups' },
        { id: 'notifications', name: 'Notifications', icon: 'notifications' },
        { id: 'profile', name: 'Profile & Bio', icon: 'person' },
        { id: 'settings', name: 'Settings & Security', icon: 'settings' },
        { id: 'achievements', name: 'Achievements', icon: 'emoji_events' },
        { id: 'leaderboard', name: 'Leaderboard', icon: 'leaderboard' },
        { id: 'help-center', name: 'Help Center', icon: 'help' },
        { id: 'error-pages', name: 'Error Mockups', icon: 'error' }
      ];
    } else if (ws === 'instructor') {
      return [
        { id: 'overview', name: 'Overview', icon: 'space_dashboard' },
        { id: 'my-courses', name: 'My Courses', icon: 'library_books' },
        { id: 'create-course', name: 'Create Course', icon: 'add_circle' },
        { id: 'analytics', name: 'Analytics', icon: 'bar_chart' },
        { id: 'student-list', name: 'Student List', icon: 'people' },
        { id: 'revenue', name: 'Revenue', icon: 'attach_money' },
        { id: 'quiz-management', name: 'Quiz Management', icon: 'quiz' },
        { id: 'assignment-management', name: 'Assignment Management', icon: 'assignment' },
        { id: 'reviews', name: 'Reviews', icon: 'rate_review' },
        { id: 'announcements', name: 'Announcements', icon: 'campaign' },
        { id: 'internships', name: 'Internships', icon: 'work' }
      ];
    } else { // admin
      return [
        { id: 'dashboard', name: 'Dashboard', icon: 'space_dashboard' },
        { id: 'user-management', name: 'User Management', icon: 'manage_accounts' },
        { id: 'instructor-management', name: 'Instructor Management', icon: 'supervisor_account' },
        { id: 'student-management', name: 'Student Management', icon: 'school' },
        { id: 'course-management', name: 'Course Management', icon: 'auto_stories' },
        { id: 'categories', name: 'Categories', icon: 'category' },
        { id: 'reports', name: 'Reports', icon: 'analytics' },
        { id: 'analytics', name: 'Analytics', icon: 'insights' },
        { id: 'payments', name: 'Payments', icon: 'account_balance_wallet' },
        { id: 'coupons', name: 'Coupons', icon: 'local_offer' },
        { id: 'cms-pages', name: 'CMS Pages', icon: 'wysiwyg' },
        { id: 'notifications', name: 'Notifications', icon: 'notifications_active' },
        { id: 'settings', name: 'Settings', icon: 'settings_applications' }
      ];
    }
  });

  handleSidebarClick(id: string) {
    if (this.currentWorkspace() === 'learner') {
      this.state.activeView.set(id);
    } else if (this.currentWorkspace() === 'instructor') {
      this.activeInstructorView.set(id);
    } else if (this.currentWorkspace() === 'admin') {
      this.activeAdminView.set(id);
    }
  }

  isSidebarActive(id: string): boolean {
    const ws = this.currentWorkspace();
    if (ws === 'learner') {
      return this.state.activeView() === id;
    } else if (ws === 'instructor') {
      return this.activeInstructorView() === id;
    } else {
      return this.activeAdminView() === id;
    }
  }

  // Multi-Dashboard Interactive Data Signals & States
  instructors = signal([
    { id: 'inst1', name: 'Dr. Evelyn Vance', email: 'evelyn@omni.com', specialty: 'Development', courseCount: 4, totalEarnings: 48500, status: 'Approved', registrationDate: '2025-01-10' },
    { id: 'inst2', name: 'Marcus Aurelius', email: 'marcus@omni.com', specialty: 'Design & Business', courseCount: 3, totalEarnings: 32200, status: 'Approved', registrationDate: '2025-03-14' },
    { id: 'inst3', name: 'Sarah Jenkins', email: 'sarah@omni.com', specialty: 'Cloud Engineering', courseCount: 2, totalEarnings: 15400, status: 'Approved', registrationDate: '2025-05-19' },
    { id: 'inst4', name: 'Dan Abramov', email: 'dan@omni.com', specialty: 'Development', courseCount: 1, totalEarnings: 8200, status: 'Pending', registrationDate: '2026-06-01' },
    { id: 'inst5', name: 'Chloe Zhao', email: 'chloe@omni.com', specialty: 'UI/UX Design', courseCount: 0, totalEarnings: 0, status: 'Pending', registrationDate: '2026-07-02' }
  ]);

  students = signal([
    { id: 'std1', name: 'Pradeep Kumar', email: 'pradeep@gmail.com', enrollmentDate: '2026-01-05', activeCoursesCount: 3, progressPercent: 88, avgGrade: 94, lastActiveDate: '2026-07-11', status: 'Active' },
    { id: 'std2', name: 'Alice Smith', email: 'alice@yahoo.com', enrollmentDate: '2026-02-12', activeCoursesCount: 2, progressPercent: 62, avgGrade: 85, lastActiveDate: '2026-07-10', status: 'Active' },
    { id: 'std3', name: 'Bob Johnson', email: 'bob@omni.com', enrollmentDate: '2026-03-15', activeCoursesCount: 1, progressPercent: 35, avgGrade: 78, lastActiveDate: '2026-07-08', status: 'Active' },
    { id: 'std4', name: 'Charlie Brown', email: 'charlie@gmail.com', enrollmentDate: '2026-04-20', activeCoursesCount: 4, progressPercent: 95, avgGrade: 97, lastActiveDate: '2026-07-12', status: 'Active' },
    { id: 'std5', name: 'Diana Prince', email: 'diana@amazon.com', enrollmentDate: '2026-05-01', activeCoursesCount: 2, progressPercent: 12, avgGrade: 60, lastActiveDate: '2026-06-30', status: 'Suspended' },
    { id: 'std6', name: 'Evan Wright', email: 'evan@design.io', enrollmentDate: '2026-06-18', activeCoursesCount: 1, progressPercent: 0, avgGrade: 0, lastActiveDate: '2026-06-19', status: 'Active' }
  ]);

  instructorQuizzes = signal([
    { id: 'q1', title: 'Signals Core Concepts & Change Detection', courseId: 'c1', questionsCount: 10, passingScore: 80, avgScore: 84, status: 'Published' },
    { id: 'q2', title: 'RxJS Operators & Declarative Streams', courseId: 'c1', questionsCount: 12, passingScore: 75, avgScore: 72, status: 'Published' },
    { id: 'q3', title: 'Figma Auto-Layout & Design Tokens', courseId: 'c2', questionsCount: 8, passingScore: 70, avgScore: 91, status: 'Published' },
    { id: 'q4', title: 'Drizzle Schema Migrations', courseId: 'c3', questionsCount: 15, passingScore: 80, avgScore: 68, status: 'Draft' }
  ]);

  assignmentSubmissions = signal([
    { id: 'sub1', studentName: 'Pradeep Kumar', assignmentTitle: 'Clean Architecture Decoupling', courseTitle: 'Enterprise Angular', submitDate: '2026-07-10', file: 'angular_clean_arch_pk.pdf', grade: 95, status: 'Graded', comment: 'Spectacular modular layout and Zoneless logic.' },
    { id: 'sub2', studentName: 'Alice Smith', assignmentTitle: 'Clean Architecture Decoupling', courseTitle: 'Enterprise Angular', submitDate: '2026-07-11', file: 'alice_architecture_draft.pdf', grade: 0, status: 'Pending', comment: '' },
    { id: 'sub3', studentName: 'Charlie Brown', assignmentTitle: 'Clean Architecture Decoupling', courseTitle: 'Enterprise Angular', submitDate: '2026-07-09', file: 'charlie_arch_v2.zip', grade: 88, status: 'Graded', comment: 'Well organized core layers, but missing some type safety parameters.' },
    { id: 'sub4', studentName: 'Bob Johnson', assignmentTitle: 'Figma Design System Components', courseTitle: 'Product-Led Growth', submitDate: '2026-07-11', file: 'bob_figma_system.pdf', grade: 0, status: 'Pending', comment: '' }
  ]);

  selectedSubId = signal<string | null>(null);
  assignmentGradeInput = signal<number>(85);
  assignmentCommentInput = signal<string>('');

  // Course Management State & Curriculum Editor
  editingCourseId = signal<string | null>(null);
  editingCourse = computed(() => {
    const id = this.editingCourseId();
    return this.state.catalogCourses().find(c => c.id === id) || null;
  });
  selectedSectionIndex = signal<number>(0);

  // Quiz Creator State
  showQuizCreator = signal<boolean>(false);
  newQuizTitle = signal<string>('');
  newQuizPassingScore = signal<number>(80);
  newQuizQuestionsCount = signal<number>(5);

  announcements = signal([
    { id: 'a1', title: 'Angular 21 zoneless masterclass has been scheduled!', course: 'Enterprise Angular & Clean Architecture', date: '2026-07-10', views: 245, text: 'We are thrilled to launch the live coding session tomorrow. Bring your questions on Signals.' },
    { id: 'a2', title: 'New design system assets published to Figma community workspace', course: 'Product-Led Growth & Modern SaaS UX', date: '2026-07-08', views: 180, text: 'Please download the components file in lecture 4 to complete your weekend assignment.' },
    { id: 'a3', title: 'Scheduled platform server migration notice', course: 'All Courses', date: '2026-07-01', views: 920, text: 'The playground environment will undergo a quick database version upgrade on July 14 at 02:00 AM UTC.' }
  ]);
  newAnnouncementTitle = signal<string>('');
  newAnnouncementCourse = signal<string>('All Courses');
  newAnnouncementText = signal<string>('');

  adminCategories = signal([
    { id: 'cat1', name: 'Development', desc: 'Angular, Typescript, Systems Engineering, Rust', courseCount: 4 },
    { id: 'cat2', name: 'Design & Business', desc: 'Product-Led Growth, Product Design, SaaS Mechanics', courseCount: 3 },
    { id: 'cat3', name: 'Artificial Intelligence', desc: 'LLMs, Prompt Engineering, Agents, PyTorch', courseCount: 2 },
    { id: 'cat4', name: 'Cloud Engineering', desc: 'PostgreSQL, Drizzle ORM, AWS, Cloud SQL', courseCount: 2 },
    { id: 'cat5', name: 'UI/UX Design', desc: 'Figma design tokens, SVG rendering, animations', courseCount: 1 }
  ]);
  newCategoryName = signal<string>('');
  newCategoryDesc = signal<string>('');

  adminCoupons = signal([
    { code: 'EDU20', discount: 20, uses: 142, status: 'Active', expiry: '2026-12-31' },
    { code: 'OMNIPROMO50', discount: 50, uses: 89, status: 'Active', expiry: '2026-08-15' },
    { code: 'SUMMER75', discount: 75, uses: 210, status: 'Active', expiry: '2026-07-31' },
    { code: 'WINTER30', discount: 30, uses: 45, status: 'Expired', expiry: '2026-01-01' }
  ]);
  newCouponCode = signal<string>('');
  newCouponDiscount = signal<number>(10);
  newCouponExpiry = signal<string>('2026-12-31');

  adminTransactions = signal([
    { id: 'TXN-90128', student: 'Pradeep Kumar', email: 'pradeep@gmail.com', course: 'Enterprise Angular & Clean Architecture', amount: 149, date: '2026-07-12', gateway: 'Credit Card', status: 'Success' },
    { id: 'TXN-88271', student: 'Alice Smith', email: 'alice@yahoo.com', course: 'Product-Led Growth & Modern SaaS UX', amount: 99, date: '2026-07-11', gateway: 'PayPal', status: 'Success' },
    { id: 'TXN-77382', student: 'Bob Johnson', email: 'bob@omni.com', course: 'Enterprise Angular & Clean Architecture', amount: 149, date: '2026-07-09', gateway: 'Google Pay', status: 'Success' },
    { id: 'TXN-66251', student: 'Diana Prince', email: 'diana@amazon.com', course: 'High-Fidelity SVG Dashboards & Visuals', amount: 79, date: '2026-07-08', gateway: 'Credit Card', status: 'Failed' },
    { id: 'TXN-55412', student: 'Charlie Brown', email: 'charlie@gmail.com', course: 'Advanced Rust for Systems Engineering', amount: 189, date: '2026-07-05', gateway: 'Crypto', status: 'Success' }
  ]);

  cmsPages = signal([
    { slug: 'home', title: 'OmniLMS Landing Page', lastModified: '2026-07-10', author: 'Admin Principal', status: 'Published', content: 'Empower your engineering teams with modern zoneless learning engines.' },
    { slug: 'about-us', title: 'About Our Collective', lastModified: '2026-06-15', author: 'Admin Principal', status: 'Published', content: 'Our collective of compiler designers and product leaders curate advanced tech modules.' },
    { slug: 'privacy', title: 'Privacy & Cookie Security', lastModified: '2026-05-12', author: 'Legal Lead', status: 'Published', content: 'All browser-side storage variables adhere strictly to modern Sandbox mandates.' },
    { slug: 'terms', title: 'Terms of Service SLA', lastModified: '2026-05-12', author: 'Legal Lead', status: 'Draft', content: 'Enterprise user agreements grant single-instance permanent access rights.' }
  ]);
  selectedCmsSlug = signal<string | null>(null);
  cmsEditContent = signal<string>('');

  adminNotifications = signal([
    { id: 'an1', title: 'Welcome to OmniLMS v2.1', audience: 'All Users', date: '2026-07-11', dispatched: true },
    { id: 'an2', title: 'Database optimization window notice', audience: 'All Users', date: '2026-07-12', dispatched: false }
  ]);
  newAdminNoticeTitle = signal<string>('');
  newAdminNoticeAudience = signal<string>('All Users');

  usersList = signal([
    { id: 'u1', name: 'Admin Principal', email: 'admin@omni.com', role: 'Admin', status: 'Active', dateCreated: '2025-01-01', lastLogin: '2026-07-12' },
    { id: 'u2', name: 'Dr. Evelyn Vance', email: 'evelyn@omni.com', role: 'Instructor', status: 'Active', dateCreated: '2025-01-10', lastLogin: '2026-07-12' },
    { id: 'u3', name: 'Marcus Aurelius', email: 'marcus@omni.com', role: 'Instructor', status: 'Active', dateCreated: '2025-03-14', lastLogin: '2026-07-11' },
    { id: 'u4', name: 'Sarah Jenkins', email: 'sarah@omni.com', role: 'Instructor', status: 'Active', dateCreated: '2025-05-19', lastLogin: '2026-07-10' },
    { id: 'u5', name: 'Pradeep Kumar', email: 'pradeep@gmail.com', role: 'Student', status: 'Active', dateCreated: '2026-01-05', lastLogin: '2026-07-12' },
    { id: 'u6', name: 'Alice Smith', email: 'alice@yahoo.com', role: 'Student', status: 'Active', dateCreated: '2026-02-12', lastLogin: '2026-07-10' },
    { id: 'u7', name: 'Bob Johnson', email: 'bob@omni.com', role: 'Student', status: 'Active', dateCreated: '2026-03-15', lastLogin: '2026-07-08' },
    { id: 'u8', name: 'Charlie Brown', email: 'charlie@gmail.com', role: 'Student', status: 'Active', dateCreated: '2026-04-20', lastLogin: '2026-07-12' },
    { id: 'u9', name: 'Diana Prince', email: 'diana@amazon.com', role: 'Student', status: 'Suspended', dateCreated: '2026-05-01', lastLogin: '2026-06-30' },
    { id: 'u10', name: 'Evan Wright', email: 'evan@design.io', role: 'User', status: 'Active', dateCreated: '2026-06-18', lastLogin: '2026-06-19' }
  ]);

  selectedCmsCourseId = signal<string | null>(null);
  selectedCmsCourse = computed(() => {
    const id = this.selectedCmsCourseId();
    return this.state.catalogCourses().find(c => c.id === id) || null;
  });

  selectedAdminStudentId = signal<string | null>(null);
  selectedAdminStudent = computed(() => {
    const id = this.selectedAdminStudentId();
    return this.students().find(s => s.id === id) || null;
  });

  // Filter & Search Controls
  instructorCourseFilter = signal<string>('all');
  adminUserRoleFilter = signal<string>('all');
  adminUserStatusFilter = signal<string>('all');
  instructorStudentSearch = signal<string>('');
  instructorStudentGradeFilter = signal<string>('all');

  // Form Group for Creating a Course
  newCourseForm = new FormGroup({
    title: new FormControl('', Validators.required),
    category: new FormControl('Development', Validators.required),
    price: new FormControl(99, [Validators.required, Validators.min(0)]),
    level: new FormControl('Advanced', Validators.required),
    language: new FormControl('English', Validators.required),
    description: new FormControl('', Validators.required),
    duration: new FormControl('12 Hours', Validators.required),
    outcomes: new FormControl('Outcome 1; Outcome 2; Outcome 3', Validators.required),
    requirements: new FormControl('Requirement 1; Requirement 2', Validators.required)
  });

  // Form Group for Editing a Course
  editCourseForm = new FormGroup({
    title: new FormControl('', Validators.required),
    category: new FormControl('Development', Validators.required),
    price: new FormControl(99, [Validators.required, Validators.min(0)]),
    level: new FormControl('Advanced', Validators.required),
    language: new FormControl('English', Validators.required),
    description: new FormControl('', Validators.required),
    duration: new FormControl('12 Hours', Validators.required),
    outcomes: new FormControl('', Validators.required),
    requirements: new FormControl('', Validators.required)
  });

  // Action Controllers
  switchWorkspace(ws: 'learner' | 'instructor' | 'admin') {
    this.currentWorkspace.set(ws);
    this.state.showToast(`Switched to ${ws === 'learner' ? 'Student Workspace' : ws === 'instructor' ? 'Instructor Portal' : 'Admin Panel'}`, 'success');
    if (ws === 'learner') {
      this.state.activeView.set('dashboard');
    } else if (ws === 'instructor') {
      this.activeInstructorView.set('overview');
    } else {
      this.activeAdminView.set('dashboard');
    }
  }

  submitNewCourse() {
    if (this.newCourseForm.invalid) {
      this.state.showToast('Please complete all course fields.', 'error');
      return;
    }
    const raw = this.newCourseForm.value;
    const outcomesArr = raw.outcomes ? raw.outcomes.split(';').map(o => o.trim()) : [];
    const requirementsArr = raw.requirements ? raw.requirements.split(';').map(r => r.trim()) : [];

    const newC = {
      id: 'c_' + Date.now(),
      title: raw.title || 'Untitled Course',
      category: raw.category || 'Development',
      instructor: 'Dr. Evelyn Vance (Self)',
      instructorImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      instructorBio: 'Principal Platform Architect & Senior Lecturer.',
      duration: raw.duration || '20 Hours',
      description: raw.description || 'No description provided.',
      price: Number(raw.price) || 99,
      rating: 5.0,
      reviewsCount: 1,
      level: (raw.level || 'Advanced') as 'Beginner' | 'Intermediate' | 'Advanced',
      language: (raw.language || 'English') as 'English' | 'Spanish' | 'German' | 'French',
      thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
      trailerUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      outcomes: outcomesArr,
      requirements: requirementsArr,
      faq: [{ q: 'Is there direct instructor code support?', a: 'Yes, full review checks are integrated.' }],
      reviews: [],
      syllabus: [{ title: 'Module 1: Foundations', duration: '2 hours', lessons: ['Welcome & Architecture overview', 'Interactive playground setups'] }],
      relatedCourses: ['c1'],
      wishlisted: false,
      recentlyViewed: true,
      viewCount: 12
    };

    this.state.catalogCourses.update(prev => [newC, ...prev]);
    this.state.showToast(`Successfully created "${newC.title}" inside catalog!`, 'success');
    this.newCourseForm.reset({
      title: '',
      category: 'Development',
      price: 99,
      level: 'Advanced',
      language: 'English',
      description: '',
      duration: '12 Hours',
      outcomes: 'Outcome 1; Outcome 2',
      requirements: 'Requirement 1'
    });
    this.activeInstructorView.set('my-courses');
  }

  deleteCourse(id: string) {
    this.state.catalogCourses.update(prev => prev.filter(c => c.id !== id));
    this.state.showToast('Course removed from catalogue.', 'success');
  }

  createCategory() {
    const name = this.newCategoryName().trim();
    const desc = this.newCategoryDesc().trim();
    if (!name || !desc) {
      this.state.showToast('Please provide both name and description.', 'error');
      return;
    }
    const newCat = {
      id: 'cat_' + Date.now(),
      name,
      desc,
      courseCount: 0
    };
    this.adminCategories.update(prev => [...prev, newCat]);
    this.state.showToast(`Category "${name}" created.`, 'success');
    this.newCategoryName.set('');
    this.newCategoryDesc.set('');
  }

  deleteCategory(id: string) {
    this.adminCategories.update(prev => prev.filter(c => c.id !== id));
    this.state.showToast('Category deleted.', 'success');
  }

  createCoupon() {
    const code = this.newCouponCode().toUpperCase().trim();
    const disc = Number(this.newCouponDiscount());
    const exp = this.newCouponExpiry();
    if (!code || isNaN(disc) || disc <= 0 || disc > 100) {
      this.state.showToast('Please provide valid coupon code and discount percentage (1-100).', 'error');
      return;
    }
    const newC = {
      code,
      discount: disc,
      uses: 0,
      status: 'Active',
      expiry: exp
    };
    this.adminCoupons.update(prev => [...prev, newC]);
    this.state.showToast(`Coupon promo "${code}" added successfully!`, 'success');
    this.newCouponCode.set('');
    this.newCouponDiscount.set(10);
  }

  toggleCouponStatus(code: string) {
    this.adminCoupons.update(prev => prev.map(c => {
      if (c.code === code) {
        return { ...c, status: c.status === 'Active' ? 'Expired' : 'Active' };
      }
      return c;
    }));
    this.state.showToast('Coupon status updated.', 'info');
  }

  publishAnnouncement() {
    const title = this.newAnnouncementTitle().trim();
    const text = this.newAnnouncementText().trim();
    const course = this.newAnnouncementCourse();
    if (!title || !text) {
      this.state.showToast('Please complete the announcement details.', 'error');
      return;
    }
    const newA = {
      id: 'a_' + Date.now(),
      title,
      course,
      date: new Date().toISOString().split('T')[0],
      views: 0,
      text
    };
    this.announcements.update(prev => [newA, ...prev]);
    this.state.showToast(`Announcement published to "${course}"`, 'success');
    this.newAnnouncementTitle.set('');
    this.newAnnouncementText.set('');
  }

  deleteAnnouncement(id: string) {
    this.announcements.update(prev => prev.filter(a => a.id !== id));
    this.state.showToast('Announcement removed.', 'success');
  }

  dispatchNotification() {
    const title = this.newAdminNoticeTitle().trim();
    const audience = this.newAdminNoticeAudience();
    if (!title) {
      this.state.showToast('Notification alert text required.', 'error');
      return;
    }
    const nextId = 'an_' + Date.now();
    const newN = {
      id: nextId,
      title,
      audience,
      date: new Date().toISOString().split('T')[0],
      dispatched: true
    };
    this.adminNotifications.update(prev => [...prev, newN]);

    // Append to global state alerts
    this.state.notifications.update(prev => [
      {
        id: nextId,
        title: 'System Bulletin: ' + title,
        message: `Published globally to: ${audience}`,
        time: 'Just now',
        unread: true,
        type: 'success'
      },
      ...prev
    ]);

    this.state.showToast(`Dispatched system notice to ${audience}!`, 'success');
    this.newAdminNoticeTitle.set('');
  }

  openCmsEditor(page: { slug: string, content: string }) {
    this.selectedCmsSlug.set(page.slug);
    this.cmsEditContent.set(page.content);
  }

  saveCmsPage() {
    const slug = this.selectedCmsSlug();
    if (!slug) return;
    this.cmsPages.update(prev => prev.map(p => {
      if (p.slug === slug) {
        return { ...p, content: this.cmsEditContent(), lastModified: new Date().toISOString().split('T')[0] };
      }
      return p;
    }));
    this.state.showToast('CMS system changes successfully committed!', 'success');
    this.selectedCmsSlug.set(null);
  }

  toggleUserStatus(studentId: string) {
    this.students.update(prev => prev.map(s => {
      if (s.id === studentId) {
        const nextStatus = s.status === 'Active' ? 'Suspended' : 'Active';
        this.state.showToast(`Student ${s.name} is now ${nextStatus}`, 'info');
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  }

  toggleInstructorStatus(instId: string) {
    this.instructors.update(prev => prev.map(i => {
      if (i.id === instId) {
        const nextStatus = i.status === 'Approved' ? 'Pending' : 'Approved';
        this.state.showToast(`Instructor ${i.name} status: ${nextStatus}`, 'info');
        return { ...i, status: nextStatus };
      }
      return i;
    }));
  }

  createUser(user: { name: string; email: string; role: string; status: string }) {
    const newUser = {
      id: 'u_' + Date.now(),
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      dateCreated: new Date().toISOString().split('T')[0],
      lastLogin: 'Never'
    };
    this.usersList.update(list => [...list, newUser]);
    
    // Also add to students/instructors list dynamically if relevant
    if (user.role === 'Student') {
      this.students.update(list => [...list, {
        id: 'std_' + Date.now(),
        name: user.name,
        email: user.email,
        enrollmentDate: new Date().toISOString().split('T')[0],
        activeCoursesCount: 0,
        progressPercent: 0,
        avgGrade: 0,
        lastActiveDate: 'Never',
        status: user.status === 'Active' ? 'Active' : 'Suspended'
      }]);
    } else if (user.role === 'Instructor') {
      this.instructors.update(list => [...list, {
        id: 'inst_' + Date.now(),
        name: user.name,
        email: user.email,
        specialty: 'Development',
        courseCount: 0,
        totalEarnings: 0,
        status: user.status === 'Active' ? 'Approved' : 'Pending',
        registrationDate: new Date().toISOString().split('T')[0]
      }]);
    }

    this.state.showToast(`User "${user.name}" successfully created!`, 'success');
  }

  updateUser(id: string, updated: { name: string; email: string; role: string; status: string }) {
    this.usersList.update(list => list.map(u => u.id === id ? { ...u, ...updated } : u));
    
    // Sync to students/instructors if needed
    this.students.update(list => list.map(s => s.email === updated.email ? { ...s, name: updated.name } : s));
    this.instructors.update(list => list.map(i => i.email === updated.email ? { ...i, name: updated.name } : i));

    this.state.showToast(`User details updated successfully!`, 'success');
  }

  deleteUser(id: string) {
    const user = this.usersList().find(u => u.id === id);
    this.usersList.update(list => list.filter(u => u.id !== id));
    if (user) {
      this.students.update(list => list.filter(s => s.email !== user.email));
      this.instructors.update(list => list.filter(i => i.email !== user.email));
    }
    this.state.showToast(`User deleted from system records.`, 'success');
  }

  toggleUserActivation(id: string) {
    this.usersList.update(list => list.map(u => {
      if (u.id === id) {
        const nextStatus = u.status === 'Active' ? 'Suspended' : 'Active';
        this.state.showToast(`User "${u.name}" account is now ${nextStatus}`, 'info');
        
        // Also update corresponding entries in students/instructors
        this.students.update(sList => sList.map(s => s.email === u.email ? { ...s, status: nextStatus } : s));
        this.instructors.update(iList => iList.map(i => i.email === u.email ? { ...i, status: nextStatus === 'Active' ? 'Approved' : 'Pending' } : i));

        return { ...u, status: nextStatus };
      }
      return u;
    }));
  }

  resetUserPassword(id: string) {
    const user = this.usersList().find(u => u.id === id);
    if (user) {
      this.state.showToast(`A secure password reset link has been dispatched to ${user.email}!`, 'success');
    }
  }

  assignUserRole(id: string, newRole: string) {
    this.usersList.update(list => list.map(u => {
      if (u.id === id) {
        this.state.showToast(`User "${u.name}" role updated to ${newRole}`, 'success');
        return { ...u, role: newRole };
      }
      return u;
    }));
  }

  rejectInstructor(id: string) {
    this.instructors.update(list => list.map(i => {
      if (i.id === id) {
        this.state.showToast(`Instructor application for ${i.name} has been rejected.`, 'error');
        return { ...i, status: 'Rejected' };
      }
      return i;
    }));
  }

  updateInstructorDetails(id: string, updated: { name: string; email: string; specialty: string }) {
    this.instructors.update(list => list.map(i => {
      if (i.id === id) {
        this.state.showToast(`Instructor details saved!`, 'success');
        return { ...i, ...updated };
      }
      return i;
    }));
  }

  updateCourse(id: string, updated: { title: string; price: number; category: string; description: string; level: 'Beginner' | 'Intermediate' | 'Advanced'; duration: string }) {
    this.state.catalogCourses.update(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, ...updated };
      }
      return c;
    }));
    this.state.showToast(`Course "${updated.title}" successfully updated!`, 'success');
  }

  approveCourse(id: string) {
    this.state.catalogCourses.update(prev => prev.map(c => {
      if (c.id === id) {
        this.state.showToast(`Course "${c.title}" approved and published!`, 'success');
        return { ...c, status: 'Published' };
      }
      return c;
    }));
  }

  setCourseStatus(id: string, status: 'Draft' | 'Published' | 'Archived') {
    this.state.catalogCourses.update(prev => prev.map(c => {
      if (c.id === id) {
        this.state.showToast(`Course "${c.title}" status changed to ${status}!`, 'success');
        return { ...c, status };
      }
      return c;
    }));
  }

  addSyllabusSection(courseId: string, title: string) {
    this.state.catalogCourses.update(prev => prev.map(c => {
      if (c.id === courseId) {
        const currentSyllabus = c.syllabus || [];
        return {
          ...c,
          syllabus: [...currentSyllabus, { title, duration: '2 Hours', lessons: [] }]
        };
      }
      return c;
    }));
    this.state.showToast(`Added new syllabus module "${title}"`, 'success');
  }

  addLessonToSection(courseId: string, sectionTitle: string, lessonName: string) {
    this.state.catalogCourses.update(prev => prev.map(c => {
      if (c.id === courseId) {
        return {
          ...c,
          syllabus: (c.syllabus || []).map(s => {
            if (s.title === sectionTitle) {
              return { ...s, lessons: [...(s.lessons || []), lessonName] };
            }
            return s;
          })
        };
      }
      return c;
    }));
    this.state.showToast(`Added item "${lessonName}"`, 'success');
  }

  deleteLessonFromSection(courseId: string, sectionTitle: string, lessonName: string) {
    this.state.catalogCourses.update(prev => prev.map(c => {
      if (c.id === courseId) {
        return {
          ...c,
          syllabus: (c.syllabus || []).map(s => {
            if (s.title === sectionTitle) {
              return { ...s, lessons: (s.lessons || []).filter(l => l !== lessonName) };
            }
            return s;
          })
        };
      }
      return c;
    }));
    this.state.showToast(`Removed lesson item`, 'info');
  }

  enrollStudentInCourse(studentEmail: string, courseId: string) {
    const course = this.state.catalogCourses().find(c => c.id === courseId);
    if (!course) return;

    this.students.update(list => list.map(s => {
      if (s.email === studentEmail) {
        this.state.showToast(`Enrolled ${s.name} in "${course.title}"!`, 'success');
        return { ...s, activeCoursesCount: s.activeCoursesCount + 1 };
      }
      return s;
    }));
  }

  issueStudentCertificate(studentName: string, courseTitle: string) {
    const certId = 'CERT-NG-' + Math.floor(100000 + Math.random() * 900000) + '-X';
    const newCert = {
      id: certId,
      title: courseTitle,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      studentName
    };
    
    this.certificatesList.update(all => [newCert, ...all]);
    this.state.showToast(`Issued brand new graduation certificate to ${studentName}!`, 'success');
  }

  triggerPayout(instId: string, amount: number) {
    this.instructors.update(prev => prev.map(i => {
      if (i.id === instId) {
        this.state.showToast(`Disbursed immediate digital payout of $${amount} to ${i.name}`, 'success');
        return { ...i, totalEarnings: 0 };
      }
      return i;
    }));
  }

  startGradeSubmission(sub: { id: string; grade: number; comment: string }) {
    this.selectedSubId.set(sub.id);
    this.assignmentGradeInput.set(sub.grade || 85);
    this.assignmentCommentInput.set(sub.comment || '');
  }

  saveGradeSubmission() {
    const id = this.selectedSubId();
    if (!id) return;
    this.assignmentSubmissions.update(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, grade: Number(this.assignmentGradeInput()), comment: this.assignmentCommentInput(), status: 'Graded' };
      }
      return s;
    }));
    this.state.showToast('Homework graded. Score committed to record ledger.', 'success');
    this.selectedSubId.set(null);
  }

  // Course Management - Editing Methods
  startEditCourse(courseId: string) {
    this.editingCourseId.set(courseId);
    const course = this.state.catalogCourses().find(c => c.id === courseId);
    if (course) {
      this.editCourseForm.patchValue({
        title: course.title,
        category: course.category,
        price: course.price,
        level: course.level,
        language: course.language,
        description: course.description,
        duration: course.duration,
        outcomes: (course.outcomes || []).join('; '),
        requirements: (course.requirements || []).join('; ')
      });
      this.selectedSectionIndex.set(0);
      this.state.showToast(`Loaded details for "${course.title}"`, 'info');
    }
  }

  saveEditCourse() {
    const id = this.editingCourseId();
    if (!id || this.editCourseForm.invalid) return;
    const raw = this.editCourseForm.getRawValue();
    const outcomesArr = raw.outcomes ? raw.outcomes.split(';').map((o: string) => o.trim()).filter(Boolean) : [];
    const requirementsArr = raw.requirements ? raw.requirements.split(';').map((r: string) => r.trim()).filter(Boolean) : [];

    this.state.catalogCourses.update(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          title: raw.title ?? '',
          category: raw.category ?? 'Development',
          price: Number(raw.price) || 0,
          level: (raw.level ?? 'Beginner') as 'Beginner' | 'Intermediate' | 'Advanced',
          language: (raw.language ?? 'English') as 'English' | 'Spanish' | 'German' | 'French',
          description: raw.description ?? '',
          duration: raw.duration ?? '',
          outcomes: outcomesArr,
          requirements: requirementsArr
        };
      }
      return c;
    }));

    this.state.showToast('Course changes successfully updated!', 'success');
    this.editingCourseId.set(null);
  }

  cancelEditCourse() {
    this.editingCourseId.set(null);
  }

  addCourseModule(moduleTitle: string) {
    const id = this.editingCourseId();
    if (!id || !moduleTitle.trim()) return;
    this.state.catalogCourses.update(prev => prev.map(c => {
      if (c.id === id) {
        const syllabus = c.syllabus ? [...c.syllabus] : [];
        syllabus.push({
          title: moduleTitle.trim(),
          duration: '1 Hour',
          lessons: []
        });
        return { ...c, syllabus };
      }
      return c;
    }));
    this.state.showToast('New module section added!', 'success');
  }

  deleteCourseModule(moduleIndex: number) {
    const id = this.editingCourseId();
    if (!id) return;
    this.state.catalogCourses.update(prev => prev.map(c => {
      if (c.id === id && c.syllabus) {
        const syllabus = c.syllabus.filter((_, idx) => idx !== moduleIndex);
        return { ...c, syllabus };
      }
      return c;
    }));
    this.state.showToast('Module section removed.', 'info');
  }

  addCourseLesson(moduleIndex: number, lessonTitle: string) {
    const id = this.editingCourseId();
    if (!id || !lessonTitle.trim()) return;
    this.state.catalogCourses.update(prev => prev.map(c => {
      if (c.id === id && c.syllabus) {
        const syllabus = c.syllabus.map((m, idx) => {
          if (idx === moduleIndex) {
            const lessons = m.lessons ? [...m.lessons] : [];
            lessons.push(lessonTitle.trim());
            return { ...m, lessons };
          }
          return m;
        });
        return { ...c, syllabus };
      }
      return c;
    }));
    this.state.showToast(`Lesson "${lessonTitle}" added successfully!`, 'success');
  }

  deleteCourseLesson(moduleIndex: number, lessonIndex: number) {
    const id = this.editingCourseId();
    if (!id) return;
    this.state.catalogCourses.update(prev => prev.map(c => {
      if (c.id === id && c.syllabus) {
        const syllabus = c.syllabus.map((m, idx) => {
          if (idx === moduleIndex && m.lessons) {
            const lessons = m.lessons.filter((_, lIdx) => lIdx !== lessonIndex);
            return { ...m, lessons };
          }
          return m;
        });
        return { ...c, syllabus };
      }
      return c;
    }));
    this.state.showToast('Lesson deleted.', 'info');
  }

  moveCourseLesson(moduleIndex: number, lessonIndex: number, direction: 'up' | 'down') {
    const id = this.editingCourseId();
    if (!id) return;
    this.state.catalogCourses.update(prev => prev.map(c => {
      if (c.id === id && c.syllabus) {
        const syllabus = c.syllabus.map((m, idx) => {
          if (idx === moduleIndex && m.lessons) {
            const lessons = [...m.lessons];
            const targetIndex = direction === 'up' ? lessonIndex - 1 : lessonIndex + 1;
            if (targetIndex >= 0 && targetIndex < lessons.length) {
              const temp = lessons[lessonIndex];
              lessons[lessonIndex] = lessons[targetIndex];
              lessons[targetIndex] = temp;
            }
            return { ...m, lessons };
          }
          return m;
        });
        return { ...c, syllabus };
      }
      return c;
    }));
    this.state.showToast('Lesson order updated.', 'success');
  }

  createQuizSubmit(title: string, passingScore: number, questionsCount: number) {
    if (!title.trim()) {
      this.state.showToast('Please provide a quiz title.', 'error');
      return;
    }
    const newQuiz = {
      id: 'q_' + Date.now(),
      title: title.trim(),
      courseId: 'c1',
      questionsCount: Number(questionsCount) || 5,
      passingScore: Number(passingScore) || 80,
      avgScore: 0,
      status: 'Published'
    };
    this.instructorQuizzes.update(prev => [...prev, newQuiz]);
    this.state.showToast(`Quiz "${title}" published to student cohort!`, 'success');
  }

  // Sidebar navigation and state items
  sidebarItems: SidebarItem[] = [
    { id: 'dashboard', name: 'Dashboard', icon: 'dashboard' },
    { id: 'my-learning', name: 'My Learning', icon: 'school' },
    { id: 'courses-catalog', name: 'Course Catalog', icon: 'explore' },
    { id: 'shopping-cart', name: 'Shopping Cart', icon: 'shopping_cart' },
    { id: 'wishlist', name: 'Wishlist', icon: 'favorite' },
    { id: 'assignments', name: 'Assignments', icon: 'assignment' },
    { id: 'live-classes', name: 'Live Classes', icon: 'live_tv' },
    { id: 'calendar', name: 'Calendar', icon: 'calendar_today' },
    { id: 'certificates', name: 'Certificates', icon: 'workspace_premium' },
    { id: 'messages', name: 'Messages', icon: 'forum' },
    { id: 'community', name: 'Community', icon: 'groups' },
    { id: 'notifications', name: 'Notifications', icon: 'notifications' },
    { id: 'profile', name: 'Profile & Bio', icon: 'person' },
    { id: 'settings', name: 'Settings & Security', icon: 'settings' }
  ];

  // Calendar Days (July 2026 starts on Wednesday, so July has 31 days)
  calendarDays = Array.from({ length: 31 }, (_, i) => {
    const num = i + 1;
    // Map events
    const hasEvent = num === 12 || num === 13 || num === 15 || num === 20;
    return { num, hasEvent };
  });

  // Calendar Predefined Events Map
  calendarEventsMap: Record<number, { title: string; time: string; instructor: string }> = {
    12: { title: 'Angular Signals Deep-Dive & Performance Review', time: '02:00 PM', instructor: 'Dr. Evelyn Vance' },
    13: { title: 'Drizzle Schema Migrations with Cloud SQL', time: '10:00 AM', instructor: 'Sarah Jenkins' },
    15: { title: 'SaaS Growth Mechanics & Funnel Optimization', time: '04:00 PM', instructor: 'Marcus Aurelius' },
    20: { title: 'State Architecture Consultation 1-on-1', time: '01:00 PM', instructor: 'Dr. Evelyn Vance' }
  };

  // Certificates list
  certificatesList = signal<{ id: string; title: string; date: string; studentName: string }[]>([
    { id: 'CERT-NG-88921-X', title: 'Enterprise Angular & Clean Architecture', date: 'July 05, 2026', studentName: 'Pradeep Kumar' },
    { id: 'CERT-SVG-11029-A', title: 'High-Fidelity SVG Dashboards & Visuals', date: 'July 09, 2026', studentName: 'Pradeep Kumar' },
    { id: 'CERT-UX-77281-K', title: 'Product-Led Growth & Modern SaaS UX', date: 'June 28, 2026', studentName: 'Pradeep Kumar' }
  ]);

  // Active Selectors Signals
  selectedPlayerCourseId = signal<string>('c1');
  selectedCalendarDay = signal<number>(12);
  activeHoveredSkill = signal<string>('Angular Signals');
  activeHoveredProficiency = signal<string>('95% Mastery');
  activeCertificateViewer = signal<{ id: string; title: string; date: string } | null>(null);
  
  // Course Catalog Filtering & Sort UI Signals
  courseListingView = signal<'grid' | 'list'>('grid');
  selectedCategory = signal<string>('all');
  selectedInstructor = signal<string>('all');
  selectedLanguage = signal<string>('all');
  selectedLevel = signal<string>('all');
  maxPrice = signal<number>(300);
  minRating = signal<number>(0);
  catalogSortBy = signal<'rating' | 'price-asc' | 'price-desc' | 'title'>('rating');
  catalogPage = signal<number>(1);
  catalogPageSize = signal<number>(4);

  // Dynamic filter lists for select option items
  categoriesList = ['Development', 'Design & Business', 'Artificial Intelligence', 'Cloud Engineering', 'UI/UX Design'];
  instructorsList = ['Dr. Evelyn Vance', 'Marcus Aurelius', 'Sarah Jenkins', 'Prof. Alan Turing', 'Dan Abramov', 'Chloe Zhao'];
  languagesList = ['English', 'German', 'Spanish', 'French'];
  levelsList = ['Beginner', 'Intermediate', 'Advanced'];

  // Computed signals for Filtered, Sorted and Paginated Catalog
  filteredCatalog = computed(() => {
    let list = this.state.catalogCourses();

    // 1. Search Query
    const query = this.state.searchQuery().toLowerCase().trim();
    if (query) {
      list = list.filter(c => 
        c.title.toLowerCase().includes(query) || 
        c.description.toLowerCase().includes(query) || 
        c.instructor.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query)
      );
    }

    // 2. Category
    const cat = this.selectedCategory();
    if (cat !== 'all') {
      list = list.filter(c => c.category === cat);
    }

    // 3. Instructor
    const inst = this.selectedInstructor();
    if (inst !== 'all') {
      list = list.filter(c => c.instructor === inst);
    }

    // 4. Language
    const lang = this.selectedLanguage();
    if (lang !== 'all') {
      list = list.filter(c => c.language === lang);
    }

    // 5. Level
    const lvl = this.selectedLevel();
    if (lvl !== 'all') {
      list = list.filter(c => c.level === lvl);
    }

    // 6. Max Price
    const price = this.maxPrice();
    list = list.filter(c => c.price <= price);

    // 7. Min Rating
    const rat = this.minRating();
    list = list.filter(c => c.rating >= rat);

    // 8. Sorting
    const sort = this.catalogSortBy();
    const sorted = [...list];
    if (sort === 'rating') {
      sorted.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'price-asc') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sort === 'title') {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    }

    return sorted;
  });

  paginatedCatalog = computed(() => {
    const list = this.filteredCatalog();
    const page = this.catalogPage();
    const size = this.catalogPageSize();
    const start = (page - 1) * size;
    return list.slice(start, start + size);
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredCatalog().length / this.catalogPageSize()) || 1;
  });

  // Active details course object mapping
  activeCourseDetails = computed(() => {
    const id = this.state.activeCourseDetailsId();
    return this.state.catalogCourses().find(c => c.id === id) || null;
  });

  // Related courses computed selector
  relatedCourseItems = computed(() => {
    const active = this.activeCourseDetails();
    if (!active) return [];
    return this.state.catalogCourses().filter(c => active.relatedCourses.includes(c.id) && c.id !== active.id);
  });

  // Student dashboard additional computed elements
  wishlistCourses = computed(() => {
    const ids = this.state.wishlistedIds();
    return this.state.catalogCourses().filter(c => ids.includes(c.id));
  });

  recentlyViewedCourses = computed(() => {
    const ids = this.state.recentlyViewedIds();
    return this.state.catalogCourses().filter(c => ids.includes(c.id));
  });

  // Filter helper functions
  setCategory(cat: string) {
    this.selectedCategory.set(cat);
    this.catalogPage.set(1);
  }

  setInstructor(inst: string) {
    this.selectedInstructor.set(inst);
    this.catalogPage.set(1);
  }

  setLanguage(lang: string) {
    this.selectedLanguage.set(lang);
    this.catalogPage.set(1);
  }

  setLevel(lvl: string) {
    this.selectedLevel.set(lvl);
    this.catalogPage.set(1);
  }

  setMaxPrice(price: number) {
    this.maxPrice.set(price);
    this.catalogPage.set(1);
  }

  setMinRating(rating: number) {
    this.minRating.set(rating);
    this.catalogPage.set(1);
  }

  resetAllFilters() {
    this.selectedCategory.set('all');
    this.selectedInstructor.set('all');
    this.selectedLanguage.set('all');
    this.selectedLevel.set('all');
    this.maxPrice.set(300);
    this.minRating.set(0);
    this.state.searchQuery.set('');
    this.catalogPage.set(1);
    this.state.showToast('All course directory filters reset', 'info');
  }

  nextCatalogPage() {
    if (this.catalogPage() < this.totalPages()) {
      this.catalogPage.update(p => p + 1);
    }
  }

  prevCatalogPage() {
    if (this.catalogPage() > 1) {
      this.catalogPage.update(p => p - 1);
    }
  }

  // UI Dropdowns & Popup Signals
  dashboardTab = signal<'overview' | 'my-courses' | 'wishlist' | 'recently-viewed'>('overview');
  showNewPostPopup = signal<boolean>(false);
  showQuickActions = signal<boolean>(false);
  showNotifications = signal<boolean>(false);
  showUserDropdown = signal<boolean>(false);
  activeSubmissionTarget = signal<Assignment | null>(null);

  // Live Class Booking Helpers
  bookingTutor = signal<string>('Dr. Evelyn Vance');
  bookingDate = signal<string>('2026-07-16');
  bookingTime = signal<string>('02:00 PM');

  // Public Module States
  isVerificationEmailSent = signal<boolean>(false);
  registeredUserEmail = signal<string>('learner@omnidemo.com');
  otpCodeVerified = signal<boolean>(false);
  selectedWelcomeInterests = signal<string[]>([]);
  faqExpanded = signal<Record<string, boolean>>({});
  landingSearchQuery = signal<string>('');
  newsletterSubscribed = signal<boolean>(false);
  resetSuccess = signal<boolean>(false);

  // --- Commerce UI Helpers ---
  searchFocused = signal<boolean>(false);
  couponInputText = signal<string>('');
  
  // Checkout Card Form Bindings
  cardNumber = signal<string>('4111 2222 3333 4444');
  cardName = signal<string>('Pradeep Kumar');
  cardExpiry = signal<string>('12/28');
  cardCvv = signal<string>('382');

  // Review Form Bindings
  reviewRating = signal<number>(5);
  reviewText = signal<string>('');
  editingReview = signal<{ originalText: string; text: string; rating: number } | null>(null);
  showWriteReview = signal<boolean>(false);

  // Landing Page Data
  landingCategories = [
    { id: 'dev', name: 'Software Development', icon: 'code', count: 12, desc: 'Angular, Typescript, Rust, Go, Python, Clean Architecture' },
    { id: 'design', name: 'UI/UX Design & SaaS', icon: 'palette', count: 8, desc: 'Figma Mastery, Design Systems, SaaS UX Foundations' },
    { id: 'cloud', name: 'Cloud & Infrastructure', icon: 'cloud', count: 6, desc: 'AWS, Cloud SQL, Serverless, GCP Deployments' },
    { id: 'pm', name: 'Product Management', icon: 'assessment', count: 5, desc: 'Product-Led Growth, Metrics, Hook Frameworks' },
    { id: 'sec', name: 'Cyber Security', icon: 'security', count: 7, desc: 'Pentesting, Cryptography, Secure API Protocols' },
    { id: 'ai', name: 'Artificial Intelligence', icon: 'psychology', count: 9, desc: 'Machine Learning, LLM Tuning, Vector Databases' }
  ];

  featuredCourses = [
    {
      id: 'fc1',
      title: 'Enterprise Angular & Clean Architecture',
      instructor: 'Dr. Evelyn Vance',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
      rating: 4.9,
      reviews: 1420,
      price: 199,
      discountPrice: 149,
      badge: 'Bestseller',
      tag: 'Development',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=500&q=80'
    },
    {
      id: 'fc2',
      title: 'Product-Led Growth & Modern SaaS UX',
      instructor: 'Marcus Aurelius',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80',
      rating: 4.8,
      reviews: 954,
      price: 149,
      discountPrice: 99,
      badge: 'Trending',
      tag: 'Design & Business',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=500&q=80'
    },
    {
      id: 'fc3',
      title: 'High-Fidelity SVG Dashboards & Visuals',
      instructor: 'Pradeep Kumar',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      rating: 5.0,
      reviews: 312,
      price: 119,
      discountPrice: 79,
      badge: 'Elite Masterclass',
      tag: 'UI/UX Design',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=500&q=80'
    }
  ];

  popularCourses = [
    {
      id: 'pc1',
      title: 'Advanced Rust for Systems Engineering',
      instructor: 'Dr. Evelyn Vance',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
      rating: 4.9,
      reviews: 820,
      price: 249,
      discountPrice: 189,
      badge: 'Systems',
      tag: 'Development',
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=500&q=80'
    },
    {
      id: 'pc2',
      title: 'Drizzle ORM & Cloud SQL in Production',
      instructor: 'Sarah Jenkins',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80',
      rating: 4.7,
      reviews: 412,
      price: 129,
      discountPrice: 89,
      badge: 'Database',
      tag: 'Cloud Engineering',
      image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=500&q=80'
    },
    {
      id: 'pc3',
      title: 'Secure API Gateways & OAuth Protocols',
      instructor: 'Marcus Aurelius',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80',
      rating: 4.8,
      reviews: 289,
      price: 159,
      discountPrice: 119,
      badge: 'Security',
      tag: 'Cyber Security',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=500&q=80'
    },
    {
      id: 'pc4',
      title: 'Prompt Engineering & LLM Integration',
      instructor: 'AI Agent Specialist',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
      rating: 4.9,
      reviews: 2110,
      price: 99,
      discountPrice: 49,
      badge: 'Hot',
      tag: 'Artificial Intelligence',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=500&q=80'
    }
  ];

  testimonials = [
    {
      quote: "The interactive assignments and instant feedback loop on OmniLMS elevated my front-end architecture. I transitioned from basic templates to enterprise-ready systems within months.",
      author: "Sarah Jenkins",
      title: "Senior UI/UX Engineer at Google",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80",
      rating: 5
    },
    {
      quote: "I loved how complete the learning materials are. The SVG Dashboards class has zero filler content. It goes deep into pure reactive math and beautiful layouts. Truly elite.",
      author: "David Miller",
      title: "CTO at Vercel Enterprise",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
      rating: 5
    },
    {
      quote: "The modular structure allowed me to study while running a startup. The community was an absolute goldmine of design reviews and code suggestions. Worth every single penny.",
      author: "Jessica Wong",
      title: "Founding Product Designer at Stripe",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80",
      rating: 5
    }
  ];

  partners = [
    { name: 'Google Cloud Partner', logoText: 'Google Cloud' },
    { name: 'Vercel Partner', logoText: 'VERCEL' },
    { name: 'Stripe Integration', logoText: 'stripe' },
    { name: 'Github Education', logoText: 'GitHub' },
    { name: 'Figma Enterprise', logoText: 'Figma' }
  ];

  faqItems = [
    {
      id: 'faq1',
      question: 'Are these courses self-paced, or is there a live cohort element?',
      answer: 'Our programs offer the ultimate flexibility of self-paced high-fidelity lectures paired with bi-weekly live cohort reviews and office hours. You can progress completely on your schedule while never feeling isolated.'
    },
    {
      id: 'faq2',
      question: 'How do I access my verified certificate of completion?',
      answer: 'Upon finishing all mandatory interactive deliverables and passing the core projects, a unique cryptographic certificate ID (fully compliance-checked) is issued directly in your Profile and Certificates tabs.'
    },
    {
      id: 'faq3',
      question: 'Can I request custom enterprise training for my team?',
      answer: 'Absolutely! We offer specialized team licenses, customized learning dashboards, and dedicated cohort sessions with Dr. Evelyn Vance or other elite tutors. Contact enterprise@omnilms.com.'
    },
    {
      id: 'faq4',
      question: 'What is the refund policy if I change my mind?',
      answer: 'We back all of our premium masterclasses with an unconditional 14-day money-back guarantee. If you are not 100% satisfied with the curriculum quality, email us for a hassle-free, immediate refund.'
    }
  ];

  blogPosts = [
    {
      title: 'Unidirectional Data Flow & Zoneless Angular Signals',
      excerpt: 'Explore why Angular 21 is moving completely away from Zone.js towards reactive signals. Understand the rendering pipeline and CPU utilization gains.',
      date: 'July 05, 2026',
      readTime: '6 min read',
      tag: 'Angular',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=500&q=80'
    },
    {
      title: 'Crafting High-Contrast Visual Dashboards with Pure SVGs',
      excerpt: 'Learn the exact math behind radar charts, line matrices, and concentric progress bars without relying on heavy canvas drawing libraries.',
      date: 'June 29, 2026',
      readTime: '8 min read',
      tag: 'UI/UX Design',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=500&q=80'
    },
    {
      title: 'Drizzle ORM performance and Cloud SQL Pooling Secrets',
      excerpt: 'A deep architectural guide to managing connections in serverless container environments. Minimize connection counts under extreme user concurrency.',
      date: 'June 18, 2026',
      readTime: '11 min read',
      tag: 'Databases',
      image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=500&q=80'
    }
  ];

  // Forms declaration
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  postForm!: FormGroup;
  eventForm!: FormGroup;
  messageForm!: FormGroup;
  assignmentForm!: FormGroup;

  // Public module forms
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  forgotForm!: FormGroup;
  resetForm!: FormGroup;
  otpForm!: FormGroup;
  welcomeForm!: FormGroup;
  newsletterForm!: FormGroup;

  // Computed counters
  unreadNotificationsCount = computed(() => this.state.notifications().filter(n => n.unread).length);
  pendingAssignmentsCount = computed(() => this.state.assignments().filter(a => a.status === 'Pending' || a.status === 'In Progress').length);
  unreadMessagesCount = computed(() => {
    // Just mock sum of counts for interactive indicators
    return this.state.chats().length;
  });

  // Current active chat selection
  activeChat = computed(() => {
    return this.state.chats().find(c => c.id === this.state.activeChatId());
  });

  // Selected course inside course player
  selectedPlayerCourse = computed(() => {
    const course = this.state.courses().find(c => c.id === this.selectedPlayerCourseId());
    return course || this.state.courses()[0];
  });

  selectedPlayerCatalogCourse = computed(() => {
    const pCourse = this.selectedPlayerCourse();
    if (!pCourse) return null;
    return this.state.catalogCourses().find(c => c.id === pCourse.id) || null;
  });

  // Learning Player Interactive Signals
  activeLessonName = signal<string>('');
  activeLessonType = signal<'video' | 'quiz' | 'assignment'>('video');
  isVideoPlaying = signal<boolean>(false);
  playbackSpeed = signal<number>(1.0);
  currentTime = signal<number>(872); // 14:32 initial seek
  duration = signal<number>(2700); // 45:00 total
  volume = signal<number>(80);
  isMuted = signal<boolean>(false);
  isFullscreen = signal<boolean>(false);
  playerDarkMode = signal<boolean>(false);
  playerActiveTab = signal<'discussion' | 'notes' | 'bookmarks' | 'resources'>('discussion');

  // Certificate Sharing
  showShareModal = signal<boolean>(false);
  activeShareCert = signal<{ id: string; title: string; date: string } | null>(null);
  certHistory = signal<{ id: string; title: string; date: string }[]>([
    { id: 'CERT-NG-88921-X', title: 'Enterprise Angular & Clean Architecture', date: 'July 05, 2026' },
    { id: 'CERT-SVG-11029-A', title: 'High-Fidelity SVG Dashboards & Visuals', date: 'July 09, 2026' },
    { id: 'CERT-UX-77281-K', title: 'Product-Led Growth & Modern SaaS UX', date: 'June 28, 2026' }
  ]);

  // Discussion Messages (Indexed by lesson name)
  discussionMessages = signal<Record<string, { sender: string; avatar: string; text: string; time: string }[]>>({
    'Zoneless Angular 21 Architecture Deep Dive': [
      { sender: 'Dr. Evelyn Vance', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80', text: 'Welcome everyone to the Zoneless track. Make sure to complete the Module 1 Quiz after this lecture!', time: '2 hours ago' },
      { sender: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80', text: 'This lecture is key. Changing compile flags in angular.json changes CPU cycles directly.', time: '1 hour ago' }
    ],
    'Signal Primitives: Writable, Computed, and Effects': [
      { sender: 'Marcus Aurelius', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80', text: 'Is there any issue with using effects to write back to a writable signal?', time: '3 hours ago' },
      { sender: 'Dr. Evelyn Vance', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80', text: 'Yes, that triggers cyclic loops. Try to use computed signals for derived values instead!', time: '2 hours ago' }
    ]
  });
  newDiscussionText = signal<string>('');

  // Lesson Notes (Indexed by lesson name)
  lessonNotes = signal<Record<string, { text: string; timestamp: string; displayTime: string }[]>>({
    'Zoneless Angular 21 Architecture Deep Dive': [
      { text: 'Zoneless means we do not import zone.js anymore. Huge rendering speedups.', timestamp: '04:12', displayTime: '04:12' },
      { text: 'AOT builds strip out the compiler from the final bundle.', timestamp: '12:35', displayTime: '12:35' }
    ]
  });
  newNoteText = signal<string>('');

  // Bookmarks (Indexed by lesson name)
  lessonBookmarks = signal<Record<string, { label: string; seconds: number; displayTime: string }[]>>({
    'Zoneless Angular 21 Architecture Deep Dive': [
      { label: 'Zoneless Architecture Intro', seconds: 252, displayTime: '04:12' },
      { label: 'Compiler Stripping Deep-dive', seconds: 755, displayTime: '12:35' }
    ]
  });

  // Quiz State
  quizActiveQuestion = signal<number>(0);
  quizSelectedAnswers = signal<Record<number, number>>({});
  quizSubmitted = signal<boolean>(false);
  quizScore = signal<number>(0);
  quizTimer = signal<number>(180); // 3 minutes countdown
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  quizTimerIntervalId: any = null;

  quizTimerDisplay = computed(() => {
    const sec = this.quizTimer();
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  });

  quizAccuracyRatio = computed(() => {
    if (this.quizQuestions.length === 0) return 0;
    return Math.round((this.quizScore() / this.quizQuestions.length) * 100);
  });

  quizProgressPercentage = computed(() => {
    if (this.quizQuestions.length === 0) return 0;
    return Math.round(((this.quizActiveQuestion() + 1) / this.quizQuestions.length) * 100);
  });

  quizQuestions = [
    {
      question: 'Which Angular 21 primitive should be preferred for derived states that compute dynamically?',
      options: [
        'Writable Signal (signal())',
        'Computed Signal (computed())',
        'Effect (effect())',
        'RxJS BehaviorSubject'
      ],
      correct: 1,
      explanation: 'computed() signals are read-only, pure, lazily evaluated, and automatically track changes in their dependencies.'
    },
    {
      question: 'What is the primary architectural goal of a Zoneless Angular application?',
      options: [
        'To force developers to use NgModules',
        'To avoid change detection loops entirely',
        'To remove the runtime overhead of zone.js patching global APIs',
        'To make server-side rendering mandatory'
      ],
      correct: 2,
      explanation: 'Removing zone.js removes the monkey-patching of browser APIs, leading to faster initial render, smaller bundle size, and granular reactive updates.'
    },
    {
      question: 'How do you trigger a UI repaint in a Zoneless component if not using Signals?',
      options: [
        'By calling changeDetectorRef.markForCheck() or the async pipe',
        'UI repaints are completely automatic for any variable change',
        'By calling window.location.reload()',
        'Zoneless applications do not support template variables'
      ],
      correct: 0,
      explanation: 'In zoneless mode, Angular relies on signals, the async pipe, or explicit changeDetectorRef calls to notify the scheduler of rendering needs.'
    }
  ];

  effectiveActiveLesson = computed(() => {
    const name = this.activeLessonName();
    if (name) return name;
    const catCourse = this.selectedPlayerCatalogCourse();
    if (catCourse && catCourse.syllabus.length > 0 && catCourse.syllabus[0].lessons.length > 0) {
      return catCourse.syllabus[0].lessons[0];
    }
    return 'Zoneless Angular 21 Architecture Deep Dive';
  });

  courseLessonsList = computed(() => {
    const catalogCourse = this.selectedPlayerCatalogCourse();
    if (!catalogCourse) return [];
    
    const list: { name: string; sectionTitle: string; type: 'video' | 'quiz' | 'assignment' }[] = [];
    catalogCourse.syllabus.forEach(sec => {
      sec.lessons.forEach(l => {
        let type: 'video' | 'quiz' | 'assignment' = 'video';
        if (l.toLowerCase().includes('quiz') || l.toLowerCase().includes('cuestionario')) {
          type = 'quiz';
        } else if (l.toLowerCase().includes('assignment') || l.toLowerCase().includes('deliverable') || l.toLowerCase().includes('submission')) {
          type = 'assignment';
        }
        list.push({ name: l, sectionTitle: sec.title, type });
      });
    });
    
    // Always append a solid interactive quiz and assignment lesson to guarantee coverage
    list.push({ name: 'Module 1 Architecture Core Quiz', sectionTitle: 'Evaluation Lab', type: 'quiz' });
    list.push({ name: 'Module 1 Hexagonal Boundaries Submission', sectionTitle: 'Hands-on Deliverable', type: 'assignment' });
    
    return list;
  });

  activeLessonIndex = computed(() => {
    const list = this.courseLessonsList();
    const active = this.effectiveActiveLesson();
    return list.findIndex(l => l.name === active);
  });

  // Action methods
  isLessonCompleted(lesson: string): boolean {
    const courseId = this.selectedPlayerCourseId();
    const completed = this.state.completedLessons()[courseId] || [];
    return completed.includes(lesson);
  }

  markActiveLessonCompleted() {
    const courseId = this.selectedPlayerCourseId();
    const lesson = this.effectiveActiveLesson();
    const isCompleted = this.isLessonCompleted(lesson);
    
    // Toggle completion state
    this.state.markLessonCompleted(courseId, lesson, !isCompleted);

    // After toggling, check if progress is 100% and generate certificate
    const course = this.state.courses().find(c => c.id === courseId);
    if (course && course.progress === 100) {
      const studentName = this.state.profile().fullName;
      const courseTitle = course.title;
      
      const alreadyIssued = this.certificatesList().some(cert => cert.title === courseTitle);
      if (!alreadyIssued) {
        this.issueStudentCertificate(studentName, courseTitle);
        this.state.addSystemNotification(
          'Graduation Certificate Unlocked!', 
          `Congratulations! You have achieved 100% completion in "${courseTitle}". Your digital credential has been officially generated.`, 
          'success'
        );
      }
    }
  }

  selectLesson(lessonName: string, type: 'video' | 'quiz' | 'assignment' = 'video') {
    this.activeLessonName.set(lessonName);
    this.activeLessonType.set(type);
    this.isVideoPlaying.set(false);
    
    if (type === 'quiz') {
      this.startQuizTimer();
    } else {
      this.stopQuizTimer();
    }
    this.state.showToast(`Active lesson changed: ${lessonName}`, 'info');
  }

  goToNextLesson() {
    const list = this.courseLessonsList();
    const idx = this.activeLessonIndex();
    if (idx >= 0 && idx < list.length - 1) {
      const next = list[idx + 1];
      this.selectLesson(next.name, next.type);
    } else {
      this.state.showToast('You have reached the final module of this track!', 'success');
    }
  }

  goToPrevLesson() {
    const list = this.courseLessonsList();
    const idx = this.activeLessonIndex();
    if (idx > 0) {
      const prev = list[idx - 1];
      this.selectLesson(prev.name, prev.type);
    } else {
      this.state.showToast('You are on the first lesson.', 'info');
    }
  }

  startQuizTimer() {
    this.stopQuizTimer();
    this.quizTimer.set(180);
    this.quizTimerIntervalId = setInterval(() => {
      this.quizTimer.update(t => {
        if (t <= 1) {
          this.submitQuiz();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  stopQuizTimer() {
    if (this.quizTimerIntervalId) {
      clearInterval(this.quizTimerIntervalId);
      this.quizTimerIntervalId = null;
    }
  }

  submitQuiz() {
    this.stopQuizTimer();
    let score = 0;
    const answers = this.quizSelectedAnswers();
    this.quizQuestions.forEach((q, idx) => {
      if (answers[idx] === q.correct) {
        score++;
      }
    });
    this.quizScore.set(score);
    this.quizSubmitted.set(true);
    this.state.showToast(`Quiz completed! Score: ${score}/${this.quizQuestions.length}`, 'success');
  }

  retryQuiz() {
    this.quizSelectedAnswers.set({});
    this.quizSubmitted.set(false);
    this.quizActiveQuestion.set(0);
    this.startQuizTimer();
    this.state.showToast('Quiz restarted. Focus and try again!', 'info');
  }

  addNote() {
    const txt = this.newNoteText().trim();
    if (!txt) return;
    const lesson = this.effectiveActiveLesson();
    const minutes = Math.floor(this.currentTime() / 60);
    const seconds = this.currentTime() % 60;
    const stamp = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    
    this.lessonNotes.update(db => {
      const list = db[lesson] || [];
      return {
        ...db,
        [lesson]: [...list, { text: txt, timestamp: stamp, displayTime: stamp }]
      };
    });
    this.newNoteText.set('');
    this.state.showToast(`Saved study note at ${stamp}`, 'success');
  }

  deleteNote(idx: number) {
    const lesson = this.effectiveActiveLesson();
    this.lessonNotes.update(db => {
      const list = db[lesson] || [];
      const updated = [...list];
      updated.splice(idx, 1);
      return {
        ...db,
        [lesson]: updated
      };
    });
    this.state.showToast('Study note deleted', 'info');
  }

  addBookmark() {
    const lesson = this.effectiveActiveLesson();
    const totalSecs = this.currentTime();
    const minutes = Math.floor(totalSecs / 60);
    const seconds = totalSecs % 60;
    const stamp = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    const label = `Key Concept Bookmark at ${stamp}`;
    
    this.lessonBookmarks.update(db => {
      const list = db[lesson] || [];
      if (list.some(b => b.seconds === totalSecs)) return db;
      return {
        ...db,
        [lesson]: [...list, { label, seconds: totalSecs, displayTime: stamp }]
      };
    });
    this.state.showToast(`Added timestamp bookmark at ${stamp}`, 'success');
  }

  seekToBookmark(seconds: number) {
    this.currentTime.set(seconds);
    this.state.showToast(`Seeking stream to ${Math.floor(seconds / 60)}:${seconds % 60 < 10 ? '0' : ''}${seconds % 60}`, 'info');
  }

  deleteBookmark(idx: number) {
    const lesson = this.effectiveActiveLesson();
    this.lessonBookmarks.update(db => {
      const list = db[lesson] || [];
      const updated = [...list];
      updated.splice(idx, 1);
      return {
        ...db,
        [lesson]: updated
      };
    });
    this.state.showToast('Bookmark removed', 'info');
  }

  addDiscussionMessage() {
    const txt = this.newDiscussionText().trim();
    if (!txt) return;
    const lesson = this.effectiveActiveLesson();
    const profile = this.state.profile();
    
    this.discussionMessages.update(db => {
      const list = db[lesson] || [];
      return {
        ...db,
        [lesson]: [
          ...list,
          {
            sender: profile.fullName,
            avatar: profile.profilePhoto,
            text: txt,
            time: 'Just now'
          }
        ]
      };
    });
    this.newDiscussionText.set('');
    this.state.showToast('Discussion comment posted!', 'success');
    
    setTimeout(() => {
      this.discussionMessages.update(db => {
        const list = db[lesson] || [];
        return {
          ...db,
          [lesson]: [
            ...list,
            {
              sender: 'Dr. Evelyn Vance (Instructor)',
              avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
              text: 'Excellent comment, Pradeep. That hexagonal separation is exactly how we keep boundary layers clean.',
              time: '1 min ago'
            }
          ]
        };
      });
      this.state.showToast('Instructor replied to your discussion thread!', 'info');
    }, 2500);
  }

  setPlaybackSpeed(speed: number) {
    this.playbackSpeed.set(speed);
    this.state.showToast(`Playback speed set to ${speed}x`, 'info');
  }

  toggleMute() {
    this.isMuted.update(m => !m);
    this.state.showToast(this.isMuted() ? 'Audio muted' : 'Audio unmuted', 'info');
  }

  toggleFullscreen() {
    this.isFullscreen.update(f => !f);
    this.state.showToast(this.isFullscreen() ? 'Entered simulated fullscreen' : 'Exited simulated fullscreen', 'info');
  }

  togglePlayerDarkMode() {
    this.playerDarkMode.update(d => !d);
    this.state.showToast(this.playerDarkMode() ? 'Theater mode activated' : 'Theater mode deactivated', 'info');
  }

  triggerShareCertificate(cert: { id: string; title: string; date: string }) {
    this.activeShareCert.set(cert);
    this.showShareModal.set(true);
    this.state.showToast(`Sharing credential ${cert.id}`, 'info');
  }

  copyShareLink() {
    const cert = this.activeShareCert();
    if (!cert) return;
    const link = `https://omnilms.com/verify/${cert.id}`;
    navigator.clipboard.writeText(link);
    this.state.showToast('Verification URL copied to clipboard!', 'success');
  }

  selectQuizOption(optIdx: number) {
    this.quizSelectedAnswers.update(ans => ({
      ...ans,
      [this.quizActiveQuestion()]: optIdx
    }));
  }

  prevQuizQuestion() {
    this.quizActiveQuestion.update(q => q > 0 ? q - 1 : q);
  }

  nextQuizQuestion() {
    this.quizActiveQuestion.update(q => q < this.quizQuestions.length - 1 ? q + 1 : q);
  }

  // --- LMS Communication Features State ---
  liveCountdown = signal<string>('00:08:42');
  activeRecording = signal<ArchiveRecording | null>(null);
  isRecordingPlaying = signal<boolean>(false);
  recordingPlaybackTime = signal<number>(12);
  recordingPlaybackSpeed = signal<number>(1.0);

  // Discussion Forum Search & Filter Signals
  forumSearchQuery = signal<string>('');
  forumTagFilter = signal<string>('all');
  forumTabFilter = signal<'all' | 'liked' | 'my-posts'>('all');
  activeReplyCommentId = signal<string | null>(null);

  // Chat system upgrades
  chatCategoryFilter = signal<'all' | 'instructor' | 'student' | 'group'>('all');
  chatSearchQuery = signal<string>('');
  showEmojiPicker = signal<boolean>(false);
  isRecordingVoice = signal<boolean>(false);
  voiceDuration = signal<number>(0);
  private voiceTimerIntervalId: ReturnType<typeof setInterval> | null = null;

  // Notification center
  notificationFilter = signal<'all' | 'unread' | 'alerts' | 'system'>('all');
  expandedNotificationId = signal<string | null>(null);

  // Calendar upgrades
  calendarMode = signal<'monthly' | 'weekly' | 'daily'>('monthly');
  calendarFilterType = signal<'all' | 'assignments' | 'quizzes' | 'live'>('all');

  // Filtered Forum Posts
  filteredForumPosts = computed(() => {
    let posts = this.state.communityPosts();
    const tag = this.forumTagFilter();
    if (tag !== 'all') {
      posts = posts.filter(p => p.tags.includes(tag));
    }
    const tab = this.forumTabFilter();
    if (tab === 'liked') {
      posts = posts.filter(p => p.hasLiked);
    } else if (tab === 'my-posts') {
      posts = posts.filter(p => p.author === this.state.profile().fullName);
    }
    const query = this.forumSearchQuery().toLowerCase().trim();
    if (query) {
      posts = posts.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.content.toLowerCase().includes(query) ||
        p.author.toLowerCase().includes(query)
      );
    }
    return posts;
  });

  // Filtered Chats
  filteredChats = computed(() => {
    let list = this.state.chats();
    const cat = this.chatCategoryFilter();
    if (cat !== 'all') {
      list = list.filter(c => c.chatType === cat);
    }
    const query = this.chatSearchQuery().toLowerCase().trim();
    if (query) {
      list = list.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.role.toLowerCase().includes(query)
      );
    }
    return list;
  });

  // Filtered Notifications
  filteredNotifications = computed(() => {
    let list = this.state.notifications();
    const f = this.notificationFilter();
    if (f === 'unread') {
      list = list.filter(n => n.unread);
    } else if (f === 'alerts') {
      list = list.filter(n => n.type === 'alert');
    } else if (f === 'system') {
      list = list.filter(n => n.type === 'info' || n.type === 'success');
    }
    return list;
  });

  // Categorized Calendar Events
  filteredCalendarEvents = computed(() => {
    const events: { day: number; title: string; time: string; instructor: string; type: 'assignments' | 'quizzes' | 'live' }[] = [
      { day: 12, title: 'Angular Signals Deep-Dive & Performance Review', time: '02:00 PM', instructor: 'Dr. Evelyn Vance', type: 'live' },
      { day: 13, title: 'Drizzle Schema Migrations with Cloud SQL', time: '10:00 AM', instructor: 'Sarah Jenkins', type: 'live' },
      { day: 15, title: 'SaaS Growth Mechanics & Funnel Optimization', time: '04:00 PM', instructor: 'Marcus Aurelius', type: 'live' },
      { day: 20, title: 'State Architecture Consultation 1-on-1', time: '01:00 PM', instructor: 'Dr. Evelyn Vance', type: 'live' },
      { day: 18, title: 'Evaluation: Secure Proxy Server Blueprint', time: '11:59 PM', instructor: 'LMS System', type: 'assignments' },
      { day: 22, title: 'Evaluation: Zoneless Angular State Manager', time: '11:59 PM', instructor: 'LMS System', type: 'assignments' },
      { day: 25, title: 'Evaluation: Secure Proxy Server Blueprint', time: '11:59 PM', instructor: 'LMS System', type: 'assignments' },
      { day: 14, title: 'Quiz: Angular Signals Core Evaluation', time: '06:00 PM', instructor: 'Dr. Evelyn Vance', type: 'quizzes' },
      { day: 21, title: 'Quiz: Enterprise SVG Mastery Check', time: '03:00 PM', instructor: 'Sarah Jenkins', type: 'quizzes' }
    ];

    for (const dStr of Object.keys(this.calendarEventsMap)) {
      const dNum = Number(dStr);
      const exists = events.some(e => e.day === dNum && e.type === 'live');
      if (!exists && this.calendarEventsMap[dNum]) {
        events.push({
          day: dNum,
          title: this.calendarEventsMap[dNum].title,
          time: this.calendarEventsMap[dNum].time,
          instructor: this.calendarEventsMap[dNum].instructor || 'Instructor',
          type: 'live'
        });
      }
    }

    const filter = this.calendarFilterType();
    if (filter !== 'all') {
      return events.filter(e => e.type === filter);
    }
    return events;
  });

  // Events for selected day
  selectedDayEvents = computed(() => {
    const day = this.selectedCalendarDay();
    return this.filteredCalendarEvents().filter(e => e.day === day);
  });

  // Action methods for LMS Communications
  addEmoji(emoji: string) {
    const currentText = this.messageForm.get('text')?.value || '';
    this.messageForm.get('text')?.setValue(currentText + emoji);
    this.showEmojiPicker.set(false);
  }

  startVoiceRecording() {
    this.isRecordingVoice.set(true);
    this.voiceDuration.set(0);
    this.voiceTimerIntervalId = setInterval(() => {
      this.voiceDuration.update(d => d + 1);
    }, 1000);
  }

  cancelVoiceRecording() {
    if (this.voiceTimerIntervalId) {
      clearInterval(this.voiceTimerIntervalId);
    }
    this.isRecordingVoice.set(false);
    this.voiceDuration.set(0);
  }

  sendVoiceRecording() {
    if (this.voiceTimerIntervalId) {
      clearInterval(this.voiceTimerIntervalId);
    }
    const secs = this.voiceDuration();
    const minStr = Math.floor(secs / 60);
    const secStr = (secs % 60).toString().padStart(2, '0');
    const dur = `${minStr}:${secStr}`;
    
    this.state.sendChatVoiceNote(this.state.activeChatId(), dur);
    this.isRecordingVoice.set(false);
    this.voiceDuration.set(0);
  }

  simulateFileShare(name: string, size: string, type: 'pdf' | 'image' | 'code' | 'zip') {
    this.state.sendChatAttachment(this.state.activeChatId(), name, size, type);
  }

  markClassAttendance(classId: string) {
    this.state.liveAttendance.update(attendanceList => {
      return attendanceList.map(a => {
        if (a.classId === classId) {
          return { ...a, status: 'Checked In' };
        }
        return a;
      });
    });
    this.state.showToast('Attendance registered successfully!', 'success');
  }

  playRecording(rec: ArchiveRecording) {
    this.activeRecording.set(rec);
    this.isRecordingPlaying.set(true);
    this.recordingPlaybackTime.set(12);
  }

  closeRecordingPlayer() {
    this.activeRecording.set(null);
    this.isRecordingPlaying.set(false);
  }

  toggleNotificationRead(id: string) {
    this.state.notifications.update(nots => nots.map(n => {
      if (n.id === id) {
        return { ...n, unread: !n.unread };
      }
      return n;
    }));
  }

  // --- ADDED LMS FRONTEND STATE SIGNALS & METHODS ---
  showLogoutConfirmation = signal<boolean>(false);
  showDeleteConfirmation = signal<boolean>(false);
  showCurrentPassword = signal<boolean>(false);
  showNewPassword = signal<boolean>(false);
  showConfirmPassword = signal<boolean>(false);
  newPasswordValue = signal<string>('');

  passwordStrength = computed(() => {
    const pwd = this.newPasswordValue();
    if (!pwd) return { score: 0, label: 'None', color: 'bg-slate-200', width: '0%' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    
    if (score <= 2) {
      return { score, label: 'Weak', color: 'bg-rose-500', width: '33%' };
    } else if (score <= 4) {
      return { score, label: 'Medium', color: 'bg-amber-500', width: '66%' };
    } else {
      return { score, label: 'Strong', color: 'bg-emerald-500', width: '100%' };
    }
  });

  confirmLogout() {
    this.showLogoutConfirmation.set(false);
    this.authService.logout().subscribe({ next: () => undefined, error: () => undefined });
    localStorage.clear();
    sessionStorage.clear();
    this.state.logout();
  }

  confirmDeleteAccount() {
    this.showDeleteConfirmation.set(false);
    this.state.showToast('Account permanently deleted. Hope to see you again!', 'success');
    localStorage.clear();
    sessionStorage.clear();
    this.state.isLoggedIn.set(false);
    this.state.activeView.set('landing');
  }

  selectedAvatar = signal<string>('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80');
  avatarsList = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80'
  ];

  studentXP = signal<number>(1250);
  studentRank = signal<number>(3);

  rewardsList = signal([
    { id: 'rew1', name: 'Free 1-on-1 Office Hour with Evelyn', cost: 500, description: 'Book a private Zoom session to refactor your Angular architecture.', claimed: false },
    { id: 'rew2', name: 'SaaS Elite Diploma PDF Certificate', cost: 1000, description: 'Custom printed and cryptographic verified physical diploma.', claimed: false },
    { id: 'rew3', name: 'Early Access to Advanced Rust WebAssembly', cost: 300, description: 'Unlock the Rust-wasm compiler block immediately before main catalog release.', claimed: false }
  ]);

  milestones = signal([
    { id: 'm1', name: 'The Zoneless Pioneer', description: 'Complete all Lectures in Angular 21 Course', progress: 75, target: 100, unlocked: false },
    { id: 'm2', name: 'Vector Mastery', description: 'Achieve a grade of 90%+ on SVG Line Chart assignment', progress: 100, target: 100, unlocked: true },
    { id: 'm3', name: 'Social Connector', description: 'Add GitHub & Twitter coordinates to your scholar profile', progress: 100, target: 100, unlocked: true }
  ]);

  topStudentsList = signal([
    { rank: 1, name: 'Alice Smith', xp: 1850, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80', badges: ['Early Adopter', 'Signal Architect', 'High Flyer'] },
    { rank: 2, name: 'Charlie Brown', xp: 1420, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80', badges: ['Early Adopter', 'High Flyer'] },
    { rank: 3, name: 'Pradeep Kumar (You)', xp: 1250, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', badges: ['Early Adopter', 'Signal Architect'] },
    { rank: 4, name: 'Sarah Jenkins', xp: 950, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80', badges: ['Signal Architect'] },
    { rank: 5, name: 'Bob Johnson', xp: 820, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80', badges: ['Early Adopter'] }
  ]);

  selectedFaqCategory = signal<string>('all');
  faqs = [
    { category: 'general', question: 'Is OmniLMS compatible with Zoneless Angular 21?', answer: 'Yes! All courses, syllabus structures, and playground terminals are completely designed to support zoneless Signals architecture natively.' },
    { category: 'security', question: 'How is my private data stored?', answer: 'We follow standard Sandboxing directives. No keys or secrets are exposed, and your login session is encrypted via client local-state variables.' },
    { category: 'billing', question: 'What is your refund policy on commercial catalog courses?', answer: 'We offer an hassle-free 14-day refund policy on all masterclasses. Simply submit a support ticket.' }
  ];

  ticketSubject = signal<string>('');
  ticketCategory = signal<string>('Technical Support');
  ticketDescription = signal<string>('');
  raisedTicketsList = signal([
    { id: 'TCK-8821', subject: 'Change detection cycle latency on slow CPUs', category: 'Technical Support', status: 'In Review', date: '2026-07-11' }
  ]);

  chatBotMessageInput = signal<string>('');
  chatBotMessages = signal([
    { id: 'c1', sender: 'bot', text: 'Hello! I am the Omni LMS Assistant. How can I help you today with your learning tracks, assignments, or billing coordinates?', time: 'Just now' }
  ]);
  isBotTyping = signal<boolean>(false);

  selectedMockError = signal<'none' | '404' | '403' | '500' | 'maintenance' | 'offline'>('none');

  privacyPublicProfile = signal<boolean>(true);
  privacyShowProgress = signal<boolean>(true);
  privacyShowAchievements = signal<boolean>(true);
  privacyShareHistory = signal<boolean>(false);

  selectAvatar(url: string) {
    this.state.profile.update(p => ({ ...p, profilePhoto: url }));
    this.state.showToast('Avatar updated successfully!', 'success');
  }

  claimDailyStreak() {
    this.state.learningStreak.update(s => s + 1);
    this.studentXP.update(xp => xp + 50);
    this.state.showToast('Daily Streak Maintained! +50 XP claimed.', 'success');
  }

  claimReward(rewId: string, cost: number) {
    if (this.studentXP() < cost) {
      this.state.showToast('Insufficient XP! Complete quizzes and daily check-ins.', 'error');
      return;
    }
    this.studentXP.update(xp => xp - cost);
    this.rewardsList.update(list => list.map(r => r.id === rewId ? { ...r, claimed: true } : r));
    this.state.showToast('Reward claimed successfully! Check your email instructions.', 'success');
  }

  raiseTicketSubmit() {
    const subj = this.ticketSubject().trim();
    const desc = this.ticketDescription().trim();
    if (!subj || !desc) {
      this.state.showToast('Please enter both subject and details.', 'error');
      return;
    }
    const newT = {
      id: 'TCK-' + Math.floor(1000 + Math.random() * 9000),
      subject: subj,
      category: this.ticketCategory(),
      status: 'Open',
      date: new Date().toISOString().split('T')[0]
    };
    this.raisedTicketsList.update(list => [newT, ...list]);
    this.state.showToast('Support ticket raised successfully!', 'success');
    this.ticketSubject.set('');
    this.ticketDescription.set('');
  }

  sendChatBotMessage() {
    const msg = this.chatBotMessageInput().trim();
    if (!msg) return;
    const userMsg = { id: 'u_' + Date.now(), sender: 'user', text: msg, time: 'Just now' };
    this.chatBotMessages.update(msgs => [...msgs, userMsg]);
    this.chatBotMessageInput.set('');
    this.isBotTyping.set(true);
    setTimeout(() => {
      let reply = "I've logged your request. Our support champions are checking the coordinates. For immediate reference, check our detailed system documentation below!";
      const textLower = msg.toLowerCase();
      if (textLower.includes('angular') || textLower.includes('signal') || textLower.includes('zoneless')) {
        reply = "Zoneless Angular 21 is fully active on OmniLMS! You can check your learning progress inside the 'My Learning' section to view lesson tutorials.";
      } else if (textLower.includes('billing') || textLower.includes('invoice') || textLower.includes('refund')) {
        reply = "Billing issues are handled securely. You can raise a formal support ticket right here on this page, and we will reply within 4 hours.";
      } else if (textLower.includes('password') || textLower.includes('reset')) {
        reply = "You can update your security credentials under 'Settings & Security' -> 'Security Credentials Rotation'.";
      }
      this.chatBotMessages.update(msgs => [...msgs, { id: 'b_' + Date.now(), sender: 'bot', text: reply, time: 'Just now' }]);
      this.isBotTyping.set(false);
    }, 1000);
  }

  ngOnInit() {
    this.initializeForms();
  }

  initializeForms() {
    // 1. Reactive Profile Form
    const p = this.state.profile();
    this.profileForm = new FormGroup({
      fullName: new FormControl(p.fullName, { nonNullable: true, validators: [Validators.required] }),
      username: new FormControl(p.username, { nonNullable: true, validators: [Validators.required] }),
      bio: new FormControl(p.bio, { nonNullable: true }),
      email: new FormControl(p.email, { nonNullable: true, validators: [Validators.required, Validators.email] }),
      mobile: new FormControl(p.mobile, { nonNullable: true }),
      country: new FormControl(p.country, { nonNullable: true }),
      state: new FormControl(p.state, { nonNullable: true }),
      city: new FormControl(p.city, { nonNullable: true }),
      zipCode: new FormControl(p.zipCode, { nonNullable: true }),
      linkedin: new FormControl(p.linkedin, { nonNullable: true }),
      github: new FormControl(p.github, { nonNullable: true }),
      twitter: new FormControl(p.twitter, { nonNullable: true }),
      education: new FormControl(p.education, { nonNullable: true }),
      experience: new FormControl(p.experience, { nonNullable: true }),
      skills: new FormControl(p.skills.join(', '), { nonNullable: true }),
      preferredLanguage: new FormControl(p.preferredLanguage, { nonNullable: true }),
      timezone: new FormControl(p.timezone, { nonNullable: true })
    });

    // 2. Reactive Password Rotation Form
    this.passwordForm = new FormGroup({
      currentPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      newPassword: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
      confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] })
    }, {
      validators: (group) => {
        const pass = group.get('newPassword')?.value;
        const confirm = group.get('confirmPassword')?.value;
        return pass === confirm ? null : { mismatch: true };
      }
    });

    // 3. Discussion Post Form
    this.postForm = new FormGroup({
      title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      content: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      tags: new FormControl('', { nonNullable: true })
    });

    // 4. Custom Calendar Goal Event Form
    this.eventForm = new FormGroup({
      title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      day: new FormControl(12, { nonNullable: true, validators: [Validators.required, Validators.min(1), Validators.max(31)] }),
      time: new FormControl('02:00 PM', { nonNullable: true, validators: [Validators.required] })
    });

    // 5. Direct Message Form
    this.messageForm = new FormGroup({
      text: new FormControl('', { nonNullable: true, validators: [Validators.required] })
    });

    // 6. Interactive Deliverable Submission Form
    this.assignmentForm = new FormGroup({
      comments: new FormControl('', { nonNullable: true }),
      fileName: new FormControl('', { nonNullable: true, validators: [Validators.required] })
    });

    // 7. Login Form
    this.loginForm = new FormGroup({
      email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
      password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] }),
      rememberMe: new FormControl(false, { nonNullable: true })
    });

    // 8. Register Form
    this.registerForm = new FormGroup({
      role: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
      fullName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email, approvedDomainValidator()] }),
      bio: new FormControl('', { nonNullable: true }),
      password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
      confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      agreeTerms: new FormControl(false, { nonNullable: true, validators: [Validators.requiredTrue] })
    }, {
      validators: (group) => {
        const pass = group.get('password')?.value;
        const confirm = group.get('confirmPassword')?.value;
        return pass === confirm ? null : { mismatch: true };
      }
    });

    // 9. Forgot Password Form
    this.forgotForm = new FormGroup({
      email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] })
    });

    // 10. Reset Password Form
    this.resetForm = new FormGroup({
      newPassword: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
      confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] })
    }, {
      validators: (group) => {
        const pass = group.get('newPassword')?.value;
        const confirm = group.get('confirmPassword')?.value;
        return pass === confirm ? null : { mismatch: true };
      }
    });

    // 11. OTP Form
    this.otpForm = new FormGroup({
      code: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^\d{6}$/)] })
    });

    // 12. Welcome Form
    this.welcomeForm = new FormGroup({
      learningGoal: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      experienceLevel: new FormControl('beginner', { nonNullable: true, validators: [Validators.required] })
    });

    // 13. Newsletter Form
    this.newsletterForm = new FormGroup({
      email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] })
    });
  }

  // Handle active navigation redirecting
  navigateTo(viewId: string) {
    this.state.activeView.set(viewId);
    this.showUserDropdown.set(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleInterest(interest: string) {
    const current = this.selectedWelcomeInterests();
    if (current.includes(interest)) {
      this.selectedWelcomeInterests.set(current.filter(i => i !== interest));
    } else {
      this.selectedWelcomeInterests.set([...current, interest]);
    }
  }

  toggleFaq(faqId: string) {
    this.faqExpanded.update(states => ({
      ...states,
      [faqId]: !states[faqId]
    }));
  }

  /**
   * Replaces the mock `certificatesList` with real data from
   * `GET /api/certificates/me`, mapped onto the shape the existing
   * certificate-viewer modal (`openCertificateViewer`) already expects.
   */
  loadRealCertificates() {
    this.certificateService.getMyCertificates().subscribe({
      next: (certs) => {
        this.certificatesList.set(
          certs.map((c) => ({
            id: c.certificateNumber,
            title: c.courseTitle,
            date: new Date(c.issuedOn).toLocaleDateString(),
            studentName: c.studentName,
          }))
        );
      },
      error: () => {
        // Leave existing (placeholder) certificates in place if the fetch fails.
      },
    });
  }

  private workspaceForRole(role: UserRole): 'learner' | 'instructor' | 'admin' {
    if (role === 'instructor') return 'instructor';
    if (role === 'admin') return 'admin';
    return 'learner';
  }

  onLoginSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.state.showToast('Please fix the errors in the login form.', 'error');
      return;
    }
    const { email, password } = this.loginForm.getRawValue();
    this.authError.set(null);
    this.authLoading.set(true);

    this.authService.login({ email, password }).subscribe({
      next: (result) => {
        this.authLoading.set(false);
        this.state.showToast(`Welcome back, ${result.user.name}! Logged in successfully.`, 'success');
        this.state.profile.update((p) => ({ ...p, fullName: result.user.name, email: result.user.email }));
        this.currentWorkspace.set(this.workspaceForRole(result.user.role));
        this.state.isLoggedIn.set(true);
        this.state.activeView.set('dashboard');
        if (result.user.role === 'student') {
          this.loadRealCertificates();
        }
      },
      error: (err: unknown) => {
        this.authLoading.set(false);
        const message =
          (err as { error?: { message?: string } })?.error?.message ??
          'Login failed. Please check your credentials and try again.';
        this.authError.set(message);
        this.state.showToast(message, 'error');
      },
    });
  }

  activeRegisterStep = signal<number>(1);
  showEmailSuggestions = signal<boolean>(false);

  commonDomains = [
    { suffix: 'stanford.edu', label: 'Academic (.edu)', icon: 'school' },
    { suffix: 'harvard.edu', label: 'Academic (.edu)', icon: 'school' },
    { suffix: 'mit.edu', label: 'Academic (.edu)', icon: 'school' },
    { suffix: 'ieee.org', label: 'Institution (.org)', icon: 'groups' },
    { suffix: 'enterprise.corp', label: 'Corporate (.corp)', icon: 'business' },
    { suffix: 'agency.gov', label: 'Government (.gov)', icon: 'account_balance' },
    { suffix: 'tech.io', label: 'Tech Org (.io)', icon: 'code' },
    { suffix: 'omnidemo.com', label: 'Corporate (.com)', icon: 'domain' }
  ];

  setRegisterStep(step: number) {
    if (step >= 1 && step <= 3) {
      this.activeRegisterStep.set(step);
    }
  }

  isStepCompleted(stepNum: number): boolean {
    if (!this.registerForm) return false;
    if (stepNum === 1) {
      return !!(this.registerForm.get('fullName')?.value?.trim());
    } else if (stepNum === 2) {
      return !!(this.registerForm.get('role')?.value);
    } else if (stepNum === 3) {
      const email = this.registerForm.get('email');
      const pass = this.registerForm.get('password');
      const terms = this.registerForm.get('agreeTerms');
      return !!(email?.valid && pass?.valid && terms?.value);
    }
    return false;
  }

  getRegistrationProgressPercentage(): number {
    if (!this.registerForm) return 15;
    let completedCount = 0;
    if (this.isStepCompleted(1)) completedCount++;
    if (this.isStepCompleted(2)) completedCount++;
    if (this.isStepCompleted(3)) completedCount++;

    if (completedCount === 3) return 100;
    if (completedCount === 2) return 66;
    if (completedCount === 1) return 33;
    return 15;
  }

  getEmailSuggestions(): { fullEmail: string; domain: string; label: string; icon: string }[] {
    const raw = this.registerForm?.get('email')?.value || '';
    if (!raw.trim()) return [];

    let prefix = raw;
    let domainPart = '';

    if (raw.includes('@')) {
      const parts = raw.split('@');
      prefix = parts[0];
      domainPart = parts[1] || '';
    }

    if (!prefix) return [];

    return this.commonDomains
      .filter(d => d.suffix.toLowerCase().startsWith(domainPart.toLowerCase()) || !domainPart)
      .slice(0, 5)
      .map(d => ({
        fullEmail: `${prefix}@${d.suffix}`,
        domain: `@${d.suffix}`,
        label: d.label,
        icon: d.icon
      }));
  }

  applyEmailSuggestion(suggestedEmail: string) {
    if (!this.registerForm) return;
    this.registerForm.get('email')?.setValue(suggestedEmail);
    this.registerForm.get('email')?.markAsDirty();
    this.registerForm.get('email')?.markAsTouched();
    this.registerForm.get('email')?.updateValueAndValidity();
    this.showEmailSuggestions.set(false);
  }

  quickAppendDomain(suffix: string) {
    const raw = this.registerForm?.get('email')?.value || '';
    const prefix = raw.includes('@') ? raw.split('@')[0] : raw;
    if (prefix) {
      this.applyEmailSuggestion(`${prefix}@${suffix}`);
    } else {
      this.applyEmailSuggestion(`user@${suffix}`);
    }
  }

  selectRegisterRole(roleValue: string) {
    this.registerForm.get('role')?.setValue(roleValue);
    this.registerForm.get('role')?.markAsTouched();
    this.registerForm.get('role')?.markAsDirty();
    this.registerForm.updateValueAndValidity();
    this.activeRegisterStep.set(3); // Auto advance to security step
  }

  importFromLinkedIn() {
    this.registerForm.patchValue({
      fullName: 'Dr. Alex Morgan, Ph.D.',
      email: 'alex.morgan@stanford.edu',
      bio: 'Senior EdTech Researcher & Curriculum Director at Stanford Learning Lab. Specializing in AI in Education.',
      role: 'teacher'
    });
    this.registerForm.markAsDirty();
    this.registerForm.get('role')?.markAsTouched();
    this.registerForm.get('fullName')?.markAsTouched();
    this.registerForm.get('email')?.markAsTouched();
    this.registerForm.get('bio')?.markAsTouched();
    this.registerForm.updateValueAndValidity();
    this.activeRegisterStep.set(3);
    this.state.showToast('LinkedIn profile synced! Full Name, Academic Email, Bio & Role auto-populated.', 'success');
  }

  getPasswordStrength() {
    const pass = this.registerForm?.get('password')?.value || '';
    const checks = {
      minLength: pass.length >= 8,
      hasNumber: /\d/.test(pass),
      hasUpper: /[A-Z]/.test(pass),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(pass)
    };

    if (!pass) {
      return {
        level: 'none',
        label: 'Enter Password',
        score: 0,
        color: 'bg-slate-200 dark:bg-slate-700',
        textColor: 'text-slate-400',
        barClass: 'w-0 bg-slate-300 dark:bg-slate-700',
        checks
      };
    }

    let score = 0;
    if (checks.minLength) score += 1;
    if (checks.hasNumber) score += 1;
    if (checks.hasUpper) score += 1;
    if (checks.hasSpecial) score += 1;

    if (pass.length < 6 || score <= 1) {
      return {
        level: 'weak',
        label: 'Weak Security',
        score: 1,
        color: 'bg-rose-500',
        textColor: 'text-rose-500',
        barClass: 'w-1/3 bg-rose-500',
        checks
      };
    } else if (score === 2 || score === 3) {
      return {
        level: 'medium',
        label: 'Medium Security',
        score: 2,
        color: 'bg-amber-500',
        textColor: 'text-amber-500',
        barClass: 'w-2/3 bg-amber-500',
        checks
      };
    } else {
      return {
        level: 'strong',
        label: 'Strong Security',
        score: 3,
        color: 'bg-emerald-500',
        textColor: 'text-emerald-500',
        barClass: 'w-full bg-emerald-500',
        checks
      };
    }
  }

  onRegisterSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      if (this.registerForm.get('role')?.invalid) {
        this.state.showToast('Please select your role.', 'error');
      } else {
        this.state.showToast('Please complete all registration fields correctly.', 'error');
      }
      return;
    }

    const { fullName, email, password, role } = this.registerForm.getRawValue();
    // Backend `registerSchema` (auth.validator.ts) only accepts
    // 'student' | 'instructor' — admin accounts cannot self-register,
    // so 'administration' is rejected client-side before it ever hits
    // the API (the backend would 400 it anyway).
    if (role === 'administration') {
      this.state.showToast(
        'Administrator accounts cannot self-register. Please contact an existing admin.',
        'error'
      );
      return;
    }
    const backendRole: Exclude<UserRole, 'admin'> = role === 'teacher' ? 'instructor' : 'student';

    this.registeredUserEmail.set(email || 'learner@omnidemo.com');
    this.authError.set(null);
    this.authLoading.set(true);

    // POST /api/auth/register (see core/services/auth.service.ts).
    // Registration alone does not log the user in on the backend — it
    // just creates the account — so we chain a real login() call with
    // the same credentials to get an access token/session, matching
    // the "auto login after registering" behavior the UI already promises.
    this.authService.register({ name: fullName, email, password, role: backendRole }).subscribe({
      next: () => {
        this.authService.login({ email, password }).subscribe({
          next: (result) => {
            this.authLoading.set(false);
            this.state.profile.update((p) => ({ ...p, fullName: result.user.name, email: result.user.email }));
            this.currentWorkspace.set(this.workspaceForRole(result.user.role));
            this.state.isLoggedIn.set(true);
            this.state.activeView.set('dashboard');
            this.state.showToast(
              `Account registered as ${backendRole === 'instructor' ? 'Instructor' : 'Student'}! Redirecting to your dashboard...`,
              'success'
            );
          },
          error: () => {
            this.authLoading.set(false);
            this.state.showToast('Account created — please log in.', 'success');
            this.state.activeView.set('login');
          },
        });
      },
      error: (err: unknown) => {
        this.authLoading.set(false);
        const message =
          (err as { error?: { message?: string } })?.error?.message ??
          'Registration failed. Please check your details and try again.';
        this.authError.set(message);
        this.state.showToast(message, 'error');
      },
    });
  }

  onForgotSubmit() {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }
    const email = this.forgotForm.value.email;
    this.state.showToast(`Password reset link sent to ${email}`, 'success');
    this.isVerificationEmailSent.set(true);
    setTimeout(() => {
      this.state.activeView.set('reset-password');
    }, 1500);
  }

  onResetSubmit() {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }
    this.state.showToast('Password reset successfully. Redirecting to login...', 'success');
    this.resetSuccess.set(true);
    setTimeout(() => {
      this.resetForm.reset();
      this.resetSuccess.set(false);
      this.state.activeView.set('login');
    }, 2000);
  }

  onOtpSubmit() {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }
    this.state.showToast('OTP code verified successfully! Onboarding complete.', 'success');
    this.otpCodeVerified.set(true);
    setTimeout(() => {
      this.state.activeView.set('welcome');
    }, 1500);
  }

  resendOtp() {
    this.state.showToast('A new 6-digit verification code has been sent to your device.', 'success');
  }

  resendVerificationEmail() {
    this.state.showToast(`Resending email verification link to ${this.registeredUserEmail()}`, 'success');
  }

  onWelcomeSubmit() {
    if (this.welcomeForm.invalid) {
      this.welcomeForm.markAllAsTouched();
      return;
    }
    this.state.showToast('Onboarding completed! Welcome to your learning space.', 'success');
    this.state.profile.update(p => ({
      ...p,
      fullName: this.registerForm.value.fullName || p.fullName,
      email: this.registerForm.value.email || p.email,
    }));
    this.state.isLoggedIn.set(true);
    this.state.activeView.set('dashboard');
  }

  onNewsletterSubmit() {
    if (this.newsletterForm.invalid) {
      this.newsletterForm.markAllAsTouched();
      return;
    }
    this.newsletterSubscribed.set(true);
    this.state.showToast('Successfully subscribed to OmniLMS newsletters!', 'success');
    setTimeout(() => {
      this.newsletterForm.reset();
      this.newsletterSubscribed.set(false);
    }, 4000);
  }

  // ==================== CAREERS & JOBS STATE & METHODS ====================
  careersSelectedRole = signal<string>('Frontend');
  careersInterviewQuestion = signal<string>('Explain the architectural differences between Zoneless Angular 21 (using Signals) and Zone.js change detection, and how it impacts rendering performance.');
  careersInterviewAnswer = signal<string>('');
  careersInterviewFeedback = signal<string>('');
  careersIsLoadingFeedback = signal<boolean>(false);
  careersAppliedJobs = signal<string[]>(['AI Systems Integration Specialist']);
  careersShowApplyModal = signal<boolean>(false);
  careersSelectedJob = signal<PartnerJob | null>(null);
  careersResumeText = signal<string>('');
  careersCoverLetterText = signal<string>('');

  partnerJobs = [
    {
      id: 'job-1',
      title: 'Senior Cloud Architect',
      company: 'Aether Cloud Systems',
      location: 'Remote (US/Europe)',
      salary: '$155,000 - $190,000',
      type: 'Full-time',
      logoText: 'AC',
      logoBg: 'bg-indigo-500/10 text-indigo-400',
      tags: ['PostgreSQL', 'Drizzle', 'Docker', 'Google Cloud'],
      description: 'Lead the migration of legacy database layers to enterprise-grade scale-to-zero serverless backends and direct VPC integrations.'
    },
    {
      id: 'job-2',
      title: 'Frontend Tech Lead',
      company: 'Helix Interactive',
      location: 'Hybrid (New York, NY)',
      salary: '$140,000 - $175,000',
      type: 'Full-time',
      logoText: 'HX',
      logoBg: 'bg-emerald-500/10 text-emerald-400',
      tags: ['Angular 21', 'TypeScript', 'Tailwind v4', 'Zoneless'],
      description: 'Direct a team of 6 engineers building beautiful, accessible high-contrast enterprise analytics dashboards and client portals.'
    },
    {
      id: 'job-3',
      title: 'AI Systems Integration Specialist',
      company: 'Synthetix AI',
      location: 'Remote (Global)',
      salary: '$165,000 - $215,000',
      type: 'Contract / Full-time',
      logoText: 'SX',
      logoBg: 'bg-purple-500/10 text-purple-400',
      tags: ['Gemini 2.5', 'Python', 'Node.js', 'Vector DBs'],
      description: 'Incorporate real-time multi-modal AI agents and function-calling workflows into core SaaS operations.'
    },
    {
      id: 'job-4',
      title: 'Full-Stack Developer',
      company: 'SaaSify Platforms',
      location: 'Remote (US East)',
      salary: '$120,000 - $150,000',
      type: 'Full-time',
      logoText: 'SP',
      logoBg: 'bg-cyan-500/10 text-cyan-400',
      tags: ['React', 'Next.js', 'PostgreSQL', 'Tailwind'],
      description: 'Build fast, offline-first client dashboards and customer portals using scalable database migrations and modern design tokens.'
    }
  ];

  careersMockInterviews = {
    'Frontend': {
      question: 'Explain the architectural differences between Zoneless Angular 21 (using Signals) and Zone.js change detection, and how it impacts rendering performance.',
      answers: {
        short: 'Zoneless uses Signals to know exactly which components changed, whereas Zone.js intercepts all async operations and runs global checks.',
        perfect: 'Zone.js performs top-down dirty checking by patching asynchronous APIs (setTimeout, events, promises) which results in unnecessary change detection runs across the entire component tree. Angular 21 Zoneless uses Signals (`computed`, `signal`, `effect`) to track precise, fine-grained state dependencies. When a signal updates, Angular directly schedules a microtask to render only the affected view nodes, removing global dirty-checking overhead, improving startup times, and enabling near-instantaneous UI updates.'
      }
    },
    'Cloud': {
      question: 'How would you design a rate-limiter for a microservice backend utilizing Redis and Node?',
      answers: {
        short: 'Use Redis key-value with TTL or token bucket algorithm.',
        perfect: 'We would implement a Sliding Window Counter algorithm using Redis sorted sets (ZADD, ZREMRANGEBYSCORE). Each incoming request is saved with its current timestamp as a score. We remove elements older than (now - window_size), check if the remaining set size is within the limit, and save. This prevents burst traffic at window boundaries compared to simple Fixed Window systems.'
      }
    },
    'AI': {
      question: 'How do you structure a multi-agent system utilizing Gemini 2.5 Flash for parallel workflow tasks with low latency?',
      answers: {
        short: 'Run them in parallel using Promise.all and structured tool calls.',
        perfect: 'To minimize latency and maximize throughput, we orchestrate agents using a main supervisor agent which divides a query into independent sub-tasks. We use `Promise.all` to trigger concurrent requests to the Gemini 2.5 Flash API with specific custom system instructions and strict system output schemas (via JSON response schemas). A separate coordinator agent then collects, aggregates, and validates the parallel outputs into a single consolidated answer.'
      }
    }
  };

  selectCareersRole(role: string) {
    this.careersSelectedRole.set(role);
    this.careersInterviewAnswer.set('');
    this.careersInterviewFeedback.set('');
    
    if (role === 'Frontend') {
      this.careersInterviewQuestion.set(this.careersMockInterviews['Frontend'].question);
    } else if (role === 'Cloud') {
      this.careersInterviewQuestion.set(this.careersMockInterviews['Cloud'].question);
    } else if (role === 'AI') {
      this.careersInterviewQuestion.set(this.careersMockInterviews['AI'].question);
    }
  }

  triggerCareersAIReview() {
    const answer = this.careersInterviewAnswer().trim();
    if (!answer) {
      this.state.showToast('Please enter an answer to get feedback.', 'error');
      return;
    }

    this.careersIsLoadingFeedback.set(true);
    this.careersInterviewFeedback.set('');

    setTimeout(() => {
      this.careersIsLoadingFeedback.set(false);
      const role = this.careersSelectedRole() as 'Frontend' | 'Cloud' | 'AI';
      const perfectText = this.careersMockInterviews[role].answers.perfect;

      this.careersInterviewFeedback.set(
        `### 🦾 OMNI AI Feedback Terminal\\n` +
        `**Completeness Metric**: 88% Match\\n` +
        `**Key Concepts Identified**: ${role === 'Frontend' ? 'Change Detection, Angular Signals, microtasks' : role === 'Cloud' ? 'Redis Transactions, Sliding Window, rate limits' : 'Concurrent execution, prompt engineering, structured JSON response'}\\n\\n` +
        `**Review Feedback Summary**:\\n` +
        `Your response correctly outlines the high-level concept. To make this an enterprise-grade interview answer, we recommend explaining how this mechanism scales under load and how error exceptions are handled gracefully.\\n\\n` +
        `**Refined Architectural Recommendation**:\\n` +
        `*${perfectText}*`
      );
      this.state.showToast('AI assessment generated successfully!', 'success');
    }, 1500);
  }

  submitCareersApplication(job: PartnerJob) {
    this.careersSelectedJob.set(job);
    this.careersResumeText.set('');
    this.careersCoverLetterText.set('');
    this.careersShowApplyModal.set(true);
  }

  submitApplyModal() {
    const job = this.careersSelectedJob();
    if (!job) return;

    if (!this.careersResumeText().trim()) {
      this.state.showToast('Please provide your resume content.', 'error');
      return;
    }

    const current = this.careersAppliedJobs();
    if (!current.includes(job.title)) {
      this.careersAppliedJobs.set([...current, job.title]);
    }

    this.state.showToast(`Application to ${job.company} submitted successfully! Our Partner Success Lead will contact you shortly.`, 'success');
    this.careersShowApplyModal.set(false);
    this.careersSelectedJob.set(null);
  }

  scrollToSection(sectionId: string) {
    this.state.activeView.set('landing');
    this.showUserDropdown.set(false);
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 120);
  }

  // Get color tag for Tailwind rendering
  getThemeColor(): string {
    const theme = this.state.selectedTheme();
    if (theme === 'cyan') return 'cyan';
    if (theme === 'emerald') return 'emerald';
    return 'indigo';
  }

  toggleDarkMode() {
    this.state.toggleDarkMode();
  }

  // Hover indicator updates for SVG Radar Matrix
  hoverSkill(name: string, proficiency: string) {
    this.activeHoveredSkill.set(name);
    this.activeHoveredProficiency.set(proficiency);
  }

  // Calendar helper
  getDayEvent(dayNum: number) {
    return this.calendarEventsMap[dayNum] || null;
  }

  // Search filter matching
  onSearchChange(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.state.searchQuery.set(val);
    if (val.trim()) {
      this.searchFocused.set(true);
    }
  }

  triggerSearch(query: string) {
    const clean = query.trim();
    this.state.searchQuery.set(clean);
    this.state.addRecentSearch(clean);
    this.state.activeView.set('courses-catalog');
    this.searchFocused.set(false);
  }

  // Submits
  saveProfileSubmit() {
    if (this.profileForm.invalid) return;
    const formVals = this.profileForm.getRawValue();
    // Parse skills array
    const skillsArr = formVals.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
    this.state.updateProfile({
      fullName: formVals.fullName,
      username: formVals.username,
      bio: formVals.bio,
      email: formVals.email,
      mobile: formVals.mobile,
      country: formVals.country,
      state: formVals.state,
      city: formVals.city,
      zipCode: formVals.zipCode,
      education: formVals.education,
      experience: formVals.experience,
      linkedin: formVals.linkedin,
      github: formVals.github,
      twitter: formVals.twitter,
      skills: skillsArr,
      preferredLanguage: formVals.preferredLanguage,
      timezone: formVals.timezone
    });
  }

  changePasswordSubmit() {
    if (this.passwordForm.invalid) {
      this.state.showToast('Please check password mismatch criteria!', 'error');
      return;
    }
    this.state.showToast('Security Key updated successfully! (Rotation complete)', 'success');
    this.passwordForm.reset();
  }

  submitNewPostForm() {
    if (this.postForm.invalid) return;
    const raw = this.postForm.getRawValue();
    this.state.addForumPost(raw.title, raw.content, raw.tags);
    this.postForm.reset();
    this.showNewPostPopup.set(false);
  }

  addEventSubmit() {
    if (this.eventForm.invalid) return;
    const raw = this.eventForm.getRawValue();
    const dayNum = raw.day;
    this.calendarEventsMap[dayNum] = {
      title: raw.title,
      time: raw.time,
      instructor: 'Pradeep Kumar (Self-Goal)'
    };
    // Force day update representation
    this.calendarDays = this.calendarDays.map(d => d.num === dayNum ? { ...d, hasEvent: true } : d);
    this.selectedCalendarDay.set(dayNum);
    this.state.showToast(`Learning goal "${raw.title}" pinned on day ${dayNum}!`, 'success');
    this.eventForm.reset({ day: dayNum, time: '02:00 PM', title: '' });
  }

  sendMessageSubmit() {
    if (this.messageForm.invalid) return;
    const text = this.messageForm.get('text')?.value;
    const activeId = this.state.activeChatId();
    this.state.sendChatMessage(activeId, text);
    this.messageForm.reset();
  }

  // Trigger submission action
  triggerSubmission(assignment: Assignment) {
    this.activeSubmissionTarget.set(assignment);
    this.assignmentForm.reset({ comments: '', fileName: '' });
    this.state.showToast(`Ready to submit: ${assignment.title}`, 'info');
  }

  // Choose a mock file
  selectMockFile() {
    const mockFiles = [
      'enterprise_signals_draft.pdf',
      'interactive_ux_flow_v4.pdf',
      'svg_responsive_coordinates.svg',
      'proxy_blueprint_shielded.json'
    ];
    const randomFile = mockFiles[Math.floor(Math.random() * mockFiles.length)];
    this.assignmentForm.patchValue({ fileName: randomFile });
    this.state.showToast(`Mock uploaded: ${randomFile}`, 'success');
  }

  submitAssignmentForm() {
    if (this.assignmentForm.invalid || !this.activeSubmissionTarget()) return;
    const target = this.activeSubmissionTarget()!;
    this.state.submitAssignment(target.id);
    this.activeSubmissionTarget.set(null);
    this.assignmentForm.reset();
  }

  // Community discussion comments
  addCommentSubmit(postId: string, commentInput: HTMLInputElement) {
    const text = commentInput.value;
    if (!text.trim()) return;
    this.state.addPostComment(postId, text);
    commentInput.value = '';
  }

  // Quick Action trigger shortcuts
  triggerQuickAction(actionType: 'class' | 'forum' | 'verify' | 'session') {
    this.showQuickActions.set(false);
    if (actionType === 'class') {
      const live = this.state.liveClasses().find(l => l.status === 'live');
      if (live && live.roomUrl) {
        window.open(live.roomUrl, '_blank');
        this.state.showToast('Opening Live Class Link...', 'success');
      } else {
        this.navigateTo('calendar');
        this.state.showToast('Checking calendar for upcoming slots', 'info');
      }
    } else if (actionType === 'forum') {
      this.navigateTo('community');
      this.showNewPostPopup.set(true);
    } else if (actionType === 'verify') {
      this.navigateTo('profile');
      this.state.showToast('Please trigger SMS/Email verify buttons in coordinates', 'info');
    } else if (actionType === 'session') {
      this.navigateTo('settings');
      this.state.showToast('Review active authenticated logs', 'info');
    }
  }

  // Remind me class slot alert trigger
  remindMe(classTitle: string) {
    this.state.showToast(`Alert registered for "${classTitle}"!`, 'success');
    this.state.notifications.update(n => [
      {
        id: Math.random().toString(),
        title: 'Reminder Configured',
        message: `We will alert you 10 mins before: ${classTitle}`,
        time: 'Just now',
        unread: true,
        type: 'info'
      },
      ...n
    ]);
  }

  // Upload custom profile face Unsplash
  triggerMockPhotoUpload() {
    const avatars = [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
    ];
    const current = this.state.profile().profilePhoto;
    const nextIdx = (avatars.indexOf(current) + 1) % avatars.length;
    this.state.profile.update(p => ({ ...p, profilePhoto: avatars[nextIdx] }));
    this.state.showToast('Profile photo updated successfully!', 'success');
  }

  // Open Certificate modal
  openCertificateViewer(cert: { id: string; title: string; date: string }) {
    this.activeCertificateViewer.set(cert);
    this.state.showToast(`Loading verified document: ${cert.title}`, 'info');
  }

  downloadCertificateMock(cert: { id: string; title: string; date: string }) {
    this.state.showToast(`Preparing printed document package for "${cert.title}"...`, 'info');
    setTimeout(() => {
      window.print();
      this.state.showToast(`Credentials downloaded successfully as PDF!`, 'success');
    }, 1200);
  }
}
