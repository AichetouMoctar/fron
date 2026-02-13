import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TransportService } from '../../services/transport.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  private transport = inject(TransportService);

  lignes: any[] = [];
  nearbyStops: any[] = [];
  isSearchingNearby = false;
  stats = { lignes: 0, arrets: 0, bus: 0 };

  ngOnInit() {
    this.transport.getLines().subscribe({
      next: (data) => {
        this.lignes = data;
        this.stats.lignes = data.length;
      }
    });
  }

  findNearby() {
    this.isSearchingNearby = true;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.transport.getNearbyStops(pos.coords.latitude, pos.coords.longitude).subscribe({
            next: (data) => { this.nearbyStops = data; this.isSearchingNearby = false; },
            error: () => this.isSearchingNearby = false
          });
        },
        () => this.isSearchingNearby = false
      );
    }
  }
}