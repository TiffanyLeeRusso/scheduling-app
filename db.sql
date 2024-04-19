CREATE DATABASE schedule;

-- Users of this app
CREATE TABLE `schedule`.`users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE);

-- Clients of the users who provide services
CREATE TABLE `schedule`.`clients` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `contact_phone` VARCHAR(24) NULL,
  `contact_email` VARCHAR(100) NULL,
  `notes` VARCHAR(256) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE);

-- Services offered
CREATE TABLE `schedule`.`services` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `description` VARCHAR(256) NULL,
  `billing_code` VARCHAR(45) NOT NULL,
  `billing_description` VARCHAR(256) NULL,
  `base_price` VARCHAR(45) NOT NULL,
  `duration` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE);

-- Appointments
CREATE TABLE `schedule`.`appointments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `start_time` DATETIME NOT NULL,
  `end_time` DATETIME NOT NULL,
  `user_id` INT NOT NULL,
  `client_id` INT NOT NULL,
  `price_charged` VARCHAR(45) NULL,
  `notes` VARCHAR(256) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  INDEX `appointment_ibfk_1_idx` (`client_id` ASC) VISIBLE,
  INDEX `appointment_ibfk_2_idx` (`user_id` ASC) VISIBLE,
  CONSTRAINT `appointment_ibfk_1`
    FOREIGN KEY (`client_id`)
    REFERENCES `schedule`.`clients` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `appointment_ibfk_2`
    FOREIGN KEY (`user_id`)
    REFERENCES `schedule`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

-- Since an appointment may include multiple services
-- store the services for each appointment in a separate table.    
CREATE TABLE `schedule`.`appointment_services` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `appointment_id` INT NOT NULL,
  `service_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  INDEX `appointment_services_ibfk_1_idx` (`appointment_id` ASC) VISIBLE,
  INDEX `appointment_services_ibfk_2_idx` (`service_id` ASC) VISIBLE,
  CONSTRAINT `appointment_services_ibfk_1`
    FOREIGN KEY (`appointment_id`)
    REFERENCES `schedule`.`appointments` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `appointment_services_ibfk_2`
    FOREIGN KEY (`service_id`)
    REFERENCES `schedule`.`services` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);


