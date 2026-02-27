import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EstimatorService {
    private http = inject(HttpClient);
    private apiUrl = 'https://signsinfo.com/backend/api/estimator.php';

    // Add this missing method
    getEstimateDetails(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}?type=details&id=${id}`, { withCredentials: true });
    }

    // Ensure this exists for the other error you had earlier
    editSalesMultiplier(val: number): Observable<string> {
        return this.http.patch<string>(this.apiUrl, { value: val, type: 'salesMult' }, { withCredentials: true });
    }
}