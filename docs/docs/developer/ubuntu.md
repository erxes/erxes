---
id: ubuntu
title: Ubuntu
sidebar_label: Ubuntu
---
---

# Installing from CLI

Strapi CLI (Command Line Interface) installation scripts are the fastest way to get Strapi running locally. The following guide is the installation option most recommended by Strapi.

## Preparing the installation

The CLI installation guide requires at least two software prerequisites to be already installed on your computer:

- <a href="https://github.com/git-guides/install-git" target="_blank">Git</a>
- [Node.js](https://nodejs.org): only LTS versions are supported (v14 and v16). Other versions of Node.js may not be compatible with the latest release of erxes. The 14.x version is most recommended by erxes.
- [npm](https://docs.npmjs.com/cli/v6/commands/npm-install) (v6 only) or [yarn](https://yarnpkg.com/getting-started/install) to run the CLI installation scripts.
- <a href="https://docs.docker.com/engine/install/">Docker</a>


## Creating a Strapi project

::: strapi CLI installation options
The following installation guide covers the most basic installation option using the CLI. There are however other options that can be used when creating a new Strapi project:

- Using the `--quickstart` flag at the end of the command to directly create the project in quickstart mode.
- Using the `--template` flag at the end of the command to create a project with pre-made Strapi configurations (see [Templates](templates.md)).
- Using the `--typescript` flag (or the shorter version `--ts`) at the end of the command to create a project in [TypeScript](/developer-docs/latest/development/typescript.md).
- Using the `--no-run` flag will prevent Strapi from automatically starting the server (useful in combination with `--quickstart`)

For more information on available flags, see our [CLI documentation](/developer-docs/latest/developer-resources/cli/CLI.md).

Strapi also offers a starters CLI to create a project with a pre-made frontend application (see [our dedicated blog post](https://strapi.io/blog/announcing-the-strapi-starter-cli)).
:::

1. In a terminal, run the following command:

<code-group>

<code-block title="NPM">
```sh
npx create-strapi-app@latest my-project
```
</code-block>

<code-block title="YARN">
```sh
yarn create strapi-app my-project
```
</code-block>

</code-group>

2. Choose an installation type:

   - `Quickstart (recommended)`, which uses the default database (SQLite)
   - `Custom (manual settings)`, which allows to choose your preferred database

3. (Custom installation type only) Among the list of databases, choose a database for your Strapi project.

4. (Custom installation type only) Name your project's database.

## Running Strapi

To start the Strapi application, run the following command in the project folder:

<code-group>

<code-block title="NPM">
```bash
npm run develop
```
</code-block>

<code-block title="YARN">
```sh
yarn develop
```
</code-block>

</code-group>
