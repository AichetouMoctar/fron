// src/app/pages/home/home.ts
import { Component, inject, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TransportService } from '../../services/transport';

declare var google: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  private transport = inject(TransportService);

  // Données
  network: any = null;
  selectedLigne: any = null;
  isLoading = true;

  // Carte
  private map: any = null;
  private userMarker: any = null;
  private arretMarkers: any[] = [];
  private busMarkers: any[] = [];
  private polylines: any[] = [];
  private refreshInterval: any = null;

  // État UI
  showArrets = true;
  showBus = true;
  showLignes = true;
  userPosition: { lat: number; lng: number } | null = null;

  ngOnInit() {
    this.loadNetwork();
  }

  ngAfterViewInit() {
    // Attendre que Google Maps soit chargé
    this.waitForGoogleMaps().then(() => {
      this.initMap();
    });
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  // ===== INITIALISATION =====

  private waitForGoogleMaps(): Promise<void> {
    return new Promise((resolve) => {
      if (typeof google !== 'undefined' && google.maps) {
        resolve();
        return;
      }
      const interval = setInterval(() => {
        if (typeof google !== 'undefined' && google.maps) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
  }

  private initMap() {
    const mapElement = document.getElementById('map-canvas');
    if (!mapElement) return;

    this.map = new google.maps.Map(mapElement, {
      center: { lat: 18.0735, lng: -15.9582 }, // Nouakchott
      zoom: 13,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      styles: [
        { featureType: 'poi', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', stylers: [{ visibility: 'off' }] }
      ]
    });

    // Localiser le citoyen
    this.locateUser();

    // Si les données sont déjà chargées, afficher
    if (this.network) {
      this.renderNetwork();
    }

    // Rafraîchir les bus toutes les 15 secondes
    this.refreshInterval = setInterval(() => {
      this.refreshBusPositions();
    }, 15000);
  }

  private loadNetwork() {
    this.isLoading = true;
    this.transport.getMapNetwork().subscribe({
      next: (data) => {
        this.network = data;
        this.isLoading = false;
        if (this.map) {
          this.renderNetwork();
        }
      },
      error: (err) => {
        console.error('Erreur chargement réseau:', err);
        this.isLoading = false;
      }
    });
  }

  // ===== RENDU SUR LA CARTE =====

  private renderNetwork() {
    if (!this.network || !this.map) return;

    this.clearMap();

    // 1. Tracer les lignes (polylines)
    this.renderLignes(this.network.lignes);

    // 2. Poser les arrêts
    this.renderArrets(this.network.arrets);

    // 3. Poser les bus
    this.renderBus(this.network.busEnService);
  }

  private renderArrets(arrets: any[]) {
  if (!arrets) return;

  arrets.forEach(arret => {
    if (!arret.latitude || !arret.longitude) return;

    const marker = new google.maps.Marker({
      position: {
        lat: parseFloat(arret.latitude),
        lng: parseFloat(arret.longitude)
      },
      map: this.showArrets ? this.map : null,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
            <path d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.3 21.7 0 14 0z" fill="#f59e0b" stroke="#ffffff" stroke-width="2"/>
            <circle cx="14" cy="14" r="6" fill="white"/>
            <text x="14" y="18" text-anchor="middle" font-size="12" font-weight="bold" fill="#f59e0b">H</text>
          </svg>
        `),
        scaledSize: new google.maps.Size(28, 36),
        anchor: new google.maps.Point(14, 36)
      },
      title: arret.nom
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="font-family:Inter,sans-serif;padding:8px;min-width:150px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
            <span style="background:#f59e0b;color:white;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px">🚏</span>
            <strong style="font-size:14px;color:#1e293b">${arret.nom}</strong>
          </div>
          ${arret.code ? `<span style="font-size:12px;color:#64748b">Code: ${arret.code}</span>` : ''}
        </div>
      `
    });

    marker.addListener('click', () => infoWindow.open(this.map, marker));
    this.arretMarkers.push(marker);
  });
}

  private renderLignes(lignes: any[]) {
    if (!lignes) return;

    const defaultColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

    lignes.forEach((ligne, index) => {
      if (!ligne.arrets || ligne.arrets.length < 2) return;

      const path = ligne.arrets
        .filter((a: any) => a.latitude && a.longitude)
        .map((a: any) => ({
          lat: parseFloat(a.latitude),
          lng: parseFloat(a.longitude)
        }));

      if (path.length < 2) return;

      const couleur = ligne.couleur || defaultColors[index % defaultColors.length];

      const polyline = new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: couleur,
        strokeOpacity: 0.8,
        strokeWeight: 4,
        map: this.showLignes ? this.map : null
      });

      // Info au clic sur la ligne
      polyline.addListener('click', (e: any) => {
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="font-family:Inter,sans-serif;padding:8px">
              <strong style="color:${couleur}">${ligne.code}</strong> — ${ligne.nom}
              <br><span style="font-size:12px;color:#64748b">${ligne.arretDepart} → ${ligne.arretArrivee}</span>
            </div>
          `,
          position: e.latLng
        });
        infoWindow.open(this.map);
      });

      // Stocker avec l'ID de la ligne pour le filtrage
      this.polylines.push({ polyline, ligneId: ligne.id });
    });
  }

 private renderBus(busEnService: any[]) {
  if (!busEnService) return;

  busEnService.forEach(bus => {
    if (!bus.latitude || !bus.longitude) return;

    const isAller = bus.direction === 'ALLER';
    const couleur = isAller ? '#10b981' : '#ef4444';

    const marker = new google.maps.Marker({
      position: {
        lat: parseFloat(bus.latitude),
        lng: parseFloat(bus.longitude)
      },
      map: this.showBus ? this.map : null,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
            <rect x="2" y="2" width="32" height="32" rx="8" fill="${couleur}" stroke="white" stroke-width="2"/>
            <rect x="8" y="8" width="8" height="6" rx="1" fill="rgba(255,255,255,0.9)"/>
            <rect x="20" y="8" width="8" height="6" rx="1" fill="rgba(255,255,255,0.9)"/>
            <rect x="6" y="18" width="24" height="3" rx="1" fill="rgba(255,255,255,0.3)"/>
            <circle cx="11" cy="27" r="3" fill="white" stroke="${couleur}" stroke-width="1"/>
            <circle cx="25" cy="27" r="3" fill="white" stroke="${couleur}" stroke-width="1"/>
          </svg>
        `),
        scaledSize: new google.maps.Size(36, 36),
        anchor: new google.maps.Point(18, 18)
      },
      title: `Bus ${bus.immatriculation}`,
      zIndex: 100
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="font-family:Inter,sans-serif;padding:10px;min-width:180px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <span style="background:${couleur};color:white;padding:4px 8px;border-radius:6px;font-size:12px;font-weight:600">🚌 ${bus.immatriculation}</span>
          </div>
          <div style="font-size:13px;color:#475569;line-height:1.6">
            <div><strong>Ligne:</strong> ${bus.ligneCode || '-'} — ${bus.ligneNom || ''}</div>
            <div><strong>Direction:</strong> <span style="color:${couleur};font-weight:600">${bus.direction || '-'}</span></div>
            ${bus.vitesse ? `<div><strong>Vitesse:</strong> ${Math.round(bus.vitesse)} km/h</div>` : ''}
          </div>
        </div>
      `
    });

    marker.addListener('click', () => infoWindow.open(this.map, marker));
    this.busMarkers.push(marker);
  });
}

  // ===== POSITION DU CITOYEN =====

  locateUser() {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.userPosition = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };

        if (this.userMarker) {
          this.userMarker.setPosition(this.userPosition);
        } else {
          this.userMarker = new google.maps.Marker({
            position: this.userPosition,
            map: this.map,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#3b82f6',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3
            },
            title: 'Vous êtes ici',
            zIndex: 999
          });

          // Cercle bleu autour
          new google.maps.Circle({
            map: this.map,
            center: this.userPosition,
            radius: 30,
            fillColor: '#3b82f6',
            fillOpacity: 0.15,
            strokeColor: '#3b82f6',
            strokeOpacity: 0.3,
            strokeWeight: 1
          });
        }
      },
      (err) => console.warn('Géolocalisation refusée:', err),
      { enableHighAccuracy: true }
    );
  }

  // ===== ACTIONS UI =====

  centerOnUser() {
    if (this.userPosition && this.map) {
      this.map.panTo(this.userPosition);
      this.map.setZoom(15);
    } else {
      this.locateUser();
    }
  }

  filterByLigne(ligne: any) {
    if (this.selectedLigne?.id === ligne.id) {
      // Désélectionner → tout afficher
      this.selectedLigne = null;
      this.renderNetwork();
      return;
    }

    this.selectedLigne = ligne;

    // Masquer toutes les polylines sauf celle sélectionnée
    this.polylines.forEach(p => {
      p.polyline.setMap(p.ligneId === ligne.id ? this.map : null);
    });

    // Masquer les bus des autres lignes
    this.busMarkers.forEach(m => m.setMap(null));
    if (this.network?.busEnService) {
      this.network.busEnService
        .filter((b: any) => b.ligneCode === ligne.code)
        .forEach((bus: any) => {
          const marker = this.busMarkers.find(m =>
            m.getTitle() === `Bus ${bus.immatriculation}`
          );
          if (marker) marker.setMap(this.map);
        });
    }

    // Zoomer sur la ligne
    this.transport.getMapLinePath(ligne.id).subscribe({
      next: (data) => {
        if (data.arrets && data.arrets.length > 0) {
          const bounds = new google.maps.LatLngBounds();
          data.arrets.forEach((a: any) => {
            bounds.extend({
              lat: parseFloat(a.latitude),
              lng: parseFloat(a.longitude)
            });
          });
          this.map.fitBounds(bounds, 50);
        }
      }
    });
  }

  toggleArrets() {
    this.showArrets = !this.showArrets;
    this.arretMarkers.forEach(m => m.setMap(this.showArrets ? this.map : null));
  }

  toggleBus() {
    this.showBus = !this.showBus;
    this.busMarkers.forEach(m => m.setMap(this.showBus ? this.map : null));
  }

  toggleLignes() {
    this.showLignes = !this.showLignes;
    this.polylines.forEach(p => p.polyline.setMap(this.showLignes ? this.map : null));
  }

  refreshMap() {
    this.loadNetwork();
  }

  // ===== UTILITAIRES =====

  private refreshBusPositions() {
    this.transport.getMapNetwork().subscribe({
      next: (data) => {
        // Supprimer les anciens bus
        this.busMarkers.forEach(m => m.setMap(null));
        this.busMarkers = [];
        // Ajouter les nouveaux
        this.renderBus(data.busEnService);
      }
    });
  }

  private clearMap() {
    this.arretMarkers.forEach(m => m.setMap(null));
    this.busMarkers.forEach(m => m.setMap(null));
    this.polylines.forEach(p => p.polyline.setMap(null));
    this.arretMarkers = [];
    this.busMarkers = [];
    this.polylines = [];
  }
}




