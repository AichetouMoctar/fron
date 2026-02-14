// src/app/services/transport.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TransportService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api/mobile`;

  // ===== Lignes =====
  getLines(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/lines`);
  }

  getLineDetail(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/lines/${id}`);
  }

  getLineStops(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/lines/${id}/stops`);
  }

  getLineSchedule(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/lines/${id}/schedules`);
  }

  // ===== Arrêts =====
  getStopDetail(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/stops/${id}`);
  }

  getNearbyStops(lat: number, lon: number, radius: number = 1): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/stops/nearby`, {
      params: { lat: lat.toString(), lon: lon.toString(), radiusKm: radius.toString() }
    });
  }

  // ===== Carte =====
  getMapNetwork(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/map/network`);
  }

  getMapLinePath(lineId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/map/line/${lineId}/path`);
  }

  getMapBounds(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/map/bounds`);
  }
}