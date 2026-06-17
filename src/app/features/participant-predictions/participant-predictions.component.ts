import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Match, Prediction, Profile } from '../../core/models';
import { SupabaseService } from '../../core/supabase.service';

interface ReadonlyMatchDay {
  key: string;
  date: Date;
  matches: Match[];
  visibleCount: number;
}

@Component({
  selector: 'app-participant-predictions',
  imports: [DatePipe, RouterLink],
  templateUrl: './participant-predictions.component.html',
})
export class ParticipantPredictionsComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly supabase = inject(SupabaseService);
  private channel: RealtimeChannel | null = null;
  private timerId: number | null = null;
  private lastNow = Date.now();

  readonly profileId = this.route.snapshot.paramMap.get('profileId') ?? '';
  readonly profile = signal<Profile | null>(null);
  readonly matches = signal<Match[]>([]);
  readonly predictions = signal<Map<number, Prediction>>(new Map());
  readonly loading = signal(true);
  readonly message = signal('');
  readonly now = signal(Date.now());
  readonly isOwnProfile = computed(() => this.profileId === this.supabase.user()?.id);
  readonly matchDays = computed<ReadonlyMatchDay[]>(() => {
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
      visibleCount: matches.filter((match) => this.canShowPrediction(match) && this.hasPrediction(match)).length,
    }));
  });

  async ngOnInit(): Promise<void> {
    await this.load();
    this.channel = this.supabase.subscribeToMvpChanges(() => void this.load(false));
    this.timerId = window.setInterval(() => this.tick(), 1000);
  }

  ngOnDestroy(): void {
    this.supabase.removeChannel(this.channel);
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
    }
  }

  async load(showLoading = true): Promise<void> {
    if (showLoading) {
      this.loading.set(true);
    }
    this.message.set('');

    try {
      const [profile, matches, predictions] = await Promise.all([
        this.supabase.getProfile(this.profileId),
        this.supabase.getMatches(),
        this.supabase.getPredictionsByProfile(this.profileId),
      ]);

      this.profile.set(profile);
      this.matches.set(matches);
      this.predictions.set(new Map(predictions.map((prediction) => [prediction.match_id, prediction])));
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : 'No se pudieron cargar los pronosticos del participante.');
    } finally {
      this.loading.set(false);
    }
  }

  canShowPrediction(match: Match): boolean {
    return this.isOwnProfile() || new Date(match.starts_at).getTime() <= this.now();
  }

  hasPrediction(match: Match): boolean {
    return this.predictions().has(match.id);
  }

  predictionFor(match: Match): Prediction | undefined {
    return this.predictions().get(match.id);
  }

  private tick(): void {
    const currentNow = Date.now();
    const crossedStartTime = this.matches().some((match) => {
      const startsAt = new Date(match.starts_at).getTime();
      return startsAt > this.lastNow && startsAt <= currentNow;
    });

    this.lastNow = currentNow;
    this.now.set(currentNow);

    if (crossedStartTime && !this.isOwnProfile()) {
      void this.load(false);
    }
  }
}
