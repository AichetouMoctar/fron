import { Component, OnInit } from '@angular/core';
import { TransportService } from '../../services/transport.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-line-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './line-list.component.html',
  styleUrls: ['./line-list.component.css']
})
export class LineListComponent implements OnInit {
  // Données pour les APIs 1, 3, 4
  lignes: any[] = [];
  selectedLigne: any = null;
  arrets: any[] = [];
  horaires: any[] = [];

  // Données pour l'API 5 (Détails d'un arrêt spécifique)
  selectedStopDetails: any = null;

  // Données pour l'API 6 (Arrêts à proximité)
  nearbyStops: any[] = [];
  isSearchingNearby: boolean = false;

  constructor(private transportService: TransportService) {}

  ngOnInit(): void {
    this.loadAllLines();
  }

  // API 1 : Charger toutes les lignes
  loadAllLines(): void {
    this.transportService.getLines().subscribe({
      next: (data) => this.lignes = data,
      error: (err) => console.error('Erreur lignes:', err)
    });
  }

  // API 2, 3 et 4 : Quand on clique sur une ligne
  onSelectLigne(ligne: any) {
    this.selectedLigne = ligne;
    this.selectedStopDetails = null; // Reset les détails d'arrêt précédents

    // Charger les arrêts de la ligne (API 3)
    this.transportService.getLineStops(ligne.id).subscribe(data => {
      this.arrets = data;
    });

    // Charger les horaires (API 4)
    this.transportService.getLineSchedule(ligne.id).subscribe(data => {
      this.horaires = data;
    });
  }

  // API 5 : Charger les détails d'un arrêt quand on clique dessus dans la liste
  onSelectStop(stopId: number) {
    this.transportService.getStopDetail(stopId).subscribe({
      next: (data) => this.selectedStopDetails = data,
      error: (err) => console.error('Erreur détails arrêt:', err)
    });
  }

  // API 6 : Trouver les arrêts proches via la position du navigateur
  findNearbyStops() {
    this.isSearchingNearby = true;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          
          this.transportService.getNearbyStops(lat, lon).subscribe({
            next: (data) => {
              this.nearbyStops = data;
              this.isSearchingNearby = false;
            },
            error: (err) => {
              console.error('Erreur arrêts proches:', err);
              this.isSearchingNearby = false;
            }
          });
        },
        (error) => {
          console.error('Erreur Géolocalisation:', error);
          this.isSearchingNearby = false;
        }
      );
    } else {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
      this.isSearchingNearby = false;
    }
  }
}