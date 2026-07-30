/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { LmsState } from '../../state';

@Component({
  selector: 'app-messages-page',
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './messages.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessagesPage {
  app = input.required<any>();

  get state(): LmsState {
    return this.app().state;
  }

  get chatCategoryFilter(): any {
    return this.app().chatCategoryFilter;
  }

  get chatSearchQuery(): any {
    return this.app().chatSearchQuery;
  }

  get showEmojiPicker(): any {
    return this.app().showEmojiPicker;
  }

  get isRecordingVoice(): any {
    return this.app().isRecordingVoice;
  }

  get voiceDuration(): any {
    return this.app().voiceDuration;
  }

  get messageForm(): any {
    return this.app().messageForm;
  }

  filteredChats(): any[] {
    return this.app().filteredChats();
  }

  activeChat(): any {
    return this.app().activeChat();
  }

  simulateFileShare(name: string, size: string, type: string): void {
    this.app().simulateFileShare(name, size, type);
  }

  addEmoji(emoji: string): void {
    this.app().addEmoji(emoji);
  }

  cancelVoiceRecording(): void {
    this.app().cancelVoiceRecording();
  }

  sendVoiceRecording(): void {
    this.app().sendVoiceRecording();
  }

  startVoiceRecording(): void {
    this.app().startVoiceRecording();
  }

  sendMessageSubmit(): void {
    this.app().sendMessageSubmit();
  }
}
