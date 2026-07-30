import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-instructor-card',
  imports: [CommonModule, MatIconModule],
  template: `
    <div [id]="'instructor-card-' + name().replace(' ', '-')" class="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-5">
      <div class="flex flex-col sm:flex-row gap-5 items-start">
        <img [src]="image()" referrerpolicy="no-referrer" [alt]="name()" class="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-sm shrink-0" />
        <div class="space-y-2.5 flex-1">
          <div>
            <h4 class="font-black text-base text-slate-800 dark:text-slate-100">{{ name() }}</h4>
            <p class="text-[11px] text-indigo-600 dark:text-cyan-400 font-bold uppercase tracking-wider">{{ role() }}</p>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {{ bio() }}
          </p>
          
          <!-- Trust highlights -->
          <div class="flex items-center gap-4 text-[10px] font-bold text-slate-400">
            <span class="flex items-center gap-1"><mat-icon class="text-sm">star</mat-icon> {{ rating() }} Instructor Rating</span>
            <span class="flex items-center gap-1"><mat-icon class="text-sm">people</mat-icon> {{ students().toLocaleString() }} Students</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class InstructorCard {
  name = input.required<string>();
  image = input.required<string>();
  bio = input<string>('Principal Architect & Senior Industry Specialist with deep experience building scalable production platforms.');
  role = input<string>('Enterprise Principal Architect');
  rating = input<number>(4.9);
  students = input<number>(18410);
}
