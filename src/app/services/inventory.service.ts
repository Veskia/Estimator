import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs'; // Modern RxJS import

import { Inventory } from '../models/inventory'; // Ensure paths match your models folder
import { Procurement } from '../models/procurement';
import { ChangeDataPoint } from '../models/inventory_changelog';

@Injectable({
  providedIn: 'root' // Auto-registers the service globally
})
export class InventoryService {

  private http = inject(HttpClient);
  private apiUrl = "https://signsinfo.com/backend/api/inventory.php";
  private headers = new HttpHeaders().set("Content-Type", "application/json");

  getInventory(): Observable<Inventory[]> {
    return this.http.get<Inventory[]>(`${this.apiUrl}?type=inventory`, { 
        withCredentials: true 
    });
  }

  getProcurementOptions(): Observable<Procurement[]> {
    return this.http.get<Procurement[]>(`${this.apiUrl}?type=procurement`, { 
        withCredentials: true 
    });
  }

  getChangelogData(inventoryId: number, startDate: string, endDate: string): Observable<ChangeDataPoint[]> {
    return this.http.get<ChangeDataPoint[]>(
        `${this.apiUrl}?type=change&id=${inventoryId}&startDate=${startDate}&endDate=${endDate}`,
        { withCredentials: true }
    );
  }

  addInventory(inventory: Inventory): Observable<string> {
    // HttpClient automatically stringifies the body in modern Angular
    return this.http.post<string>(this.apiUrl, inventory, { 
        withCredentials: true, 
        headers: this.headers 
    });
  }

  updateCell(inventoryId: number, col: string, data: any): Observable<string> {
    const body = { inventoryId, col, data, type: 'inventory' };
    return this.http.patch<string>(this.apiUrl, body, { 
        withCredentials: true, 
        headers: this.headers 
    });
  }

  updateInventoryLastUpdate(inventory: Inventory): Observable<string> {
    const body = { inventoryId: inventory.id, type: 'update' };
    return this.http.patch<string>(this.apiUrl, body, { 
        withCredentials: true, 
        headers: this.headers 
    });
  }

  reassignUsers(oldUser: string, newUser: string): Observable<string> {
    const body = { oldUser, newUser, type: 'users' };
    return this.http.patch<string>(this.apiUrl, body, { 
        withCredentials: true, 
        headers: this.headers 
    });
  }

  deleteInventory(inventoryId: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}?id=${inventoryId}`, { 
        withCredentials: true 
    });
  }

  getInventoryCSV(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}?type=csv`, {
        withCredentials: true,
        responseType: 'text' as 'json' // Needed because it returns a raw string filename
    });
  }
}