import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';

// PrimeNG Standalone Imports
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-login',
  standalone: true, // v19 default
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private loginService = inject(LoginService); // Modern injection
  private router = inject(Router);

  // Using Signals for form state
  email = signal('');
  password = signal('');
  errorMessage = signal<string | null>(null);

  login(): void {
    this.errorMessage.set(null);
    
    this.loginService.login(this.email(), this.password()).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        this.router.navigate(['/estimator']); // Navigate on success
      },
      error: (err) => {
        console.error(err);
        this.errorMessage.set('Invalid login credentials.');
      }
    });
  }
}