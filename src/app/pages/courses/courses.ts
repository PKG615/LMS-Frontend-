/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { LmsState } from '../../state';

@Component({
  selector: 'app-courses-page',
  imports: [CommonModule, MatIconModule],
  templateUrl: './courses.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoursesPage {
  app = input.required<any>();

  get state(): LmsState {
    return this.app().state;
  }

  get selectedCategory(): any {
    return this.app().selectedCategory;
  }

  get categoriesList(): any[] {
    return this.app().categoriesList;
  }

  get selectedInstructor(): any {
    return this.app().selectedInstructor;
  }

  get instructorsList(): any[] {
    return this.app().instructorsList;
  }

  get selectedLevel(): any {
    return this.app().selectedLevel;
  }

  get levelsList(): any[] {
    return this.app().levelsList;
  }

  get maxPrice(): any {
    return this.app().maxPrice;
  }

  get selectedLanguage(): any {
    return this.app().selectedLanguage;
  }

  get languagesList(): any[] {
    return this.app().languagesList;
  }

  get catalogSortBy(): any {
    return this.app().catalogSortBy;
  }

  get courseListingView(): any {
    return this.app().courseListingView;
  }

  get catalogPage(): any {
    return this.app().catalogPage;
  }

  filteredCatalog(): any[] {
    return this.app().filteredCatalog();
  }

  paginatedCatalog(): any[] {
    return this.app().paginatedCatalog();
  }

  totalPages(): number {
    return this.app().totalPages();
  }

  resetAllFilters(): void {
    this.app().resetAllFilters();
  }

  setCategory(category: string): void {
    this.app().setCategory(category);
  }

  setInstructor(instructor: string): void {
    this.app().setInstructor(instructor);
  }

  setLevel(level: string): void {
    this.app().setLevel(level);
  }

  setMaxPrice(price: number): void {
    this.app().setMaxPrice(price);
  }

  setLanguage(language: string): void {
    this.app().setLanguage(language);
  }

  prevCatalogPage(): void {
    this.app().prevCatalogPage();
  }

  nextCatalogPage(): void {
    this.app().nextCatalogPage();
  }
}
