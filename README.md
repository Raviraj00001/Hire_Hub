# HireHub

Simple full-stack Job Portal built with:

- React frontend
- Spring Boot backend
- MySQL database

## Project Structure

```text
backend/
frontend/
```

## Backend Setup

1. Create the MySQL database used in [backend/src/main/resources/application.properties](/c:/Users/Ravi%20raj%20kumar/Pm4/backend/src/main/resources/application.properties). Your current config points to `hirehub`.
2. Open [backend/src/main/resources/application.properties](/c:/Users/Ravi%20raj%20kumar/Pm4/backend/src/main/resources/application.properties) and update the MySQL username/password if needed.
3. Run the backend:

```bash
cd backend
run-backend.bat
```

Backend runs on `http://localhost:8080`.

## Frontend Setup

1. Install frontend dependencies:

```bash
cd frontend
npm install
```

2. Start the frontend:

```bash
npm run dev
```

Frontend runs on `http://localhost:3000`.

## GitHub Pages Deployment

Frontend GitHub Pages URL:

```text
https://ravirajj0001.github.io/Hire_Hub/
```

Important:

- GitHub Pages hosts only the frontend
- backend must be deployed separately
- set your deployed backend URL in [frontend/.env.production](/c:/Users/Ravi%20raj%20kumar/Pm4/frontend/.env.production)

Deployment guide:

- [frontend/DEPLOYMENT.md](/c:/Users/Ravi%20raj%20kumar/Pm4/frontend/DEPLOYMENT.md)

## Main Features

- Register and login with simple database storage
- Job seekers can view jobs, apply, and check their applications
- Employers can post jobs, view their jobs, and see applicants
- Logged-in user is stored in browser `localStorage`
- Resume upload and recruiter resume viewing
- Shortlist email notification from recruiter to applicant
- Simple keyword-based resume analyzer for recruiters

## Resume Analyzer

HireHub now includes a beginner-friendly resume analyzer.

How it works:

1. A job seeker applies with a resume.
2. A recruiter opens the job details page.
3. The recruiter enters required skills or specification in the text box.
4. The recruiter clicks `Analyze Resume` for an applicant.
5. HireHub shows:
   - match score
   - matched skills
   - missing skills
   - recommendation
   - short summary

Example specification:

```text
Java, Spring Boot, MySQL, REST API
```

Supported resume formats for analysis:

- `PDF`
- `DOCX`
- `TXT`

Current limitation:

- `DOC` resumes can still be uploaded, but keyword analysis currently supports `PDF`, `DOCX`, and `TXT`.

## Email Notification Setup

To send shortlist emails, update these values in [backend/src/main/resources/application.properties](/c:/Users/Ravi%20raj%20kumar/Pm4/backend/src/main/resources/application.properties):

```properties
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

For Gmail, use an App Password instead of your normal password.
