DROP TABLE IF EXISTS companies;
-- DROP TABLE IF EXISTS users;

CREATE TABLE companies (
    handle text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    num_employees integer,
    description text,
    logo_url text
);

-- CREATE TABLE messages (
--     id SERIAL PRIMARY KEY,
--     from_username text NOT NULL REFERENCES users,
--     to_username text NOT NULL REFERENCES users,
--     body text NOT NULL,
--     sent_at timestamp with time zone NOT NULL,
--     read_at timestamp with time zone
-- );

INSERT INTO companies VALUES ('TSLA', 'Tesla', 1234, 'World leading EV maker','tatata');
INSERT INTO companies VALUES ('AAPL', 'Apple', 4321, 'World leading phone maker','ffddss');

