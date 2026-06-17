import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'actualizar-password',
    loadComponent: () => import('./features/update-password/update-password.component').then((m) => m.UpdatePasswordComponent),
  },
  {
    path: 'ranking',
    canActivate: [authGuard],
    loadComponent: () => import('./features/ranking/ranking.component').then((m) => m.RankingComponent),
  },
  {
    path: 'participante/:profileId/pronosticos',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/participant-predictions/participant-predictions.component').then((m) => m.ParticipantPredictionsComponent),
  },
  {
    path: 'pronosticos',
    canActivate: [authGuard],
    loadComponent: () => import('./features/predictions/predictions.component').then((m) => m.PredictionsComponent),
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/admin.component').then((m) => m.AdminComponent),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'ranking',
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
