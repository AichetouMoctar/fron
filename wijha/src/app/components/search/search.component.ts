import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchService } from '../../services/search.service';
import { Arret } from '../../models/transport.model';
import { ItineraireResult } from '../../models/search-request.model';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  departQuery = '';
  arriveeQuery = '';
  suggestionsDepart: Arret[] = [];
  suggestionsArrivee: Arret[] = [];
  selectedDepart?: Arret;
  selectedArrivee?: Arret;

  // On envoie les résultats au parent (LineListComponent) pour affichage
  @Output() searchFound = new EventEmitter<ItineraireResult[]>();

  constructor(private searchService: SearchService) {}

  onSearch(type: 'depart' | 'arrivee') {
    const query = type === 'depart' ? this.departQuery : this.arriveeQuery;
    if (query.length > 2) {
      this.searchService.autocomplete(query).subscribe(data => {
        type === 'depart' ? this.suggestionsDepart = data : this.suggestionsArrivee = data;
      });
    }
  }

  select(arret: Arret, type: 'depart' | 'arrivee') {
    if (type === 'depart') {
      this.selectedDepart = arret;
      this.departQuery = arret.nom;
      this.suggestionsDepart = [];
    } else {
      this.selectedArrivee = arret;
      this.arriveeQuery = arret.nom;
      this.suggestionsArrivee = [];
    }
  }

  launchSearch() {
    if (!this.selectedDepart || !this.selectedArrivee) return;
    this.searchService.searchRoutes({
      departId: this.selectedDepart.id,
      arriveeId: this.selectedArrivee.id
    }).subscribe(results => this.searchFound.emit(results));
  }
}