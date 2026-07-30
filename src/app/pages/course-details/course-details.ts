/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { LmsState } from '../../state';
import { ReviewsComponent } from '../../shared/reviews/reviews';
import { PaymentCheckoutComponent } from '../../shared/payment-checkout/payment-checkout';

@Component({
  selector: 'app-course-details-page',
  imports: [CommonModule, MatIconModule, ReviewsComponent, PaymentCheckoutComponent],
  templateUrl: './course-details.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseDetailsPage {
  app = input.required<any>();

  get state(): LmsState {
    return this.app().state;
  }

  get activeCourseDetails(): any {
    return this.app().activeCourseDetails;
  }

  get showWriteReview(): any {
    return this.app().showWriteReview;
  }

  get reviewRating(): any {
    return this.app().reviewRating;
  }

  get reviewText(): any {
    return this.app().reviewText;
  }

  get editingReview(): any {
    return this.app().editingReview;
  }

  relatedCourseItems(): any[] {
    return this.app().relatedCourseItems();
  }

  navigateTo(view: string): void {
    this.app().navigateTo(view);
  }
}
