import { Component, inject, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { LmsState } from '../../state';

@Component({
  selector: 'app-header-layout',
  imports: [CommonModule, MatIconModule],
  templateUrl: './header.html',
})
export class HeaderLayout {
  readonly state = inject(LmsState);

  // Local UI States
  showQuickActions = signal<boolean>(false);
  showNotifications = signal<boolean>(false);
  showUserDropdown = signal<boolean>(false);
  searchFocused = signal<boolean>(false);

  // Outputs
  logoutRequested = output<void>();

  // Computed counters
  unreadNotificationsCount = computed(() => 
    this.state.notifications().filter(n => n.unread).length
  );

  // Get color tag for Tailwind rendering
  getThemeColor(): string {
    const theme = this.state.selectedTheme();
    if (theme === 'cyan') return 'cyan';
    if (theme === 'emerald') return 'emerald';
    return 'indigo';
  }

  // Navigation Helper
  navigateTo(viewId: string) {
    this.state.activeView.set(viewId);
    this.showUserDropdown.set(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      this.state.showToast('Opening Technical Discussion Forums', 'success');
    } else if (actionType === 'verify') {
      this.navigateTo('profile');
      this.state.showToast('Viewing security and certification verification', 'info');
    } else if (actionType === 'session') {
      this.navigateTo('settings');
      this.state.showToast('Opening system security audit panel', 'info');
    }
  }
}
