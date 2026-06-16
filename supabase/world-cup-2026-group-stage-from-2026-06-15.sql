-- FIFA World Cup 2026 group-stage matches from June 15 through June 27, 2026.
-- Times below are written in Peru time (America/Lima, UTC-05:00).
-- The matches.starts_at column is timestamptz, so Supabase stores the exact UTC instant.
--
-- Sources checked on June 16, 2026:
-- - FIFA schedule page: https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/articles/calendario-fixture-mundial-2026-partidos-fechas
-- - Economic Times IST schedule, which lists all fixtures and kickoff times.
-- - FIFA-indexed schedule summaries confirming group stage dates: June 11-27, 2026.
--
-- Safe to rerun: it inserts only rows that do not already exist with the same teams and kickoff.

insert into public.matches (home_team, away_team, starts_at, stage)
select home_team, away_team, starts_at::timestamptz, stage
from (
  values
    ('Spain', 'Cape Verde', '2026-06-15 11:00:00-05', 'Grupo H - Atlanta'),
    ('Belgium', 'Egypt', '2026-06-15 14:00:00-05', 'Grupo G - Seattle'),
    ('Saudi Arabia', 'Uruguay', '2026-06-15 17:00:00-05', 'Grupo H - Miami'),
    ('Iran', 'New Zealand', '2026-06-15 20:00:00-05', 'Grupo G - Los Angeles'),
    ('France', 'Senegal', '2026-06-16 14:00:00-05', 'Grupo I - New Jersey'),
    ('Iraq', 'Norway', '2026-06-16 17:00:00-05', 'Grupo I - Foxborough'),
    ('Argentina', 'Algeria', '2026-06-16 20:00:00-05', 'Grupo J - Kansas City'),
    ('Austria', 'Jordan', '2026-06-16 23:00:00-05', 'Grupo J - Santa Clara'),
    ('Portugal', 'DR Congo', '2026-06-17 12:00:00-05', 'Grupo K - Houston'),
    ('England', 'Croatia', '2026-06-17 15:00:00-05', 'Grupo L - Arlington'),
    ('Ghana', 'Panama', '2026-06-17 18:00:00-05', 'Grupo L - Toronto'),
    ('Uzbekistan', 'Colombia', '2026-06-17 21:00:00-05', 'Grupo K - Mexico City'),
    ('Czechia', 'South Africa', '2026-06-18 11:00:00-05', 'Grupo A - Atlanta'),
    ('Switzerland', 'Bosnia and Herzegovina', '2026-06-18 14:00:00-05', 'Grupo B - Los Angeles'),
    ('Canada', 'Qatar', '2026-06-18 17:00:00-05', 'Grupo B - Vancouver'),
    ('Mexico', 'South Korea', '2026-06-18 20:00:00-05', 'Grupo A - Guadalajara'),
    ('USA', 'Australia', '2026-06-19 14:00:00-05', 'Grupo D - Seattle'),
    ('Scotland', 'Morocco', '2026-06-19 17:00:00-05', 'Grupo C - Foxborough'),
    ('Brazil', 'Haiti', '2026-06-19 19:30:00-05', 'Grupo C - Philadelphia'),
    ('Turkey', 'Paraguay', '2026-06-19 22:00:00-05', 'Grupo D - Santa Clara'),
    ('Netherlands', 'Sweden', '2026-06-20 12:00:00-05', 'Grupo F - Houston'),
    ('Germany', 'Ivory Coast', '2026-06-20 15:00:00-05', 'Grupo E - Toronto'),
    ('Ecuador', 'Curacao', '2026-06-20 19:00:00-05', 'Grupo E - Kansas City'),
    ('Tunisia', 'Japan', '2026-06-20 23:00:00-05', 'Grupo F - Guadalajara'),
    ('Spain', 'Saudi Arabia', '2026-06-21 11:00:00-05', 'Grupo H - Atlanta'),
    ('Belgium', 'Iran', '2026-06-21 14:00:00-05', 'Grupo G - Los Angeles'),
    ('Uruguay', 'Cape Verde', '2026-06-21 17:00:00-05', 'Grupo H - Miami'),
    ('New Zealand', 'Egypt', '2026-06-21 20:00:00-05', 'Grupo G - Vancouver'),
    ('Argentina', 'Austria', '2026-06-22 12:00:00-05', 'Grupo J - Arlington'),
    ('France', 'Iraq', '2026-06-22 16:00:00-05', 'Grupo I - Philadelphia'),
    ('Norway', 'Senegal', '2026-06-22 19:00:00-05', 'Grupo I - Toronto'),
    ('Jordan', 'Algeria', '2026-06-22 22:00:00-05', 'Grupo J - Santa Clara'),
    ('Portugal', 'Uzbekistan', '2026-06-23 12:00:00-05', 'Grupo K - Houston'),
    ('England', 'Ghana', '2026-06-23 15:00:00-05', 'Grupo L - Foxborough'),
    ('Panama', 'Croatia', '2026-06-23 18:00:00-05', 'Grupo L - Toronto'),
    ('Colombia', 'DR Congo', '2026-06-23 21:00:00-05', 'Grupo K - Guadalajara'),
    ('Switzerland', 'Canada', '2026-06-24 14:00:00-05', 'Grupo B - Vancouver'),
    ('Bosnia and Herzegovina', 'Qatar', '2026-06-24 14:00:00-05', 'Grupo B - Seattle'),
    ('Morocco', 'Haiti', '2026-06-24 17:00:00-05', 'Grupo C - Atlanta'),
    ('Scotland', 'Brazil', '2026-06-24 17:00:00-05', 'Grupo C - Miami'),
    ('South Africa', 'South Korea', '2026-06-24 20:00:00-05', 'Grupo A - Guadalajara'),
    ('Czechia', 'Mexico', '2026-06-24 20:00:00-05', 'Grupo A - Mexico City'),
    ('Curacao', 'Ivory Coast', '2026-06-25 15:00:00-05', 'Grupo E - Philadelphia'),
    ('Ecuador', 'Germany', '2026-06-25 15:00:00-05', 'Grupo E - New Jersey'),
    ('Tunisia', 'Netherlands', '2026-06-25 18:00:00-05', 'Grupo F - Kansas City'),
    ('Japan', 'Sweden', '2026-06-25 18:00:00-05', 'Grupo F - Arlington'),
    ('Turkey', 'USA', '2026-06-25 21:00:00-05', 'Grupo D - Los Angeles'),
    ('Paraguay', 'Australia', '2026-06-25 21:00:00-05', 'Grupo D - Santa Clara'),
    ('Norway', 'France', '2026-06-26 14:00:00-05', 'Grupo I - Foxborough'),
    ('Senegal', 'Iraq', '2026-06-26 14:00:00-05', 'Grupo I - Toronto'),
    ('Cape Verde', 'Saudi Arabia', '2026-06-26 19:00:00-05', 'Grupo H - Houston'),
    ('Uruguay', 'Spain', '2026-06-26 19:00:00-05', 'Grupo H - Guadalajara'),
    ('New Zealand', 'Belgium', '2026-06-26 22:00:00-05', 'Grupo G - Vancouver'),
    ('Egypt', 'Iran', '2026-06-26 22:00:00-05', 'Grupo G - Seattle'),
    ('Panama', 'England', '2026-06-27 16:00:00-05', 'Grupo L - New Jersey'),
    ('Croatia', 'Ghana', '2026-06-27 16:00:00-05', 'Grupo L - Philadelphia'),
    ('Colombia', 'Portugal', '2026-06-27 18:30:00-05', 'Grupo K - Miami'),
    ('DR Congo', 'Uzbekistan', '2026-06-27 18:30:00-05', 'Grupo K - Atlanta'),
    ('Algeria', 'Austria', '2026-06-27 21:00:00-05', 'Grupo J - Kansas City'),
    ('Jordan', 'Argentina', '2026-06-27 21:00:00-05', 'Grupo J - Arlington')
) as fixture(home_team, away_team, starts_at, stage)
where not exists (
  select 1
  from public.matches
  where matches.home_team = fixture.home_team
    and matches.away_team = fixture.away_team
    and matches.starts_at = fixture.starts_at::timestamptz
);
