DROP TABLE IF EXISTS api_keys;

CREATE TABLE api_keys (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  `key` VARCHAR(64) NOT NULL,
  permissions LONGTEXT NOT NULL,
  expiration_date DATE NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY (`key`),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;