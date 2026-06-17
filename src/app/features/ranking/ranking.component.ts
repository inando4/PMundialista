import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RealtimeChannel } from '@supabase/supabase-js';
import { LeaderboardRow } from '../../core/models';
import { SupabaseService } from '../../core/supabase.service';

@Component({
  selector: 'app-ranking',
  imports: [RouterLink],
  templateUrl: './ranking.component.html',
})
export class RankingComponent implements OnInit, OnDestroy {
  private readonly supabase = inject(SupabaseService);
  private channel: RealtimeChannel | null = null;

  readonly rows = signal<LeaderboardRow[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  async ngOnInit(): Promise<void> {
    await this.load();
    this.channel = this.supabase.subscribeToMvpChanges(() => void this.load());
  }

  ngOnDestroy(): void {
    this.supabase.removeChannel(this.channel);
  }

  async load(): Promise<void> {
    this.error.set('');
    try {
      this.rows.set(await this.supabase.getLeaderboard());
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'No se pudo cargar el ranking.');
    } finally {
      this.loading.set(false);
    }
  }
}
