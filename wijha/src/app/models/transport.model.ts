export interface Ligne {
  id: number;
  numero: string;
  nom: string;
}

export interface Arret {
  id: number;
  nom: string;
  latitude: number;
  longitude: number;
}

export interface LigneArret {
  arretId: number;
  arretNom: string;
  ordre: number;
  distance: number;
}

export interface Horaire {
  id: number;
  heureDepart: string;
  heureFin: string;
}