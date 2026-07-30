import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Course } from '../../state';

@Component({
  selector: 'app-progress-card',
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="p-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl flex flex-col justify-between hover:shadow-md transition-all group">
      <div class="flex gap-4">
        <img [src]="course().thumbnail" referrerpolicy="no-referrer" [alt]="course().title" class="w-20 h-20 rounded-2xl object-cover shrink-0" />
        <div class="space-y-1">
          <span class="text-[9px] font-bold text-indigo-600 dark:text-cyan-400 uppercase tracking-wide">{{ course().category }}</span>
          <h3 class="font-bold text-sm text-slate-800 dark:text-slate-200 group-hover:text-brand-500 transition-colors leading-tight line-clamp-1">{{ course().title }}</h3>
          <p class="text-[10px] text-slate-400">Instructor: {{ course().instructor }}</p>
        </div>
      </div>

      <div class="space-y-2 mt-5">
        <div class="flex justify-between text-xs">
          <span class="text-slate-500 font-medium">Learning Progress:</span>
          <span class="font-bold text-brand-600 dark:text-cyan-400">{{ course().progress }}% Complete</span>
        </div>
        <div class="w-full h-1.5 bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
          <div class="h-full bg-brand-500 rounded-full animate-progress" [style.width.%]="course().progress"></div>
        </div>
        <p class="text-[10px] text-slate-500">Next Track: <span class="font-semibold text-slate-700 dark:text-slate-300">{{ course().nextLesson }}</span></p>
      </div>

      <div class="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
        <span class="text-[10px] text-slate-400 font-medium">{{ course().completedHours }} / {{ course().totalHours }} Hours Spent</span>
        <button (click)="resumeCourse.emit(course().id)" class="bg-indigo-50 hover:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-indigo-600 dark:text-cyan-400 text-xs font-bold px-3.5 py-2 rounded-xl cursor-pointer border-none" type="button">
          Resume Study
        </button>
      </div>
    </div>
  `
})
export class ProgressCard {
  course = input.required<Course>();
  resumeCourse = output<string>();
}
