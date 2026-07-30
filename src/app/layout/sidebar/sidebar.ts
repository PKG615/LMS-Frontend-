import { Component, input, output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { LmsState } from '../../state';

@Component({
  selector: 'app-sidebar-layout',
  imports: [CommonModule, MatIconModule],
  templateUrl: './sidebar.html',
  host: {
    class: 'contents'
  }
})
export class SidebarLayout {
  readonly state = inject(LmsState);
  
  currentWorkspace = input<'learner' | 'instructor' | 'admin'>('learner');
  workspaceChanged = output<'learner' | 'instructor' | 'admin'>();
  
  activeView = input<string>('dashboard');
  activeInstructorView = input<string>('overview');
  activeAdminView = input<string>('dashboard');
  
  sidebarClick = output<string>();
  
  unreadMessagesCount = input<number>(0);
  
  dynamicSidebarItems = computed(() => {
    const ws = this.currentWorkspace();
    if (ws === 'learner') {
      return [
        { id: 'dashboard', name: 'Dashboard', icon: 'dashboard' },
        { id: 'my-learning', name: 'My Learning', icon: 'school' },
        { id: 'progress-dashboard', name: 'Course Progress', icon: 'trending_up' },
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
        { id: 'announcements', name: 'Announcements', icon: 'campaign' }
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

  isSidebarActive(id: string): boolean {
    const ws = this.currentWorkspace();
    if (ws === 'learner') {
      return this.activeView() === id;
    } else if (ws === 'instructor') {
      return this.activeInstructorView() === id;
    } else {
      return this.activeAdminView() === id;
    }
  }

  switchWorkspace(ws: 'learner' | 'instructor' | 'admin') {
    this.workspaceChanged.emit(ws);
  }

  handleSidebarClick(id: string) {
    this.sidebarClick.emit(id);
  }
}
