import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Match, Profile, ScoringRules } from '../../core/models';
import { formatPeruDay, formatPeruTime, peruDateKey, teamCode, teamFlag } from '../../core/match-ui';
import { SupabaseService } from '../../core/supabase.service';

interface ResultDraft {
  home_score: number | null;
  away_score: number | null;
  status: string;
}

interface ResultDay {
  key: string;
  date: Date;
  matches: Match[];
  finishedCount: number;
}

@Component({
  selector: 'app-admin',
  imports: [FormsModule],
  templateUrl: './admin.component.html',
})
export class AdminComponent implements OnInit {
  private readonly supabase = inject(SupabaseService);

  readonly matches = signal<Match[]>([]);
  readonly profiles = signal<Profile[]>([]);
  readonly rules = signal<ScoringRules | null>(null);
  readonly resultDrafts = signal<Record<number, ResultDraft>>({});
  readonly resultPoints = signal(1);
  readonly exactBonusPoints = signal(3);
  readonly loading = signal(true);
  readonly message = signal('');
  readonly formatPeruDay = formatPeruDay;
  readonly formatPeruTime = formatPeruTime;
  readonly teamCode = teamCode;
  readonly teamFlag = teamFlag;
  readonly todayKey = peruDateKey(Date.now());
  readonly resultDays = computed<ResultDay[]>(() => {
    const groups = new Map<string, Match[]>();

    for (const match of this.matches()) {
      const key = peruDateKey(match.starts_at);
      groups.set(key, [...(groups.get(key) ?? []), match]);
    }

    return Array.from(groups.entries()).map(([key, matches]) => ({
      key,
      date: new Date(`${key}T12:00:00-05:00`),
      matches,
      finishedCount: matches.filter((match) => this.resultDrafts()[match.id]?.status === 'finished').length,
    }));
  });

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  isResultDayOpen(day: ResultDay): boolean {
    return day.key === this.todayKey;
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.message.set('');

    try {
      const [matches, profiles, rules] = await Promise.all([
        this.supabase.getMatches(),
        this.supabase.getProfiles(),
        this.supabase.getScoringRules(),
      ]);
      const drafts: Record<number, ResultDraft> = {};

      for (const match of matches) {
        drafts[match.id] = {
          home_score: match.home_score,
          away_score: match.away_score,
          status: match.status,
        };
      }

      this.matches.set(matches);
      this.profiles.set(profiles);
      this.rules.set(rules);
      this.resultDrafts.set(drafts);
      this.resultPoints.set(rules.result_points);
      this.exactBonusPoints.set(rules.exact_bonus_points);
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : 'No se pudo cargar el panel admin.');
    } finally {
      this.loading.set(false);
    }
  }

  async saveResult(match: Match): Promise<void> {
    const draft = this.resultDrafts()[match.id];
    const home = draft.home_score === null || draft.home_score === undefined ? null : Number(draft.home_score);
    const away = draft.away_score === null || draft.away_score === undefined ? null : Number(draft.away_score);

    if (draft.status === 'finished' && (!Number.isInteger(home) || !Number.isInteger(away))) {
      this.message.set('Para finalizar un partido debes cargar ambos marcadores.');
      return;
    }

    try {
      await this.supabase.updateMatchResult(match, home, away, draft.status);
      this.message.set('Resultado actualizado.');
      await this.load();
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : 'No se pudo actualizar el resultado.');
    }
  }

  async togglePaid(profile: Profile): Promise<void> {
    try {
      await this.supabase.updatePayment(profile, !profile.has_paid);
      await this.load();
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : 'No se pudo actualizar el pago.');
    }
  }

  async deleteProfile(profile: Profile): Promise<void> {
    const confirmed = window.confirm(`Eliminar a ${profile.display_name} del ranking?`);
    if (!confirmed) {
      return;
    }

    try {
      await this.supabase.deleteProfile(profile);
      await this.load();
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : 'No se pudo eliminar el participante.');
    }
  }

  async saveRules(): Promise<void> {
    const result = Number(this.resultPoints());
    const bonus = Number(this.exactBonusPoints());

    if (!Number.isInteger(result) || !Number.isInteger(bonus) || result < 0 || bonus < 0) {
      this.message.set('Las reglas deben ser numeros enteros positivos.');
      return;
    }

    try {
      await this.supabase.updateScoringRules(result, bonus);
      this.message.set('Reglas actualizadas.');
      await this.load();
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : 'No se pudieron actualizar las reglas.');
    }
  }
}
