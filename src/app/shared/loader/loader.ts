import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  imports: [CommonModule],
  template: `
    <div [id]="id()" class="flex flex-col items-center justify-center p-6 space-y-3">
      <div class="relative w-12 h-12">
        <div class="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-800"></div>
        <div class="absolute inset-0 rounded-full border-4 border-t-indigo-600 dark:border-t-cyan-400 animate-spin"></div>
      </div>
      @if (label()) {
        <span class="text-xs font-medium text-slate-500 dark:text-slate-400 animate-pulse">{{ label() }}</span>
      }
    </div>
  `
})
export class Loader {
  id = input<string>('app-loader-default');
  label = input<string>('');
}
