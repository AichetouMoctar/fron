import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TransportService {
  // URL de base pointant vers ton backend Spring Boot (Port 8082)
  private baseUrl = 'http://localhost:8080/api/mobile';

  constructor(private http: HttpClient) {}

  // 1. Liste de toutes les lignes (API 1)
  getLines(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/lines`, { withCredentials: true });
  }

  // 2. Détails d'une ligne spécifique (API 2)
  getLineDetail(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/lines/${id}`, { withCredentials: true });
  }

  // 3. Liste des arrêts pour une ligne (API 3)
  getLineStops(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/lines/${id}/stops`, { withCredentials: true });
  }

  // 4. Horaires de passage pour une ligne (API 4)
  getLineSchedule(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/lines/${id}/schedule`, { withCredentials: true });
  }

  // 5. Détails d'un arrêt spécifique (API 5) - C'était la méthode manquante !
  getStopDetail(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/stops/${id}`, { withCredentials: true });
  }

  // 6. Recherche d'arrêts à proximité via coordonnées GPS (API 6)
  getNearbyStops(lat: number, lon: number, radius: number = 2.0): Observable<any[]> {
    const params = new HttpParams()
      .set('lat', lat.toString())
      .set('lon', lon.toString())
      .set('radius', radius.toString());

    return this.http.get<any[]>(`${this.baseUrl}/stops/nearby`, { params, withCredentials: true });
  }

  
  
}