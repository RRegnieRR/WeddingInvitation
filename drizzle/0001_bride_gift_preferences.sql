CREATE TABLE IF NOT EXISTS gift_preferences (
  invitation_id TEXT PRIMARY KEY NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  preference TEXT NOT NULL CHECK (preference IN ('money', 'gift', 'both')),
  gift_note TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL
);
