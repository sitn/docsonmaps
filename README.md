# Getting started

```
npm i
npm start
```

## Deploy

Don't forget to add to `version.html` what you've done.

Create a `.env.prod` file and set your vars like:

```env
VITE_BASE_URL=/path/to/your/app
VITE_API_URL=your.backend.com/apps/health
```

For some reason, `env.prod` has to be in `src` directory and at the root of the project. Start by building and pushing:

```powershell
docker compose build
docker compose push
```

Set the DOCKER_HOST environment variable and launch the build/run :

```powershell
$env:DOCKER_HOST="<PATH_TO_REMOTE_HOST>"
docker compose pull
docker compose up -d
```
