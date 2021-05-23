DROP TABLE IF EXISTS jobs;

CREATE TABLE jobs (
    id serial PRIMARY KEY NOT NULL,
    title varchar(255),
    company varchar(255),
    location varchar(255),
    url varchar(255),
    description varchar(255)
);

