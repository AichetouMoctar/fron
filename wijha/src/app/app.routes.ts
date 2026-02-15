import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Pages publiques (pas de layout)
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then(m => m.RegisterComponent)
  },

  // Pages protégées (avec layout)
  {
    path: 'home',
    loadComponent: () => import('./components/home/home').then(m => m.HomeComponent),
    canActivate: [authGuard]
  },
  {
    path: 'lines',
    loadComponent: () => import('./components/line-list/line-list.component').then(m => m.LineListComponent),
    canActivate: [authGuard]
  },
    {
    path: 'profile',
    loadComponent: () => import('./components/profile/profile').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  // {
  //   path: 'lines/:id',
  //   loadComponent: () => import('./pages/line-detail/line-detail.component').then(m => m.LineDetailComponent),
  //   canActivate: [authGuard]
  // },
  // {
  //   path: 'stops',
  //   loadComponent: () => import('./pages/stops/stops.component').then(m => m.StopsComponent),
  //   canActivate: [authGuard]
  // },

  // Redirections
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' }
];

