export type MatchStatus = 'scheduled' | 'live' | 'finished';

export interface Profile {
  id: string;
  display_name: string;
  email: string;
  has_paid: boolean;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: number;
  home_team: string;
  away_team: string;
  starts_at: string;
  stage: string;
  home_score: number | null;
  away_score: number | null;
  status: MatchStatus;
  created_at: string;
  updated_at: string;
}

export interface Prediction {
  id: number;
  user_id: string;
  match_id: number;
  predicted_home_score: number;
  predicted_away_score: number;
  created_at: string;
  updated_at: string;
}

export interface LeaderboardRow {
  profile_id: string;
  display_name: string;
  email: string;
  has_paid: boolean;
  points: number;
  correct_results: number;
  exact_scores: number;
}

export interface ScoringRules {
  id: string;
  result_points: number;
  exact_bonus_points: number;
  updated_at: string;
}

export interface MatchDraft {
  predicted_home_score: number | null;
  predicted_away_score: number | null;
}
