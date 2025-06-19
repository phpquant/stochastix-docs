# Upgrading Stochastix

To ensure you benefit from the latest features, performance improvements, and bug fixes, it's important to keep both the framework code and your development environment up-to-date. This guide outlines the recommended procedures for upgrading.

## Upgrading the Framework (Core Logic)

This process updates the `stochastix/core` package and its related PHP dependencies to the latest versions defined in your `composer.json` file.

The recommended way to do this is by using the provided `Makefile` shortcut, which executes the command within the running Docker container.

```bash
# Updates composer dependencies
make update
```

:::warning Breaking Changes
Stochastix is still in development, and while we strive to maintain backward compatibility, there may be breaking changes in future development releases, until we reach a stable version.
:::

## Upgrading the Docker Environment

Your Docker environment consists of the base PHP image, system-level dependencies, and any pre-built UI assets. These do not get updated by `composer update`.

To get the latest Docker environment, you need to pull the latest image and recreate the containers.

```bash
# Pull the latest Docker image for Stochastix
docker pull ghcr.io/phpquant/stochastix:latest

# Recreate the containers with the latest image
make up
```

Following these steps will ensure that your entire Stochastix stack—from the underlying PHP version to the latest framework code—is fully up-to-date.
