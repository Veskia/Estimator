import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'; // Modern RxJS import
import { Change } from '../models/change'; // Ensure path points to your models folder

@Injectable({
  providedIn: 'root'
})
export class ChangelogService {
    private http = inject(HttpClient);
    private apiUrl = "https://signsinfo.com/backend/api/changelog.php";

    getChanges(): Observable<Change[]> {
        return this.http.get<Change[]>(this.apiUrl, { withCredentials: true });
    }
}