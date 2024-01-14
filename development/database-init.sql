CREATE DATABASE IF NOT EXISTS crawler;
USE crawler;

CREATE TABLE client (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cnpj VARCHAR(20) NOT NULL,
    companyName VARCHAR(255) NOT NULL
);

CREATE TABLE plan (
    id INT PRIMARY KEY AUTO_INCREMENT,
    year VARCHAR(4) NOT NULL,
    status VARCHAR(50) NOT NULL,
    identification VARCHAR(255) NOT NULL,
    budget DECIMAL(10, 2),
    client_id INT NOT NULL,
    FOREIGN KEY (client_id) REFERENCES client(id)
);
