🛠️ Technology Stack
Technology	Note
Node.js	LTS runtime (24.x or higher)
TypeScript	use latest version, dont use beta version
Express.js	Modular router architecture
PostgreSQL	Relational database, native pg driver only
Raw SQL	Direct pool.query() calls, absolutely no query builders, ORMs, or SQL JOINs
bcrypt	Password hashing, salt rounds between 8 and 12
jsonwebtoken	JWT generation & verification (standard tokens)

--- Database Schema Design-------
Table 1: users
Field	Requirement (Plain Text)
id	Auto-incrementing unique identifier for each account
name	Full display name of the team member, must be provided
email	Valid login address, must be unique across all accounts, must be provided
password	Encrypted string stored securely, must be provided during registration, never returned in responses
role	Determines system access level, defaults to contributor, must be contributor or maintainer
created_at	Timestamp marking when the account was created, automatically generated on insert
updated_at	Timestamp marking when the account was last updated, automatically refreshed on update
Table 2: issues
Field	Requirement (Plain Text)
id	Auto-incrementing unique identifier for each reported item
title	Short descriptive headline, must be provided, maximum 150 characters
description	Detailed explanation of the problem or suggestion, must be provided, minimum 20 characters
type	Categorizes the entry, must be either bug or feature_request
status	Current workflow state, defaults to open. Status must be one of: open, in_progress, resolved
reporter_id	References the user who submitted the issue (no foreign key constraint required; validate in application logic)
created_at	Timestamp marking when the issue was created, automatically generated on insert
updated_at	Timestamp marking when the issue was last updated, automatically refreshed on update



-> api end points
--User Registration--
  /api/auth/signup

--User Login --
/api/auth/login

--Create Issue--
/api/issues

--Get All Issues--
/api/issues for sorting like this /api/issues?sort=newest

--Get Single Issue--
/api/issues/:id

--Update Issue--
PATCH /api/issues/:id

--Delete Issue--
DELETE /api/issues/:id

---------- LIVE LINK ON VERCEL --------------
https://github.com/mahdi839/programmin_hero_assignment_02

