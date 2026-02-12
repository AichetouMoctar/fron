import { Utilisateur } from './utilisateur.model';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  utilisateur: Utilisateur;
}