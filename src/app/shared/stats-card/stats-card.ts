import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stats-card',
  imports: [CommonModule, MatIconModule],
  template: `
    <div [id]="'stats-card-' + label().replace(' ', '-').toLowerCase()" class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
      <span class="p-3.5 rounded-xl flex items-center justify-center shrink-0" [class]="iconBgClass()">
        <mat-icon>{{ icon() }}</mat-icon>
      </span>
      <div>
        <span class="text-xs text-slate-500 dark:text-slate-400 block font-medium">{{ label() }}</span>
        <p class="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{{ value() }}</p>
      </div>
    </div>
  `
})
export class StatsCard {
  label = input.required<string>();
  value = input.required<string | number>();
  icon = input.required<string>();
  iconBgClass = input<string>('bg-brand-50 dark:bg-brand-950/40 text-brand-500');
}
