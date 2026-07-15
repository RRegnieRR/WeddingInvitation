CREATE TABLE IF NOT EXISTS invitations (
  id TEXT PRIMARY KEY NOT NULL,
  external_id TEXT NOT NULL UNIQUE,
  code_hash TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  invitation_type TEXT NOT NULL DEFAULT 'family' CHECK (invitation_type IN ('family', 'personal')),
  max_adults INTEGER NOT NULL DEFAULT 1 CHECK (max_adults BETWEEN 0 AND 20),
  max_children INTEGER NOT NULL DEFAULT 0 CHECK (max_children BETWEEN 0 AND 20)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS rsvps (
  invitation_id TEXT PRIMARY KEY NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  attendance INTEGER NOT NULL,
  adult_count INTEGER NOT NULL DEFAULT 0,
  child_count INTEGER NOT NULL DEFAULT 0,
  guests TEXT NOT NULL DEFAULT '[]',
  message TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS invitations_code_hash_idx ON invitations (code_hash);
--> statement-breakpoint
INSERT INTO invitations (id, external_id, code_hash, display_name, invitation_type, max_adults, max_children)
VALUES ('familia-palacios-garcia', 'familia-palacios-garcia', '882c6aaa092092e51d0a7389472b443287cd7f09fa1542c8c6a21f2b3cfcf5d3', 'Familia Palacios García', 'family', 4, 2)
ON CONFLICT(external_id) DO UPDATE SET display_name=excluded.display_name, invitation_type=excluded.invitation_type, max_adults=excluded.max_adults, max_children=excluded.max_children;
--> statement-breakpoint
INSERT INTO invitations (id, external_id, code_hash, display_name, invitation_type, max_adults, max_children)
VALUES ('mckay-stacey', 'mckay-stacey', 'ac17b6166dfa8299317442458322c2b11deb21487528112fe4706c82761b2ba2', 'McKay Stacey', 'personal', 1, 0)
ON CONFLICT(external_id) DO UPDATE SET display_name=excluded.display_name, invitation_type=excluded.invitation_type, max_adults=excluded.max_adults, max_children=excluded.max_children;
