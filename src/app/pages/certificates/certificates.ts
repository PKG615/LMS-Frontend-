/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { LmsState } from '../../state';

@Component({
  selector: 'app-certificates-page',
  imports: [CommonModule, MatIconModule],
  templateUrl: './certificates.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CertificatesPage {
  app = input.required<any>();

  get state(): LmsState {
    return this.app().state;
  }

  get certificatesList(): any[] {
    return this.app().certificatesList;
  }

  openCertificateViewer(cert: any): void {
    this.app().openCertificateViewer(cert);
  }
}
