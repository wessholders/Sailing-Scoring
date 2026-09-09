export const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('UNIVERSITY', 'YACHT_CLUB', 'ASSOCIATION')),
    primary_team_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    image TEXT,
    linked_sailor_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (linked_sailor_id) REFERENCES sailors(id)
  )`,
  `CREATE TABLE IF NOT EXISTS conferences (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE
  )`,
  `CREATE TABLE IF NOT EXISTS seasons (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    year INTEGER NOT NULL,
    term TEXT NOT NULL CHECK (term IN ('FALL', 'SPRING')),
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS sailors (
    id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    preferred_name TEXT,
    graduation_year INTEGER NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    linked_user_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (linked_user_id) REFERENCES users(id)
  )`,
  `CREATE TABLE IF NOT EXISTS teams (
    id TEXT PRIMARY KEY,
    organization_id TEXT,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    conference_id TEXT,
    logo_url TEXT,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (conference_id) REFERENCES conferences(id)
  )`,
  `CREATE TABLE IF NOT EXISTS organization_user_roles (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role = 'ORGANIZATION_ADMIN'),
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`,
  `CREATE TABLE IF NOT EXISTS team_memberships (
    id TEXT PRIMARY KEY,
    team_id TEXT NOT NULL,
    sailor_id TEXT NOT NULL,
    invited_by_user_id TEXT,
    source_invitation_id TEXT,
    start_season_id TEXT NOT NULL,
    end_season_id TEXT,
    active INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (team_id) REFERENCES teams(id),
    FOREIGN KEY (sailor_id) REFERENCES sailors(id),
    FOREIGN KEY (invited_by_user_id) REFERENCES users(id),
    FOREIGN KEY (start_season_id) REFERENCES seasons(id),
    FOREIGN KEY (end_season_id) REFERENCES seasons(id)
  )`,
  `CREATE TABLE IF NOT EXISTS team_invitations (
    id TEXT PRIMARY KEY,
    team_id TEXT NOT NULL,
    email TEXT NOT NULL,
    intended_role TEXT NOT NULL CHECK (intended_role IN ('SAILOR', 'TEAM_MANAGER', 'TEAM_ADMIN')),
    sailor_id TEXT,
    invited_by_user_id TEXT NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED')),
    expires_at TEXT NOT NULL,
    accepted_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (team_id) REFERENCES teams(id),
    FOREIGN KEY (sailor_id) REFERENCES sailors(id),
    FOREIGN KEY (invited_by_user_id) REFERENCES users(id)
  )`,
  `CREATE TABLE IF NOT EXISTS sailor_account_links (
    id TEXT PRIMARY KEY,
    sailor_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    source_invitation_id TEXT,
    verified_at TEXT NOT NULL,
    FOREIGN KEY (sailor_id) REFERENCES sailors(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (source_invitation_id) REFERENCES team_invitations(id)
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_sailor_account_links_sailor_user
    ON sailor_account_links(sailor_id, user_id)`,
  `CREATE TABLE IF NOT EXISTS team_boats (
    id TEXT PRIMARY KEY,
    team_id TEXT NOT NULL,
    boat_class TEXT NOT NULL,
    hull_number TEXT,
    hull_name TEXT,
    sail_number TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (team_id) REFERENCES teams(id)
  )`,
  `CREATE TABLE IF NOT EXISTS scoring_profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    season_id TEXT NOT NULL,
    host_team_id TEXT,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    location TEXT NOT NULL,
    boat_class TEXT NOT NULL,
    status TEXT NOT NULL,
    scoring_profile_id TEXT NOT NULL,
    number_of_divisions INTEGER NOT NULL,
    public INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (season_id) REFERENCES seasons(id),
    FOREIGN KEY (host_team_id) REFERENCES teams(id),
    FOREIGN KEY (scoring_profile_id) REFERENCES scoring_profiles(id)
  )`,
  `CREATE TABLE IF NOT EXISTS event_entries (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    team_id TEXT NOT NULL,
    entry_name TEXT NOT NULL,
    short_name TEXT,
    seed INTEGER,
    active INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (team_id) REFERENCES teams(id)
  )`,
  `CREATE TABLE IF NOT EXISTS event_registration_invites (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    team_id TEXT,
    team_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('INVITED', 'NEEDS_ACCOUNT', 'REGISTERED', 'DECLINED')),
    token_hash TEXT NOT NULL UNIQUE,
    registration_url TEXT NOT NULL,
    created_by_user_id TEXT NOT NULL,
    accepted_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (team_id) REFERENCES teams(id),
    FOREIGN KEY (created_by_user_id) REFERENCES users(id)
  )`,
  `CREATE TABLE IF NOT EXISTS divisions (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    display_order INTEGER NOT NULL,
    FOREIGN KEY (event_id) REFERENCES events(id)
  )`,
  `CREATE TABLE IF NOT EXISTS races (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    division_id TEXT NOT NULL,
    race_number INTEGER NOT NULL,
    status TEXT NOT NULL,
    started_at TEXT,
    completed_at TEXT,
    counts_toward_standings INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (division_id) REFERENCES divisions(id)
  )`,
  `CREATE TABLE IF NOT EXISTS race_results (
    id TEXT PRIMARY KEY,
    race_id TEXT NOT NULL,
    event_entry_id TEXT NOT NULL,
    finish_position INTEGER,
    status_code TEXT,
    calculated_points REAL NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (race_id) REFERENCES races(id),
    FOREIGN KEY (event_entry_id) REFERENCES event_entries(id)
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_race_results_race_entry
    ON race_results(race_id, event_entry_id)`,
  `CREATE TABLE IF NOT EXISTS sailing_assignments (
    id TEXT PRIMARY KEY,
    event_entry_id TEXT NOT NULL,
    division_id TEXT NOT NULL,
    sailor_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('SKIPPER', 'CREW')),
    start_race_number INTEGER NOT NULL,
    end_race_number INTEGER,
    FOREIGN KEY (event_entry_id) REFERENCES event_entries(id),
    FOREIGN KEY (division_id) REFERENCES divisions(id),
    FOREIGN KEY (sailor_id) REFERENCES sailors(id)
  )`,
  `CREATE TABLE IF NOT EXISTS user_team_roles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    team_id TEXT NOT NULL,
    role TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (team_id) REFERENCES teams(id)
  )`,
  `CREATE TABLE IF NOT EXISTS event_user_roles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    event_id TEXT NOT NULL,
    role TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (event_id) REFERENCES events(id)
  )`,
  `CREATE TABLE IF NOT EXISTS audit_log (
    id TEXT PRIMARY KEY,
    actor TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    old_value TEXT NOT NULL,
    new_value TEXT NOT NULL,
    timestamp TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_events_status_start_date
    ON events(status, start_date)`,
  `CREATE INDEX IF NOT EXISTS idx_team_memberships_team_active
    ON team_memberships(team_id, active)`,
  `CREATE INDEX IF NOT EXISTS idx_team_invitations_team_status
    ON team_invitations(team_id, status)`,
  `CREATE INDEX IF NOT EXISTS idx_event_registration_invites_event_status
    ON event_registration_invites(event_id, status)`,
  `CREATE INDEX IF NOT EXISTS idx_team_boats_team_active
    ON team_boats(team_id, active)`,
  `CREATE INDEX IF NOT EXISTS idx_sailing_assignments_entry_division
    ON sailing_assignments(event_entry_id, division_id)`,
];
