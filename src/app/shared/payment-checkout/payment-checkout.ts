import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnrollmentService } from '../../core/services/enrollment.service';
import { IEnrollment } from '../../core/models/enrollment.model';

/**
 * Razorpay checkout.js response shape for a successful payment
 * (documented at https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/build-integration/).
 */
interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description?: string;
  prefill?: { name?: string; email?: string };
  theme?: { color?: string };
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open(): void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';
let razorpayScriptPromise: Promise<void> | null = null;

function loadRazorpayScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.Razorpay) return Promise.resolve();
  if (razorpayScriptPromise) return razorpayScriptPromise;

  razorpayScriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_URL;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load the Razorpay checkout script.'));
    document.body.appendChild(script);
  });
  return razorpayScriptPromise;
}

/**
 * Real Razorpay checkout flow, replacing the fake payment call
 * (`https://api.omnicommerce.com/v1/payments/charge`) that existed
 * before. Wraps `POST /api/enrollments/payment/initiate` +
 * `POST /api/enrollments/payment/verify` from
 * `src/modules/enrollment/enrollment.routes.ts`.
 *
 * Flow:
 *  1. Ask the backend to create a Razorpay order (`initiatePayment`).
 *  2. Open Razorpay's hosted checkout widget with that order.
 *  3. On success, send the three values Razorpay returns
 *     (order id, payment id, signature) back to the backend so it can
 *     verify the payment's HMAC signature server-side and only THEN
 *     mark the enrollment as paid — the frontend never trusts
 *     Razorpay's client-side "success" callback on its own.
 */
@Component({
  selector: 'app-payment-checkout',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './payment-checkout.html',
})
export class PaymentCheckoutComponent {
  courseId = input.required<string>();
  courseTitle = input.required<string>();
  studentName = input<string>('');
  studentEmail = input<string>('');

  enrolled = output<IEnrollment>();

  private readonly enrollmentService = inject(EnrollmentService);

  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  async payAndEnroll(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      await loadRazorpayScript();
    } catch {
      this.loading.set(false);
      this.error.set('Could not load the payment widget. Check your connection and try again.');
      return;
    }

    this.enrollmentService.initiatePayment({ courseId: this.courseId() }).subscribe({
      next: (order) => {
        this.loading.set(false);
        if (!window.Razorpay) {
          this.error.set('Payment widget unavailable.');
          return;
        }

        const razorpay = new window.Razorpay({
          key: order.razorpayKeyId,
          amount: order.amount,
          currency: order.currency,
          order_id: order.orderId,
          name: 'OmniLMS Enterprise',
          description: this.courseTitle(),
          prefill: { name: this.studentName(), email: this.studentEmail() },
          theme: { color: '#6366f1' },
          handler: (response) => this.verify(order.enrollmentId, response),
          modal: {
            ondismiss: () => {
              this.error.set('Payment was cancelled.');
            },
          },
        });
        razorpay.open();
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.error.set((err as { error?: { message?: string } })?.error?.message ?? 'Could not start checkout.');
      },
    });
  }

  private verify(enrollmentId: string, response: RazorpaySuccessResponse): void {
    this.loading.set(true);
    this.enrollmentService
      .verifyPayment({
        enrollmentId,
        razorpayOrderId: response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
      })
      .subscribe({
        next: (enrollment) => {
          this.loading.set(false);
          this.enrolled.emit(enrollment);
        },
        error: (err: unknown) => {
          this.loading.set(false);
          this.error.set(
            (err as { error?: { message?: string } })?.error?.message ??
              'Payment succeeded but verification failed — please contact support with your payment id.'
          );
        },
      });
  }
}
