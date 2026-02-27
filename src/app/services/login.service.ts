import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

// Define the shape of your user data
export interface LoginResponse {
    level: string;
    firstName: string;
    lastName: string;
    email: string;
}

@Injectable({
  providedIn: 'root' // This makes the service a global singleton
})
export class LoginService {
  private http = inject(HttpClient); // Modern injection
  
  // Signal to hold the current user's info
  // Any component (like a header) can now "listen" to this signal.
  currentUser = signal<LoginResponse | null>(null);

  /**
   * Log in to the PHP backend
   */
  login(email: string, password: string): Observable<LoginResponse> {
    const body = { email, password };
    return this.http.post<LoginResponse>(environment.loginUrl, body, {
      withCredentials: true, // Required for your PHP sessions
      headers: new HttpHeaders().set("Content-Type", "application/json")
    }).pipe(
      tap(user => this.currentUser.set(user)) // Update the signal on success
    );
  }

  /**
   * Check if a session already exists (e.g., on page refresh)
   */
  getLogin(): Observable<LoginResponse> {
    return this.http.get<LoginResponse>(environment.loginUrl, { withCredentials: true }).pipe(
      tap(user => this.currentUser.set(user))
    );
  }

  /**
   * Log out and clear the local signal
   */
  logout(): Observable<string> {
    return this.http.get<string>(environment.logoutUrl, { withCredentials: true }).pipe(
      tap(() => this.currentUser.set(null))
    );
  }
}