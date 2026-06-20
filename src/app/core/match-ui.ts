import { Match } from './models';

export type MatchSectionKind = 'today' | 'upcoming' | 'past';
export type MatchVisualStatus = 'available' | 'soon' | 'locked' | 'finished';

export interface MatchDayGroup {
  key: string;
  date: Date;
  matches: Match[];
}

export interface MatchSection {
  kind: MatchSectionKind;
  title: string;
  subtitle: string;
  days: MatchDayGroup[];
  count: number;
}

interface TeamMeta {
  flag: string;
  code: string;
}

const PERU_TIME_ZONE = 'America/Lima';

const dateKeyFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: PERU_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const dayLabelFormatter = new Intl.DateTimeFormat('es-PE', {
  timeZone: PERU_TIME_ZONE,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

const timeFormatter = new Intl.DateTimeFormat('es-PE', {
  timeZone: PERU_TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

const TEAM_META: Record<string, TeamMeta> = {
  Algeria: { flag: '🇩🇿', code: 'ALG' },
  Argentina: { flag: '🇦🇷', code: 'ARG' },
  Australia: { flag: '🇦🇺', code: 'AUS' },
  Austria: { flag: '🇦🇹', code: 'AUT' },
  Belgium: { flag: '🇧🇪', code: 'BEL' },
  'Bosnia and Herzegovina': { flag: '🇧🇦', code: 'BIH' },
  Brazil: { flag: '🇧🇷', code: 'BRA' },
  Canada: { flag: '🇨🇦', code: 'CAN' },
  'Cape Verde': { flag: '🇨🇻', code: 'CPV' },
  Colombia: { flag: '🇨🇴', code: 'COL' },
  Croatia: { flag: '🇭🇷', code: 'CRO' },
  Curacao: { flag: '🇨🇼', code: 'CUW' },
  Czechia: { flag: '🇨🇿', code: 'CZE' },
  'DR Congo': { flag: '🇨🇩', code: 'COD' },
  Ecuador: { flag: '🇪🇨', code: 'ECU' },
  Egypt: { flag: '🇪🇬', code: 'EGY' },
  England: { flag: 'ENG', code: 'ENG' },
  France: { flag: '🇫🇷', code: 'FRA' },
  Germany: { flag: '🇩🇪', code: 'GER' },
  Ghana: { flag: '🇬🇭', code: 'GHA' },
  Haiti: { flag: '🇭🇹', code: 'HAI' },
  Iran: { flag: '🇮🇷', code: 'IRN' },
  Iraq: { flag: '🇮🇶', code: 'IRQ' },
  'Ivory Coast': { flag: '🇨🇮', code: 'CIV' },
  Japan: { flag: '🇯🇵', code: 'JPN' },
  Jordan: { flag: '🇯🇴', code: 'JOR' },
  Mexico: { flag: '🇲🇽', code: 'MEX' },
  Morocco: { flag: '🇲🇦', code: 'MAR' },
  Netherlands: { flag: '🇳🇱', code: 'NED' },
  'New Zealand': { flag: '🇳🇿', code: 'NZL' },
  Norway: { flag: '🇳🇴', code: 'NOR' },
  Panama: { flag: '🇵🇦', code: 'PAN' },
  Paraguay: { flag: '🇵🇾', code: 'PAR' },
  Portugal: { flag: '🇵🇹', code: 'POR' },
  Qatar: { flag: '🇶🇦', code: 'QAT' },
  'Saudi Arabia': { flag: '🇸🇦', code: 'KSA' },
  Scotland: { flag: 'SCO', code: 'SCO' },
  Senegal: { flag: '🇸🇳', code: 'SEN' },
  'South Africa': { flag: '🇿🇦', code: 'RSA' },
  'South Korea': { flag: '🇰🇷', code: 'KOR' },
  Spain: { flag: '🇪🇸', code: 'ESP' },
  Sweden: { flag: '🇸🇪', code: 'SWE' },
  Switzerland: { flag: '🇨🇭', code: 'SUI' },
  Tunisia: { flag: '🇹🇳', code: 'TUN' },
  Turkey: { flag: '🇹🇷', code: 'TUR' },
  Uruguay: { flag: '🇺🇾', code: 'URU' },
  USA: { flag: '🇺🇸', code: 'USA' },
  Uzbekistan: { flag: '🇺🇿', code: 'UZB' },
};

export function peruDateKey(value: string | number | Date): string {
  return dateKeyFormatter.format(new Date(value));
}

export function formatPeruDay(value: string | number | Date): string {
  return dayLabelFormatter.format(new Date(value));
}

export function formatPeruTime(value: string | number | Date): string {
  return timeFormatter.format(new Date(value));
}

export function buildMatchSections(matches: Match[], nowMs: number): MatchSection[] {
  const todayKey = peruDateKey(nowMs);
  const buckets: Record<MatchSectionKind, Map<string, Match[]>> = {
    today: new Map<string, Match[]>(),
    upcoming: new Map<string, Match[]>(),
    past: new Map<string, Match[]>(),
  };

  for (const match of matches) {
    const key = peruDateKey(match.starts_at);
    const startsAt = new Date(match.starts_at).getTime();
    const sectionKind: MatchSectionKind = key === todayKey ? 'today' : startsAt < nowMs ? 'past' : 'upcoming';
    buckets[sectionKind].set(key, [...(buckets[sectionKind].get(key) ?? []), match]);
  }

  return [
    createSection('today', 'Hoy', 'Partidos que se juegan hoy en hora Peru', buckets.today, true),
    createSection('upcoming', 'Proximos', 'Ordenados de mas cercano a mas lejano', buckets.upcoming, true),
    createSection('past', 'Anteriores', 'Partidos ya iniciados o finalizados', buckets.past, false),
  ].filter((section) => section.count > 0);
}

export function countdownLabel(match: Match, nowMs: number): string {
  if (match.status === 'finished') {
    return 'Finalizado';
  }

  const diffMs = new Date(match.starts_at).getTime() - nowMs;

  if (diffMs <= 0) {
    return 'Bloqueado';
  }

  const totalMinutes = Math.ceil(diffMs / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `Se bloquea en ${days}d ${hours}h`;
  }

  if (hours > 0) {
    return `Se bloquea en ${hours}h ${minutes.toString().padStart(2, '0')}m`;
  }

  return `Se bloquea en ${minutes.toString().padStart(2, '0')}m`;
}

export function visualStatus(match: Match, nowMs: number): MatchVisualStatus {
  if (match.status === 'finished') {
    return 'finished';
  }

  const diffMs = new Date(match.starts_at).getTime() - nowMs;

  if (diffMs <= 0) {
    return 'locked';
  }

  return diffMs <= 60 * 60 * 1000 ? 'soon' : 'available';
}

export function visualStatusLabel(match: Match, nowMs: number): string {
  const status = visualStatus(match, nowMs);

  if (status === 'finished') {
    return 'Finalizado';
  }

  if (status === 'locked') {
    return match.status === 'live' ? 'En vivo' : 'Bloqueado';
  }

  return status === 'soon' ? 'Por bloquear' : 'Disponible';
}

export function teamFlag(team: string): string {
  return TEAM_META[team]?.flag ?? team.slice(0, 3).toUpperCase();
}

export function teamCode(team: string): string {
  return TEAM_META[team]?.code ?? team.slice(0, 3).toUpperCase();
}

function createSection(
  kind: MatchSectionKind,
  title: string,
  subtitle: string,
  groups: Map<string, Match[]>,
  ascending: boolean,
): MatchSection {
  const days = Array.from(groups.entries())
    .map(([key, groupedMatches]) => ({
      key,
      date: new Date(`${key}T12:00:00-05:00`),
      matches: [...groupedMatches].sort((first, second) => {
        return new Date(first.starts_at).getTime() - new Date(second.starts_at).getTime();
      }),
    }))
    .sort((first, second) => {
      const diff = first.date.getTime() - second.date.getTime();
      return ascending ? diff : -diff;
    });

  return {
    kind,
    title,
    subtitle,
    days,
    count: days.reduce((total, day) => total + day.matches.length, 0),
  };
}
