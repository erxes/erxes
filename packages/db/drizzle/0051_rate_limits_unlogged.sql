-- Request counts are worth less than the WAL they cost: every request writes a
-- row. An unlogged table skips the WAL; a crash empties it, which only resets
-- the windows. drizzle-kit doesn't model persistence, so its snapshot is unchanged.
ALTER TABLE core_rate_limits SET UNLOGGED;
