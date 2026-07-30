/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { LmsState } from './state';
import { DashboardPage } from './pages/dashboard/dashboard';
import { CoursesPage } from './pages/courses/courses';
import { CourseDetailsPage } from './pages/course-details/course-details';
import { MyLearningPage } from './pages/my-learning/my-learning';
import { AssignmentsPage } from './pages/assignments/assignments';
import { CalendarPage } from './pages/calendar/calendar';
import { CertificatesPage } from './pages/certificates/certificates';
import { MessagesPage } from './pages/messages/messages';
import { CommunityPage } from './pages/community/community';
import { ProfilePage } from './pages/profile/profile';
import { NotificationInboxComponent } from './shared/notification-inbox/notification-inbox';
import { InternshipBoardComponent } from './shared/internship-board/internship-board';
import { CoursePlayerComponent } from './shared/course-player/course-player';

@Component({
  selector: 'app-learner-workspace',
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatIconModule,
    DashboardPage,
    CoursesPage,
    CourseDetailsPage,
    MyLearningPage,
    AssignmentsPage,
    CalendarPage,
    CertificatesPage,
    MessagesPage,
    CommunityPage,
    ProfilePage,
    NotificationInboxComponent,
    InternshipBoardComponent,
    CoursePlayerComponent
  ],
  templateUrl: './learner-workspace.html',
})
export class LearnerWorkspace {
  app = input.required<any>();
  get state(): LmsState { return this.app().state; }

