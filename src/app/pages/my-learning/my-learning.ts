/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { LmsState } from '../../state';

@Component({
  selector: 'app-my-learning-page',
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './my-learning.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyLearningPage {
  app = input.required<any>();

  get state(): LmsState {
    return this.app().state;
  }

  get selectedPlayerCatalogCourse(): any {
    return this.app().selectedPlayerCatalogCourse;
  }

  get playerDarkMode(): any {
    return this.app().playerDarkMode;
  }

  togglePlayerDarkMode(): void {
    this.app().togglePlayerDarkMode();
  }

  get isFullscreen(): any {
    return this.app().isFullscreen;
  }

  toggleFullscreen(): void {
    this.app().toggleFullscreen();
  }

  get activeLessonType(): any {
    return this.app().activeLessonType;
  }

  get selectedPlayerCourse(): any {
    return this.app().selectedPlayerCourse;
  }

  get effectiveActiveLesson(): any {
    return this.app().effectiveActiveLesson;
  }

  get playbackSpeed(): any {
    return this.app().playbackSpeed;
  }

  get isVideoPlaying(): any {
    return this.app().isVideoPlaying;
  }

  get isMuted(): any {
    return this.app().isMuted;
  }

  get volume(): any {
    return this.app().volume;
  }

  get quizTimerDisplay(): any {
    return this.app().quizTimerDisplay;
  }

  get quizSubmitted(): any {
    return this.app().quizSubmitted;
  }

  get quizScore(): any {
    return this.app().quizScore;
  }

  get quizQuestions(): any[] {
    return this.app().quizQuestions;
  }

  get quizAccuracyRatio(): any {
    return this.app().quizAccuracyRatio;
  }

  get quizSelectedAnswers(): any {
    return this.app().quizSelectedAnswers;
  }

  get quizActiveQuestion(): any {
    return this.app().quizActiveQuestion;
  }

  get quizProgressPercentage(): any {
    return this.app().quizProgressPercentage;
  }

  get assignmentForm(): any {
    return this.app().assignmentForm;
  }

  get playerActiveTab(): any {
    return this.app().playerActiveTab;
  }

  get discussionMessages(): any {
    return this.app().discussionMessages;
  }

  get newDiscussionText(): any {
    return this.app().newDiscussionText;
  }

  get lessonNotes(): any {
    return this.app().lessonNotes;
  }

  get newNoteText(): any {
    return this.app().newNoteText;
  }

  get lessonBookmarks(): any {
    return this.app().lessonBookmarks;
  }

  get selectedPlayerCourseId(): any {
    return this.app().selectedPlayerCourseId;
  }

  goToPrevLesson(): void {
    this.app().goToPrevLesson();
  }

  goToNextLesson(): void {
    this.app().goToNextLesson();
  }

  toggleMute(): void {
    this.app().toggleMute();
  }

  setPlaybackSpeed(sp: number): void {
    this.app().setPlaybackSpeed(sp);
  }

  addBookmark(): void {
    this.app().addBookmark();
  }

  retryQuiz(): void {
    this.app().retryQuiz();
  }

  selectQuizOption(optIdx: number): void {
    this.app().selectQuizOption(optIdx);
  }

  prevQuizQuestion(): void {
    this.app().prevQuizQuestion();
  }

  nextQuizQuestion(): void {
    this.app().nextQuizQuestion();
  }

  submitQuiz(): void {
    this.app().submitQuiz();
  }

  selectMockFile(): void {
    this.app().selectMockFile();
  }

  addDiscussionMessage(): void {
    this.app().addDiscussionMessage();
  }

  seekToBookmark(seconds: number): void {
    this.app().seekToBookmark(seconds);
  }

  deleteNote(idx: number): void {
    this.app().deleteNote(idx);
  }

  addNote(): void {
    this.app().addNote();
  }

  deleteBookmark(idx: number): void {
    this.app().deleteBookmark(idx);
  }

  selectLesson(l: string, type: string): void {
    this.app().selectLesson(l, type);
  }
}
