DROP TABLE IF EXISTS workouts;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL
);

CREATE TABLE workouts (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  heavy INT CHECK (heavy >= 0),
  medium INT CHECK (medium >= 0),
  light INT CHECK (light >= 0),
  position INT CHECK (position >= 0) NOT NULL
);
