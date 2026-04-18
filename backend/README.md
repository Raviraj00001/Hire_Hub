# HireHub Backend

Simple Spring Boot backend for the HireHub job portal.

## Run

1. Create the MySQL database used in `src/main/resources/application.properties`.
2. Update `src/main/resources/application.properties` if your MySQL username or password is different.
3. Run the backend with the helper script:

```bash
run-backend.bat
```

The script will:

- use Maven from your system if it already exists
- otherwise download a portable Maven copy into `backend/.tools`
- start Spring Boot on port `8081`

## Resume Analyzer

Recruiters can analyze uploaded resumes using a simple keyword-based specification.

Flow:

1. A seeker applies with a resume.
2. The recruiter opens the job details page.
3. The recruiter enters required skills such as:

```text
Java, Spring Boot, MySQL, REST API
```

4. The recruiter clicks `Analyze Resume`.
5. The backend returns:

- required skills
- matched skills
- missing skills
- match percentage
- recommendation
- summary

Supported formats for analysis:

- `PDF`
- `DOCX`
- `TXT`

## Shortlist Email Setup

To allow recruiters to send shortlist emails, configure these values in `src/main/resources/application.properties`:

```properties
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

For Gmail, use an App Password.
