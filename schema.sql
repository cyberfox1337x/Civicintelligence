PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS boards (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  icon_emoji TEXT NOT NULL DEFAULT '📁',
  accent_color TEXT NOT NULL DEFAULT '#63b6ff',
  owner_user_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS nodes (
  id TEXT PRIMARY KEY,
  board_id TEXT NOT NULL,
  type TEXT NOT NULL,
  label TEXT NOT NULL,
  x INTEGER NOT NULL DEFAULT 240,
  y INTEGER NOT NULL DEFAULT 180,
  metadata TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS edges (
  id TEXT PRIMARY KEY,
  board_id TEXT NOT NULL,
  source_node_id TEXT NOT NULL,
  target_node_id TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  metadata TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
  FOREIGN KEY (source_node_id) REFERENCES nodes(id) ON DELETE CASCADE,
  FOREIGN KEY (target_node_id) REFERENCES nodes(id) ON DELETE CASCADE,
  UNIQUE(board_id, source_node_id, target_node_id)
);

CREATE TABLE IF NOT EXISTS app_users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL DEFAULT '',
  organization TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  banned INTEGER NOT NULL DEFAULT 0,
  role TEXT NOT NULL DEFAULT 'normal user',
  profile_image TEXT NOT NULL DEFAULT '',
  otp_secret TEXT NOT NULL DEFAULT '',
  otp_enabled INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS app_sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS auth_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  username TEXT NOT NULL DEFAULT '',
  user_id TEXT NOT NULL DEFAULT '',
  ip_address TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  zip TEXT NOT NULL DEFAULT '',
  user_agent TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL,
  message TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS app_metrics (
  metric_key TEXT PRIMARY KEY,
  metric_value INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS app_rate_limits (
  bucket_key TEXT PRIMARY KEY,
  bucket_count INTEGER NOT NULL DEFAULT 0,
  reset_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS inventory_items (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_nodes_board_id ON nodes(board_id);
CREATE INDEX IF NOT EXISTS idx_nodes_board_type ON nodes(board_id, type);
CREATE INDEX IF NOT EXISTS idx_boards_owner_user_id ON boards(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_boards_status ON boards(status);
CREATE INDEX IF NOT EXISTS idx_edges_board_id ON edges(board_id);
CREATE INDEX IF NOT EXISTS idx_edges_source_node_id ON edges(source_node_id);
CREATE INDEX IF NOT EXISTS idx_edges_target_node_id ON edges(target_node_id);
CREATE INDEX IF NOT EXISTS idx_app_users_email ON app_users(email);
CREATE INDEX IF NOT EXISTS idx_app_users_role ON app_users(role);
CREATE INDEX IF NOT EXISTS idx_app_sessions_user_id ON app_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_app_sessions_expires_at ON app_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_auth_events_user_id ON auth_events(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_events_created_at ON auth_events(created_at);
CREATE INDEX IF NOT EXISTS idx_app_rate_limits_reset_at ON app_rate_limits(reset_at);
