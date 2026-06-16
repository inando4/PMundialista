import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SupabaseService } from './core/supabase.service';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private readonly supabase = inject(SupabaseService);

  readonly user = this.supabase.user;
  readonly isAdmin = computed(() => this.supabase.isAdmin());

  signOut(): void {
    void this.supabase.signOut();
  }
}
