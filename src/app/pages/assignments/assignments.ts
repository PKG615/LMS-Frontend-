/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { LmsState } from '../../state';

@Component({
  selector: 'app-assignments-page',
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './assignments.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignmentsPage {
  app = input.required<any>();

  get state(): LmsState {
    return this.app().state;
  }

  get activeSubmissionTarget(): any {
    return this.app().activeSubmissionTarget;
  }

  get assignmentForm(): any {
    return this.app().assignmentForm;
  }

  triggerSubmission(assignment: any): void {
    this.app().triggerSubmission(assignment);
  }

  selectMockFile(): void {
    this.app().selectMockFile();
  }

  submitAssignmentForm(): void {
    this.app().submitAssignmentForm();
  }
}
