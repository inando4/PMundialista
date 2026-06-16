import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from './supabase.service';

export const authGuard: CanActivateFn = async () => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);
  const session = supabase.session() ?? (await supabase.client.auth.getSession()).data.session;

  if (session) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

export const adminGuard: CanActivateFn = async () => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);
  const session = supabase.session() ?? (await supabase.client.auth.getSession()).data.session;

  if (session && supabase.isAdmin(session.user)) {
    return true;
  }

  return router.createUrlTree(['/ranking']);
};
