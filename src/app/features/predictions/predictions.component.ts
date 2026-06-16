import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Match, MatchDraft, Prediction } from '../../core/models';
import { SupabaseService } from '../../core/supabase.service';

interface MatchDay {
  key: string;
  date: Date;
  matches: Match[];
  predictedCount: number;
}

@Component({
  selector: 'app-predictions',
  imports: [DatePipe, FormsModule],
  templateUrl: './predictions.component.html',
})
export class PredictionsComponent implements OnInit, OnDestroy {
  private readonly supabase = inject(SupabaseService);
  private channel: RealtimeChannel | null = null;
  private lockTimerId: number | null = null;

  readonly matches = signal<Match[]>([]);
  readonly predictions = signal<Map<number, Prediction>>(new Map());
  readonly drafts = signal<Record<number, MatchDraft>>({});
  readonly loading = signal(true);
  readonly savingMatchId = signal<number | null>(null);
  readonly message = signal('');
  readonly now = signal(Date.now());
  readonly matchDays = computed<MatchDay[]>(() => {
    const groups = new Map<string, Match[]>();
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Lima',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    for (const match of this.matches()) {
      const key = formatter.format(new Date(match.starts_at));
      groups.set(key, [...(groups.get(key) ?? []), match]);
    }

    return Array.from(groups.entries()).map(([key, matches]) => ({
      key,
      date: new Date(`${key}T12:00:00-05:00`),
      matches,
      predictedCount: matches.filter((match) => this.hasPrediction(match)).length,
    }));
  });

  async ngOnInit(): Promise<void> {
    await this.load();
    this.channel = this.supabase.subscribeToMvpChanges(() => void this.load(false));
    this.lockTimerId = window.setInterval(() => this.now.set(Date.now()), 1000);
  }

  ngOnDestroy(): void {
    this.supabase.removeChannel(this.channel);
    if (this.lockTimerId !== null) {
      window.clearInterval(this.lockTimerId);
    }
  }

  async load(showLoading = true): Promise<void> {
    if (showLoading) {
      this.loading.set(true);
    }
    this.message.set('');

    try {
      const [matches, predictions] = await Promise.all([this.supabase.getMatches(), this.supabase.getMyPredictions()]);
      const predictionMap = new Map(predictions.map((prediction) => [prediction.match_id, prediction]));
      const drafts: Record<number, MatchDraft> = {};

      for (const match of matches) {
        const prediction = predictionMap.get(match.id);
        drafts[match.id] = {
          predicted_home_score: prediction?.predicted_home_score ?? null,
          predicted_away_score: prediction?.predicted_away_score ?? null,
        };
      }

      this.matches.set(matches);
      this.predictions.set(predictionMap);
      this.drafts.set(drafts);
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : 'No se pudieron cargar los pronosticos.');
    } finally {
      this.loading.set(false);
    }
  }

  isLocked(match: Match): boolean {
    return new Date(match.starts_at).getTime() <= this.now();
  }

  hasPrediction(match: Match): boolean {
    return this.predictions().has(match.id);
  }

  async save(match: Match): Promise<void> {
    const draft = this.drafts()[match.id];
    const home = Number(draft?.predicted_home_score);
    const away = Number(draft?.predicted_away_score);

    if (!Number.isInteger(home) || !Number.isInteger(away) || home < 0 || away < 0) {
      this.message.set('Ingresa marcadores validos en ambos equipos.');
      return;
    }

    this.savingMatchId.set(match.id);
    this.message.set('');

    try {
      await this.supabase.savePrediction(match.id, home, away);
      this.message.set('Pronostico guardado.');
      await this.load(false);
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : 'No se pudo guardar el pronostico.');
    } finally {
      this.savingMatchId.set(null);
    }
  }
}
