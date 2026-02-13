import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  showLayout = false;
  mobileMenuOpen = false;

  // Pages sans layout
  private noLayoutRoutes = ['/login', '/register'];

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.showLayout = !this.noLayoutRoutes.includes(event.urlAfterRedirects);
      this.mobileMenuOpen = false; // Fermer le menu mobile après navigation
    });
  }

  navItems = [
    { path: '/home',   label: 'Accueil',  icon: 'fas fa-home' },
    { path: '/lines',  label: 'Lignes',   icon: 'fas fa-route' },
    { path: '/stops',  label: 'Arrêts',   icon: 'fas fa-map-marker-alt' },
  ];

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  logout() {
    this.authService.logout();
  }
}



// import { Component } from '@angular/core';
// import { RouterOutlet } from '@angular/router';

// @Component({
//   selector: 'app-root',
//   imports: [RouterOutlet],
//   templateUrl: './app.component.html',
//   styleUrl: './app.component.css'
// })
// export class AppComponent {
//   title = 'wijha';
// }
