import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { CourseService } from './core/services/course.service';
import { EnrollmentService } from './core/services/enrollment.service';
import { mapCourseToCatalogCourse, mapModulesToSyllabus } from './core/mappers/course.mapper';

export interface Course {
  id: string;
  title: string;
  instructor: string;
  instructorImage: string;
  duration: string;
  completedHours: number;
  totalHours: number;
  progress: number;
  thumbnail: string;
  nextLesson: string;
  category: string;
  description: string;
}

export interface Assignment {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Submitted' | 'Graded';
  grade?: string;
  points: number;
}

export interface LiveClass {
  id: string;
  title: string;
  instructor: string;
  time: string;
  date: string;
  status: 'live' | 'upcoming' | 'ended';
  roomUrl?: string;
}

export interface Activity {
  id: string;
  text: string;
  time: string;
  icon: string;
  color: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
  color: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'instructor' | 'peer';
  senderName: string;
  avatar: string;
  text: string;
  time: string;
  attachment?: { name: string; size: string; type: 'pdf' | 'image' | 'code' | 'zip' };
  voiceNoteDuration?: string;
}

export interface ForumPost {
  id: string;
  author: string;
  avatar: string;
  title: string;
  content: string;
  likes: number;
  commentsCount: number;
  comments: {
    id: string;
    author: string;
    avatar: string;
    text: string;
    time: string;
    likes: number;
    hasLiked?: boolean;
    replies?: { id: string; author: string; avatar: string; text: string; time: string }[];
  }[];
  tags: string[];
  time: string;
  hasLiked?: boolean;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  type: 'info' | 'success' | 'alert';
}

export interface UserProfile {
  fullName: string;
  username: string;
  bio: string;
  email: string;
  emailVerified: boolean;
  mobile: string;
  mobileVerified: boolean;
  country: string;
  state: string;
  city: string;
  zipCode: string;
  linkedin: string;
  github: string;
  twitter: string;
  education: string;
  experience: string;
  skills: string[];
  preferredLanguage: string;
  timezone: string;
  profilePhoto: string;
  verificationStatus: string;
  twoFactorEnabled: boolean;
}

