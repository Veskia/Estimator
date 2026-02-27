import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Material } from '../models/material';

@Injectable({
  providedIn: 'root'
})
export class MaterialsService {
  private http = inject(HttpClient);
  private apiUrl = "https://signsinfo.com/backend/api/materials.php";

  /**
   * Fetches the list of all materials
   */
  getMaterials(): Observable<Material[]> {
    return this.http.get<Material[]>(this.apiUrl, { withCredentials: true });
  }

  /**
   * Adds a new material to the database
   */
  addMaterial(material: any): Observable<string> {
    return this.http.post<string>(this.apiUrl, { ...material, type: 'add' }, { withCredentials: true });
  }

  /**
   * Updates a specific field for a material (e.g., price or multiplier)
   * FIX: This was missing and caused the TS2551 error
   */
  editMaterial(id: number, field: string, value: any): Observable<string> {
    return this.http.patch<string>(this.apiUrl, { id, field, value, type: 'edit' }, { withCredentials: true });
  }

  /**
   * Deletes a material from the database
   */
  deleteMaterial(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}?id=${id}`, { withCredentials: true });
  }
}