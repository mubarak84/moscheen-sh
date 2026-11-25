-- D1 (SQLite) schema for moscheen-sh. Apply with:
--   npx wrangler d1 migrations apply moscheen-sh-db --local   (or --remote)
-- Timestamps are ISO-8601 strings (UTC). JSON columns are TEXT.

CREATE TABLE IF NOT EXISTS mosques (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  slug              TEXT NOT NULL UNIQUE,
  name              TEXT NOT NULL,
  subtitle          TEXT,
  type              TEXT NOT NULL DEFAULT 'mosque' CHECK (type IN ('mosque', 'center')),
  street            TEXT,
  zip               TEXT,
  city              TEXT NOT NULL,
  district          TEXT,
  lat               REAL,
  lng               REAL,
  opened_year       INTEGER,
  image             TEXT,              -- "/media/<r2-key>" or "/assets/..."
  image_alt         TEXT,
  short_description TEXT,
  description       TEXT,
  features          TEXT,              -- JSON array of strings
  email             TEXT,              -- public contact email
  booking_email     TEXT,              -- internal: receives visit requests (not public)
  phone             TEXT,
  sort_order        INTEGER NOT NULL DEFAULT 100,
  is_published      INTEGER NOT NULL DEFAULT 1,
  created_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS contacts (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  mosque_id    INTEGER NOT NULL REFERENCES mosques(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  role         TEXT NOT NULL,
  email        TEXT,
  phone        TEXT,
  photo        TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 100,
  is_published INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_contacts_mosque ON contacts(mosque_id);

CREATE TABLE IF NOT EXISTS events (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  mosque_id    INTEGER REFERENCES mosques(id) ON DELETE SET NULL,  -- NULL = region-wide
  title        TEXT NOT NULL,
  description  TEXT,
  starts_at    TEXT NOT NULL,
  ends_at      TEXT,
  location     TEXT,
  image        TEXT,
  is_published INTEGER NOT NULL DEFAULT 1,
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_events_start ON events(starts_at);

CREATE TABLE IF NOT EXISTS highlights (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  mosque_id    INTEGER REFERENCES mosques(id) ON DELETE SET NULL,
  title        TEXT NOT NULL,
  summary      TEXT,
  body         TEXT,
  date         TEXT NOT NULL,          -- YYYY-MM-DD
  image        TEXT,
  link         TEXT,
  is_published INTEGER NOT NULL DEFAULT 1,
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_highlights_date ON highlights(date);

CREATE TABLE IF NOT EXISTS feedback (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  mosque_id    INTEGER NOT NULL REFERENCES mosques(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  email        TEXT,                   -- never published
  visit_type   TEXT,
  rating       INTEGER CHECK (rating BETWEEN 1 AND 5),
  text         TEXT NOT NULL,
  visited_on   TEXT,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  moderated_by TEXT,
  moderated_at TEXT,
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_feedback_mosque_status ON feedback(mosque_id, status, created_at);

CREATE TABLE IF NOT EXISTS bookings (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  reference       TEXT NOT NULL UNIQUE,
  mosque_id       INTEGER NOT NULL REFERENCES mosques(id),
  visit_type      TEXT NOT NULL,
  group_size      INTEGER NOT NULL DEFAULT 1,
  organization    TEXT,
  preferred_slots TEXT NOT NULL,       -- JSON [{date, time}]
  interests       TEXT,                -- JSON array
  language        TEXT,
  name            TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT,
  message         TEXT,
  status          TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'confirmed', 'declined', 'done', 'cancelled')),
  confirmed_slot  TEXT,                -- JSON {date, time}
  internal_note   TEXT,
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at      TEXT
);
CREATE INDEX IF NOT EXISTS idx_bookings_mosque_status ON bookings(mosque_id, status);

CREATE TABLE IF NOT EXISTS contact_messages (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  mosque_id  INTEGER REFERENCES mosques(id),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  subject    TEXT,
  message    TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Admin users are managed by Cloudflare Access; this table maps them to mosques (phase 3).
CREATE TABLE IF NOT EXISTS admin_users (
  email      TEXT PRIMARY KEY,
  role       TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
  mosque_id  INTEGER REFERENCES mosques(id),  -- NULL = all mosques
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
