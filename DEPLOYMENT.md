# Automatic deployment from GitHub

## How it works

1. A push to the default `main` branch starts GitHub Actions.
2. GitHub builds the Dockerfile and publishes:
   `ghcr.io/tomaszmroczynski/limes-decor:latest`.
3. Watchtower checks the registry every five minutes.
4. When the image digest changes, it pulls the new image, recreates `shop`,
   and removes the previous image.

Only containers with the `com.centurylinklabs.watchtower.enable=true` label are
updated.

## GitHub setup

1. Put the project files in the root of
   `https://github.com/tomaszmroczynski/limes-decor`.
2. Make sure its default branch is named `main`.
3. Push the repository. No custom Actions secret is needed because the workflow
   publishes with the repository's `GITHUB_TOKEN`.
4. After the first successful workflow, open the package settings on GitHub and
   set the container package visibility to `Public`.

Keeping the package public is the simplest option because the Synology server
can pull it without storing a GitHub token.

## Synology setup

Create `.env` next to `compose.yaml`:

```env
IMAGE_REPOSITORY=ghcr.io/tomaszmroczynski/limes-decor:latest
```

Start the deployment:

```sh
docker compose pull
docker compose up -d
```

The shop is exposed on port `10000`:

```text
http://SYNOLOGY_IP:10000
```

Check the automatic updater:

```sh
docker compose logs -f watchtower
```

## Private container package

If the GHCR package must remain private, log in on the Synology server before
the first deployment:

```sh
echo "$GHCR_TOKEN" | docker login ghcr.io -u GITHUB_USERNAME --password-stdin
```

The token needs only the `read:packages` permission. Watchtower must also be
given access to the Docker credentials by adding this volume:

```yaml
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - /root/.docker/config.json:/config.json:ro
```

For a public package, do not add the credentials volume.
