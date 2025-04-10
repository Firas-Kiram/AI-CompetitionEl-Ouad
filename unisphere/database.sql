-- UniSphere Enhanced Database Schema

-- Drop database if it exists
DROP DATABASE IF EXISTS unisphere;

-- Create database
CREATE DATABASE unisphere;
USE unisphere;

-- University table - Basic information about universities
CREATE TABLE university (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  description TEXT,
  logo_image VARCHAR(255),
  website VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Faculty table - Academic faculties/departments within universities
CREATE TABLE faculty (
  id INT AUTO_INCREMENT PRIMARY KEY,
  university_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo_image VARCHAR(255),
  website VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (university_id) REFERENCES university(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Specialty table - Academic specialties/programs within faculties
CREATE TABLE specialty (
  id INT AUTO_INCREMENT PRIMARY KEY,
  faculty_id INT NOT NULL,
  university_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  degree_level ENUM('bachelor', 'master', 'phd', 'other'),
  time_table_link VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (university_id) REFERENCES university(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- User table - All users with role-based access control
CREATE TABLE user (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  firstname VARCHAR(255),
  lastname VARCHAR(255),
  profile_picture VARCHAR(255),
  bio TEXT,
  type ENUM('student', 'teacher', 'admin') NOT NULL,
  status ENUM('verified', 'unverified', 'banned') DEFAULT 'unverified',
  university_id INT,
  faculty_id INT,
  specialty_id INT,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (university_id) REFERENCES university(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (specialty_id) REFERENCES specialty(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Student table - Extended student information
CREATE TABLE student (
  id INT NOT NULL PRIMARY KEY,
  student_id_number VARCHAR(100) NOT NULL,
  student_card_image VARCHAR(255),
  enrollment_year YEAR,
  graduation_year YEAR,
  academic_level ENUM('undergraduate', 'graduate', 'postgraduate'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id) REFERENCES user(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Teacher table - Extended teacher information
CREATE TABLE teacher (
  id INT NOT NULL PRIMARY KEY,
  employee_id VARCHAR(100),
  office_location VARCHAR(255),
  office_hours TEXT,
  research_interests TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id) REFERENCES user(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Admin table - Extended admin information
CREATE TABLE admin (
  id INT NOT NULL PRIMARY KEY,
  admin_level ENUM('university', 'faculty', 'system') DEFAULT 'university',
  permissions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id) REFERENCES user(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Event types lookup table
CREATE TABLE event_type (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Events table - University events with enhanced details
CREATE TABLE events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  university_id INT NOT NULL,
  faculty_id INT,
  organizer_id INT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_type_id INT,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location VARCHAR(255),
  location_url VARCHAR(255),
  virtual_meeting_link VARCHAR(255),
  is_virtual BOOLEAN DEFAULT FALSE,
  max_participants INT,
  current_participants INT DEFAULT 0,
  prerequisites TEXT,
  image VARCHAR(255),
  attachment_url VARCHAR(255),
  prizes TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_cancelled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (university_id) REFERENCES university(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (organizer_id) REFERENCES user(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (event_type_id) REFERENCES event_type(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Event schedule items - Detailed agenda for events
CREATE TABLE event_schedule (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  title VARCHAR(255),
  speaker VARCHAR(255),
  time_slot TIME NOT NULL,
  end_time TIME,
  activity TEXT NOT NULL,
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Event participation table - Track who's attending which events
CREATE TABLE event_participant (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  user_id INT NOT NULL,
  status ENUM('registered', 'attended', 'cancelled', 'waitlisted') DEFAULT 'registered',
  registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  feedback TEXT,
  rating INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY unique_event_user (event_id, user_id)
);

-- News table - University news and announcements
CREATE TABLE news (
  id INT AUTO_INCREMENT PRIMARY KEY,
  university_id INT NOT NULL,
  faculty_id INT,
  author_id INT,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  summary TEXT,
  image VARCHAR(255),
  publication_date DATE,
  is_featured BOOLEAN DEFAULT FALSE,
  link VARCHAR(255),
  tags VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (university_id) REFERENCES university(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (author_id) REFERENCES user(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Posts for the feed - Social interactions
CREATE TABLE post (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  image VARCHAR(255),
  privacy ENUM('public', 'university', 'faculty', 'private') DEFAULT 'public',
  total_likes INT DEFAULT 0,
  total_comments INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Post likes
CREATE TABLE post_like (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES post(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY unique_post_like (post_id, user_id)
);

-- Comments on posts
CREATE TABLE post_comment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES post(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Marketplace categories
CREATE TABLE marketplace_category (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Marketplace listings
CREATE TABLE marketplace_listing (
  id INT AUTO_INCREMENT PRIMARY KEY,
  seller_id INT NOT NULL,
  category_id INT,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  is_negotiable BOOLEAN DEFAULT FALSE,
  condition VARCHAR(50),
  location VARCHAR(255),
  university_id INT,
  image VARCHAR(255),
  additional_images TEXT,
  status ENUM('available', 'sold', 'pending', 'removed') DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES user(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (category_id) REFERENCES marketplace_category(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (university_id) REFERENCES university(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Marketplace messages between buyers and sellers
CREATE TABLE marketplace_message (
  id INT AUTO_INCREMENT PRIMARY KEY,
  listing_id INT NOT NULL,
  sender_id INT NOT NULL,
  recipient_id INT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (listing_id) REFERENCES marketplace_listing(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES user(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (recipient_id) REFERENCES user(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Academic calendar and important dates
CREATE TABLE academic_calendar (
  id INT AUTO_INCREMENT PRIMARY KEY,
  university_id INT NOT NULL,
  faculty_id INT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  event_type ENUM('semester_start', 'semester_end', 'exam_period', 'holiday', 'registration', 'other'),
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_pattern VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (university_id) REFERENCES university(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Course table - Academic courses
CREATE TABLE course (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  credits INT,
  faculty_id INT,
  specialty_id INT,
  semester VARCHAR(50),
  instructor_id INT,
  syllabus_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (specialty_id) REFERENCES specialty(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (instructor_id) REFERENCES user(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Course materials and resources
CREATE TABLE course_material (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url VARCHAR(255),
  material_type ENUM('lecture_notes', 'assignment', 'reading', 'video', 'other'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES course(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Timetable table - Student course schedules
CREATE TABLE timetable (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room VARCHAR(100),
  building VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (course_id) REFERENCES course(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Notifications system
CREATE TABLE notification (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('event', 'post', 'comment', 'marketplace', 'academic', 'system') NOT NULL,
  reference_id INT,
  reference_type VARCHAR(50),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- User connections/friendships
CREATE TABLE user_connection (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  connected_user_id INT NOT NULL,
  status ENUM('pending', 'accepted', 'rejected', 'blocked') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (connected_user_id) REFERENCES user(id) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY unique_connection (user_id, connected_user_id)
);

-- Chat conversations
CREATE TABLE chat_conversation (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  is_group BOOLEAN DEFAULT FALSE,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES user(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Chat conversation participants
CREATE TABLE chat_participant (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversation_id INT NOT NULL,
  user_id INT NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  left_at TIMESTAMP NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES chat_conversation(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY unique_conversation_user (conversation_id, user_id)
);

-- Chat messages
CREATE TABLE chat_message (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversation_id INT NOT NULL,
  sender_id INT NOT NULL,
  message TEXT NOT NULL,
  attachment_url VARCHAR(255),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES chat_conversation(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES user(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Study groups
CREATE TABLE study_group (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  course_id INT,
  created_by INT NOT NULL,
  university_id INT,
  faculty_id INT,
  is_private BOOLEAN DEFAULT FALSE,
  image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES course(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (created_by) REFERENCES user(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (university_id) REFERENCES university(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Study group members
CREATE TABLE study_group_member (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_id INT NOT NULL,
  user_id INT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES study_group(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY unique_group_member (group_id, user_id)
);

-- Insert sample data for event types
INSERT INTO event_type (name, description, icon) VALUES 
('Competition', 'Contests, hackathons, and other competitive events', 'trophy'),
('Learning', 'Workshops, seminars, and educational programs', 'school'),
('Conference', 'Large-scale events featuring multiple speakers and sessions', 'microphone'),
('Exhibition', 'Showcases of art, projects, or research', 'image'),
('Workshop', 'Hands-on, interactive learning sessions', 'tools'),
('Social', 'Networking and social gatherings', 'account-group'),
('Career', 'Job fairs, recruitment events, and career development', 'briefcase'),
('Cultural', 'Cultural celebrations and activities', 'palette');

-- Insert sample university data
INSERT INTO university (name, location, description, logo_image, website) VALUES
('MIT University', 'Cambridge, MA', 'Massachusetts Institute of Technology', '/images/universities/mit.png', 'https://www.mit.edu'),
('Harvard University', 'Cambridge, MA', 'Harvard University', '/images/universities/harvard.png', 'https://www.harvard.edu'),
('Stanford University', 'Stanford, CA', 'Stanford University', '/images/universities/stanford.png', 'https://www.stanford.edu'),
('Carnegie Mellon', 'Pittsburgh, PA', 'Carnegie Mellon University', '/images/universities/cmu.png', 'https://www.cmu.edu'),
('RISD', 'Providence, RI', 'Rhode Island School of Design', '/images/universities/risd.png', 'https://www.risd.edu');

-- Insert sample marketplace categories
INSERT INTO marketplace_category (name, description, icon) VALUES
('Textbooks', 'Academic books and course materials', 'book'),
('Electronics', 'Computers, phones, and other electronics', 'laptop'),
('Furniture', 'Dorm and apartment furniture', 'chair-rolling'),
('Clothing', 'Apparel, accessories, and university merchandise', 'tshirt-crew'),
('Services', 'Tutoring, rides, and other services', 'account-wrench'),
('Housing', 'Apartments, roommate searches, and sublets', 'home'),
('Free Stuff', 'Items being given away for free', 'gift');

-- Create stored procedure to update post counters
DELIMITER //
CREATE PROCEDURE update_post_counters(IN post_id INT)
BEGIN
    UPDATE post p 
    SET 
        p.total_likes = (SELECT COUNT(*) FROM post_like WHERE post_id = p.id),
        p.total_comments = (SELECT COUNT(*) FROM post_comment WHERE post_id = p.id)
    WHERE p.id = post_id;
END //
DELIMITER ;

-- Create stored procedure to update event participant count
DELIMITER //
CREATE PROCEDURE update_event_participant_count(IN event_id INT)
BEGIN
    UPDATE events e 
    SET 
        e.current_participants = (SELECT COUNT(*) FROM event_participant WHERE event_id = e.id AND status = 'registered')
    WHERE e.id = event_id;
END //
DELIMITER ;

-- Create triggers to maintain counts
DELIMITER //
CREATE TRIGGER after_post_like_insert
AFTER INSERT ON post_like
FOR EACH ROW
BEGIN
    CALL update_post_counters(NEW.post_id);
END //

CREATE TRIGGER after_post_like_delete
AFTER DELETE ON post_like
FOR EACH ROW
BEGIN
    CALL update_post_counters(OLD.post_id);
END //

CREATE TRIGGER after_post_comment_insert
AFTER INSERT ON post_comment
FOR EACH ROW
BEGIN
    CALL update_post_counters(NEW.post_id);
END //

CREATE TRIGGER after_post_comment_delete
AFTER DELETE ON post_comment
FOR EACH ROW
BEGIN
    CALL update_post_counters(OLD.post_id);
END //

CREATE TRIGGER after_event_participant_insert
AFTER INSERT ON event_participant
FOR EACH ROW
BEGIN
    IF NEW.status = 'registered' THEN
        CALL update_event_participant_count(NEW.event_id);
    END IF;
END //

CREATE TRIGGER after_event_participant_update
AFTER UPDATE ON event_participant
FOR EACH ROW
BEGIN
    IF NEW.status != OLD.status THEN
        CALL update_event_participant_count(NEW.event_id);
    END IF;
END //

CREATE TRIGGER after_event_participant_delete
AFTER DELETE ON event_participant
FOR EACH ROW
BEGIN
    CALL update_event_participant_count(OLD.event_id);
END //
DELIMITER ; 