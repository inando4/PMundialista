import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthChangeEvent, createClient, RealtimeChannel, Session, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { LeaderboardRow, Match, Prediction, Profile, ScoringRules } from './models';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  readonly client: SupabaseClient;
  readonly session = signal<Session | null>(null);
  readonly user = signal<User | null>(null);

  constructor(private readonly router: Router) {
    this.client = createClient(environment.supabaseUrl, environment.supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });

    void this.client.auth.getSession().then(({ data }) => {
      this.session.set(data.session);
      this.user.set(data.session?.user ?? null);
    });

    this.client.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      this.session.set(session);
      this.user.set(session?.user ?? null);
    });
  }

  isConfigured(): boolean {
    return !environment.supabaseUrl.includes('YOUR-PROJECT') && !environment.supabaseAnonKey.includes('YOUR-SUPABASE');
  }

  isAdmin(user = this.user()): boolean {
    const email = user?.email?.toLowerCase();
    return !!email && environment.adminEmails.map((item) => item.toLowerCase()).includes(email);
  }

  async signIn(email: string, password: string): Promise<void> {
    const { error } = await this.client.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }
  }

  async signUp(email: string, password: string, displayName: string): Promise<void> {
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });

    if (error) {
      throw error;
    }

    if (data.user && data.session) {
      await this.upsertMyProfile(displayName, email, data.user.id);
    }
  }

  async signOut(): Promise<void> {
    await this.client.auth.signOut();
    await this.router.navigateByUrl('/login');
  }

  async upsertMyProfile(displayName: string, email: string, userId = this.user()?.id): Promise<void> {
    if (!userId) {
      return;
    }

    const { error } = await this.client.from('profiles').upsert({
      id: userId,
      display_name: displayName,
      email,
    });

    if (error) {
      throw error;
    }
  }

  async getMatches(): Promise<Match[]> {
    const { data, error } = await this.client.from('matches').select('*').order('starts_at', { ascending: true });
    if (error) {
      throw error;
    }
    return data ?? [];
  }

  async getMyPredictions(): Promise<Prediction[]> {
    const userId = this.user()?.id;
    if (!userId) {
      return [];
    }

    const { data, error } = await this.client.from('predictions').select('*').eq('user_id', userId);
    if (error) {
      throw error;
    }
    return data ?? [];
  }

  async savePrediction(matchId: number, homeScore: number, awayScore: number): Promise<void> {
    const userId = this.user()?.id;
    if (!userId) {
      throw new Error('Debes iniciar sesion para guardar pronosticos.');
    }

    const { error } = await this.client.from('predictions').upsert(
      {
        user_id: userId,
        match_id: matchId,
        predicted_home_score: homeScore,
        predicted_away_score: awayScore,
      },
      { onConflict: 'user_id,match_id' },
    );

    if (error) {
      throw error;
    }
  }

  async getLeaderboard(): Promise<LeaderboardRow[]> {
    const { data, error } = await this.client
      .from('leaderboard')
      .select('*')
      .order('points', { ascending: false })
      .order('exact_scores', { ascending: false })
      .order('correct_results', { ascending: false });

    if (error) {
      throw error;
    }
    return data ?? [];
  }

  async getProfiles(): Promise<Profile[]> {
    const { data, error } = await this.client.from('profiles').select('*').order('display_name');
    if (error) {
      throw error;
    }
    return data ?? [];
  }

  async updatePayment(profile: Profile, hasPaid: boolean): Promise<void> {
    const { error } = await this.client.from('profiles').update({ has_paid: hasPaid }).eq('id', profile.id);
    if (error) {
      throw error;
    }
    await this.insertHistory('profiles', profile.id, 'payment_update', profile, { ...profile, has_paid: hasPaid });
  }

  async deleteProfile(profile: Profile): Promise<void> {
    const { error } = await this.client.from('profiles').delete().eq('id', profile.id);
    if (error) {
      throw error;
    }
    await this.insertHistory('profiles', profile.id, 'delete', profile, null);
  }

  async getScoringRules(): Promise<ScoringRules> {
    const { data, error } = await this.client.from('scoring_rules').select('*').eq('id', 'default').single();
    if (error) {
      throw error;
    }
    return data;
  }

  async updateScoringRules(resultPoints: number, exactBonusPoints: number): Promise<void> {
    const before = await this.getScoringRules();
    const after = {
      id: 'default',
      result_points: resultPoints,
      exact_bonus_points: exactBonusPoints,
    };
    const { error } = await this.client.from('scoring_rules').update(after).eq('id', 'default');
    if (error) {
      throw error;
    }
    await this.insertHistory('scoring_rules', 'default', 'update', before, after);
  }

  async updateMatchResult(match: Match, homeScore: number | null, awayScore: number | null, status: string): Promise<void> {
    const after = {
      home_score: homeScore,
      away_score: awayScore,
      status,
    };
    const { error } = await this.client.from('matches').update(after).eq('id', match.id);
    if (error) {
      throw error;
    }
    await this.insertHistory('matches', String(match.id), 'result_update', match, { ...match, ...after });
  }

  subscribeToMvpChanges(onChange: () => void): RealtimeChannel {
    return this.client
      .channel('mvp-refresh')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, onChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'predictions' }, onChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, onChange)
      .subscribe();
  }

  removeChannel(channel: RealtimeChannel | null): void {
    if (channel) {
      void this.client.removeChannel(channel);
    }
  }

  private async insertHistory(entity: string, entityId: string, changeType: string, beforeData: unknown, afterData: unknown): Promise<void> {
    const { error } = await this.client.from('change_history').insert({
      actor_id: this.user()?.id ?? null,
      entity,
      entity_id: entityId,
      change_type: changeType,
      before_data: beforeData,
      after_data: afterData,
    });

    if (error) {
      throw error;
    }
  }
}