  // Property Getters
  get currentWorkspace(): any { return this.app().currentWorkspace; }
  get activeInstructorView(): any { return this.app().activeInstructorView; }
  get activeAdminView(): any { return this.app().activeAdminView; }
  get activeReportsView(): any { return this.app().activeReportsView; }
  get dynamicSidebarItems(): any { return this.app().dynamicSidebarItems; }
  get instructors(): any { return this.app().instructors; }
  get students(): any { return this.app().students; }
  get instructorQuizzes(): any { return this.app().instructorQuizzes; }
  get assignmentSubmissions(): any { return this.app().assignmentSubmissions; }
  get selectedSubId(): any { return this.app().selectedSubId; }
  get assignmentGradeInput(): any { return this.app().assignmentGradeInput; }
  get assignmentCommentInput(): any { return this.app().assignmentCommentInput; }
  get announcements(): any { return this.app().announcements; }
  get newAnnouncementTitle(): any { return this.app().newAnnouncementTitle; }
  get newAnnouncementCourse(): any { return this.app().newAnnouncementCourse; }
  get newAnnouncementText(): any { return this.app().newAnnouncementText; }
  get adminCategories(): any { return this.app().adminCategories; }
  get newCategoryName(): any { return this.app().newCategoryName; }
  get newCategoryDesc(): any { return this.app().newCategoryDesc; }
  get adminCoupons(): any { return this.app().adminCoupons; }
  get newCouponCode(): any { return this.app().newCouponCode; }
  get newCouponDiscount(): any { return this.app().newCouponDiscount; }
  get newCouponExpiry(): any { return this.app().newCouponExpiry; }
  get adminTransactions(): any { return this.app().adminTransactions; }
  get cmsPages(): any { return this.app().cmsPages; }
  get selectedCmsSlug(): any { return this.app().selectedCmsSlug; }
  get cmsEditContent(): any { return this.app().cmsEditContent; }
  get adminNotifications(): any { return this.app().adminNotifications; }
  get newAdminNoticeTitle(): any { return this.app().newAdminNoticeTitle; }
  get newAdminNoticeAudience(): any { return this.app().newAdminNoticeAudience; }
  get instructorCourseFilter(): any { return this.app().instructorCourseFilter; }
  get adminUserRoleFilter(): any { return this.app().adminUserRoleFilter; }
  get adminUserStatusFilter(): any { return this.app().adminUserStatusFilter; }
  get instructorStudentSearch(): any { return this.app().instructorStudentSearch; }
  get instructorStudentGradeFilter(): any { return this.app().instructorStudentGradeFilter; }
  get newCourseForm(): any { return this.app().newCourseForm; }
  get sidebarItems(): any { return this.app().sidebarItems; }
  get calendarDays(): any { return this.app().calendarDays; }
  get calendarEventsMap(): any { return this.app().calendarEventsMap; }
  get certificatesList(): any { return this.app().certificatesList(); }
  get selectedPlayerCourseId(): any { return this.app().selectedPlayerCourseId; }
  get selectedCalendarDay(): any { return this.app().selectedCalendarDay; }
  get activeHoveredSkill(): any { return this.app().activeHoveredSkill; }
  get activeHoveredProficiency(): any { return this.app().activeHoveredProficiency; }
  get activeCertificateViewer(): any { return this.app().activeCertificateViewer; }
  get courseListingView(): any { return this.app().courseListingView; }
  get selectedCategory(): any { return this.app().selectedCategory; }
  get selectedInstructor(): any { return this.app().selectedInstructor; }
  get selectedLanguage(): any { return this.app().selectedLanguage; }
  get selectedLevel(): any { return this.app().selectedLevel; }
  get maxPrice(): any { return this.app().maxPrice; }
  get minRating(): any { return this.app().minRating; }
  get catalogSortBy(): any { return this.app().catalogSortBy; }
  get catalogPage(): any { return this.app().catalogPage; }
  get catalogPageSize(): any { return this.app().catalogPageSize; }
  get categoriesList(): any { return this.app().categoriesList; }
  get instructorsList(): any { return this.app().instructorsList; }
  get languagesList(): any { return this.app().languagesList; }
  get levelsList(): any { return this.app().levelsList; }
  get filteredCatalog(): any { return this.app().filteredCatalog; }
  get paginatedCatalog(): any { return this.app().paginatedCatalog; }
  get totalPages(): any { return this.app().totalPages; }
  get activeCourseDetails(): any { return this.app().activeCourseDetails; }
  get relatedCourseItems(): any { return this.app().relatedCourseItems; }
  get wishlistCourses(): any { return this.app().wishlistCourses; }
  get recentlyViewedCourses(): any { return this.app().recentlyViewedCourses; }
  get dashboardTab(): any { return this.app().dashboardTab; }
  get showNewPostPopup(): any { return this.app().showNewPostPopup; }
  get showQuickActions(): any { return this.app().showQuickActions; }
  get showNotifications(): any { return this.app().showNotifications; }
  get showUserDropdown(): any { return this.app().showUserDropdown; }
  get activeSubmissionTarget(): any { return this.app().activeSubmissionTarget; }
  get bookingTutor(): any { return this.app().bookingTutor; }
  get bookingDate(): any { return this.app().bookingDate; }
  get bookingTime(): any { return this.app().bookingTime; }
  get isVerificationEmailSent(): any { return this.app().isVerificationEmailSent; }
  get registeredUserEmail(): any { return this.app().registeredUserEmail; }
  get otpCodeVerified(): any { return this.app().otpCodeVerified; }
  get selectedWelcomeInterests(): any { return this.app().selectedWelcomeInterests; }
  get faqExpanded(): any { return this.app().faqExpanded; }
  get landingSearchQuery(): any { return this.app().landingSearchQuery; }
  get newsletterSubscribed(): any { return this.app().newsletterSubscribed; }
  get resetSuccess(): any { return this.app().resetSuccess; }
  get searchFocused(): any { return this.app().searchFocused; }
  get couponInputText(): any { return this.app().couponInputText; }
  get cardNumber(): any { return this.app().cardNumber; }
  get cardName(): any { return this.app().cardName; }
  get cardExpiry(): any { return this.app().cardExpiry; }
  get cardCvv(): any { return this.app().cardCvv; }
  get reviewRating(): any { return this.app().reviewRating; }
  get reviewText(): any { return this.app().reviewText; }
  get editingReview(): any { return this.app().editingReview; }
  get showWriteReview(): any { return this.app().showWriteReview; }
  get landingCategories(): any { return this.app().landingCategories; }
  get featuredCourses(): any { return this.app().featuredCourses; }
  get popularCourses(): any { return this.app().popularCourses; }
  get testimonials(): any { return this.app().testimonials; }
  get partners(): any { return this.app().partners; }
  get faqItems(): any { return this.app().faqItems; }
  get blogPosts(): any { return this.app().blogPosts; }
  get profileForm(): any { return this.app().profileForm; }
  get passwordForm(): any { return this.app().passwordForm; }
  get postForm(): any { return this.app().postForm; }
  get eventForm(): any { return this.app().eventForm; }
  get messageForm(): any { return this.app().messageForm; }
  get assignmentForm(): any { return this.app().assignmentForm; }
  get loginForm(): any { return this.app().loginForm; }
  get registerForm(): any { return this.app().registerForm; }
  get forgotForm(): any { return this.app().forgotForm; }
  get resetForm(): any { return this.app().resetForm; }
  get otpForm(): any { return this.app().otpForm; }
  get welcomeForm(): any { return this.app().welcomeForm; }
  get newsletterForm(): any { return this.app().newsletterForm; }
  get unreadNotificationsCount(): any { return this.app().unreadNotificationsCount; }
  get pendingAssignmentsCount(): any { return this.app().pendingAssignmentsCount; }
  get unreadMessagesCount(): any { return this.app().unreadMessagesCount; }
  get activeChat(): any { return this.app().activeChat; }
  get selectedPlayerCourse(): any { return this.app().selectedPlayerCourse; }
  get selectedPlayerCatalogCourse(): any { return this.app().selectedPlayerCatalogCourse; }
  get activeLessonName(): any { return this.app().activeLessonName; }
  get activeLessonType(): any { return this.app().activeLessonType; }
  get isVideoPlaying(): any { return this.app().isVideoPlaying; }
  get playbackSpeed(): any { return this.app().playbackSpeed; }
  get currentTime(): any { return this.app().currentTime; }
  get duration(): any { return this.app().duration; }
  get volume(): any { return this.app().volume; }
  get isMuted(): any { return this.app().isMuted; }
  get isFullscreen(): any { return this.app().isFullscreen; }
  get playerDarkMode(): any { return this.app().playerDarkMode; }
  get playerActiveTab(): any { return this.app().playerActiveTab; }
  get showShareModal(): any { return this.app().showShareModal; }
  get activeShareCert(): any { return this.app().activeShareCert; }
  get certHistory(): any { return this.app().certHistory; }
  get discussionMessages(): any { return this.app().discussionMessages; }
  get newDiscussionText(): any { return this.app().newDiscussionText; }
  get lessonNotes(): any { return this.app().lessonNotes; }
  get newNoteText(): any { return this.app().newNoteText; }
  get lessonBookmarks(): any { return this.app().lessonBookmarks; }
  get quizActiveQuestion(): any { return this.app().quizActiveQuestion; }
  get quizSelectedAnswers(): any { return this.app().quizSelectedAnswers; }
  get quizSubmitted(): any { return this.app().quizSubmitted; }
  get quizScore(): any { return this.app().quizScore; }
  get quizTimer(): any { return this.app().quizTimer; }
  get quizTimerIntervalId(): any { return this.app().quizTimerIntervalId; }
  get quizTimerDisplay(): any { return this.app().quizTimerDisplay; }
  get quizAccuracyRatio(): any { return this.app().quizAccuracyRatio; }
  get quizProgressPercentage(): any { return this.app().quizProgressPercentage; }
  get quizQuestions(): any { return this.app().quizQuestions; }
  get effectiveActiveLesson(): any { return this.app().effectiveActiveLesson; }
  get courseLessonsList(): any { return this.app().courseLessonsList; }
  get activeLessonIndex(): any { return this.app().activeLessonIndex; }
  get liveCountdown(): any { return this.app().liveCountdown; }
  get activeRecording(): any { return this.app().activeRecording; }
  get isRecordingPlaying(): any { return this.app().isRecordingPlaying; }
  get recordingPlaybackTime(): any { return this.app().recordingPlaybackTime; }
  get recordingPlaybackSpeed(): any { return this.app().recordingPlaybackSpeed; }
  get forumSearchQuery(): any { return this.app().forumSearchQuery; }
  get forumTagFilter(): any { return this.app().forumTagFilter; }
  get forumTabFilter(): any { return this.app().forumTabFilter; }
  get activeReplyCommentId(): any { return this.app().activeReplyCommentId; }
  get chatCategoryFilter(): any { return this.app().chatCategoryFilter; }
  get chatSearchQuery(): any { return this.app().chatSearchQuery; }
  get showEmojiPicker(): any { return this.app().showEmojiPicker; }
  get isRecordingVoice(): any { return this.app().isRecordingVoice; }
  get voiceDuration(): any { return this.app().voiceDuration; }
  get voiceTimerIntervalId(): any { return this.app().voiceTimerIntervalId; }
  get notificationFilter(): any { return this.app().notificationFilter; }
  get expandedNotificationId(): any { return this.app().expandedNotificationId; }
  get calendarMode(): any { return this.app().calendarMode; }
  get calendarFilterType(): any { return this.app().calendarFilterType; }
  get filteredForumPosts(): any { return this.app().filteredForumPosts; }
  get filteredChats(): any { return this.app().filteredChats; }
  get filteredNotifications(): any { return this.app().filteredNotifications; }
  get filteredCalendarEvents(): any { return this.app().filteredCalendarEvents; }
  get selectedDayEvents(): any { return this.app().selectedDayEvents; }
  get showLogoutConfirmation(): any { return this.app().showLogoutConfirmation; }
  get showDeleteConfirmation(): any { return this.app().showDeleteConfirmation; }
  get showCurrentPassword(): any { return this.app().showCurrentPassword; }
  get showNewPassword(): any { return this.app().showNewPassword; }
  get showConfirmPassword(): any { return this.app().showConfirmPassword; }
  get newPasswordValue(): any { return this.app().newPasswordValue; }
  get passwordStrength(): any { return this.app().passwordStrength; }
  get selectedAvatar(): any { return this.app().selectedAvatar; }
  get avatarsList(): any { return this.app().avatarsList; }
  get studentXP(): any { return this.app().studentXP; }
  get studentRank(): any { return this.app().studentRank; }
  get rewardsList(): any { return this.app().rewardsList; }
  get milestones(): any { return this.app().milestones; }
  get topStudentsList(): any { return this.app().topStudentsList; }
  get selectedFaqCategory(): any { return this.app().selectedFaqCategory; }
  get faqs(): any { return this.app().faqs; }
  get ticketSubject(): any { return this.app().ticketSubject; }
  get ticketCategory(): any { return this.app().ticketCategory; }
  get ticketDescription(): any { return this.app().ticketDescription; }
  get raisedTicketsList(): any { return this.app().raisedTicketsList; }
  get chatBotMessageInput(): any { return this.app().chatBotMessageInput; }
  get chatBotMessages(): any { return this.app().chatBotMessages; }
  get isBotTyping(): any { return this.app().isBotTyping; }
  get selectedMockError(): any { return this.app().selectedMockError; }
  get privacyPublicProfile(): any { return this.app().privacyPublicProfile; }
  get privacyShowProgress(): any { return this.app().privacyShowProgress; }
  get privacyShowAchievements(): any { return this.app().privacyShowAchievements; }
  get privacyShareHistory(): any { return this.app().privacyShareHistory; }
  get careersSelectedRole(): any { return this.app().careersSelectedRole; }
  get careersInterviewQuestion(): any { return this.app().careersInterviewQuestion; }
  get careersInterviewAnswer(): any { return this.app().careersInterviewAnswer; }
  get careersInterviewFeedback(): any { return this.app().careersInterviewFeedback; }
  get careersIsLoadingFeedback(): any { return this.app().careersIsLoadingFeedback; }
  get careersAppliedJobs(): any { return this.app().careersAppliedJobs; }
  get careersShowApplyModal(): any { return this.app().careersShowApplyModal; }
  get careersSelectedJob(): any { return this.app().careersSelectedJob; }
  get careersResumeText(): any { return this.app().careersResumeText; }
  get careersCoverLetterText(): any { return this.app().careersCoverLetterText; }
  get partnerJobs(): any { return this.app().partnerJobs; }
  get careersMockInterviews(): any { return this.app().careersMockInterviews; }

