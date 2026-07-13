#!/bin/sh

# TODO: remove later
if [ "$I_UNDERSTAND_REST_API_BREAKING_CHANGES" != "true" ]; then
    echo ""
    echo "=================================================================="
    echo "                         BREAKING CHANGES                        "
    echo "                         Remnawave 3.0.0                          "
    echo "=================================================================="
    echo ""
    echo "This dev-branch build contains BREAKING CHANGES in the REST API."
    echo ""
    echo "If you are NOT sure, stay on the previous dev-branch version by"
    echo "pinning the image digest in your docker-compose.yml:"
    echo ""
    echo "  image: remnawave/backend@sha256:75b8f1d25b0d7754436e62df0e32f67e7592a6cb64dfe01d426d35e741032c59"
    echo ""
    echo "If you understand the consequences and want to continue anyway,"
    echo "set the following environment variable:"
    echo ""
    echo "  I_UNDERSTAND_REST_API_BREAKING_CHANGES=true"
    echo ""
    echo "You can also deploy the latest dev-branch and try it out at:"
    echo ""
    echo "  https://try.rw"
    echo ""
    echo "=================================================================="
    exit 1
fi

echo "Starting entrypoint script..."

PRISMA="/opt/app/node_modules/.bin/prisma"

echo "Migrating database..."
if ! "$PRISMA" migrate deploy; then
    echo "Database migration failed! Exiting container..."
    exit 1
fi

echo "Migrations deployed successfully!"

echo "Seeding database..."
if ! "$PRISMA" db seed; then
    echo "Database seeding failed! Exiting container..."
    exit 1
fi

echo "Entrypoint script completed."
exec "$@"