export interface CatalogCourse {
  id: string;
  title: string;
  status?: 'Draft' | 'Published' | 'Archived';
  instructor: string;
  instructorImage: string;
  instructorBio: string;
  duration: string;
  category: string;
  description: string;
  price: number;
  rating: number;
  reviewsCount: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  language: 'English' | 'Spanish' | 'German' | 'French';
  thumbnail: string;
  trailerUrl: string;
  outcomes: string[];
  requirements: string[];
  faq: { q: string; a: string }[];
  reviews: { user: string; avatar: string; rating: number; text: string; date: string }[];
  syllabus: { title: string; duration: string; lessons: string[] }[];
  relatedCourses: string[];
  wishlisted: boolean;
  recentlyViewed: boolean;
  viewCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class LmsState {
  // Navigation & UI State
  activeView = signal<string>('landing');
  isLoggedIn = signal<boolean>(false);
  sidebarCollapsed = signal<boolean>(false);
  darkMode = signal<boolean>(false);
  accessibilityLargeText = signal<boolean>(false);
  selectedTheme = signal<'indigo' | 'cyan' | 'emerald'>('indigo');
  searchQuery = signal<string>('');

  private readonly courseService = inject(CourseService);
  private readonly enrollmentService = inject(EnrollmentService);
  /** True while the initial GET /api/courses catalog fetch is in flight. */
  catalogLoading = signal<boolean>(false);
  catalogLoadError = signal<string | null>(null);
  /** Course id currently open in the real (API-backed) course player view. */
  livePlayerCourseId = signal<string | null>(null);

  constructor() {
    try {
      if (typeof localStorage !== 'undefined') {
        const savedDark = localStorage.getItem('lms_dark_mode');
        if (savedDark !== null) {
          this.darkMode.set(savedDark === 'true');
        } else if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          this.darkMode.set(true);
        }
      }
    } catch (err) {
      // Storage unavailable in restricted iframe context
      console.debug('localStorage check failed', err);
    }

    effect(() => {
      const isDark = this.darkMode();
      if (typeof document !== 'undefined' && document.documentElement) {
        document.documentElement.classList.toggle('dark', isDark);
        document.documentElement.classList.toggle('dark-theme', isDark);
        if (document.body) {
          document.body.classList.toggle('dark', isDark);
          document.body.classList.toggle('dark-theme', isDark);
        }
      }
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('lms_dark_mode', String(isDark));
        }
      } catch (err) {
        console.debug('localStorage write failed', err);
      }
    });

    // Replace the placeholder catalogCourses below with real data from
    // GET /api/courses as soon as it's available. Guarded to the
    // browser only: environment.apiUrl is relative-friendly in the
    // browser but SSR's fetch backend needs an absolute origin (see
    // the note in environments/environment.ts), so this intentionally
    // does not run during server-side rendering.
    if (typeof window !== 'undefined') {
      this.loadCatalogCoursesFromApi();
    }
  }

  /**
   * Fetches the real, published course catalog from the backend
   * (`GET /api/courses`) and replaces the placeholder
   * `catalogCourses` signal contents with it. Falls back to leaving
   * the existing (placeholder) data in place if the request fails,
   * so the UI never ends up empty just because the API is down.
   */
  loadCatalogCoursesFromApi(page = 1, pageSize = 50) {
    this.catalogLoading.set(true);
    this.catalogLoadError.set(null);
    this.courseService.list({ status: 'published', page, pageSize }).subscribe({
      next: (result) => {
        this.catalogLoading.set(false);
        this.catalogCourses.set(result.data.map(mapCourseToCatalogCourse));
      },
      error: (err: unknown) => {
        this.catalogLoading.set(false);
        const message =
          (err as { error?: { message?: string } })?.error?.message ?? 'Could not load the course catalog.';
        this.catalogLoadError.set(message);
      },
    });
  }

  /**
   * Fetches a course's modules/lessons (`GET /api/courses/:courseId/modules`)
   * and merges them into that course's `syllabus` field in the catalog
   * signal — call this when a course detail page opens, rather than
   * eagerly for the whole catalog (avoids an N+1 request per course).
   */
  loadCourseSyllabus(courseId: string) {
    this.courseService.getModules(courseId).subscribe({
      next: (modules) => {
        const syllabus = mapModulesToSyllabus(modules);
        this.catalogCourses.update((list) =>
          list.map((c) => (c.id === courseId ? { ...c, syllabus } : c))
        );
      },
      error: () => {
        this.showToast('Could not load the course curriculum.', 'error');
      },
    });
  }

  /**
   * Enrolls the current student in a free course
   * (`POST /api/enrollments/free`). Paid courses go through
   * `EnrollmentService.initiatePayment` + the Razorpay checkout widget
   * instead — that widget integration is a separate frontend task
   * (loading Razorpay's checkout.js and handling its callback) and is
   * intentionally not included here.
   */
  enrollFreeInCourse(courseId: string) {
    this.enrollmentService.enrollFree({ courseId }).subscribe({
      next: () => {
        this.showToast('Enrolled successfully! Check "My Learning" to get started.', 'success');
      },
      error: (err: unknown) => {
        const message =
          (err as { error?: { message?: string } })?.error?.message ?? 'Enrollment failed. Please try again.';
        this.showToast(message, 'error');
      },
    });
  }

  toggleDarkMode() {
    this.darkMode.update(d => !d);
    this.showToast(this.darkMode() ? 'Switched to Dark Mode' : 'Switched to Light Mode', 'info');
  }

  // --- Commerce & Search Features State ---
  cartIds = signal<string[]>([]);
  recentSearches = signal<string[]>(['angular signals', 'clean architecture', 'ux dashboard']);
  trendingSearches = signal<string[]>(['Zoneless Angular 21', 'SVG D3 Visuals', 'Secure Prompting', 'Figma SaaS Kit']);
  couponCodeInput = signal<string>('');
  activeCoupon = signal<{ code: string; discountPercent: number } | null>(null);
  paymentMethod = signal<'card' | 'paypal' | 'gpay' | 'crypto'>('card');
  checkoutStep = signal<'cart' | 'checkout' | 'payment' | 'success' | 'failed'>('cart');
  lastOrder = signal<{
    id: string;
    date: string;
    items: CatalogCourse[];
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    invoiceNo: string;
    paymentMethod: string;
  } | null>(null);

  cartCourses = computed(() => {
    return this.catalogCourses().filter(c => this.cartIds().includes(c.id));
  });

  wishlistedCourses = computed(() => {
    return this.catalogCourses().filter(c => this.wishlistedIds().includes(c.id));
  });

  cartSubtotal = computed(() => {
    return this.cartCourses().reduce((sum, item) => sum + item.price, 0);
  });

  cartDiscount = computed(() => {
    const sub = this.cartSubtotal();
    const coupon = this.activeCoupon();
    if (!coupon) return 0;
    return Math.round((sub * coupon.discountPercent) / 100);
  });

  cartTax = computed(() => {
    const base = this.cartSubtotal() - this.cartDiscount();
    return Math.round(base * 0.08); // 8% tax
  });

  cartTotal = computed(() => {
    const sub = this.cartSubtotal();
    const disc = this.cartDiscount();
    const tax = this.cartTax();
    return Math.max(0, sub - disc + tax);
  });

  searchSuggestions = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return [];
    return this.catalogCourses()
      .filter(c => c.title.toLowerCase().includes(q) || c.instructor.toLowerCase().includes(q) || c.category.toLowerCase().includes(q))
      .map(c => ({ id: c.id, title: c.title, category: c.category }));
  });

  // Course Experience State Signals
  wishlistedIds = signal<string[]>(['c2', 'c4']);
  recentlyViewedIds = signal<string[]>(['c1', 'c3']);
  activeCourseDetailsId = signal<string | null>(null);
  learningStreak = signal<number>(7);

  catalogCourses = signal<CatalogCourse[]>([
    {
      id: 'c1',
      title: 'Enterprise Angular & Clean Architecture',
      category: 'Development',
      instructor: 'Dr. Evelyn Vance',
      instructorImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      instructorBio: 'Former principal compiler designer with 15+ years experience teaching clean architectural engineering patterns.',
      duration: '32 Hours',
      description: 'Master the arts of clean scalability in Angular 21, including state-of-the-art Zoneless execution, modern Signals reactive patterns, and strict AOT-compliant architecture.',
      price: 149,
      rating: 4.9,
      reviewsCount: 320,
      level: 'Advanced',
      language: 'English',
      thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
      trailerUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      outcomes: [
        'Understand Zoneless Angular and custom Change Detection',
        'Implement highly decoupled clean architecture boundaries',
        'Write high-performance signal-based state pipelines',
        'Optimize compilation bundles using AOT & Tree-shaking'
      ],
      requirements: [
        'Proficiency in fundamental TypeScript structures',
        'Basic understanding of Angular component models',
        'Comfortable with CLI terminals and NPM scripting'
      ],
      faq: [
        { q: 'Is this course compatible with Angular 21?', a: 'Absolutely, the entire content has been fully audited and written with Zoneless Angular 21 patterns.' },
        { q: 'Do we get a verified completion certificate?', a: 'Yes, completing all modules unlocks a high-contrast cryptography-secured PDF certificate.' }
      ],
      reviews: [
        { user: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80', rating: 5, text: 'This was a masterful course. The deep dive into signal-based forms saved us weeks of over-engineering.', date: 'May 12, 2026' },
        { user: 'Marcus Aurelius', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80', rating: 4.8, text: 'Clear explanation of dependency injection boundaries and clean hexagonal decoupling.', date: 'April 28, 2026' }
      ],
      syllabus: [
        { title: 'Module 1: The Reactive Signal Foundations', duration: '8 Hours', lessons: ['Zoneless Angular 21 Architecture Deep Dive', 'Signal Primitives: Writable, Computed, and Effects', 'Advanced State Synchronization Loops'] },
        { title: 'Module 2: Hexagonal Decoupled Architecture', duration: '12 Hours', lessons: ['Defining Clear Boundary Layers', 'Injectable Token Scoping & Dependency Inversion', 'Mock-Free Clean Unit Testing Protocols'] }
      ],
      relatedCourses: ['c3', 'c5'],
      wishlisted: false,
      recentlyViewed: true,
      viewCount: 1250
    },
    {
      id: 'c2',
      title: 'Product-Led Growth & Modern SaaS UX',
      category: 'Design & Business',
      instructor: 'Marcus Aurelius',
      instructorImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
      instructorBio: 'Pioneered low-friction user activation and viral loops. Authorized speaker at premier global SaaS design summits.',
      duration: '24 Hours',
      description: 'Unlock the mechanics of high-conversion user journeys, beautiful SaaS spacing, intuitive interactive controls, and virality loops in enterprise dashboards.',
      price: 99,
      rating: 4.8,
      reviewsCount: 185,
      level: 'Intermediate',
      language: 'English',
      thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
      trailerUrl: 'https://www.w3schools.com/html/movie.mp4',
      outcomes: [
        'Design beautiful glassmorphism interfaces and cards',
        'Optimize onboarding screens for low-friction activation',
        'Integrate growth loops and self-serve upsells',
        'Conduct data-driven UX user testing feedback cycles'
      ],
      requirements: [
        'Familiarity with basic Figma design systems',
        'Fundamental appreciation for user interface colors and typography'
      ],
      faq: [
        { q: 'Will we design real dashboards in Figma?', a: 'Yes, a comprehensive 50+ element Figma UI Kit is bundled for free with this course.' }
      ],
      reviews: [
        { user: 'Pradeep Kumar', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80', rating: 5, text: 'This single-handedly reshaped my product design philosophy. Simple, scannable layouts are the absolute gold standard.', date: 'June 01, 2026' }
      ],
      syllabus: [
        { title: 'Module 1: SaaS Aesthetics & Visual Spacing', duration: '10 Hours', lessons: ['Micro-typography and Contrast Hierarchies', 'Bento Box Grid Layouts and Aspect Ratios', 'Glassmorphism & Radial Backglow Styling'] }
      ],
      relatedCourses: ['c3', 'c6'],
      wishlisted: true,
      recentlyViewed: false,
      viewCount: 940
    },
    {
      id: 'c3',
      title: 'High-Fidelity SVG Dashboards & Visuals',
      category: 'Development',
      instructor: 'Sarah Jenkins',
      instructorImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      instructorBio: 'Senior software architect specializing in interactive visualizations, scalable canvas rendering, and custom D3 modules.',
      duration: '18 Hours',
      description: 'Create state-of-the-art interactive analytical widgets, reactive polygonal charts, and beautiful vector visualizations using raw SVG and D3.',
      price: 79,
      rating: 5.0,
      reviewsCount: 94,
      level: 'Advanced',
      language: 'English',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
      trailerUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      outcomes: [
        'Master SVG path drawing algorithms and responsive viewpoints',
        'Integrate raw SVG elements within reactive Angular directives',
        'Implement smooth animated transitions using native web animations'
      ],
      requirements: [
        'Solid grasp of TypeScript arithmetic and basic algebra',
        'Familiarity with HTML and CSS transforms'
      ],
      faq: [
        { q: 'Do we need a D3 license?', a: 'No, we build everything using standard open-source D3 library blocks.' }
      ],
      reviews: [
        { user: 'Evelyn Vance', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80', rating: 5, text: 'The mathematical approach to vector layout mapping was incredibly clean.', date: 'May 19, 2026' }
      ],
      syllabus: [
        { title: 'Module 1: Vector Fundamentals', duration: '6 Hours', lessons: ['SVG coordinate space & viewport scaling', 'Custom path constructors and cubic bezier arcs'] }
      ],
      relatedCourses: ['c1', 'c2'],
      wishlisted: false,
      recentlyViewed: true,
      viewCount: 880
    },
    {
      id: 'c4',
      title: 'AI-Assisted Full-Stack Development',
      category: 'Artificial Intelligence',
      instructor: 'Prof. Alan Turing',
      instructorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      instructorBio: 'Renowned computing pioneer and lead instructor in advanced machine learning applications.',
      duration: '20 Hours',
      description: 'Leverage state-of-the-art LLMs (like the Gemini API) to automate full-stack application development, refactoring, and code analysis.',
      price: 49,
      rating: 4.9,
      reviewsCount: 512,
      level: 'Beginner',
      language: 'English',
      thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80',
      trailerUrl: 'https://www.w3schools.com/html/movie.mp4',
      outcomes: [
        'Formulate optimal system instructions for code gen',
        'Proxy server API requests with total security',
        'Design self-healing software compilation pipelines'
      ],
      requirements: [
        'Basic JavaScript execution experience',
        'Familiarity with API request-response structure'
      ],
      faq: [
        { q: 'Are keys provided?', a: 'A sandbox key is provided for in-app code labs.' }
      ],
      reviews: [
        { user: 'Pradeep Kumar', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80', rating: 4.9, text: 'This was an excellent intro to combining AI pipelines with real fullstack routes.', date: 'June 02, 2026' }
      ],
      syllabus: [
        { title: 'Module 1: LLM Orchestration', duration: '8 Hours', lessons: ['Prompt structures for structural outputs', 'Streaming responses and parsing JSON schemas'] }
      ],
      relatedCourses: ['c1', 'c5'],
      wishlisted: true,
      recentlyViewed: false,
      viewCount: 1410
    },
    {
      id: 'c5',
      title: 'Secure Cloud SQL & Server SSR',
      category: 'Cloud Engineering',
      instructor: 'Dan Abramov',
      instructorImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      instructorBio: 'Renowned software engineer specializing in backend scaling and edge server rendering.',
      duration: '28 Hours',
      description: 'Design fast, relational, and highly-scalable databases using Cloud SQL PostgreSQL and configure fast server-side rendering routes.',
      price: 119,
      rating: 4.8,
      reviewsCount: 143,
      level: 'Intermediate',
      language: 'German',
      thumbnail: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=800&q=80',
      trailerUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      outcomes: [
        'Model relational databases with Drizzle ORM schemas',
        'Deploy ultra-fast scaling Cloud SQL nodes',
        'Secure Express routers with server-side authentication'
      ],
      requirements: [
        'Familiarity with basic SQL queries',
        'Basic knowledge of Node.js routing and Express'
      ],
      faq: [
        { q: 'Is the course taught in German?', a: 'Yes, the audio and syllabus materials are completely in German.' }
      ],
      reviews: [
        { user: 'Evelyn Vance', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80', rating: 5, text: 'Fantastic coverage of server hydration boundaries and relational indexes.', date: 'May 20, 2026' }
      ],
      syllabus: [
        { title: 'Module 1: Relational Schema Modeling', duration: '12 Hours', lessons: ['Third-Normal-Form relational database design', 'Configuring connection pools and migration scripts'] }
      ],
      relatedCourses: ['c1', 'c4'],
      wishlisted: false,
      recentlyViewed: false,
      viewCount: 720
    },
    {
      id: 'c6',
      title: 'Next-Gen Web Animations & Motion',
      category: 'UI/UX Design',
      instructor: 'Chloe Zhao',
      instructorImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      instructorBio: 'Principal animator and motion designer who has crafted layouts for world-leading design firms.',
      duration: '16 Hours',
      description: 'Create breath-taking scroll-linked animations, multi-step morphing transitions, and high-fidelity page loads using vanilla JS Motion.',
      price: 89,
      rating: 4.7,
      reviewsCount: 78,
      level: 'Beginner',
      language: 'Spanish',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      trailerUrl: 'https://www.w3schools.com/html/movie.mp4',
      outcomes: [
        'Orchestrate complex timeline sequences using staggers',
        'Animate SVGs and transform nodes for responsive micro-interactions',
        'Deliver layout morphing transitions without HMR lag'
      ],
      requirements: [
        'Fundamental CSS experience',
        'Comfortable writing basic functions in vanilla JS'
      ],
      faq: [
        { q: '¿Este curso se enseña en español?', a: 'Sí, todas las lecciones y cuestionarios se presentan en español con subtítulos opcionales.' }
      ],
      reviews: [
        { user: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80', rating: 4.8, text: '¡Excelente! Las transiciones de curvas Bézier personalizadas son increíbles.', date: 'May 30, 2026' }
      ],
      syllabus: [
        { title: 'Module 1: Easing & Bezier Control', duration: '6 Hours', lessons: ['Timing configurations and stagger arrays', 'Scroll-linked timelines and performance bottlenecks'] }
      ],
      relatedCourses: ['c2', 'c3'],
      wishlisted: false,
      recentlyViewed: false,
      viewCount: 650
    }
  ]);

  // View course details action
  viewCourseDetails(courseId: string) {
    this.activeCourseDetailsId.set(courseId);
    this.activeView.set('course-details');
    // Add to recently viewed if not already there
    this.recentlyViewedIds.update(ids => {
      const filtered = ids.filter(id => id !== courseId);
      return [courseId, ...filtered];
    });
    this.showToast('Loading syllabus files and outcomes...', 'info');
  }

  // Toggle wishlist action
  toggleWishlist(courseId: string) {
    let status = false;
    this.wishlistedIds.update(ids => {
      if (ids.includes(courseId)) {
        this.showToast('Removed from wishlisted syllabus', 'info');
        status = false;
        return ids.filter(id => id !== courseId);
      } else {
        this.showToast('Added to wishlisted syllabus!', 'success');
        status = true;
        return [...ids, courseId];
      }
    });

    // Sync back with catalog courses list
    this.catalogCourses.update(courses => 
      courses.map(c => c.id === courseId ? { ...c, wishlisted: status } : c)
    );
  }

  // Enroll in catalog course
  enrollInCatalogCourse(courseId: string) {
    const catalog = this.catalogCourses().find(c => c.id === courseId);
    if (!catalog) return;

    // Check if already enrolled
    const exists = this.courses().find(c => c.id === courseId);
    if (exists) {
      this.showToast('You are already enrolled in this course!', 'info');
      this.activeView.set('my-learning');
      return;
    }

    // Add to enrolled courses list
    const newEnrolled: Course = {
      id: catalog.id,
      title: catalog.title,
      instructor: catalog.instructor,
      instructorImage: catalog.instructorImage,
      duration: catalog.duration,
      completedHours: 0,
      totalHours: parseInt(catalog.duration),
      progress: 0,
      thumbnail: catalog.thumbnail,
      nextLesson: catalog.syllabus[0]?.lessons[0] || 'Orientation',
      category: catalog.category,
      description: catalog.description
    };

    this.courses.update(list => [...list, newEnrolled]);
    this.showToast(`Congratulations! Successfully enrolled in "${catalog.title}"`, 'success');
    
    // Add simple timeline activity
    const newActivity = {
      id: Math.random().toString(),
      text: `Enrolled in new masterclass: ${catalog.title}`,
      time: 'Just Now',
      icon: 'school',
      color: 'bg-brand-500'
    };
    this.activities.update(list => [newActivity, ...list]);

    this.activeView.set('my-learning');
  }

  // Handle Quick Actions
  triggerQuickAction(action: string) {
    if (action === 'schedule') {
      this.showToast('Study session block appended to calendar!', 'success');
      this.activeView.set('calendar');
    } else if (action === 'certificate') {
      this.showToast('Assembling authorized cryptographic certificate bundle...', 'info');
      setTimeout(() => {
        this.showToast('Bundle download triggered successfully!', 'success');
      }, 1000);
    } else if (action === 'resume') {
      // Resume the first active course
      const first = this.courses()[0];
      if (first) {
        this.showToast(`Resuming "${first.title}"`, 'info');
        this.activeView.set('my-learning');
      } else {
        this.showToast('Explore courses to begin learning!', 'info');
        this.activeView.set('courses-catalog');
      }
    } else if (action === 'verify') {
      this.showToast('Initiating standard bio credentials audit...', 'info');
      this.activeView.set('profile');
    }
  }

  // Toast notifications helper
  toasts = signal<{ id: string; message: string; type: 'success' | 'info' | 'error' }[]>([]);

  // Profile Module State
  profile = signal<UserProfile>({
    fullName: 'Pradeep Kumar',
    username: 'pradeep_enterprise',
    bio: 'Senior Product Designer & EdTech enthusiast. Learning high-fidelity full-stack architectures and modern SaaS layouts.',
    email: 'pradeep.kumar@enterprise.com',
    emailVerified: true,
    mobile: '+1 (555) 234-5678',
    mobileVerified: false,
    country: 'United States',
    state: 'California',
    city: 'San Francisco',
    zipCode: '94105',
    linkedin: 'linkedin.com/in/pradeep-designer',
    github: 'github.com/pradeep-enterprise',
    twitter: 'twitter.com/pradeep_saas',
    education: 'Master of Science in Human-Computer Interaction',
    experience: '6+ Years in Enterprise UX & SaaS Product Design',
    skills: ['UI/UX Design', 'Figma Mastery', 'Tailwind CSS v4', 'Angular Signals', 'System Architecture', 'Design Systems'],
    preferredLanguage: 'English (US)',
    timezone: 'Pacific Time (PT) - UTC-8',
    profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    verificationStatus: 'Enterprise VIP Scholar',
    twoFactorEnabled: false
  });

  // Calculate Profile Completion dynamically
  profileCompletion = computed(() => {
    const p = this.profile();
    const fields = [
      p.fullName, p.username, p.bio, p.email, p.mobile,
      p.country, p.state, p.city, p.zipCode, p.linkedin,
      p.github, p.education, p.experience, p.profilePhoto
    ];
    const filled = fields.filter(f => !!f).length;
    let base = Math.round((filled / fields.length) * 100);
    // Add bonus points for verification & 2FA
    if (p.emailVerified) base = Math.min(100, base + 5);
    if (p.mobileVerified) base = Math.min(100, base + 5);
    if (p.twoFactorEnabled) base = Math.min(100, base + 5);
    return Math.min(100, base);
  });

  // Completed Lessons index by course ID
  completedLessons = signal<Record<string, string[]>>({
    'c1': ['Zoneless Angular 21 Architecture Deep Dive'],
    'c2': [],
    'c3': ['Custom Path Interpolations & Fluid SVG Timelines'],
    'c4': []
  });

  // Enrolled Courses
  courses = signal<Course[]>([
    {
      id: 'c1',
      title: 'Enterprise Angular & Clean Architecture',
      instructor: 'Dr. Evelyn Vance',
      instructorImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
      duration: '16 hours',
      completedHours: 12,
      totalHours: 16,
      progress: 75,
      thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=500&q=80',
      nextLesson: 'Unidirectional Data Flow & Zoneless Angular Signals',
      category: 'Development',
      description: 'Master enterprise-level Angular development including standalone patterns, state management via Signals, and optimized build engines.'
    },
    {
      id: 'c2',
      title: 'Product-Led Growth & Modern SaaS UX',
      instructor: 'Marcus Aurelius',
      instructorImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80',
      duration: '10 hours',
      completedHours: 4,
      totalHours: 10,
      progress: 40,
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=500&q=80',
      nextLesson: 'The Hook Framework: Frictionless Activation Loops',
      category: 'Design & Business',
      description: 'Understand high-converting growth loops, onboarding aesthetics, and telemetry-driven feature iterations for scalable business SaaS.'
    },
    {
      id: 'c3',
      title: 'High-Fidelity SVG Dashboards & Visuals',
      instructor: 'Sarah Jenkins',
      instructorImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
      duration: '15 hours',
      completedHours: 13.5,
      totalHours: 15,
      progress: 90,
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=500&q=80',
      nextLesson: 'Custom Path Interpolations & Fluid SVG Timelines',
      category: 'Development',
      description: 'Build gorgeous interactive SVG data visualizers, custom line charts, responsive nodes grids, and seamless viewport canvas controls.'
    },
    {
      id: 'c4',
      title: 'AI-Assisted Full-Stack Development',
      instructor: 'Prof. Alan Turing',
      instructorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
      duration: '20 hours',
      completedHours: 2,
      totalHours: 20,
      progress: 10,
      thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=500&q=80',
      nextLesson: 'Context Injecting & Secure Prompt Engineering SDKs',
      category: 'Artificial Intelligence',
      description: 'Incorporate state-of-the-art Generative AI features with full sandboxing, server-side proxies, and proper key shielding protocols.'
    }
  ]);

  // Recommended Courses
  recommendedCourses = signal([
    {
      id: 'rc1',
      title: 'Advanced D3.js and Spatial Maps',
      duration: '6 hours',
      rating: 4.9,
      instructor: 'Chloe Zhao',
      image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=300&q=80',
      enrolled: false
    },
    {
      id: 'rc2',
      title: 'Tailwind CSS v4.0 Layout Masterclass',
      duration: '5 hours',
      rating: 5.0,
      instructor: 'Adam Wathan',
      image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=300&q=80',
      enrolled: false
    },
    {
      id: 'rc3',
      title: 'Secure Cloud SQL & Server SSR',
      duration: '10 hours',
      rating: 4.8,
      instructor: 'Dan Abramov',
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=300&q=80',
      enrolled: false
    }
  ]);

  // Assignments
  assignments = signal<Assignment[]>([
    {
      id: 'a1',
      title: 'State Architecture Design Document',
      course: 'Enterprise Angular & Clean Architecture',
      dueDate: '2026-07-13',
      status: 'Pending',
      points: 100
    },
    {
      id: 'a2',
      title: 'Frictionless Signup Interactive Prototype',
      course: 'Product-Led Growth & Modern SaaS UX',
      dueDate: '2026-07-16',
      status: 'In Progress',
      points: 100
    },
    {
      id: 'a3',
      title: 'Dynamic Responsive SVG Line Chart',
      course: 'High-Fidelity SVG Dashboards & Visuals',
      dueDate: '2026-07-20',
      status: 'Graded',
      grade: '98/100',
      points: 100
    },
    {
      id: 'a4',
      title: 'Secure Proxy Server-Side Blueprint',
      course: 'AI-Assisted Full-Stack Development',
      dueDate: '2026-07-25',
      status: 'Pending',
      points: 100
    }
  ]);

  // Upcoming Live Classes
  liveClasses = signal<LiveClass[]>([
    {
      id: 'lc1',
      title: 'Angular Signals Deep-Dive & Performance Review',
      instructor: 'Dr. Evelyn Vance',
      date: '2026-07-12',
      time: '02:00 PM',
      status: 'live',
      roomUrl: 'https://meet.google.com/abc-defg-hij'
    },
    {
      id: 'lc2',
      title: 'Drizzle Schema Migrations with Cloud SQL',
      instructor: 'Sarah Jenkins',
      date: '2026-07-13',
      time: '10:00 AM',
      status: 'upcoming'
    },
    {
      id: 'lc3',
      title: 'SaaS Growth Mechanics & Funnel Optimization',
      instructor: 'Marcus Aurelius',
      date: '2026-07-15',
      time: '04:00 PM',
      status: 'upcoming'
    }
  ]);

  recordings = signal([
    { id: 'rec-1', title: 'Signals: From Legacy ChangeDetection to Zoneless', instructor: 'Dr. Evelyn Vance', date: '2026-07-08', duration: '58 mins', thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80', views: 185 },
    { id: 'rec-2', title: 'Advanced Postgres Partitioning Strategies', instructor: 'Sarah Jenkins', date: '2026-07-05', duration: '1 hr 12 mins', thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=400&q=80', views: 120 },
    { id: 'rec-3', title: 'Designing Minimalist SaaS Dashboards in Figma', instructor: 'Marcus Aurelius', date: '2026-07-02', duration: '45 mins', thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=400&q=80', views: 240 }
  ]);

  liveAttendance = signal([
    { classId: 'lc1', title: 'Angular Signals Deep-Dive', status: 'Checked In', date: '2026-07-12' },
    { classId: 'lc2', title: 'Drizzle Schema Migrations', status: 'Excused', date: '2026-07-13' },
    { classId: 'lc3', title: 'SaaS Growth Mechanics', status: 'Absent', date: '2026-07-15' }
  ]);

  // Badges
  badges = signal<Badge[]>([
    {
      id: 'b1',
      name: 'Early Adopter',
      description: 'First course enrollment and onboarding completed',
      icon: 'verified_user',
      unlockedAt: '2026-07-01',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'b2',
      name: 'Signal Architect',
      description: 'Successfully built custom state systems using reactive Signals',
      icon: 'dynamic_feed',
      unlockedAt: '2026-07-05',
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 'b3',
      name: 'High Flyer',
      description: 'Sustained an average score above 95% on all assignments',
      icon: 'emoji_events',
      unlockedAt: '2026-07-09',
      color: 'from-amber-400 to-orange-500'
    },
    {
      id: 'b4',
      name: 'Full Stack Elite',
      description: 'Deployed server proxies and shielded security mechanisms',
      icon: 'shield',
      unlockedAt: 'Pending',
      color: 'from-slate-400 to-slate-600'
    }
  ]);

  // Activity Feed
  activities = signal<Activity[]>([
    {
      id: 'act1',
      text: 'Completed Lesson: Signals state synchronization',
      time: '2 hours ago',
      icon: 'check_circle',
      color: 'text-emerald-500'
    },
    {
      id: 'act2',
      text: 'Submitted Assignment: SVG Interactive Graph Chart',
      time: '1 day ago',
      icon: 'cloud_upload',
      color: 'text-blue-500'
    },
    {
      id: 'act3',
      text: 'Earned Achievement Badge: "High Flyer"',
      time: '2 days ago',
      icon: 'star',
      color: 'text-amber-500'
    },
    {
      id: 'act4',
      text: 'Joined Group: "SaaS Designers Hub"',
      time: '3 days ago',
      icon: 'group_add',
      color: 'text-indigo-500'
    }
  ]);

  // Messages with peers & instructors
  activeChatId = signal<string>('c-evelyn');
  chats = signal([
    {
      id: 'c-evelyn',
      name: 'Dr. Evelyn Vance',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
      role: 'Lead Instructor',
      online: true,
      chatType: 'instructor' as 'instructor' | 'student' | 'group',
      messages: signal<ChatMessage[]>([
        { id: 'm1', sender: 'instructor', senderName: 'Dr. Evelyn Vance', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80', text: 'Hello Pradeep! I noticed you completed the modular testing block ahead of time. Exceptional work.', time: '09:12 AM' },
        { id: 'm2', sender: 'user', senderName: 'Pradeep Kumar', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', text: 'Thank you Evelyn! I wanted to check if we can skip some of the standard Zone change detection strategies and go fully Zoneless.', time: '09:25 AM' },
        { id: 'm3', sender: 'instructor', senderName: 'Dr. Evelyn Vance', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80', text: 'Absolutely. Zoneless is the future of Angular. In our upcoming Live session today, we will discuss how to optimize the change cycles using computed bounds. See you there!', time: '10:02 AM' }
      ])
    },
    {
      id: 'c-sarah',
      name: 'Sarah Jenkins',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
      role: 'SVG Expert',
      online: true,
      chatType: 'instructor' as 'instructor' | 'student' | 'group',
      messages: signal<ChatMessage[]>([
        { id: 'm4', sender: 'instructor', senderName: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80', text: 'Hey Pradeep, did you check the responsive line graph coordinates?', time: 'Yesterday' },
        { id: 'm5', sender: 'user', senderName: 'Pradeep Kumar', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', text: 'Yes, they are perfectly scaled to the bounds now. Thank you!', time: 'Yesterday' }
      ])
    },
    {
      id: 'c-marcus',
      name: 'Marcus Aurelius',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80',
      role: 'Growth Mentor',
      online: false,
      chatType: 'instructor' as 'instructor' | 'student' | 'group',
      messages: signal<ChatMessage[]>([
        { id: 'm6', sender: 'instructor', senderName: 'Marcus Aurelius', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80', text: 'Hey, look into user activation curves before completing your next product prototype.', time: '3 days ago' }
      ])
    },
    {
      id: 'c-julia',
      name: 'Julia Roberts',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80',
      role: 'Peer Student',
      online: true,
      chatType: 'student' as 'instructor' | 'student' | 'group',
      messages: signal<ChatMessage[]>([
        { id: 'm7', sender: 'peer', senderName: 'Julia Roberts', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80', text: 'Hey Pradeep, do you have any tips for the Module 1 evaluating test? Stressed about the countdown timer.', time: 'Yesterday' },
        { id: 'm8', sender: 'user', senderName: 'Pradeep Kumar', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', text: 'Hey Julia! Read carefully about calculated computed signals. Re-running the quiz is always possible, so do not stress.', time: 'Yesterday' }
      ])
    },
    {
      id: 'c-michael',
      name: 'Michael Scott',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80',
      role: 'Peer Student',
      online: false,
      chatType: 'student' as 'instructor' | 'student' | 'group',
      messages: signal<ChatMessage[]>([
        { id: 'm9', sender: 'peer', senderName: 'Michael Scott', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80', text: 'I completed my assignment files but I am having issues choosing my file mock uploader.', time: '2 days ago' }
      ])
    },
    {
      id: 'g-signals',
      name: 'Angular Signals Core Cohort',
      avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=100&q=80',
      role: 'Group Discussion',
      online: true,
      chatType: 'group' as 'instructor' | 'student' | 'group',
      messages: signal<ChatMessage[]>([
        { id: 'm10', sender: 'instructor', senderName: 'Dr. Evelyn Vance', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80', text: 'Welcome everyone to the Core Cohort! Use this space to share resources and group insights.', time: 'July 10' },
        { id: 'm11', sender: 'peer', senderName: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80', text: 'Excited to be here! The modular boundaries of our state.ts make so much sense now.', time: 'July 10' }
      ])
    },
    {
      id: 'g-ux',
      name: 'SaaS Growth & Designers Hub',
      avatar: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=100&q=80',
      role: 'Group Discussion',
      online: true,
      chatType: 'group' as 'instructor' | 'student' | 'group',
      messages: signal<ChatMessage[]>([
        { id: 'm12', sender: 'instructor', senderName: 'Marcus Aurelius', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80', text: 'Remember, low-friction onboarding loops are the single best optimization you can run this week.', time: 'July 09' }
      ])
    }
  ]);

  // Discussion Forum / Community Posts
  communityPosts = signal<ForumPost[]>([
    {
      id: 'p1',
      author: 'Julia Roberts',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80',
      title: 'How are you organizing custom state models in Zoneless Angular?',
      content: 'I am building a comprehensive learning canvas and want to prevent unnecessary component refreshes. Is everyone using service-based global signals or passing reactive inputs down to the templates?',
      likes: 24,
      commentsCount: 3,
      comments: [
        { id: 'c1', author: 'Pradeep Kumar', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', text: 'Definitely go with a service-based state model! It decouples template re-renders and lets computed signals cache computed values. Super smooth.', time: '5 hours ago', likes: 6, hasLiked: true, replies: [{ id: 'rep1', author: 'Julia Roberts', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80', text: 'Thanks Pradeep, this is really helpful!', time: '4 hours ago' }] },
        { id: 'c2', author: 'Dave Chappelle', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80', text: 'I agree. Signals make state management clean, lightweight, and easy to trace.', time: '3 hours ago', likes: 2, replies: [] }
      ],
      tags: ['Angular', 'State Management', 'Signals'],
      time: '6 hours ago',
      hasLiked: false
    },
    {
      id: 'p2',
      author: 'Michael Scott',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80',
      title: 'Enterprise Figma UI Kit for Developer Handoff',
      content: 'Just uploaded our primary enterprise design library including the blue/indigo theme tokens, rounded borders, and clean data slots. Check the description for the link!',
      likes: 42,
      commentsCount: 1,
      comments: [
        { id: 'c3', author: 'Julia Roberts', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80', text: 'This is beautiful! Perfect contrast on the secondary tables.', time: '1 day ago', likes: 12, replies: [] }
      ],
      tags: ['Design Systems', 'Figma', 'UX'],
      time: '1 day ago',
      hasLiked: true
    }
  ]);

  // Notifications
  notifications = signal<SystemNotification[]>([
    {
      id: 'n1',
      title: 'New Live Session Starting Soon',
      message: 'Dr. Evelyn Vance is going LIVE in 10 minutes on Zoneless Angular Signals!',
      time: '5 mins ago',
      unread: true,
      type: 'alert'
    },
    {
      id: 'n2',
      title: 'Assignment Graded',
      message: 'Your assignment "Dynamic Responsive SVG Line Chart" scored 98/100 points!',
      time: '1 day ago',
      unread: true,
      type: 'success'
    },
    {
      id: 'n3',
      title: 'Welcome to Enterprise Academy',
      message: 'Your account has been verified as an Enterprise VIP Scholar. Enjoy premium access!',
      time: '3 days ago',
      unread: false,
      type: 'info'
    }
  ]);

  // Settings State helpers
  activeSessions = signal([
    { id: 's1', browser: 'Chrome', os: 'macOS Sonoma', ip: '192.168.1.104', isCurrent: true, date: 'Active Now' },
    { id: 's2', browser: 'Safari', os: 'iPhone 15 Pro', ip: '172.56.21.99', isCurrent: false, date: 'July 10, 2026, 04:32 PM' }
  ]);

  loginHistory = signal([
    { date: '2026-07-11 09:15 AM', status: 'Success', ip: '192.168.1.104', location: 'San Francisco, CA' },
    { date: '2026-07-10 11:24 AM', status: 'Success', ip: '192.168.1.104', location: 'San Francisco, CA' },
    { date: '2026-07-09 03:40 PM', status: 'Success', ip: '172.56.21.99', location: 'San Jose, CA' }
  ]);

  connectedDevices = signal([
    { id: 'd1', name: 'MacBook Pro 16"', type: 'laptop', status: 'Primary Device' },
    { id: 'd2', name: 'iPhone 15 Pro', type: 'phone', status: 'Secondary Device' }
  ]);

  notificationPreferences = signal({
    emailAnnouncements: true,
    emailAssignments: true,
    emailLiveClasses: true,
    smsAlerts: false,
    pushActivities: true
  });

  // Action methods to change signals state
  showToast(message: string, type: 'success' | 'info' | 'error' = 'success') {
    const id = Math.random().toString();
    this.toasts.update(t => [...t, { id, message, type }]);
    setTimeout(() => {
      this.toasts.update(t => t.filter(x => x.id !== id));
    }, 4000);
  }

  markLessonCompleted(courseId: string, lessonName: string, completed = true) {
    this.completedLessons.update(record => {
      const current = record[courseId] || [];
      let updated: string[];
      if (completed) {
        if (current.includes(lessonName)) return record;
        updated = [...current, lessonName];
      } else {
        updated = current.filter(l => l !== lessonName);
      }
      return {
        ...record,
        [courseId]: updated
      };
    });

    // Update the course progress and completedHours dynamically!
    this.courses.update(list => list.map(c => {
      if (c.id === courseId) {
        const completedList = this.completedLessons()[courseId] || [];
        const catalogCourse = this.catalogCourses().find(cat => cat.id === courseId);
        
        let totalLessons = 5; // Default safe fallback
        if (catalogCourse) {
          totalLessons = 0;
          catalogCourse.syllabus.forEach(sec => totalLessons += sec.lessons.length);
          // Add 2 for interactive quiz and assignment
          totalLessons += 2;
        }

        const completedCount = completedList.length;
        const progress = Math.round((completedCount / totalLessons) * 100);
        
        // completedHours is based on progress of total hours
        const completedHours = parseFloat(((completedCount / totalLessons) * c.totalHours).toFixed(1));

        return {
          ...c,
          progress: Math.min(100, progress),
          completedHours: Math.min(c.totalHours, completedHours)
        };
      }
      return c;
    }));
  }

  updateProfile(updated: Partial<UserProfile>) {
    this.profile.update(p => ({ ...p, ...updated }));
    this.showToast('Profile saved successfully!', 'success');
  }

  toggle2FA() {
    this.profile.update(p => {
      const targetState = !p.twoFactorEnabled;
      if (targetState) {
        this.showToast('Two-Factor Authentication is now ENABLED!', 'success');
      } else {
        this.showToast('Two-Factor Authentication is now disabled.', 'info');
      }
      return { ...p, twoFactorEnabled: targetState };
    });
  }

  verifyEmail() {
    this.profile.update(p => {
      this.showToast('Verification email resent! Please check your inbox.', 'info');
      return { ...p, emailVerified: true };
    });
  }

  verifyMobile() {
    this.profile.update(p => {
      this.showToast('Mobile phone verified via SMS confirmation code!', 'success');
      return { ...p, mobileVerified: true };
    });
  }

  submitAssignment(assignmentId: string) {
    this.assignments.update(items =>
      items.map(a => {
        if (a.id === assignmentId) {
          this.showToast(`Assignment "${a.title}" submitted successfully!`, 'success');
          // Add activity
          this.activities.update(act => [
            {
              id: Math.random().toString(),
              text: `Submitted Assignment: ${a.title}`,
              time: 'Just now',
              icon: 'cloud_upload',
              color: 'text-brand-500'
            },
            ...act
          ]);
          return { ...a, status: 'Submitted' };
        }
        return a;
      })
    );
  }

  enrollInRecommended(courseId: string) {
    this.recommendedCourses.update(courses =>
      courses.map(rc => {
        if (rc.id === courseId) {
          rc.enrolled = true;
          // Add to courses signal list
          const newCourse: Course = {
            id: 'c-new-' + rc.id,
            title: rc.title,
            instructor: rc.instructor,
            instructorImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
            duration: rc.duration,
            completedHours: 0,
            totalHours: parseInt(rc.duration) || 8,
            progress: 0,
            thumbnail: rc.image,
            nextLesson: 'Lesson 1: Platform Overview & Foundations',
            category: 'Development',
            description: 'Acquire expert-level knowledge with standard workflows, clean coding setups, and optimized compilation.'
          };
          this.courses.update(all => [...all, newCourse]);
          this.showToast(`Successfully enrolled in "${rc.title}"!`, 'success');
        }
        return rc;
      })
    );
  }

  addForumPost(title: string, content: string, tagsStr: string) {
    if (!title || !content) return;
    const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);
    const newPost: ForumPost = {
      id: Math.random().toString(),
      author: this.profile().fullName,
      avatar: this.profile().profilePhoto,
      title,
      content,
      likes: 0,
      commentsCount: 0,
      comments: [],
      tags: tags.length ? tags : ['General'],
      time: 'Just now',
      hasLiked: false
    };
    this.communityPosts.update(posts => [newPost, ...posts]);
    this.showToast('Discussion thread posted successfully!', 'success');
  }

  likePost(postId: string) {
    this.communityPosts.update(posts =>
      posts.map(p => {
        if (p.id === postId) {
          const hasLiked = !p.hasLiked;
          return {
            ...p,
            hasLiked,
            likes: hasLiked ? p.likes + 1 : p.likes - 1
          };
        }
        return p;
      })
    );
  }

  addPostComment(postId: string, commentText: string) {
    if (!commentText.trim()) return;
    this.communityPosts.update(posts =>
      posts.map(p => {
        if (p.id === postId) {
          const updatedComments = [
            ...p.comments,
            {
              id: Math.random().toString(),
              author: this.profile().fullName,
              avatar: this.profile().profilePhoto,
              text: commentText,
              time: 'Just now',
              likes: 0,
              replies: []
            }
          ];
          return {
            ...p,
            comments: updatedComments,
            commentsCount: updatedComments.length
          };
        }
        return p;
      })
    );
    this.showToast('Comment added!', 'success');
  }

  likePostComment(postId: string, commentId: string) {
    this.communityPosts.update(posts =>
      posts.map(p => {
        if (p.id === postId) {
          const updatedComments = p.comments.map(c => {
            if (c.id === commentId) {
              const hasLiked = !c.hasLiked;
              return {
                ...c,
                hasLiked,
                likes: hasLiked ? c.likes + 1 : c.likes - 1
              };
            }
            return c;
          });
          return {
            ...p,
            comments: updatedComments
          };
        }
        return p;
      })
    );
    this.showToast('Feedback updated', 'success');
  }

  addPostCommentReply(postId: string, commentId: string, replyText: string) {
    if (!replyText.trim()) return;
    this.communityPosts.update(posts =>
      posts.map(p => {
        if (p.id === postId) {
          const updatedComments = p.comments.map(c => {
            if (c.id === commentId) {
              const currentReplies = c.replies || [];
              const updatedReplies = [
                ...currentReplies,
                {
                  id: Math.random().toString(),
                  author: this.profile().fullName,
                  avatar: this.profile().profilePhoto,
                  text: replyText,
                  time: 'Just now'
                }
              ];
              return {
                ...c,
                replies: updatedReplies
              };
            }
            return c;
          });
          return {
            ...p,
            comments: updatedComments
          };
        }
        return p;
      })
    );
    this.showToast('Reply posted!', 'success');
  }

  sendChatMessage(chatId: string, text: string) {
    if (!text.trim()) return;
    const chat = this.chats().find(c => c.id === chatId);
    if (!chat) return;

    // Push user message
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      senderName: this.profile().fullName,
      avatar: this.profile().profilePhoto,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    chat.messages.update(m => [...m, userMsg]);

    // Simulate smart instructor response
    setTimeout(() => {
      const responses = [
        `Excellent point, Pradeep. I recommend looking at the reactive graph pipeline details! Let's cover this in today's feedback loop.`,
        `That is a very pertinent question regarding enterprise modular scoping. Try separating the state into a centralized store.`,
        `Fascinating approach. Let's discuss this during our 1-on-1 scheduled calendar slot tomorrow!`,
        `I appreciate the update! Keep testing different viewport width breakpoints to guarantee responsive integrity.`
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      const instructorMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: 'instructor',
        senderName: chat.name,
        avatar: chat.avatar,
        text: randomResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      chat.messages.update(m => [...m, instructorMsg]);
      this.showToast(`New reply from ${chat.name}`, 'info');
    }, 1500);
  }

  sendChatAttachment(chatId: string, name: string, size: string, type: 'pdf' | 'image' | 'code' | 'zip') {
    const chat = this.chats().find(c => c.id === chatId);
    if (!chat) return;
    const msg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      senderName: this.profile().fullName,
      avatar: this.profile().profilePhoto,
      text: `Sent a file: ${name}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachment: { name, size, type }
    };
    chat.messages.update(m => [...m, msg]);
    this.showToast('File shared successfully!', 'success');
  }

  sendChatVoiceNote(chatId: string, duration: string) {
    const chat = this.chats().find(c => c.id === chatId);
    if (!chat) return;
    const msg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      senderName: this.profile().fullName,
      avatar: this.profile().profilePhoto,
      text: `Voice Note (${duration})`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      voiceNoteDuration: duration
    };
    chat.messages.update(m => [...m, msg]);
    this.showToast('Voice note sent!', 'success');
  }

  joinLiveClass(classId: string) {
    const live = this.liveClasses().find(lc => lc.id === classId);
    if (!live) return;
    
    this.liveAttendance.update(records => {
      const exists = records.some(r => r.classId === classId);
      if (exists) {
        return records.map(r => r.classId === classId ? { ...r, status: 'Checked In' } : r);
      } else {
        return [...records, { classId, title: live.title.substring(0, 30), status: 'Checked In', date: live.date }];
      }
    });

    this.showToast(`Launching Secure Video Room for "${live.title}"`, 'success');
    this.addSystemNotification('Live Attendance Verified', `Successfully checked into live session: ${live.title}`, 'success');
  }

  book1On1Consultation(instructor: string, date: string, time: string) {
    const newClass: LiveClass = {
      id: Math.random().toString(),
      title: `1-on-1 Architecture Sync with ${instructor}`,
      instructor,
      date,
      time,
      status: 'upcoming'
    };
    this.liveClasses.update(all => [...all, newClass]);
    this.showToast('1-on-1 Consultation Scheduled!', 'success');
    this.addSystemNotification('Event Scheduled', `A private consultation has been scheduled with ${instructor} on ${date} at ${time}.`, 'info');
  }

  clearUnreadNotifications() {
    this.notifications.update(nots => nots.map(n => ({ ...n, unread: false })));
    this.showToast('All notifications marked as read', 'success');
  }

  markNotificationAsRead(id: string) {
    this.notifications.update(nots => nots.map(n => n.id === id ? { ...n, unread: false } : n));
  }

  deleteNotification(id: string) {
    this.notifications.update(nots => nots.filter(n => n.id !== id));
    this.showToast('Notification cleared', 'info');
  }

  addSystemNotification(title: string, message: string, type: 'info' | 'success' | 'alert' = 'info') {
    const newNot: SystemNotification = {
      id: Math.random().toString(),
      title,
      message,
      time: 'Just now',
      unread: true,
      type
    };
    this.notifications.update(nots => [newNot, ...nots]);
  }

  // --- Commerce, Review & Search Methods ---

  addToCart(courseId: string) {
    if (this.cartIds().includes(courseId)) {
      this.showToast('Course is already in your shopping cart.', 'info');
      return;
    }
    this.cartIds.update(ids => [...ids, courseId]);
    this.showToast('Added to shopping cart!', 'success');
  }

  removeFromCart(courseId: string) {
    this.cartIds.update(ids => ids.filter(id => id !== courseId));
    this.showToast('Removed from shopping cart.', 'info');
  }

  moveFromWishlistToCart(courseId: string) {
    // Remove from wishlist
    this.wishlistedIds.update(ids => ids.filter(id => id !== courseId));
    this.catalogCourses.update(courses =>
      courses.map(c => c.id === courseId ? { ...c, wishlisted: false } : c)
    );
    // Add to cart
    if (!this.cartIds().includes(courseId)) {
      this.cartIds.update(ids => [...ids, courseId]);
    }
    this.showToast('Moved course to shopping cart!', 'success');
  }

  moveFromCartToWishlist(courseId: string) {
    // Remove from cart
    this.cartIds.update(ids => ids.filter(id => id !== courseId));
    // Add to wishlist
    if (!this.wishlistedIds().includes(courseId)) {
      this.wishlistedIds.update(ids => [...ids, courseId]);
      this.catalogCourses.update(courses =>
        courses.map(c => c.id === courseId ? { ...c, wishlisted: true } : c)
      );
    }
    this.showToast('Moved course to wishlist.', 'success');
  }

  applyCoupon(code: string) {
    const cleanCode = code.toUpperCase().trim();
    if (cleanCode === 'EDU20') {
      this.activeCoupon.set({ code: 'EDU20', discountPercent: 20 });
      this.showToast('20% discount coupon applied successfully!', 'success');
    } else if (cleanCode === 'OMNIPROMO50') {
      this.activeCoupon.set({ code: 'OMNIPROMO50', discountPercent: 50 });
      this.showToast('50% promotional discount applied successfully!', 'success');
    } else if (cleanCode === 'FREE100') {
      this.activeCoupon.set({ code: 'FREE100', discountPercent: 100 });
      this.showToast('100% full scholarship applied!', 'success');
    } else {
      this.showToast('Invalid coupon code. Try "EDU20" or "OMNIPROMO50"!', 'error');
    }
  }

  removeCoupon() {
    this.activeCoupon.set(null);
    this.showToast('Coupon removed.', 'info');
  }

  performCheckout(paymentDetails: { cardNumber: string; name: string; expiry: string; cvv: string }) {
    this.showToast('Contacting banking merchant routing network...', 'info');

    // Payment integration URL: https://api.omnicommerce.com/v1/payments/charge
    // Commented out real gateway fetch because of "Frontend only" rule:
    /*
    fetch('https://api.omnicommerce.com/v1/payments/charge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: this.cartTotal(),
        currency: 'USD',
        paymentMethod: this.paymentMethod(),
        card: paymentDetails
      })
    })
    */

    setTimeout(() => {
      // Simulate failed CVV check for demo failed state if CVV is '000'
      if (paymentDetails.cvv === '000') {
        this.checkoutStep.set('failed');
        this.showToast('Payment declined: Invalid CVV code.', 'error');
        this.addSystemNotification('Payment Failed', 'Your order payment of $' + this.cartTotal() + ' was declined by the card issuer.', 'alert');
      } else {
        const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
        const invoiceNo = 'INV-2026-' + Math.floor(50000 + Math.random() * 50000);
        const orderItems = [...this.cartCourses()];

        const order = {
          id: orderId,
          date: 'July 12, 2026',
          items: orderItems,
          subtotal: this.cartSubtotal(),
          discount: this.cartDiscount(),
          tax: this.cartTax(),
          total: this.cartTotal(),
          invoiceNo: invoiceNo,
          paymentMethod: this.paymentMethod() === 'card' ? 'Credit Card' : this.paymentMethod().toUpperCase()
        };

        this.lastOrder.set(order);

        // Enroll the user in all purchased courses
        orderItems.forEach(item => {
          this.enrollInCatalogCourseSilently(item.id);
        });

        // Clear cart
        this.cartIds.set([]);
        this.activeCoupon.set(null);
        this.checkoutStep.set('success');

        this.showToast('Transaction completed! Invoice generated.', 'success');
        this.addSystemNotification('Order Confirmed!', `Successfully processed order ${orderId} for ${orderItems.length} courses.`, 'success');
      }
    }, 1500);
  }

  isEnrolled(courseId: string): boolean {
    return this.courses().some(c => c.id === courseId);
  }

  enrollInCatalogCourseSilently(courseId: string) {
    const catalog = this.catalogCourses().find(c => c.id === courseId);
    if (!catalog) return;

    // Check if already enrolled
    const exists = this.courses().find(c => c.id === courseId);
    if (exists) return;

    // Add to enrolled courses list
    const newEnrolled: Course = {
      id: catalog.id,
      title: catalog.title,
      instructor: catalog.instructor,
      instructorImage: catalog.instructorImage,
      duration: catalog.duration,
      completedHours: 0,
      totalHours: parseInt(catalog.duration) || 20,
      progress: 0,
      thumbnail: catalog.thumbnail,
      nextLesson: catalog.syllabus[0]?.lessons[0] || 'Orientation',
      category: catalog.category,
      description: catalog.description
    };

    this.courses.update(list => [...list, newEnrolled]);
  }

  // Course Review Management
  addCourseReview(courseId: string, text: string, rating: number) {
    if (!text.trim() || rating < 1 || rating > 5) {
      this.showToast('Please provide a valid review and rating!', 'error');
      return;
    }

    const newReview = {
      user: this.profile().fullName,
      avatar: this.profile().profilePhoto,
      rating: rating,
      text: text,
      date: 'Just Now'
    };

    this.catalogCourses.update(courses => 
      courses.map(c => {
        if (c.id === courseId) {
          const updatedReviews = [newReview, ...c.reviews];
          const newReviewsCount = updatedReviews.length;
          const avgRating = parseFloat((updatedReviews.reduce((sum, r) => sum + r.rating, 0) / newReviewsCount).toFixed(1));
          return {
            ...c,
            reviews: updatedReviews,
            reviewsCount: newReviewsCount,
            rating: avgRating
          };
        }
        return c;
      })
    );

    this.showToast('Your review has been published!', 'success');
  }

  editCourseReview(courseId: string, oldText: string, newText: string, newRating: number) {
    if (!newText.trim() || newRating < 1 || newRating > 5) {
      this.showToast('Please provide a valid review and rating!', 'error');
      return;
    }

    this.catalogCourses.update(courses =>
      courses.map(c => {
        if (c.id === courseId) {
          const updatedReviews = c.reviews.map(r => 
            (r.user === this.profile().fullName && r.text === oldText)
              ? { ...r, text: newText, rating: newRating, date: 'Updated Just Now' }
              : r
          );
          const avgRating = parseFloat((updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1));
          return {
            ...c,
            reviews: updatedReviews,
            rating: avgRating
          };
        }
        return c;
      })
    );

    this.showToast('Your review has been updated!', 'success');
  }

  deleteCourseReview(courseId: string, reviewText: string) {
    this.catalogCourses.update(courses =>
      courses.map(c => {
        if (c.id === courseId) {
          const updatedReviews = c.reviews.filter(r => !(r.user === this.profile().fullName && r.text === reviewText));
          const newReviewsCount = updatedReviews.length;
          const avgRating = newReviewsCount > 0 
            ? parseFloat((updatedReviews.reduce((sum, r) => sum + r.rating, 0) / newReviewsCount).toFixed(1))
            : 0;
          return {
            ...c,
            reviews: updatedReviews,
            reviewsCount: newReviewsCount,
            rating: avgRating
          };
        }
        return c;
      })
    );

    this.showToast('Your review was deleted.', 'info');
  }

  // Recent Searches Tracking
  addRecentSearch(query: string) {
    const clean = query.trim();
    if (!clean) return;
    this.recentSearches.update(searches => {
      const filtered = searches.filter(s => s.toLowerCase() !== clean.toLowerCase());
      return [clean, ...filtered].slice(0, 5);
    });
  }

  clearRecentSearches() {
    this.recentSearches.set([]);
    this.showToast('Search history cleared.', 'info');
  }

  deleteAccount() {
    this.showToast('Account deletion request initiated (Simulated security protocols).', 'error');
  }

  logout() {
    this.showToast('Simulating secure logout... Redirecting to landing page.', 'info');
    this.isLoggedIn.set(false);
    this.activeView.set('landing');
  }
}
