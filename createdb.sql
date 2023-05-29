CREATE TABLE accepted_url (
    id INT AUTO_INCREMENT,
    `url` VARCHAR(200) NOT NULL,
    `name` VARCHAR(200) NOT NULL,    
    PRIMARY KEY (id)
);

INSERT INTO accepted_url (`url`, `name`) VALUES ('singaporepools.com.sg', 'Singapore');
INSERT INTO accepted_url (`url`, `name`) VALUES ('hongkongpools.com', 'Hongkong');
INSERT INTO accepted_url (`url`, `name`) VALUES ('sydneypoolstoday.com', 'Sydney');
INSERT INTO accepted_url (`url`, `name`) VALUES ('debug.com', 'DEBUG');

CREATE TABLE result_data (
    id INT AUTO_INCREMENT,
    urlId INT NOT NULL,
    closeTime BIGINT NOT NULL,
    resultTime BIGINT NOT NULL,
    result VARCHAR(10) NOT NULL,    
    source VARCHAR(200) NOT NULL,
    PRIMARY KEY (id)    
);