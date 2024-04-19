-- Users
INSERT INTO users (name) VALUES ("Jane Doe");
INSERT INTO users (name) VALUES ("Francis Smith");
INSERT INTO users (name) VALUES ("May Star");

-- Clients
INSERT INTO clients (name, contact_phone, contact_email, notes) VALUES ("Telly Jay", "604-555-1234", "tjelly@example.com", "Prefers email.");
INSERT INTO clients (name, contact_email) VALUES ("Lorelei Elias", "lorelei@example.com");
INSERT INTO clients (name, contact_phone) VALUES ("Verdant Kerry", "302-555-1234");
INSERT INTO clients (name) VALUES ("Three");

-- Services
INSERT INTO services (name, description, billing_code, base_price, duration) VALUES ("Checkup", "Routine checkup", 100, 120, 30);
INSERT INTO services (name, description, billing_code, base_price, duration) VALUES ("Blood Draw", "", 130, 25, 15);
INSERT INTO services (name, description, billing_code, base_price, duration) VALUES ("Blood Test (Basic)", "", 131, 50, 0);

-- Appointments
INSERT INTO appointments (start_time, end_time, price_charged, notes, client_id, user_id) VALUES ("2024-04-19 10:00:00", "2024-04-19 10:30:00", 150, "Friends&fam discount", 1, 1);
INSERT INTO appointments (start_time, end_time, price_charged, notes, client_id, user_id) VALUES ("2024-04-19 10:00:00", "2024-04-19 10:30:00", 100, "Client running late (10min)", 2, 2);
INSERT INTO appointments (start_time, end_time, price_charged, notes, client_id, user_id) VALUES ("2024-04-19 11:00:00", "2024-04-19 11:30:00", 50, "", 3, 1);
INSERT INTO appointments (start_time, end_time, client_id, user_id) VALUES ("2024-04-22 11:00:00", "2024-04-22 11:30:00", 4, 2);
INSERT INTO appointments (start_time, end_time, client_id, user_id) VALUES ("2024-04-22 09:30:00", "2024-04-22 10:00:00", 2, 1);
INSERT INTO appointments (start_time, end_time, client_id, user_id) VALUES ("2024-04-22 10:00:00", "2024-04-22 10:30:00", 2, 1);

-- AppointmentServices
INSERT INTO appointment_services (appointment_id, service_id) values (1, 1);
INSERT INTO appointment_services (appointment_id, service_id) values (1, 2);
INSERT INTO appointment_services (appointment_id, service_id) values (1, 3);
INSERT INTO appointment_services (appointment_id, service_id) values (2, 1);
INSERT INTO appointment_services (appointment_id, service_id) values (3, 1);
INSERT INTO appointment_services (appointment_id, service_id) values (4, 1);
INSERT INTO appointment_services (appointment_id, service_id) values (4, 2);
INSERT INTO appointment_services (appointment_id, service_id) values (4, 3);
INSERT INTO appointment_services (appointment_id, service_id) values (5, 1);
INSERT INTO appointment_services (appointment_id, service_id) values (6, 1);