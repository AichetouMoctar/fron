import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Utilisateur } from '../../models/auth/utilisateur.model';
import { AuthResponse } from '../../models/auth/auth-response.model';
import { AuthRequest } from '../../models/auth/auth-request.model';
import { RefreshTokenRequest } from '../../models/auth/refresh-token-request.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/auth'; // À adapter selon votre configuration

  private userSubject = new BehaviorSubject<Utilisateur | null>(null);
  public user$ = this.userSubject.asObservable();

  private accessTokenKey = 'access_token';
  private refreshTokenKey = 'refresh_token';

  constructor(private http: HttpClient, private router: Router) {
    this.loadStoredUser();
  }

  // ========== PUBLIC API ==========

  login(credentials: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.handleAuthResponse(response)),
      catchError(this.handleError)
    );
  }

  register(userData: any): Observable<Utilisateur> {
    return this.http.post<Utilisateur>(`${this.apiUrl}/register`, userData).pipe(
      catchError(this.handleError)
    );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('Aucun refresh token disponible'));
    }
    const body: RefreshTokenRequest = { refreshToken };
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, body).pipe(
      tap(response => this.handleAuthResponse(response)),
      catchError(error => {
        this.logout();
        return this.handleError(error);
      })
    );
  }

  logout(): void {
    // Optionnel : appeler le backend pour révoquer le refresh token
    // this.http.post(`${this.apiUrl}/logout`, {}).subscribe();
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken() && !!this.userSubject.value;
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  getCurrentUser(): Utilisateur | null {
    return this.userSubject.value;
  }

  // ========== PRIVATE ==========

  private handleAuthResponse(response: AuthResponse): void {
    localStorage.setItem(this.accessTokenKey, response.accessToken);
    localStorage.setItem(this.refreshTokenKey, response.refreshToken);
    this.userSubject.next(response.utilisateur);
    this.router.navigate(['/']); 
  }

  private loadStoredUser(): void {
    // Optionnel : restaurer l'utilisateur depuis le token JWT (payload décodé)
    // Ici, on peut simplement attendre le prochain refresh ou login
    // Pour éviter un appel inutile, on ne fait rien.
  }

  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    let message = 'Une erreur est survenue';
    if (error.error && error.error.message) {
      message = error.error.message; // Format du GlobalExceptionHandler
    } else if (error.message) {
      message = error.message;
    }
    return throwError(() => ({ message, status: error.status }));
  }
}