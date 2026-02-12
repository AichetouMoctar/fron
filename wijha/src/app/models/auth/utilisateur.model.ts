export interface Utilisateur {
  id: number;
  nom: string;
  email: string;
  telephone?: string;
  role: 'ADMIN_STP' | 'GESTIONNAIRE' | 'CHAUFFEUR' | 'CITOYEN';
  actif: boolean;
  latitude?: number;
  longitude?: number;
  derniereConnexion?: string; // ISO date
  createdAt?: string;
  updatedAt?: string;
}