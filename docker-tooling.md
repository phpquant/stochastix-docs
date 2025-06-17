# Docker Tooling with Makefile

To simplify interaction with the Docker environment, Stochastix comes with a pre-configured `Makefile` in the root of your project. It contains convenient shortcuts for most common operations, from managing containers to running Composer and Symfony commands.

::: info
All `make` commands should be run from the root directory of your project (the same directory where the `Makefile` is located).
:::

## General

### Displaying Help

This is the most useful command to start with. It lists all available commands directly from the `Makefile` along with their descriptions.

```bash
make help
```

## Docker Container Management

These commands are wrappers around `docker compose` to manage the lifecycle of your development environment.

* **`make start`**
    Builds the Docker images if they don't exist and starts all containers in detached mode. This is the typical command to start your work session.

* **`make up`**
    Starts the containers without rebuilding them. Useful if you've previously run `make down`.

* **`make down`**
    Stops and removes all running containers for this project.

* **`make build`**
    Forces a rebuild of the Docker images, pulling the latest base images and ignoring any cache. Use this if you've changed the `Dockerfile` or need to ensure you have the latest updates.

* **`make logs`**
    Attaches to the logs of all running containers so you can see their output in real-time. Press `Ctrl+C` to detach.

* **`make sh` or `make bash`**
    Opens an interactive shell session inside the main `php` container. This is the primary way to run commands within the Dockerized environment. `make bash` is often preferred as it provides better support for command history (using arrow keys).

* **`make spawn c="..."`**
    Spawns a new, temporary container to run a single command and then exits. This is useful for one-off tasks without attaching to a long-running container.

    ```bash
    # Example: Check the installed PHP modules
    make spawn c="php -m"
    ```

* **`make test c="..."`**
    Runs the PHPUnit test suite inside a dedicated test environment. You can pass additional arguments to `phpunit` using the `c=` parameter.

    ```bash
    # Run all tests
    make test
    
    # Run a specific group of tests and stop on the first failure
    make test c="--group e2e --stop-on-failure"
    ```

## Application & Dependencies

These commands help you manage your project's dependencies and application state without needing to type long `docker compose exec` commands.

### Composer

* **`make install`**
    Installs all PHP dependencies based on your `composer.lock` file.

* **`make update`**
    Updates your PHP dependencies to their latest allowed versions according to `composer.json`.

* **`make composer c="..."`**
    Runs any arbitrary Composer command.

    ```bash
    # Require a new package
    make composer c="require symfony/orm-pack"
    
    # Show information about a package
    make composer c="show symfony/console"
    ```

### Symfony Console

* **`make sf c="..."`**
    The main shortcut for executing Symfony commands via `bin/console`.

    ::: details Example: Running Stochastix Commands
    This is the recommended way to run all `stochastix:*` commands documented throughout this site.
    ```bash
    # Download market data
    make sf c="stochastix:data:download binance BTC/USDT 1d --start-date=2023-01-01"
    
    # Run a backtest
    make sf c="stochastix:backtesting ema_cross"
    ```
    :::

* **`make cc`**
    A quick shortcut for clearing the Symfony cache (`make sf c=cache:clear`).

* **`make xsf c="..."`**
    Runs a Symfony command with Xdebug enabled, allowing you to connect a debugger for step-by-step analysis.
