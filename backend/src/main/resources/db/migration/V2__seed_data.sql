-- Seed Users (passwords are 'password' hashed with BCrypt)
INSERT INTO users (username, email, password_hash, display_name, bio, avatar_url, status) VALUES
('john_doe', 'john@example.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'John Doe', 'Fitness enthusiast', 'https://api.dicebear.com/7.x/avataaars/svg?seed=john', 'ACTIVE'),
('jane_smith', 'jane@example.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Jane Smith', 'Yoga lover', 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane', 'ACTIVE'),
('mike_fit', 'mike@example.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Mike Fit', 'Bodybuilder', 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike', 'ACTIVE');

-- Seed Exercises
INSERT INTO exercises (name, category, description, media_url, created_by) VALUES
('Bench Press', 'STRENGTH', 'Barbell bench press', NULL, 1),
('Squat', 'STRENGTH', 'Barbell back squat', NULL, 1),
('Deadlift', 'STRENGTH', 'Conventional deadlift', NULL, 1),
('Running', 'CARDIO', 'Outdoor running', NULL, 1),
('Cycling', 'CARDIO', 'Stationary bike', NULL, 1),
('Yoga Flow', 'FLEXIBILITY', 'Vinyasa flow', NULL, 2);

-- Seed Routines
INSERT INTO routines (owner_id, title, description, is_public) VALUES
(1, 'Full Body Strength', 'Basic compound movements', TRUE),
(2, 'Morning Yoga', 'Wake up routine', TRUE);

-- Seed Routine Exercises
INSERT INTO routine_exercises (routine_id, exercise_id, order_index, sets, reps, rest_seconds) VALUES
(1, 1, 0, 3, 10, 90), -- Bench Press
(1, 2, 1, 3, 10, 90), -- Squat
(1, 3, 2, 3, 8, 120); -- Deadlift

-- Seed Workouts
INSERT INTO workouts (user_id, title, notes, start_time, end_time, duration_seconds, calories_burned, is_private) VALUES
(1, 'Monday Grind', 'Felt strong today', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '1 hour', 3600, 500, FALSE);

-- Seed Workout Exercises
INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight_kg, duration_seconds, order_index) VALUES
(1, 1, 3, 10, 80.0, NULL, 0),
(1, 2, 3, 10, 100.0, NULL, 1),
(1, 3, 3, 8, 120.0, NULL, 2);

-- Seed Follows
INSERT INTO follows (follower_id, followee_id) VALUES
(2, 1), -- Jane follows John
(3, 1); -- Mike follows John
