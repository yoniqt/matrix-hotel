CREATE DATABASE IF NOT EXISTS reservation_system;
USE reservation_system;

CREATE TABLE guests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_number VARCHAR(20) NOT NULL UNIQUE,
  room_type VARCHAR(50) NOT NULL,
  price_per_night DECIMAL(10, 2) NOT NULL,
  capacity INT NOT NULL
);

CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  guest_id INT NOT NULL,
  room_id INT NOT NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  special_requests TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'confirmed',
  guests_count INT NOT NULL DEFAULT 1,
  booking_reference VARCHAR(20) NOT NULL DEFAULT '',
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  INDEX idx_booking_reference (booking_reference)
);

INSERT INTO rooms (room_number, room_type, price_per_night, capacity) VALUES
  ('101', 'Standard', 1500.00, 2),
  ('102', 'Standard', 1500.00, 2),
  ('103', 'Standard', 1500.00, 2),
  ('104', 'Standard', 1500.00, 2),
  ('105', 'Standard', 1500.00, 2),
  ('201', 'Deluxe', 2500.00, 2),
  ('202', 'Deluxe', 2500.00, 2),
  ('203', 'Deluxe', 2500.00, 2),
  ('301', 'Suite', 4000.00, 4),
  ('302', 'Suite', 4000.00, 4),
  ('303', 'Suite', 4000.00, 4),
  ('401', 'Family', 6000.00, 10),
  ('402', 'Family', 6000.00, 10);
