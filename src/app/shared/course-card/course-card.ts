import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CatalogCourse } from '../../state';

@Component({
  selector: 'app-course-card',
  imports: [CommonModule, MatIconModule],
  template: `
    <div [id]="'catalog-grid-' + course().id" class="rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900 overflow-hidden hover:shadow-md transition-all flex flex-col justify-between group">
      <!-- Thumbnail -->
      <div class="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img [src]="course().thumbnail" referrerpolicy="no-referrer" [alt]="course().title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <span class="absolute top-3 left-3 bg-slate-900/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-md uppercase">{{ course().level }}</span>
        <!-- Bookmark Heart -->
        <button (click)="toggleWishlist.emit(course().id)" class="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-slate-900/90 hover:bg-rose-50 text-rose-500 shadow-md cursor-pointer border-none flex items-center justify-center transition-all" type="button" [title]="wishlisted() ? 'Remove Wishlist' : 'Add to Wishlist'">
          <mat-icon class="text-sm">{{ wishlisted() ? 'favorite' : 'favorite_border' }}</mat-icon>
        </button>
      </div>

      <!-- Core info -->
      <div class="p-5 space-y-4 flex-1 flex flex-col justify-between">
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="text-[9px] font-extrabold text-indigo-600 dark:text-cyan-400 uppercase tracking-wide">{{ course().category }}</span>
            <span class="text-[10px] text-slate-400 font-bold font-mono">{{ course().duration }}</span>
          </div>
          <h3 class="font-bold text-xs md:text-sm text-slate-800 dark:text-slate-200 leading-snug line-clamp-1 group-hover:text-brand-500 transition-colors">{{ course().title }}</h3>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{{ course().description }}</p>
        </div>

        <!-- Rating & lectures -->
        <div class="flex items-center justify-between text-xs text-slate-500">
          <div class="flex items-center gap-1.5 font-bold">
            <mat-icon class="text-amber-500 text-sm">star</mat-icon>
            <span class="text-slate-700 dark:text-slate-300">{{ course().rating }}</span>
            <span class="text-[10px] text-slate-400 font-normal">({{ course().reviewsCount }} reviews)</span>
          </div>
          <span class="text-[10px] bg-slate-50 dark:bg-slate-850 px-2.5 py-1 rounded-md text-slate-500 font-bold">{{ course().syllabus.length }} Modules</span>
        </div>

        <!-- Instructor & price / actions -->
        <div class="flex items-center justify-between pt-3.5 border-t border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-2">
            <img [src]="course().instructorImage" referrerpolicy="no-referrer" alt="Instructor" class="w-7 h-7 rounded-full object-cover border border-slate-200" />
            <span class="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[80px]">{{ course().instructor }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm font-extrabold text-slate-900 dark:text-white font-mono">{{ '$' }}{{ course().price }}</span>
            <div class="flex gap-1">
              <button (click)="viewDetails.emit(course().id)" class="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 text-[9px] font-bold text-slate-700 dark:text-slate-300 cursor-pointer" type="button">
                Details
              </button>
              <button (click)="enroll.emit(course().id)" class="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-bold shadow-sm cursor-pointer border-none" type="button">
                Enroll
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CourseCard {
  course = input.required<CatalogCourse>();
  wishlisted = input<boolean>(false);

  viewDetails = output<string>();
  enroll = output<string>();
  toggleWishlist = output<string>();
}
