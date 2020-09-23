DROP TABLE IF EXISTS skills;
DROP TABLE IF EXISTS requirements;
DROP TABLE IF EXISTS technologies;
DROP TABLE IF EXISTS applications;

CREATE TYPE app_state AS ENUM ('interested', 'applied', 'accepted', 'rejected');

CREATE TABLE applications(
    username text NOT NULL REFERENCES users,
    job_id integer NOT NULL REFERENCES jobs,
    state app_state NOT NULL,
    created_at date DEFAULT CURRENT_DATE NOT NULL,
    PRIMARY KEY(username, job_id)
);

INSERT INTO applications (username, job_id, state) VALUES ('boooj', 1, 'applied');

CREATE TABLE technologies(
    tech_code text PRIMARY KEY,
    tech text NOT NULL
);

CREATE TABLE skills(
    tech_code text NOT NULL REFERENCES technologies ON DELETE CASCADE,
    username text NOT NULL REFERENCES users ON DELETE CASCADE,
    PRIMARY KEY(tech_code, username)
);

CREATE TABLE requirements(
    tech_code text NOT NULL REFERENCES technologies ON DELETE CASCADE,
    job integer NOT NULL REFERENCES jobs ON DELETE CASCADE,
    PRIMARY KEY(tech_code, job)
);