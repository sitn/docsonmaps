# Getting started

Create `src/.env.development`:

```env
VITE_API_URL=https://sitn.ne.ch/apps_prepub/health
```
Then

```
npm i
npm start
```

### Run the image locally

```powershell
docker compose build
docker run --rm -p 5021:8080 -e VITE_API_URL=https://sitn.ne.ch/apps_prepub/health ne2harbor.ne.ch/sgrf/sitn-medecins:latest
```

Then open http://localhost:5021/

## Deploy

Don't forget to add to `version.html` what you've done.

Start by building and pushing:

```powershell
$env:TAG="1.0.$(git rev-parse --short HEAD)";
docker compose build
docker compose push
```

Set the DOCKER_HOST environment variable and launch the build/run :

```powershell
$env:DOCKER_HOST="<PATH_TO_REMOTE_HOST>"
docker compose pull
docker compose up -d
```

With `docker compose up`, pass `VITE_API_URL` through an `environment:` or `env_file:` entry in
`docker-compose.yaml`
