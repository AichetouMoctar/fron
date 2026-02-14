// src/app/services/auth/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

// ===== Modèles inline (ou sépare dans models/) =====
export interface Utilisateur {
  id: number;
  nom: string;
  email: string;
  telephone?: string;
  role: string;
  actif: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  utilisateur: Utilisateur;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nom: string;
  email: string;
  telephone?: string;
  motDePasse: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  // /auth est en dehors de /api — endpoint direct
  // private authUrl = 'http://localhost:8080/auth';
  private authUrl = `${environment.apiUrl}/auth`;

  private userSubject = new BehaviorSubject<Utilisateur | null>(null);
  public user$ = this.userSubject.asObservable();

  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly ACCESS_TOKEN_KEY = 'wijha_access_token';
  private readonly REFRESH_TOKEN_KEY = 'wijha_refresh_token';
  private readonly USER_KEY = 'wijha_user';

  constructor() {
    this.loadStoredUser();
  }

  // ========== LOGIN ==========
  login(credentials: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/login`, credentials).pipe(
      tap(response => this.handleAuthResponse(response)),
      catchError(this.handleError)
    );
  }

  // ========== REGISTER (citoyen uniquement) ==========
  register(data: RegisterRequest): Observable<Utilisateur> {
    return this.http.post<Utilisateur>(`${this.authUrl}/register`, data).pipe(
      catchError(this.handleError)
    );
  }

  // ========== REFRESH TOKEN ==========
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('Aucun refresh token'));
    }
    const body: RefreshTokenRequest = { refreshToken };
    return this.http.post<AuthResponse>(`${this.authUrl}/refresh`, body).pipe(
      tap(response => this.handleAuthResponse(response)),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  // ========== LOGOUT ==========
  logout(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  // ========== GETTERS ==========
  isAuthenticated(): boolean {
    return !!this.getAccessToken() && !!this.userSubject.value;
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  getCurrentUser(): Utilisateur | null {
    return this.userSubject.value;
  }

  // ========== PRIVATE ==========
  private handleAuthResponse(response: AuthResponse): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, response.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.utilisateur));
    this.userSubject.next(response.utilisateur);
  }

  private loadStoredUser(): void {
    const userJson = localStorage.getItem(this.USER_KEY);
    const token = this.getAccessToken();
    if (userJson && token) {
      try {
        this.userSubject.next(JSON.parse(userJson));
      } catch {
        this.logout();
      }
    }
  }

  private handleError(error: any): Observable<never> {
    console.error('Auth Error:', error);
    let message = 'Une erreur est survenue';
    if (error.error?.message) {
      message = error.error.message;
    } else if (error.status === 401) {
      message = 'Email ou mot de passe incorrect';
    } else if (error.status === 409) {
      message = 'Cet email est déjà utilisé';
    }
    return throwError(() => ({ message, status: error.status }));
  }
}


