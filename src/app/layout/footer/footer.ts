import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LmsState } from '../../state';

@Component({
  selector: 'app-footer-layout',
  imports: [CommonModule],
  template: `
    <footer class="mt-12 py-6 border-t border-slate-200/50 dark:border-slate-800/50 text-center text-xs text-slate-400 font-mono">
      <div class="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>&copy; 2026 OmniLMS Enterprise. All rights reserved.</p>
        <div class="flex items-center gap-4">
          <a class="hover:text-indigo-500 transition-colors cursor-pointer" (click)="state.activeView.set('verify-certificate')">Verify Certificate</a>
          <span class="text-slate-350 dark:text-slate-700">&bull;</span>
          <a class="hover:text-indigo-500 transition-colors cursor-pointer">Security Audits</a>
          <span class="text-slate-350 dark:text-slate-700">&bull;</span>
          <a class="hover:text-indigo-500 transition-colors cursor-pointer">Compliance API</a>
          <span class="text-slate-350 dark:text-slate-700">&bull;</span>
          <a class="hover:text-indigo-500 transition-colors cursor-pointer">Status Network</a>
        </div>
      </div>
    </footer>
  `
})
export class FooterLayout {
  readonly state = inject(LmsState);
}
