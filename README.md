# Remnawave Backend Fork

This is an unofficial fork of [remnawave/backend](https://github.com/remnawave/backend).

The fork tracks upstream Remnawave and adds Cloudflare Access authentication support for deployments where the panel is protected by Cloudflare Access.

## What Is Added

- Cloudflare Access login endpoint: `POST /api/auth/cloudflare-access`
- Validation of `Cf-Access-Jwt-Assertion` against Cloudflare Access JWKS/certs
- Issuer and audience validation for the configured Cloudflare Access application
- Optional Remnawave-side email/domain allowlist
- Ability to disable the extra email allowlist when Cloudflare Access policy is authoritative
- Cloudflare Access settings in Remnawave settings storage and API contracts
- Auth status response flag for frontend auto-login support
- Fork workflows for building GHCR and optional Docker Hub images

The implementation does not trust `Cf-Access-Authenticated-User-Email` directly. The authenticated email is read from the verified Cloudflare Access JWT payload.

## Images

GHCR images:

```text
ghcr.io/celestialhq/rw-backend:dev
ghcr.io/celestialhq/rw-backend:main
ghcr.io/celestialhq/rw-backend:<tag>
ghcr.io/celestialhq/rw-backend:2
ghcr.io/celestialhq/rw-backend:latest
```

Docker Hub images, when Docker Hub secrets are configured:

```text
piuspp/rw-backend:dev
piuspp/rw-backend:main
piuspp/rw-backend:<tag>
piuspp/rw-backend:2
piuspp/rw-backend:latest
```

The `:2` tag is updated only for release tags that start with `2.`.

## Frontend Artifact

The backend image embeds the frontend ZIP during Docker build.

For this fork, workflows are configured to use:

```text
https://github.com/celestialhq/rw-frontend/releases/download/dev-build/remnawave-frontend.zip
```

for dev builds, and the matching tagged release ZIP for release builds.

## GitHub Actions Configuration

Required repository or organization variables:

```text
FRONTEND_REPOSITORY=celestialhq/rw-frontend
DOCKERHUB_BACKEND_IMAGE=piuspp/rw-backend
```

Optional Docker Hub secrets:

```text
DOCKERHUB_USERNAME
DOCKERHUB_TOKEN
```

Optional notification secrets:

```text
TELEGRAM_TOKEN
TELEGRAM_CHAT_ID
TELEGRAM_TOPIC_ID
```

Optional OpenAPI upload secrets:

```text
R2_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET
```

## Upstream

Original project documentation is available at [docs.rw](https://docs.rw/).

Upstream repository: [remnawave/backend](https://github.com/remnawave/backend)
