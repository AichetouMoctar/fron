import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard'; 
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';

export const routes: Routes = [
  // Pages publiques
  {
    path: 'login',component :LoginComponent
  },
  {
    path: 'register',component : RegisterComponent
  },

  // Pages protégées (nécessitent authentification)
//   {
//     path: 'taches',
//     loadComponent: () => import('./pages/taches/taches').then(m => m.Taches),
//     canActivate: [authGuard]
//   },
//   {
//     path: 'students',
//     loadComponent: () => import('./pages/student/student').then(m => m.Student),
//     canActivate: [authGuard]
//   },
//   {
//     path: 'articles',
//     loadComponent: () => import('./pages/articles/articles').then(m => m.Articles),
//     canActivate: [authGuard]
//   },

//   // Redirections
//   { path: '', redirectTo: '/taches', pathMatch: 'full' },
//   { path: '**', redirectTo: '/taches' }
];