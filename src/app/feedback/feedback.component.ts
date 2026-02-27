import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextarea } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { UserService } from '../services/user.service'; 

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextarea, ButtonModule],
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css']
})
export class FeedbackComponent {
  private userService = inject(UserService);

  // These Signals fix the NG9 errors in your HTML template
  isExpanded = signal(false);
  feedbackSubmitted = signal(false);
  errorEncountered = signal(false);
  feedbackText = signal('');

  closeFeedback(event: MouseEvent) {
    event.stopPropagation();
    this.isExpanded.set(false);
    this.feedbackText.set('');
    this.feedbackSubmitted.set(false);
  }

  submitFeedback() {
    this.userService.sendEmail({ feedback: this.feedbackText() }).subscribe({
      next: () => {
        this.feedbackSubmitted.set(true);
        setTimeout(() => this.isExpanded.set(false), 3000);
      },
      error: (err: any) => {
        console.error(err);
        this.errorEncountered.set(true);
      }
    });
  }
}