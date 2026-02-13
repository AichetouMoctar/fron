import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Arret } from '../models/transport.model';
import { SearchRequest, ItineraireResult } from '../models/search-request.model';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private apiUrl = 'http://localhost:8082/api/mobile/search';

  constructor(private http: HttpClient) {}

  // Itération 4.1 : Suggestions d'adresses / arrêts
  autocomplete(query: string): Observable<Arret[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<Arret[]>(`${this.apiUrl}/autocomplete`, { params });
  }

  // Itération 4.2 : Recherche d'itinéraire
  searchRoutes(request: SearchRequest): Observable<ItineraireResult[]> {
    return this.http.post<ItineraireResult[]>(`${this.apiUrl}/routes`, request);
  }

  // Itération 4.3 : Géocodage (si besoin de transformer une adresse texte en coordonnées)
  geocode(query: string): Observable<Arret[]> {
    return this.http.get<Arret[]>(`${this.apiUrl}/address/${query}`);
  }
}