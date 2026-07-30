import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-modal',
  imports: [CommonModule, MatIconModule],
  template: `
    @if (isOpen()) {
      <div [id]="id()" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in">
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col">
          <div class="p-5 border-b border-slate-100 dark:border-slate-800/60 flex justify-between items-center bg-slate-50 dark:bg-slate-950/30">
            <div>
              <h3 class="font-extrabold text-sm text-slate-800 dark:text-slate-200">{{ title() }}</h3>
              @if (subtitle()) {
                <p class="text-[10px] text-slate-400 font-mono">{{ subtitle() }}</p>
              }
            </div>
            <button (click)="modalClose.emit()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-transparent border-none cursor-pointer" type="button">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          
          <div class="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            <ng-content></ng-content>
          </div>

          @if (showFooter()) {
            <div class="p-4 bg-slate-50 dark:bg-slate-950/30 border-t border-slate-100 dark:border-slate-800/60 flex gap-3 justify-end shrink-0">
              <ng-content select="[footer]"></ng-content>
            </div>
          }
        </div>
      </div>
    }
  `
})
export class Modal {
  id = input<string>('app-modal-default');
  isOpen = input<boolean>(false);
  title = input<string>('');
  subtitle = input<string>('');
  showFooter = input<boolean>(true);

  modalClose = output<void>();
}
