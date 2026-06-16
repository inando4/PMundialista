-- Admin emails. Add one row per administrator.
insert into public.admins (email)
values ('luisrodrigopereztorres97@gmail.com')
on conflict (email) do nothing;

-- To add another administrator, replace the email and run this line:
-- insert into public.admins (email) values ('otro-admin@example.com') on conflict (email) do nothing;

-- Fixture placeholder. Replace or extend with the official 2026 schedule when available.
insert into public.matches (home_team, away_team, starts_at, stage)
values
  ('Mexico', 'Equipo 2', '2026-06-11 20:00:00+00', 'Fase de grupos'),
  ('Canada', 'Equipo 4', '2026-06-12 00:00:00+00', 'Fase de grupos'),
  ('Estados Unidos', 'Equipo 6', '2026-06-12 20:00:00+00', 'Fase de grupos'),
  ('Equipo 7', 'Equipo 8', '2026-06-13 00:00:00+00', 'Fase de grupos'),
  ('Equipo 9', 'Equipo 10', '2026-06-13 20:00:00+00', 'Fase de grupos'),
  ('Equipo 11', 'Equipo 12', '2026-06-14 00:00:00+00', 'Fase de grupos')
on conflict do nothing;
