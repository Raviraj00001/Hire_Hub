# Frontend Deployment

This frontend is configured for GitHub Pages using:

- GitHub username: `RavirajJ0001`
- Repository: `Hire_Hub`

Live frontend URL:

```text
https://ravirajj0001.github.io/Hire_Hub/
```

## Important

GitHub Pages can only host the React frontend.

The Spring Boot backend must be deployed separately on a Java hosting platform such as:

- Render
- Railway
- Koyeb

## Backend URL

Before deploying the frontend, open [`.env.production`](/c:/Users/Ravi%20raj%20kumar/Pm4/frontend/.env.production) and replace:

```text
https://your-backend-url.onrender.com
```

with your real deployed backend URL.

Example:

```text
VITE_API_BASE_URL=https://hirehub-backend.onrender.com
```

## Deploy Steps

This repo is configured with a GitHub Actions workflow that deploys the frontend automatically.

What to do:

1. Push your latest code to the `main` branch.
2. In GitHub, open the repository.
3. Go to `Settings` -> `Pages`.
4. Under source, choose `GitHub Actions`.
5. In GitHub, open `Settings` -> `Secrets and variables` -> `Actions` -> `Variables`.
6. Add a repository variable named `VITE_API_BASE_URL`.
7. Set its value to your deployed backend URL.

Example:

```text
https://hirehub-backend.onrender.com
```

After that, every push to `main` will build and publish the frontend automatically.

## GitHub Pages Settings

In GitHub:

1. Open the `Hire_Hub` repository
2. Go to `Settings`
3. Open `Pages`
4. Set source to `GitHub Actions`

## Local Development

Local development still uses:

```text
http://localhost:8081
```

because [api.js](/c:/Users/Ravi%20raj%20kumar/Pm4/frontend/src/api.js) falls back to the local backend when `VITE_API_BASE_URL` is not set.
