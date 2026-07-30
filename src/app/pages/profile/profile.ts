/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { LmsState } from '../../state';

@Component({
  selector: 'app-profile-page',
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './profile.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage {
  app = input.required<any>();

  get state(): LmsState {
    return this.app().state;
  }

  get avatarsList(): any[] {
    return this.app().avatarsList;
  }

  get profileForm(): any {
    return this.app().profileForm;
  }

  get showLogoutConfirmation(): any {
    return this.app().showLogoutConfirmation;
  }

  triggerMockPhotoUpload(): void {
    this.app().triggerMockPhotoUpload();
  }

  selectAvatar(av: any): void {
    this.app().selectAvatar(av);
  }

  saveProfileSubmit(): void {
    this.app().saveProfileSubmit();
  }
}
