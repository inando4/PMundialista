-- Manual predictions for delayed June 15 entries.
-- Safe to rerun: existing predictions for the same user_id + match_id are updated.

insert into public.predictions (
  user_id,
  match_id,
  predicted_home_score,
  predicted_away_score
)
values
  ('6a90e74b-2804-40ec-aeef-1f6f9a9d4917', 57, 3, 0),
  ('6a90e74b-2804-40ec-aeef-1f6f9a9d4917', 45, 2, 1),
  ('6a90e74b-2804-40ec-aeef-1f6f9a9d4917', 38, 0, 1),
  ('6a90e74b-2804-40ec-aeef-1f6f9a9d4917', 50, 0, 2),

  ('4890dae0-4cc4-4028-9065-5ed3c5e92b8e', 57, 5, 0),
  ('4890dae0-4cc4-4028-9065-5ed3c5e92b8e', 45, 2, 0),
  ('4890dae0-4cc4-4028-9065-5ed3c5e92b8e', 38, 1, 2),
  ('4890dae0-4cc4-4028-9065-5ed3c5e92b8e', 50, 1, 1),

  ('bde2014b-24bc-4ac4-bd78-44f82c2e283e', 57, 4, 0),
  ('bde2014b-24bc-4ac4-bd78-44f82c2e283e', 45, 2, 1),
  ('bde2014b-24bc-4ac4-bd78-44f82c2e283e', 38, 0, 2),
  ('bde2014b-24bc-4ac4-bd78-44f82c2e283e', 50, 1, 0),

  ('a87f2387-d34c-4c5f-9221-55f71be78fd6', 57, 3, 0),
  ('a87f2387-d34c-4c5f-9221-55f71be78fd6', 45, 2, 0),
  ('a87f2387-d34c-4c5f-9221-55f71be78fd6', 38, 0, 1),
  ('a87f2387-d34c-4c5f-9221-55f71be78fd6', 50, 2, 0),

  ('5084187c-da4c-4945-92f1-4dd4ef356e2a', 57, 4, 0),
  ('5084187c-da4c-4945-92f1-4dd4ef356e2a', 45, 1, 0),
  ('5084187c-da4c-4945-92f1-4dd4ef356e2a', 38, 1, 2),
  ('5084187c-da4c-4945-92f1-4dd4ef356e2a', 50, 1, 0),

  ('dbb83876-1b09-4db4-a599-00bcd3f54a75', 57, 3, 0),
  ('dbb83876-1b09-4db4-a599-00bcd3f54a75', 45, 1, 0),
  ('dbb83876-1b09-4db4-a599-00bcd3f54a75', 38, 0, 1),
  ('dbb83876-1b09-4db4-a599-00bcd3f54a75', 50, 0, 0),

  ('3bf98e9a-e5ac-422f-8faa-7ff65b7dc8a5', 57, 4, 0),
  ('3bf98e9a-e5ac-422f-8faa-7ff65b7dc8a5', 45, 2, 0),
  ('3bf98e9a-e5ac-422f-8faa-7ff65b7dc8a5', 38, 0, 1),
  ('3bf98e9a-e5ac-422f-8faa-7ff65b7dc8a5', 50, 0, 1),

  ('0675ddef-ef8d-4c97-981b-6df76705d703', 57, 2, 0),
  ('0675ddef-ef8d-4c97-981b-6df76705d703', 45, 3, 0),
  ('0675ddef-ef8d-4c97-981b-6df76705d703', 38, 1, 2),
  ('0675ddef-ef8d-4c97-981b-6df76705d703', 50, 1, 1)
on conflict (user_id, match_id)
do update set
  predicted_home_score = excluded.predicted_home_score,
  predicted_away_score = excluded.predicted_away_score,
  updated_at = now();
