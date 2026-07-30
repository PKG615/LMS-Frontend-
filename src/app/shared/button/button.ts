import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-button',
  imports: [CommonModule, MatIconModule],
  template: `
    <button
      [id]="id()"
      [type]="type()"
      [disabled]="disabled()"
      (click)="clicked.emit($event)"
      [class]="buttonClass()"
    >
      @if (icon() && iconPosition() === 'left') {
        <mat-icon class="text-sm shrink-0">{{ icon() }}</mat-icon>
      }
      <ng-content></ng-content>
      @if (icon() && iconPosition() === 'right') {
        <mat-icon class="text-sm shrink-0">{{ icon() }}</mat-icon>
      }
    </button>
  `
})
export class Button {
  id = input<string>('app-button-default');
  type = input<'button' | 'submit' | 'reset'>('button');
  variant = input<'primary' | 'secondary' | 'accent' | 'danger' | 'ghost'>('primary');
  size = input<'sm' | 'md' | 'lg'>('md');
  disabled = input<boolean>(false);
  icon = input<string>('');
  iconPosition = input<'left' | 'right'>('left');
  fullWidth = input<boolean>(false);

  clicked = output<MouseEvent>();

  buttonClass(): string {
    const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all cursor-pointer border-none gap-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    let variantStyles = '';
    if (this.variant() === 'primary') {
      variantStyles = 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md';
    } else if (this.variant() === 'secondary') {
      variantStyles = 'bg-slate-100 hover:bg-slate-250 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200/50 dark:border-slate-800/50';
    } else if (this.variant() === 'accent') {
      variantStyles = 'bg-cyan-500 hover:bg-cyan-600 text-white shadow-md';
    } else if (this.variant() === 'danger') {
      variantStyles = 'bg-rose-500 hover:bg-rose-600 text-white';
    } else if (this.variant() === 'ghost') {
      variantStyles = 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300';
    }

    let sizeStyles = '';
    if (this.size() === 'sm') {
      sizeStyles = 'px-3.5 py-1.5 text-xs';
    } else if (this.size() === 'md') {
      sizeStyles = 'px-4 py-2 text-sm';
    } else if (this.size() === 'lg') {
      sizeStyles = 'px-6 py-3 text-base';
    }

    const widthStyles = this.fullWidth() ? 'w-full' : '';

    return `${base} ${variantStyles} ${sizeStyles} ${widthStyles}`;
  }
}
