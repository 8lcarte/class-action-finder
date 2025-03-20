-- Row Level Security policies for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only read and update their own data
CREATE POLICY users_select_own ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY users_update_own ON users
  FOR UPDATE USING (auth.uid() = id);

-- Lawsuits are readable by everyone but only admins can modify
ALTER TABLE lawsuits ENABLE ROW LEVEL SECURITY;

CREATE POLICY lawsuits_select_all ON lawsuits
  FOR SELECT USING (true);

CREATE POLICY lawsuits_insert_admin ON lawsuits
  FOR INSERT WITH CHECK (auth.jwt() ? 'role' AND auth.jwt()->>'role' = 'admin');

CREATE POLICY lawsuits_update_admin ON lawsuits
  FOR UPDATE USING (auth.jwt() ? 'role' AND auth.jwt()->>'role' = 'admin');

CREATE POLICY lawsuits_delete_admin ON lawsuits
  FOR DELETE USING (auth.jwt() ? 'role' AND auth.jwt()->>'role' = 'admin');

-- Defendants are readable by everyone but only admins can modify
ALTER TABLE defendants ENABLE ROW LEVEL SECURITY;

CREATE POLICY defendants_select_all ON defendants
  FOR SELECT USING (true);

CREATE POLICY defendants_insert_admin ON defendants
  FOR INSERT WITH CHECK (auth.jwt() ? 'role' AND auth.jwt()->>'role' = 'admin');

CREATE POLICY defendants_update_admin ON defendants
  FOR UPDATE USING (auth.jwt() ? 'role' AND auth.jwt()->>'role' = 'admin');

CREATE POLICY defendants_delete_admin ON defendants
  FOR DELETE USING (auth.jwt() ? 'role' AND auth.jwt()->>'role' = 'admin');

-- Claims are only accessible by the user who created them and admins
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY claims_select_own ON claims
  FOR SELECT USING (auth.uid() = user_id OR (auth.jwt() ? 'role' AND auth.jwt()->>'role' = 'admin'));

CREATE POLICY claims_insert_own ON claims
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY claims_update_own ON claims
  FOR UPDATE USING (auth.uid() = user_id OR (auth.jwt() ? 'role' AND auth.jwt()->>'role' = 'admin'));

CREATE POLICY claims_delete_own ON claims
  FOR DELETE USING (auth.uid() = user_id OR (auth.jwt() ? 'role' AND auth.jwt()->>'role' = 'admin'));

-- Data sources are only accessible by admins
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY data_sources_select_admin ON data_sources
  FOR SELECT USING (auth.jwt() ? 'role' AND auth.jwt()->>'role' = 'admin');

CREATE POLICY data_sources_insert_admin ON data_sources
  FOR INSERT WITH CHECK (auth.jwt() ? 'role' AND auth.jwt()->>'role' = 'admin');

CREATE POLICY data_sources_update_admin ON data_sources
  FOR UPDATE USING (auth.jwt() ? 'role' AND auth.jwt()->>'role' = 'admin');

CREATE POLICY data_sources_delete_admin ON data_sources
  FOR DELETE USING (auth.jwt() ? 'role' AND auth.jwt()->>'role' = 'admin');

-- Saved searches are only accessible by the user who created them
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY saved_searches_select_own ON saved_searches
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY saved_searches_insert_own ON saved_searches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY saved_searches_update_own ON saved_searches
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY saved_searches_delete_own ON saved_searches
  FOR DELETE USING (auth.uid() = user_id);

-- User notifications are only accessible by the user they belong to
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_notifications_select_own ON user_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY user_notifications_insert_admin ON user_notifications
  FOR INSERT WITH CHECK (auth.jwt() ? 'role' AND auth.jwt()->>'role' = 'admin');

CREATE POLICY user_notifications_update_own ON user_notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY user_notifications_delete_own ON user_notifications
  FOR DELETE USING (auth.uid() = user_id);
