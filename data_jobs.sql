DROP TABLE IF EXISTS jobs;

CREATE TABLE jobs (
    id serial PRIMARY KEY,
    title text NOT NULL,
    salary float NOT NULL,
    equity float NOT NULL,
    company_handle text NOT NULL REFERENCES companies ON DELETE CASCADE,
    date_posted date DEFAULT CURRENT_DATE NOT NULL,
    CONSTRAINT equity_check CHECK (equity <= 1 AND equity >= 0)
);

-- CREATE TABLE messages (
--     id SERIAL PRIMARY KEY,
--     from_username text NOT NULL REFERENCES users,
--     to_username text NOT NULL REFERENCES users,
--     body text NOT NULL,
--     sent_at timestamp with time zone NOT NULL,
--     read_at timestamp with time zone
-- );

INSERT INTO jobs (title, salary, equity, company_handle) VALUES ('Application Engineer', 98000.44, 0.05, 'TSLA'), ('Software Engineer', 151348.98, 0.25, 'AAPL');

