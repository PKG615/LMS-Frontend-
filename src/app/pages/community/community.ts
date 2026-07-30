/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { LmsState } from '../../state';

@Component({
  selector: 'app-community-page',
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './community.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommunityPage {
  app = input.required<any>();

  get state(): LmsState {
    return this.app().state;
  }

  get showNewPostPopup(): any {
    return this.app().showNewPostPopup;
  }

  get forumTabFilter(): any {
    return this.app().forumTabFilter;
  }

  get forumSearchQuery(): any {
    return this.app().forumSearchQuery;
  }

  get forumTagFilter(): any {
    return this.app().forumTagFilter;
  }

  get activeReplyCommentId(): any {
    return this.app().activeReplyCommentId;
  }

  filteredForumPosts(): any[] {
    return this.app().filteredForumPosts();
  }
}
