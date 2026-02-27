import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models/estimate'; // Ensure the path matches your models folder!

@Injectable({
    providedIn: 'root'
})
export class ReviewService {
    private http = inject(HttpClient);

    getOrder(id: number): Observable<Order> {
        return this.http.get<Order>("https://signsinfo.com/backend/api/review.php?id=" + id, {
            withCredentials: true
        });
    }
}