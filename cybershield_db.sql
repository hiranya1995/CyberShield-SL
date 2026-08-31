-- ════════════════════════════════════════════════════════════════
-- CyberShield SL — MySQL Database Schema
-- Database Name: cybershield_db
-- ════════════════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS `cybershield_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `cybershield_db`;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `emp_id` VARCHAR(50) NOT NULL UNIQUE,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `division` VARCHAR(100) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('employee', 'admin') DEFAULT 'employee',
  `registered_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. MODULE PROGRESS TABLE
CREATE TABLE IF NOT EXISTS `module_progress` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `emp_id` VARCHAR(50) NOT NULL,
  `module_num` INT NOT NULL,
  `score` INT DEFAULT 0,
  `passed` TINYINT(1) DEFAULT 0,
  `completed_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`emp_id`) REFERENCES `users`(`emp_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. SIEM SECURITY LOGS TABLE
CREATE TABLE IF NOT EXISTS `siem_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `event_id` VARCHAR(100) NOT NULL,
  `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `event_type` VARCHAR(100) NOT NULL,
  `severity` ENUM('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO') NOT NULL,
  `source_ip` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(50),
  `description` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. INSERT DEFAULT DEMO DATA
INSERT INTO `users` (`emp_id`, `first_name`, `last_name`, `division`, `password`, `role`) VALUES
('EMP-ADMIN', 'System', 'Administrator', 'IT & Systems', 'admin123', 'admin'),
('EMP-001', 'Kamal', 'Perera', 'Administration', 'password123', 'employee')
ON DUPLICATE KEY UPDATE `emp_id`=`emp_id`;
