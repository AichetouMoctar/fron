export interface SearchRequest {
  departId: number;
  arriveeId: number;
}

export interface ItineraireResult {
  ligneNom: string;
  arretDepart: string;
  arretArrivee: string;
  dureeEstimee: number;
  prix: number;
  // Ajoute d'autres champs si ton API en renvoie (ex: distance, correspondance)
}