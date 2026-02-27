import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Estimate } from '../models/estimate'; // Ensure path is correct

export interface HistoryCount {
    totalRecords: number;
}

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private http = inject(HttpClient);
  private apiUrl = "https://signsinfo.com/backend/api/history.php";

  getHistoryCount(userCompany: string, userEmail: string, materialName: string, finishingName: string, 
                  laminate: number | null, diecut: number | null, description: string, company: string, 
                  customer: string, address: string, city: string, state: string, zip: string, 
                  phone: string, email: string): Observable<HistoryCount> {
      
      const body = { type: 'count', userCompany, userEmail, materialName, finishingName, laminate, 
                     diecut, description, company, customer, address, city, state, zip, phone, email };
      
      return this.http.post<HistoryCount>(this.apiUrl, body, { withCredentials: true });
  }

  getEstimates(offset: number, numRows: number, userCompany: string, userEmail: string, materialName: string,
               finishingName: string, laminate: number | null, diecut: number | null, description: string, 
               company: string, customer: string, address: string, city: string, state: string, zip: string, 
               phone: string, email: string): Observable<Estimate[]> {
      
      const body = { type: 'estimate', offset, numRows, userCompany, userEmail, materialName, 
                     finishingName, laminate, diecut, description, company, customer, address, city, 
                     state, zip, phone, email };
      
      return this.http.post<Estimate[]>(this.apiUrl, body, { withCredentials: true });
  }
}