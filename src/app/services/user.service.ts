import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  private http = inject(HttpClient);
  // Adjust this URL to match your Hostinger/Angular migration setup
  private apiUrl = 'https://signsinfo.com/backend/api'; 

  // Fixes: Property 'getUserRequests' does not exist
  getUserRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/requests`);
  }

  // Add this to fix the acceptUser error
  acceptUser(userId: number | string, level: string) {
    return this.http.put(`${this.apiUrl}/users/accept`, { id: userId, level });
  }

  // Add this to fix the denyUser error
  denyUser(userId: number | string) {
    return this.http.delete(`${this.apiUrl}/requests/${userId}`);
  }

  // Fixes: Property 'getUsers' does not exist
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }

  // Fixes: Property 'changeUserLevel' does not exist
  changeUserLevel(userId: number | string, level: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/level`, { id: userId, level });
  }

  // Fixes: Property 'deleteUser' does not exist
  deleteUser(userId: number | string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${userId}`);
  }

  // Fixes: Property 'sendEmail' does not exist
  sendEmail(formData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/email`, formData);
  }
}