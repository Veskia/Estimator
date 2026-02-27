import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Finishing } from '../models/finishing'; // Adjust path as needed

@Injectable({
  providedIn: 'root'
})
export class FinishingService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private headers = new HttpHeaders().set('Content-Type', 'application/json');

  // Signal to hold the reactive list of finishing options
  finishingOptions = signal<Finishing[]>([]);

  getFinishing(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?type=finishing`, { withCredentials: true }).pipe(
      tap(response => {
        const data = response.results ? response.results : response;
        this.finishingOptions.set(data);
      })
    );
  }

  addFinishing(finishing: Finishing): Observable<any> {
    const body = { ...finishing, type: 'add_finishing' };
    return this.http.post<any>(this.apiUrl, body, { withCredentials: true, headers: this.headers }).pipe(
      tap(() => this.getFinishing().subscribe())
    );
  }

  deleteFinishing(id: number): Observable<any> {
    const url = `${this.apiUrl}?type=delete_finishing&id=${id}`;
    return this.http.get<any>(url, { withCredentials: true }).pipe(
      tap(() => this.finishingOptions.update(opts => opts.filter(f => f.id !== id)))
    );
  }

  updateCell(id: number, field: string, data: any): Observable<any> {
    const body = { type: 'update_cell_finishing', id, field, data };
    return this.http.post<any>(this.apiUrl, body, { withCredentials: true, headers: this.headers });
  }

  getFinishingCSV(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}?type=csv_finishing`, { 
      withCredentials: true, 
      responseType: 'text' as 'json' 
    });
  }
}