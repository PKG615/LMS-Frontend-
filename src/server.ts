import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import {join} from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine({
  allowedHosts: ['*']
});

/**
 * ====================================================================================
 * PRODUCTION-LEVEL LMS BACKEND BLUEPRINT (Node.js, Express.js, MongoDB, JWT)
 * ====================================================================================
 * This module outlines the comprehensive, production-level backend architecture
 * required for the enterprise LMS, mapping directly to our frontend Angular Signals.
 * 
 * Major Sections Included Below:
 *  1. Database Schema & Models (MongoDB / Mongoose)
 *  2. Authentication & JWT Security (Access & Refresh tokens)
 *  3. Role-Based Access Control (RBAC) Guards & Middleware
 *  4. RESTful API Routers (Admin, Instructor, Student, User Modules)
 * 
 * To activate this backend in a standalone Node.js environment:
 *  npm install express mongoose jsonwebtoken bcryptjs cors helmet dotenv
 * ====================================================================================
 */

/*
import mongoose, { Schema, Document } from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// ------------------------------------------------------------------------------------
// 1. DATABASE SCHEMA & MODELS (MongoDB / Mongoose)
// ------------------------------------------------------------------------------------

// User Schema (Admins, Instructors, Students, Guest/Registered Users)
export interface IUser extends Document {
  fullName: string;
  email: string;
  passwordHash: string;
  role: 'Admin' | 'Instructor' | 'Student' | 'User';
  status: 'Active' | 'Deactivated';
  avatar?: string;
  bio?: string;
  mobile?: string;
  skills: string[];
  emailVerified: boolean;
  mobileVerified: boolean;
  twoFactorEnabled: boolean;
  verificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  xp: number;
  rank: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Instructor', 'Student', 'User'], default: 'User' },
  status: { type: String, enum: ['Active', 'Deactivated'], default: 'Active' },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
  bio: { type: String, default: '' },
  mobile: { type: String, default: '' },
  skills: [{ type: String }],
  emailVerified: { type: Boolean, default: false },
  mobileVerified: { type: Boolean, default: false },
  twoFactorEnabled: { type: Boolean, default: false },
  verificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  xp: { type: Number, default: 100 },
  rank: { type: String, default: 'Novice Scholar' }
}, { timestamps: true });

// Pre-save password hashing hook
UserSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// Course Schema
export interface ICourse extends Document {
  title: string;
  instructorId: mongoose.Types.ObjectId;
  category: string;
  description: string;
  thumbnail: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  price: number;
  status: 'Draft' | 'Published' | 'Archived';
  progress?: number;
  rating: number;
  syllabus: {
    sectionTitle: string;
    lessons: string[];
  }[];
  createdAt: Date;
}

const CourseSchema = new Schema<ICourse>({
  title: { type: String, required: true, trim: true },
  instructorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  thumbnail: { type: String, default: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=500&q=80' },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Advanced' },
  duration: { type: String, default: '12 Hours' },
  price: { type: Number, required: true, default: 0 },
  status: { type: String, enum: ['Draft', 'Published', 'Archived'], default: 'Draft' },
  rating: { type: Number, default: 4.8 },
  syllabus: [{
    sectionTitle: { type: String, required: true },
    lessons: [{ type: String }]
  }]
}, { timestamps: true });

// Student Enrollment & Progress Tracker Schema
export interface IEnrollment extends Document {
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  completedLessons: string[];
  certificateIssued: boolean;
  issuedCertificateId?: string;
  grade?: string;
  progressPercentage: number;
  enrolledAt: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  completedLessons: [{ type: String }],
  certificateIssued: { type: Boolean, default: false },
  issuedCertificateId: String,
  grade: { type: String, default: 'Pending' },
  progressPercentage: { type: Number, default: 0 }
}, { timestamps: true });

// Quiz & Assignment Submission Schema
export interface ISubmission extends Document {
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  itemType: 'Quiz' | 'Assignment';
  itemName: string;
  score?: number;
  totalPoints: number;
  submittedFileUrl?: string;
  feedbackText?: string;
  gradedBy?: mongoose.Types.ObjectId;
  status: 'Submitted' | 'Graded';
  submittedAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  itemType: { type: String, enum: ['Quiz', 'Assignment'], required: true },
  itemName: { type: String, required: true },
  score: Number,
  totalPoints: { type: Number, required: true },
  submittedFileUrl: String,
  feedbackText: String,
  gradedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Submitted', 'Graded'], default: 'Submitted' }
}, { timestamps: true });

// Payment & Transaction Schema
export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  amount: number;
  paymentMethod: string;
  status: 'Succeeded' | 'Failed' | 'Refunded';
  couponUsed?: string;
  transactionHash: string;
  createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, default: 'Stripe Credit Card' },
  status: { type: String, enum: ['Succeeded', 'Failed', 'Refunded'], default: 'Succeeded' },
  couponUsed: String,
  transactionHash: { type: String, required: true, unique: true }
}, { timestamps: true });


// ------------------------------------------------------------------------------------
// 2. AUTHENTICATION & JWT SECURITY MIDDLEWARE
// ------------------------------------------------------------------------------------

export interface IRequestWithUser extends express.Request {
  user?: {
    id: string;
    email: string;
    role: 'Admin' | 'Instructor' | 'Student' | 'User';
  }
}

export const authenticateJWT = (req: IRequestWithUser, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No JWT token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env['JWT_SECRET'] || 'SUPER_SECRET_JWT_SIGNING_KEY_2026') as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired JWT authorization token.' });
  }
};


// ------------------------------------------------------------------------------------
// 3. ROLE-BASED ACCESS CONTROL (RBAC) GUARDS
// ------------------------------------------------------------------------------------

export const requireRole = (allowedRoles: ('Admin' | 'Instructor' | 'Student' | 'User')[]) => {
  return (req: IRequestWithUser, res: express.Response, next: express.NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: `Forbidden. Role-based Guard blocks access for role: ${req.user.role}` });
    }
    next();
  };
};


// ------------------------------------------------------------------------------------
// 4. RESTful API ROUTERS IMPLEMENTATION
// ------------------------------------------------------------------------------------

const apiRouter = express.Router();

// --- AUTH ROUTER ---
apiRouter.post('/auth/register', async (req, res) => {
  const { fullName, email, password, role } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered.' });

    const newUser = new User({ fullName, email, passwordHash: password, role: role || 'User' });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id, email: newUser.email, role: newUser.role }, process.env['JWT_SECRET'] || 'KEY');
    res.status(201).json({ message: 'Registration completed.', token, user: { fullName, email, role } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.status === 'Deactivated') {
      return res.status(401).json({ error: 'Invalid credentials or inactive account.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials.' });

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env['JWT_SECRET'] || 'KEY', { expiresIn: '1d' });
    res.status(200).json({ token, user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- ADMIN CONTROL WORKSPACE --- (Protected by Admin Role-Guards)
apiRouter.get('/admin/analytics', authenticateJWT, requireRole(['Admin']), async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const students = await User.countDocuments({ role: 'Student' });
    const instructors = await User.countDocuments({ role: 'Instructor' });
    const courseCount = await Course.countDocuments();
    const enrollments = await Enrollment.countDocuments();
    const revenueSum = await Transaction.aggregate([{ $match: { status: 'Succeeded' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]);

    res.json({
      metrics: { userCount, students, instructors, courseCount, enrollments, revenue: revenueSum[0]?.total || 0 },
      recentActivities: [
        { time: 'Just now', detail: 'New student workspace created.' },
        { time: '2 mins ago', detail: 'Admin settings payload synchronized.' }
      ]
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/admin/users', authenticateJWT, requireRole(['Admin']), async (req, res) => {
  const users = await User.find().select('-passwordHash');
  res.json(users);
});

apiRouter.post('/admin/users', authenticateJWT, requireRole(['Admin']), async (req, res) => {
  const newUser = new User({ ...req.body, passwordHash: 'temporary_lms_pass_2026' });
  await newUser.save();
  res.status(201).json(newUser);
});

apiRouter.put('/admin/users/:id', authenticateJWT, requireRole(['Admin']), async (req, res) => {
  const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

apiRouter.delete('/admin/users/:id', authenticateJWT, requireRole(['Admin']), async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'User completely deleted from LMS registry.' });
});

apiRouter.put('/admin/settings', authenticateJWT, requireRole(['Admin']), async (req, res) => {
  // Update Payment gateways (Stripe/PayPal), system email servers, and rotate API security credentials
  res.json({ message: 'Security rotation & system email settings committed.' });
});


// --- INSTRUCTOR WORKSPACE --- (Protected by Instructor Guards)
apiRouter.get('/instructor/courses', authenticateJWT, requireRole(['Instructor']), async (req: IRequestWithUser, res) => {
  const courses = await Course.find({ instructorId: req.user!.id });
  res.json(courses);
});

apiRouter.post('/instructor/courses', authenticateJWT, requireRole(['Instructor']), async (req: IRequestWithUser, res) => {
  const newCourse = new Course({ ...req.body, instructorId: req.user!.id });
  await newCourse.save();
  res.status(201).json(newCourse);
});

apiRouter.put('/instructor/courses/:id', authenticateJWT, requireRole(['Instructor']), async (req: IRequestWithUser, res) => {
  const updated = await Course.findOneAndUpdate({ _id: req.params.id, instructorId: req.user!.id }, req.body, { new: true });
  res.json(updated);
});

apiRouter.delete('/instructor/courses/:id', authenticateJWT, requireRole(['Instructor']), async (req: IRequestWithUser, res) => {
  await Course.findOneAndDelete({ _id: req.params.id, instructorId: req.user!.id });
  res.json({ success: true, message: 'Your course has been deleted.' });
});

apiRouter.put('/instructor/submissions/:id/grade', authenticateJWT, requireRole(['Instructor']), async (req, res) => {
  const { score, feedbackText } = req.body;
  const graded = await Submission.findByIdAndUpdate(req.params.id, {
    score,
    feedbackText,
    status: 'Graded',
    gradedBy: req.user!.id
  }, { new: true });
  res.json(graded);
});


// --- STUDENT & LEARNER WORKSPACE --- (Protected by Student or general roles)
apiRouter.get('/student/dashboard', authenticateJWT, requireRole(['Student']), async (req: IRequestWithUser, res) => {
  const enrollments = await Enrollment.find({ studentId: req.user!.id }).populate('courseId');
  const certificates = enrollments.filter(e => e.certificateIssued);
  res.json({ enrollments, certificates });
});

apiRouter.post('/student/courses/:courseId/lessons/:lessonName/complete', authenticateJWT, requireRole(['Student']), async (req: IRequestWithUser, res) => {
  const enrollment = await Enrollment.findOne({ studentId: req.user!.id, courseId: req.params.courseId });
  if (!enrollment) return res.status(404).json({ error: 'Enrollment registry not found.' });

  if (!enrollment.completedLessons.includes(req.params.lessonName)) {
    enrollment.completedLessons.push(req.params.lessonName);
    await enrollment.save();
  }
  res.json({ success: true, completedLessons: enrollment.completedLessons });
});

apiRouter.post('/student/courses/:courseId/submit-assignment', authenticateJWT, requireRole(['Student']), async (req: IRequestWithUser, res) => {
  const { itemName, submittedFileUrl } = req.body;
  const submission = new Submission({
    studentId: req.user!.id,
    courseId: req.params.courseId,
    itemType: 'Assignment',
    itemName,
    submittedFileUrl,
    totalPoints: 100,
    status: 'Submitted'
  });
  await submission.save();
  res.status(201).json(submission);
});


// --- PUBLIC / GUEST VISITOR CATALOG ACCESS ---
apiRouter.get('/catalog/courses', async (req, res) => {
  const { search, category, level } = req.query;
  let filter: any = { status: 'Published' };

  if (search) filter.title = { $regex: search, $options: 'i' };
  if (category) filter.category = category;
  if (level) filter.level = level;

  const courses = await Course.find(filter).populate('instructorId', 'fullName avatar');
  res.json(courses);
});

// Register API routers to express app
app.use('/api', apiRouter);
*/


/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
