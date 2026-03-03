import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransportService } from '../../services/transport.service';

@Component({
  selector: 'app-line-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './line-list.component.html',
  styleUrls: ['./line-list.component.css']
})
export class LineListComponent implements OnInit {
  private transport = inject(TransportService);

  lignes: any[] = [];
  filteredLignes: any[] = [];
  searchQuery = '';
  isLoading = true;

  // Détail ligne
  selectedLigne: any = null;
  arrets: any[] = [];
  horaires: any[] = [];
  
  // Détail arrêt et Plan de passage
  selectedStopDetails: any = null;
  selectedPlan: any = null; 

  ngOnInit(): void {
    this.loadLines();
  }

  loadLines(): void {
    this.transport.getLines().subscribe({
      next: (data) => {
        this.lignes = data;
        this.filteredLignes = data;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  onSearch() {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) {
      this.filteredLignes = this.lignes;
      return;
    }
    this.filteredLignes = this.lignes.filter(l =>
      l.nom?.toLowerCase().includes(q) ||
      l.code?.toLowerCase().includes(q)
    );
  }

  onSelectLigne(ligne: any) {
    if (this.selectedLigne?.id === ligne.id) {
      this.selectedLigne = null;
      return;
    }

    this.selectedLigne = ligne;
    this.arrets = [];
    this.horaires = [];
    this.selectedStopDetails = null;
    this.selectedPlan = null;

    this.transport.getLineStops(ligne.id).subscribe({
      next: (data) => this.arrets = data
    });

    this.transport.getLineSchedule(ligne.id).subscribe({
      next: (data) => this.horaires = data
    });
  }

  onSelectStop(stopId: number) {
    // 1. Charger les infos de base de l'arrêt
    this.transport.getStopDetail(stopId).subscribe({
      next: (data) => this.selectedStopDetails = data
    });

    // 2. Charger le plan de passage (les lignes et horaires calculés)
    this.transport.getStopPlan(stopId).subscribe({
      next: (data) => this.selectedPlan = data,
      error: (err) => console.error("Erreur lors du chargement du plan", err)
    });
  }

  // Méthode pour télécharger le PDF
  exportPdf(stopId: number) {
    this.transport.downloadStopPlanPdf(stopId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `plan_passage_arret_${stopId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error("Erreur lors du téléchargement du PDF", err);
        alert("Impossible de générer le PDF. Vérifiez votre connexion.");
      }
    });
  }

  closeDetail() {
    this.selectedLigne = null;
    this.selectedStopDetails = null;
    this.selectedPlan = null;
  }
}