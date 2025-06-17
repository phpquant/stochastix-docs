# Getting Started

Welcome to Stochastix\! This guide will walk you through setting up the framework so you can start backtesting your first trading strategy. We offer two installation paths: a one-command Docker setup (recommended for new projects) and a manual setup for integrating Stochastix into existing Symfony applications.

Be sure to read [What's Stochastix?](/introduction.md) page to understand the framework's purpose and capabilities before diving into the installation.

## Docker Installation <Badge type="tip" text="Recommended" />

::: tip The Easy Way
This is the fastest and easiest way to get started with a fresh Stochastix project. The installer handles the creation of a new Symfony application, installation of the Stochastix bundle, and Docker configuration in a single command.
:::

Open your terminal and run the following command. Replace `your-project-name` with the desired directory name for your new project.

```bash
docker run --rm -it --pull=always -e HOST_PWD="$PWD" \
  -v "$PWD":/app -v /var/run/docker.sock:/var/run/docker.sock \
  ghcr.io/phpquant/stochastix-installer your-project-name
```

The installer will:

1.  Create a new directory named `your-project-name`.
2.  Set up a new Symfony project inside it.
3.  Install the `stochastix/core` bundle and its dependencies.
4.  Create `compose.yaml` file for a ready-to-use development environment.

Once the process is complete, your Stochastix environment is now running and ready for use.

You can access https://localhost in your web browser to access the user interface.

Next step: visit the [Docker tooling](/docker-tooling.md) page to understand how to manage your Docker environment, including starting and stopping the containers, and launching commands inside the container.

## Manual Installation

Use this method if you want to integrate Stochastix into an existing Symfony project or prefer to manage your environment manually.

### Requirements

Before you begin, ensure your environment meets the following criteria:

  * **PHP 8.4** or newer.
  * The following PHP extensions must be enabled:
      * `bcmath` (for high-precision financial calculations)
      * `trader` (for technical analysis indicators)
      * `ds` (for high-performance data structures)
      * `pdo_sqlite` (for SQLite database support)
      * `gmp` (for arbitrary precision arithmetic)
  * **Composer** installed globally.

### Step 1. Install the Bundle

Navigate to your Symfony project's root directory and run the following command to add Stochastix as a dependency:

```bash
composer require stochastix/core
```

This bundle requires `williarin/cook` Composer plugin to run in order to install the package's necessary files to your project. At installation, it will automatically prompt you to allow the plugin to run.

### Step 2. Download the UI assets

To use the Stochastix web interface, you need to download the UI assets. Visit the Stochastix UI repository and download the latest release: https://github.com/phpquant/stochastix-ui/releases

Extract the contents of the downloaded archive into the `.ui/` directory of your Symfony project.

### Step 3. Configure your web server

Ideally you should use FrankenPHP for easy installation. You can copy the configuration files from the Stochastix Docker installer into your project: https://github.com/phpquant/stochastix/tree/master/templates/frankenphp

### Step 4. Run the Symfony Messenger worker

All backtesting and data processing tasks are handled by Symfony Messenger. To start the worker, run the following command in your project root:

```bash
bin/console messenger:consume stochastix --time-limit=3600 --memory-limit=512M -vv
```

### Verifying the Installation

You can verify that the framework is correctly installed by listing the available commands. From your project root, run:

```bash
bin/console list stochastix
```

You should see a list of all the `stochastix:*` commands, such as `stochastix:backtesting` and `stochastix:data:download`.

## Headless & CLI-Driven
While the web interface provides a powerful and user-friendly way to launch backtests and visualize results, it is entirely optional.

The Stochastix engine is designed to be fully operational from the command line. Every feature, from downloading data to running complex backtests can be executed in a terminal.
