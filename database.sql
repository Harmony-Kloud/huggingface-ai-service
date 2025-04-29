CREATE TABLE IF NOT EXISTS interactions (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_interactions_created_at ON interactions (created_at);
CREATE INDEX IF NOT EXISTS idx_interactions_metadata ON interactions USING GIN (metadata);