import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Match, Prediction, Profile } from '../../core/models';
import {
  MatchSection,
  buildMatchSections,
  countdownLabel,
  formatPeruDay,
  formatPeruTime,
  teamCode,
  teamFlag,
  visualStatus,
  visualStatusLabel,
} from '../../core/match-ui';
import { SupabaseService } from '../../core/supabase.service';

@Component({
  selector: 'app-participant-predictions',
  imports: [RouterLink],
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
  readonly matchSections = computed<MatchSection[]>(() => buildMatchSections(this.matches(), this.now()));
  readonly countdownLabel = countdownLabel;
  readonly formatPeruDay = formatPeruDay;
  readonly formatPeruTime = formatPeruTime;
  readonly teamCode = teamCode;
  readonly teamFlag = teamFlag;
  readonly visualStatus = visualStatus;
  readonly visualStatusLabel = visualStatusLabel;

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

  visibleCount(matches: Match[]): number {
    return matches.filter((match) => this.canShowPrediction(match) && this.hasPrediction(match)).length;
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
