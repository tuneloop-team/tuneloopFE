-- ============================================
-- TuneLoop — Seed Data: Sample Songs
-- ============================================

INSERT INTO songs (title, artist, album, genre, cover_url, duration_ms) VALUES
  ('Bohemian Rhapsody',   'Queen',           'A Night at the Opera',    'Rock',       'https://i.scdn.co/image/ab67616d0000b273ce4f1737bc8a646c8c4bd25a', 354000),
  ('Blinding Lights',     'The Weeknd',      'After Hours',             'Synth-pop',  'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36', 200000),
  ('Shape of You',        'Ed Sheeran',      '÷ (Divide)',              'Pop',        'https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96', 233000),
  ('Smells Like Teen Spirit', 'Nirvana',     'Nevermind',               'Grunge',     'https://i.scdn.co/image/ab67616d0000b2739a5ec9e3408a83df90f68bac', 301000),
  ('Billie Jean',         'Michael Jackson', 'Thriller',                'Pop',        'https://i.scdn.co/image/ab67616d0000b27358267bd34420a00d5cf83a49', 294000),
  ('Hotel California',    'Eagles',          'Hotel California',        'Rock',       'https://i.scdn.co/image/ab67616d0000b2734637341b9f507521afa9a778', 391000),
  ('Stairway to Heaven',  'Led Zeppelin',    'Led Zeppelin IV',         'Rock',       'https://i.scdn.co/image/ab67616d0000b27351c02a77d09dfcd53c8676d0', 482000),
  ('Lose Yourself',       'Eminem',          '8 Mile Soundtrack',       'Hip-Hop',    'https://i.scdn.co/image/ab67616d0000b273726d48d93d02e1271774f023', 326000),
  ('Rolling in the Deep', 'Adele',           '21',                      'Soul',       'https://i.scdn.co/image/ab67616d0000b2732118bf9b198b05a95ded6300', 228000),
  ('Take Five',           'Dave Brubeck',    'Time Out',                'Jazz',       'https://i.scdn.co/image/ab67616d0000b273b5e247f23c1b148e1b2c315e', 324000),
  ('Imagine',             'John Lennon',     'Imagine',                 'Soft Rock',  'https://i.scdn.co/image/ab67616d0000b2730b06920ade91f87a77014708', 187000),
  ('Superstition',        'Stevie Wonder',   'Talking Book',            'Funk',       'https://i.scdn.co/image/ab67616d0000b27382de1ca074ae63cb18fce335', 245000),
  ('Wonderwall',          'Oasis',           '(What''s the Story) Morning Glory?', 'Britpop', 'https://i.scdn.co/image/ab67616d0000b27334af30de6b5e5c76c29b8d0a', 259000),
  ('One More Time',       'Daft Punk',       'Discovery',               'Electronic', 'https://i.scdn.co/image/ab67616d0000b2732cc38a0e29a04ccbc9e1c5f0', 320000),
  ('Hey Jude',            'The Beatles',     'Single',                  'Rock',       'https://i.scdn.co/image/ab67616d0000b273dc30583ba717007b00cceb25', 431000),
  ('No Woman, No Cry',    'Bob Marley & The Wailers', 'Live!',          'Reggae',     'https://i.scdn.co/image/ab67616d0000b273d3bc29fe2c76c069e5ceb8bd', 428000),
  ('Purple Rain',         'Prince',          'Purple Rain',             'Pop Rock',   'https://i.scdn.co/image/ab67616d0000b27347f29e0dbdb3337dbcc7e8b1', 522000),
  ('Levels',              'Avicii',          'True',                    'EDM',        'https://i.scdn.co/image/ab67616d0000b27348c1e00b869bf0acb1797381', 206000),
  ('Shallow',             'Lady Gaga & Bradley Cooper', 'A Star Is Born', 'Pop',     'https://i.scdn.co/image/ab67616d0000b273e2d156fdc691f57900134342', 216000),
  ('Uptown Funk',         'Mark Ronson ft. Bruno Mars', 'Uptown Special', 'Funk Pop','https://i.scdn.co/image/ab67616d0000b273e419ccba0baa8bd3f3d7abf2', 270000)
ON CONFLICT DO NOTHING;
