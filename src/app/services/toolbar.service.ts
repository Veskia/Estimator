import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs'; // Modern RxJS import

import { Reference } from '../models/reference'; // Pointing to the new models folder
import { Preset } from '../models/preset';

@Injectable({
  providedIn: 'root' // Auto-registers the service globally
})
export class ToolbarService {

    private http = inject(HttpClient);
    private apiUrl = "https://signsinfo.com/backend/api/toolbar.php";
    private headers = new HttpHeaders().set("Content-Type", "application/json");

    getReferences(): Observable<Reference[]> {
        return this.http.get<Reference[]>(`${this.apiUrl}?type=reference`, { 
            withCredentials: true 
        });
    }

    getPresets(): Observable<Preset[]> {
        return this.http.get<Preset[]>(`${this.apiUrl}?type=preset`, { 
            withCredentials: true 
        });
    }

    addTableReference(caption: string, tableHeaders: string[], rows: any): Observable<string> {
        const body = {
            type: 'table',
            caption: caption,
            tableHeaders: JSON.stringify(tableHeaders),
            data: JSON.stringify(rows)
        };
        return this.http.post<string>(this.apiUrl, body, { 
            withCredentials: true, 
            headers: this.headers 
        });
    }

    addTextReference(caption: string, data: string): Observable<string> {
        const body = { type: 'text', caption: caption, data: data };
        return this.http.post<string>(this.apiUrl, body, { 
            withCredentials: true, 
            headers: this.headers 
        });
    }

    editTableReference(referenceId: number, caption: string, tableHeaders: string[], rows: any): Observable<string> {
        const body = {
            type: 'table',
            referenceId: referenceId,
            caption: caption,
            tableHeaders: JSON.stringify(tableHeaders),
            data: JSON.stringify(rows)
        };
        return this.http.patch<string>(this.apiUrl, body, { 
            withCredentials: true, 
            headers: this.headers 
        });
    }

    editTextReference(referenceId: number, caption: string, data: string): Observable<string> {
        const body = {
            type: 'text',
            referenceId: referenceId,
            caption: caption,
            data: data
        };
        return this.http.patch<string>(this.apiUrl, body, { 
            withCredentials: true, 
            headers: this.headers 
        });
    }

    updateDisplayOrder(references: Reference[]): Observable<string> {
        const body = {
            type: 'order',
            references: references
        };
        return this.http.patch<string>(this.apiUrl, body, { 
            withCredentials: true, 
            headers: this.headers 
        });
    }

    deleteReference(referenceId: number): Observable<string> {
        return this.http.delete<string>(`${this.apiUrl}?type=reference&id=${referenceId}`, { 
            withCredentials: true, 
            headers: this.headers 
        });
    }

    deletePreset(presetId: number): Observable<string> {
        return this.http.delete<string>(`${this.apiUrl}?type=preset&id=${presetId}`, { 
            withCredentials: true, 
            headers: this.headers 
        });
    }
}