  // Method Forwarders
  handleSidebarClick(...args: any[]): any { return this.app().handleSidebarClick(...args); }
  isSidebarActive(...args: any[]): any { return this.app().isSidebarActive(...args); }
  switchWorkspace(...args: any[]): any { return this.app().switchWorkspace(...args); }
  submitNewCourse(...args: any[]): any { return this.app().submitNewCourse(...args); }
  deleteCourse(...args: any[]): any { return this.app().deleteCourse(...args); }
  createCategory(...args: any[]): any { return this.app().createCategory(...args); }
  deleteCategory(...args: any[]): any { return this.app().deleteCategory(...args); }
  createCoupon(...args: any[]): any { return this.app().createCoupon(...args); }
  toggleCouponStatus(...args: any[]): any { return this.app().toggleCouponStatus(...args); }
  publishAnnouncement(...args: any[]): any { return this.app().publishAnnouncement(...args); }
  deleteAnnouncement(...args: any[]): any { return this.app().deleteAnnouncement(...args); }
  dispatchNotification(...args: any[]): any { return this.app().dispatchNotification(...args); }
  openCmsEditor(...args: any[]): any { return this.app().openCmsEditor(...args); }
  saveCmsPage(...args: any[]): any { return this.app().saveCmsPage(...args); }
  toggleUserStatus(...args: any[]): any { return this.app().toggleUserStatus(...args); }
  toggleInstructorStatus(...args: any[]): any { return this.app().toggleInstructorStatus(...args); }
  triggerPayout(...args: any[]): any { return this.app().triggerPayout(...args); }
  startGradeSubmission(...args: any[]): any { return this.app().startGradeSubmission(...args); }
  saveGradeSubmission(...args: any[]): any { return this.app().saveGradeSubmission(...args); }
  setCategory(...args: any[]): any { return this.app().setCategory(...args); }
  setInstructor(...args: any[]): any { return this.app().setInstructor(...args); }
  setLanguage(...args: any[]): any { return this.app().setLanguage(...args); }
  setLevel(...args: any[]): any { return this.app().setLevel(...args); }
  setMaxPrice(...args: any[]): any { return this.app().setMaxPrice(...args); }
  setMinRating(...args: any[]): any { return this.app().setMinRating(...args); }
  resetAllFilters(...args: any[]): any { return this.app().resetAllFilters(...args); }
  nextCatalogPage(...args: any[]): any { return this.app().nextCatalogPage(...args); }
  prevCatalogPage(...args: any[]): any { return this.app().prevCatalogPage(...args); }
  selectLesson(...args: any[]): any { return this.app().selectLesson(...args); }
  goToNextLesson(...args: any[]): any { return this.app().goToNextLesson(...args); }
  goToPrevLesson(...args: any[]): any { return this.app().goToPrevLesson(...args); }
  startQuizTimer(...args: any[]): any { return this.app().startQuizTimer(...args); }
  stopQuizTimer(...args: any[]): any { return this.app().stopQuizTimer(...args); }
  submitQuiz(...args: any[]): any { return this.app().submitQuiz(...args); }
  retryQuiz(...args: any[]): any { return this.app().retryQuiz(...args); }
  addNote(...args: any[]): any { return this.app().addNote(...args); }
  deleteNote(...args: any[]): any { return this.app().deleteNote(...args); }
  addBookmark(...args: any[]): any { return this.app().addBookmark(...args); }
  seekToBookmark(...args: any[]): any { return this.app().seekToBookmark(...args); }
  deleteBookmark(...args: any[]): any { return this.app().deleteBookmark(...args); }
  addDiscussionMessage(...args: any[]): any { return this.app().addDiscussionMessage(...args); }
  setPlaybackSpeed(...args: any[]): any { return this.app().setPlaybackSpeed(...args); }
  toggleMute(...args: any[]): any { return this.app().toggleMute(...args); }
  toggleFullscreen(...args: any[]): any { return this.app().toggleFullscreen(...args); }
  togglePlayerDarkMode(...args: any[]): any { return this.app().togglePlayerDarkMode(...args); }
  triggerShareCertificate(...args: any[]): any { return this.app().triggerShareCertificate(...args); }
  copyShareLink(...args: any[]): any { return this.app().copyShareLink(...args); }
  selectQuizOption(...args: any[]): any { return this.app().selectQuizOption(...args); }
  prevQuizQuestion(...args: any[]): any { return this.app().prevQuizQuestion(...args); }
  nextQuizQuestion(...args: any[]): any { return this.app().nextQuizQuestion(...args); }
  addEmoji(...args: any[]): any { return this.app().addEmoji(...args); }
  startVoiceRecording(...args: any[]): any { return this.app().startVoiceRecording(...args); }
  cancelVoiceRecording(...args: any[]): any { return this.app().cancelVoiceRecording(...args); }
  sendVoiceRecording(...args: any[]): any { return this.app().sendVoiceRecording(...args); }
  simulateFileShare(...args: any[]): any { return this.app().simulateFileShare(...args); }
  markClassAttendance(...args: any[]): any { return this.app().markClassAttendance(...args); }
  playRecording(...args: any[]): any { return this.app().playRecording(...args); }
  closeRecordingPlayer(...args: any[]): any { return this.app().closeRecordingPlayer(...args); }
  toggleNotificationRead(...args: any[]): any { return this.app().toggleNotificationRead(...args); }
  confirmLogout(...args: any[]): any { return this.app().confirmLogout(...args); }
  confirmDeleteAccount(...args: any[]): any { return this.app().confirmDeleteAccount(...args); }
  selectAvatar(...args: any[]): any { return this.app().selectAvatar(...args); }
  claimDailyStreak(...args: any[]): any { return this.app().claimDailyStreak(...args); }
  claimReward(...args: any[]): any { return this.app().claimReward(...args); }
  raiseTicketSubmit(...args: any[]): any { return this.app().raiseTicketSubmit(...args); }
  sendChatBotMessage(...args: any[]): any { return this.app().sendChatBotMessage(...args); }
  initializeForms(...args: any[]): any { return this.app().initializeForms(...args); }
  navigateTo(...args: any[]): any { return this.app().navigateTo(...args); }
  toggleInterest(...args: any[]): any { return this.app().toggleInterest(...args); }
  toggleFaq(...args: any[]): any { return this.app().toggleFaq(...args); }
  onLoginSubmit(...args: any[]): any { return this.app().onLoginSubmit(...args); }
  onRegisterSubmit(...args: any[]): any { return this.app().onRegisterSubmit(...args); }
  onForgotSubmit(...args: any[]): any { return this.app().onForgotSubmit(...args); }
  onResetSubmit(...args: any[]): any { return this.app().onResetSubmit(...args); }
  onOtpSubmit(...args: any[]): any { return this.app().onOtpSubmit(...args); }
  resendOtp(...args: any[]): any { return this.app().resendOtp(...args); }
  resendVerificationEmail(...args: any[]): any { return this.app().resendVerificationEmail(...args); }
  onWelcomeSubmit(...args: any[]): any { return this.app().onWelcomeSubmit(...args); }
  onNewsletterSubmit(...args: any[]): any { return this.app().onNewsletterSubmit(...args); }
  selectRegisterRole(...args: any[]): any { return this.app().selectRegisterRole(...args); }
  importFromLinkedIn(...args: any[]): any { return this.app().importFromLinkedIn(...args); }
  getPasswordStrength(...args: any[]): any { return this.app().getPasswordStrength(...args); }
  setRegisterStep(...args: any[]): any { return this.app().setRegisterStep(...args); }
  isStepCompleted(...args: any[]): any { return this.app().isStepCompleted(...args); }
  getRegistrationProgressPercentage(...args: any[]): any { return this.app().getRegistrationProgressPercentage(...args); }
  getEmailSuggestions(...args: any[]): any { return this.app().getEmailSuggestions(...args); }
  applyEmailSuggestion(...args: any[]): any { return this.app().applyEmailSuggestion(...args); }
  quickAppendDomain(...args: any[]): any { return this.app().quickAppendDomain(...args); }
  get activeRegisterStep(): any { return this.app().activeRegisterStep; }
  get showEmailSuggestions(): any { return this.app().showEmailSuggestions; }
  selectCareersRole(...args: any[]): any { return this.app().selectCareersRole(...args); }
  triggerCareersAIReview(...args: any[]): any { return this.app().triggerCareersAIReview(...args); }
  submitCareersApplication(...args: any[]): any { return this.app().submitCareersApplication(...args); }
  submitApplyModal(...args: any[]): any { return this.app().submitApplyModal(...args); }
  scrollToSection(...args: any[]): any { return this.app().scrollToSection(...args); }
  getThemeColor(...args: any[]): any { return this.app().getThemeColor(...args); }
  toggleDarkMode(...args: any[]): any { return this.app().toggleDarkMode(...args); }
  hoverSkill(...args: any[]): any { return this.app().hoverSkill(...args); }
  getDayEvent(...args: any[]): any { return this.app().getDayEvent(...args); }
  onSearchChange(...args: any[]): any { return this.app().onSearchChange(...args); }
  triggerSearch(...args: any[]): any { return this.app().triggerSearch(...args); }
  saveProfileSubmit(...args: any[]): any { return this.app().saveProfileSubmit(...args); }
  changePasswordSubmit(...args: any[]): any { return this.app().changePasswordSubmit(...args); }
  submitNewPostForm(...args: any[]): any { return this.app().submitNewPostForm(...args); }
  addEventSubmit(...args: any[]): any { return this.app().addEventSubmit(...args); }
  sendMessageSubmit(...args: any[]): any { return this.app().sendMessageSubmit(...args); }
  triggerSubmission(...args: any[]): any { return this.app().triggerSubmission(...args); }
  selectMockFile(...args: any[]): any { return this.app().selectMockFile(...args); }
  submitAssignmentForm(...args: any[]): any { return this.app().submitAssignmentForm(...args); }
  addCommentSubmit(...args: any[]): any { return this.app().addCommentSubmit(...args); }
  triggerQuickAction(...args: any[]): any { return this.app().triggerQuickAction(...args); }
  remindMe(...args: any[]): any { return this.app().remindMe(...args); }
  triggerMockPhotoUpload(...args: any[]): any { return this.app().triggerMockPhotoUpload(...args); }
  openCertificateViewer(...args: any[]): any { return this.app().openCertificateViewer(...args); }
  downloadCertificateMock(...args: any[]): any { return this.app().downloadCertificateMock(...args); }
  isLessonCompleted(lesson: string): boolean { return this.app().isLessonCompleted(lesson); }
  markActiveLessonCompleted(): void { this.app().markActiveLessonCompleted(); }
}
