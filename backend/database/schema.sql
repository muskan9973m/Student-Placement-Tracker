CREATE DATABASE IF NOT EXISTS placement_tracker;
USE placement_tracker;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role ENUM('student', 'admin', 'recruiter') NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  reset_token VARCHAR(255) NULL,
  reset_token_expires DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  college VARCHAR(200),
  course VARCHAR(100),
  branch VARCHAR(100),
  graduation_year INT,
  date_of_birth DATE NULL,
  address TEXT NULL,
  degree VARCHAR(100) NULL,
  cgpa DECIMAL(4,2) NULL,
  class10_percentage DECIMAL(5,2) NULL,
  class12_percentage DECIMAL(5,2) NULL,
  resume_path VARCHAR(255) NULL,
  is_placed TINYINT(1) DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS student_skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  skill_name VARCHAR(100) NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS student_projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  technologies VARCHAR(255),
  github_url VARCHAR(255),
  live_url VARCHAR(255),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS student_certifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  certificate_name VARCHAR(200) NOT NULL,
  issuing_organization VARCHAR(200),
  issue_date DATE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  logo_path VARCHAR(255) NULL,
  website VARCHAR(255),
  description TEXT,
  location VARCHAR(150),
  industry VARCHAR(100),
  company_size VARCHAR(50),
  created_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS recruiters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  company_id INT NULL,
  designation VARCHAR(100),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  created_by INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  location VARCHAR(150),
  job_type ENUM('full-time', 'internship', 'part-time') DEFAULT 'full-time',
  package_lpa DECIMAL(8,2) NULL,
  openings INT DEFAULT 1,
  min_cgpa DECIMAL(4,2) DEFAULT 0,
  allowed_branches TEXT,
  graduation_years TEXT,
  required_skills TEXT,
  application_deadline DATE,
  status ENUM('open', 'closed') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  job_id INT NOT NULL,
  student_id INT NOT NULL,
  status ENUM('applied', 'shortlisted', 'rejected', 'interview', 'selected', 'offer') DEFAULT 'applied',
  notes TEXT NULL,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_application (job_id, student_id),
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS placement_drives (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  drive_date DATE,
  venue VARCHAR(200),
  min_cgpa DECIMAL(4,2) DEFAULT 0,
  allowed_branches TEXT,
  graduation_years TEXT,
  status ENUM('upcoming', 'ongoing', 'completed', 'cancelled') DEFAULT 'upcoming',
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS interviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL,
  round_name VARCHAR(100) NOT NULL,
  interview_date DATETIME NOT NULL,
  mode ENUM('online', 'offline') DEFAULT 'online',
  location_or_link VARCHAR(255),
  status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
  feedback TEXT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);
