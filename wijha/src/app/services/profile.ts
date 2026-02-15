import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Utilisateur } from '../models/auth/utilisateur.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/profile`;

  getProfile(): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`${this.apiUrl}/me`);
  }

  updateProfile(profile: Partial<Utilisateur>): Observable<Utilisateur> {
    return this.http.put<Utilisateur>(`${this.apiUrl}/me`, profile);
  }

  deleteAccount(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/me`);
  }
}