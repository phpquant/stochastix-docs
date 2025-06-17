# Getting Started

Welcome to Stochastix\! This guide will walk you through setting up the framework so you can start backtesting your first trading strategy. We offer two installation paths: a one-command Docker setup (recommended for new projects) and a manual setup for integrating Stochastix into existing Symfony applications.

Be sure to read [What's Stochastix?](/introduction.md) page to understand the framework's purpose and capabilities before diving into the installation.

## Docker Installation <Badge type="tip" text="Recommended" />

This is the fastest and easiest way to get started with a fresh Stochastix project. You do not need any prior knowledge of Docker to use this method; you just need to have Docker Desktop installed on your system.

::: info Prerequisites

1.  **Install Docker Desktop**: Download and install the version for your operating system from the official website.

      * [**Download Docker Desktop**](https://www.docker.com/products/docker-desktop/)

2.  **(Windows Users Only) Install WSL 2**: Docker Desktop on Windows requires the Windows Subsystem for Linux (WSL) 2 backend. If you don't have it installed, follow the official Microsoft guide.

      * [**Microsoft's Guide to Installing WSL**](https://learn.microsoft.com/en-us/windows/wsl/install)
:::

### Run the Installer

Once Docker Desktop is installed and running, open your terminal and run the following command. Replace `your-project-name` with the desired directory name for your new project.

```bash
docker run --rm -it --pull=always -e HOST_PWD="$PWD" \
  -v "$PWD":/app -v /var/run/docker.sock:/var/run/docker.sock \
  ghcr.io/phpquant/stochastix-installer your-project-name
```

The installer will perform the following steps:

1.  Create a new directory named `your-project-name`.
2.  Set up a new Symfony project inside it.
3.  Install the `stochastix/core` bundle and its dependencies.
4.  Create a `compose.yaml` file for a ready-to-use development environment.

### First Launch

Once the process is complete, your Stochastix environment is now running and ready for use.

You can access **https://localhost** in your web browser to access the user interface.

::: tip Next Step
Visit the [Docker tooling](/docker-tooling) page to understand how to manage your Docker environment and run commands.
:::

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
