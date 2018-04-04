--- load with 
--- sqlite3 database.db < schema.sql

DROP TABLE IF EXISTS appuser;

DROP TABLE IF EXISTS highscore;

CREATE TABLE appuser (
	name VARCHAR(20) PRIMARY KEY,
	password VARCHAR(20),
    email VARCHAR(30) DEFAULT '',
    wins INT DEFAULT 0
);

CREATE TABLE highscore (
	sid VARCHAR(20) PRIMARY KEY,
	name VARCHAR(20),
	score INT
);

