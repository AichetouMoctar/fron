import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TransportService {
  // URL de base pointant vers ton backend Spring Boot
  private baseUrl = 'http://localhost:8080/api/mobile';

  constructor(private http: HttpClient) {}

  // 1. Liste de toutes les lignes
  getLines(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/lines`, { withCredentials: true });
  }

  // 2. Détails d'une ligne spécifique
  getLineDetail(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/lines/${id}`, { withCredentials: true });
  }

  // 3. Liste des arrêts pour une ligne
  getLineStops(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/lines/${id}/stops`, { withCredentials: true });
  }

  // 4. Horaires de passage pour une ligne
  getLineSchedule(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/lines/${id}/schedule`, { withCredentials: true });
  }

  // 5. Détails d'un arrêt spécifique
  getStopDetail(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/stops/${id}`, { withCredentials: true });
  }

  // 6. Recherche d'arrêts à proximité
  getNearbyStops(lat: number, lon: number, radius: number = 2.0): Observable<any[]> {
    const params = new HttpParams()
      .set('lat', lat.toString())
      .set('lon', lon.toString())
      .set('radius', radius.toString());

    return this.http.get<any[]>(`${this.baseUrl}/stops/nearby`, { params, withCredentials: true });
  }

  // 7. Obtenir le plan de passage détaillé (Horaires calculés par arrêt)
  getStopPlan(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/stops/${id}/plan`, { withCredentials: true });
  }

  // 8. Télécharger le plan de passage en PDF (POUR UN ARRET)
  downloadStopPlanPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/stops/${id}/plan/pdf`, {
      responseType: 'blob',
      withCredentials: true 
    });
  }

  // 9. NOUVEAU : Télécharger la fiche complète de LA LIGNE
  // src/app/services/transport.service.ts

downloadLignePlanPdf(ligneId: number): Observable<Blob> {
  // Correction : utilise 'this.baseUrl' au lieu de 'this.apiUrl'
  return this.http.get(`${this.baseUrl}/lines/${ligneId}/export-pdf`, {
    responseType: 'blob',
    withCredentials: true
  });
}
}