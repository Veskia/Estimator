import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs'; // Modern RxJS import

import { Printer } from '../models/printer'; // Ensure paths point to your new models folder
import { Job } from '../models/job';

@Injectable({
    providedIn: 'root'
})
export class CapacityService {

    private http = inject(HttpClient);
    private apiUrl = "https://signsinfo.com/backend/api/capacity.php";
    private headers = new HttpHeaders().set("Content-Type", "application/json");

    getPrinters(): Observable<Printer[]> {
        return this.http.get<Printer[]>(`${this.apiUrl}?type=printer`, { withCredentials: true });
    }

    getPrinterUsages(date: Date): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}?type=usages&date=${this.formatDate(date)}`, { withCredentials: true });
    }

    getJobs(date: Date): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}?type=job&date=${this.formatDate(date)}`, { withCredentials: true });
    }

    getReport(startDate: Date, endDate: Date): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}?type=report&startDate=${this.formatDate(startDate)}&endDate=${this.formatDate(endDate)}`, { withCredentials: true });
    }

    addMachine(printer: Printer): Observable<string> {
        return this.http.post<string>(this.apiUrl, printer, { withCredentials: true, headers: this.headers });
    }

    addJob(job: Partial<Job>): Observable<string> {
        const body = { name: job.name, qty: job.qty, height: job.height, length: job.length, printerId: job.printerId, type: 'job' };
        return this.http.post<string>(this.apiUrl, body, { withCredentials: true, headers: this.headers });
    }

    editMachine(printer: Printer): Observable<string> {
        const body = { id: printer.id, name: printer.name, capacity: printer.capacity, unit: printer.unit, type: 'printer' };
        return this.http.patch<string>(this.apiUrl, body, { withCredentials: true, headers: this.headers });
    }

    updateUsage(usageId: number, date: Date, unitsUsed: number): Observable<string> {
        const body = { usageId: usageId, date: this.formatDate(date), unitsUsed: unitsUsed, type: 'usage' };
        return this.http.patch<string>(this.apiUrl, body, { withCredentials: true, headers: this.headers });
    }

    updateUseJobs(usageId: number, date: Date, useJobs: boolean): Observable<string> {
        const body = { usageId: usageId, date: this.formatDate(date), useJobs: useJobs, type: 'useJobs' };
        return this.http.patch<string>(this.apiUrl, body, { withCredentials: true, headers: this.headers });
    }

    editJob(job: Job): Observable<string> {
        const body = { id: job.id, name: job.name, qty: job.qty, height: job.height, length: job.length, type: 'job' };
        return this.http.patch<string>(this.apiUrl, body, { withCredentials: true, headers: this.headers });
    }

    deleteMachine(printerId: number): Observable<string> {
        return this.http.delete<string>(`${this.apiUrl}?type=printer&id=${printerId}`, { withCredentials: true });
    }

    deleteJob(jobId: number): Observable<string> {
        return this.http.delete<string>(`${this.apiUrl}?type=job&id=${jobId}`, { withCredentials: true });
    }

    // Helper function to format date into a string for the backend (YYYY-MM-DD)
    formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}