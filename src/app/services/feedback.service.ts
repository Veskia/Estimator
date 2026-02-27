import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'; // Modern RxJS import

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {

    private http = inject(HttpClient);
    private apiUrl = "https://signsinfo.com/backend/api/feedback.php";

    submitFeedback(feedbackText: string): Observable<string> {
        const body = { feedback: feedbackText };
        return this.http.post<string>(this.apiUrl, body, { withCredentials: true });
    }
}