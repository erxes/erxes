import * as dotenv from 'dotenv';

import { spawn, ChildProcess, execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as yaml from 'yaml';
import {
  dirTempPath,
  routerConfigPath,
  routerPath,
  supergraphPath,
} from '~/apollo-router/paths';
import supergraphCompose from '~/apollo-router/supergraph-compose';
import { isDev } from 'erxes-api-shared/utils';

dotenv.config();

const {
  DOMAIN,
  ALLOWED_ORIGINS,
  ALLOWED_DOMAINS,
  NODE_ENV,
  APOLLO_ROUTER_PORT,
  INTROSPECTION,
} = process.env;

let routerProcess: ChildProcess | undefined = undefined;

export const stopRouter = (signal: NodeJS.Signals) => {
  if (!routerProcess) {
    return;
  }
  try {
    routerProcess.kill(signal);
  } catch (e) {
    console.error(e);
  }
};
export const apolloRouterPort = Number(APOLLO_ROUTER_PORT) || 50_000;

const downloadRouter = async () => {
  if (NODE_ENV === 'production') {
    // router must be already inside the image
    return;
  }
  if (fs.existsSync(routerPath)) {
    return routerPath;
  }

  const version = 'v1.59.2';
  const downloadCommand = `(export VERSION=${version}; curl -sSL https://router.apollo.dev/download/nix/${version} | sh)`;
  try {
    execSync(`cd ${dirTempPath} && ${downloadCommand}`);
  } catch (e) {
    console.error(
      `Could not download apollo router. Run \`${downloadCommand}\` inside ${dirTempPath} manually`,
    );
    throw e;
  }
};

const createRouterConfig = async () => {
  if (NODE_ENV === 'production' && fs.existsSync(routerConfigPath)) {
    // Don't rewrite in production if it exists. Delete and restart to update the config
    return;
  }

  if (
    NODE_ENV === 'production' &&
    (INTROSPECTION || '').trim().toLowerCase() === 'true'
  ) {
    console.warn(
      '----------------------------------------------------------------------------------------------',
    );
    console.warn(
      "Graphql introspection is enabled in production environment. Disable it, if it isn't required for front-end development. Hint: Check gateway config in configs.json",
    );
    console.warn(
      '----------------------------------------------------------------------------------------------',
    );
  }

  const config: any = {
    traffic_shaping: {
      all: {
        timeout: '300s',
      },
      router: {
        timeout: '300s',
      },
    },
    include_subgraph_errors: {
      all: true,
    },
    rhai: {
      scripts: path.resolve(__dirname, 'rhai'),
      main: 'main.rhai',
    },
    cors: {
      allow_credentials: true,
      origins: [
        DOMAIN ? DOMAIN : 'http://localhost:3001',
        ...(isDev ? ['http://localhost:3001'] : []),
        ...(ALLOWED_DOMAINS || '').split(','),
        'https://studio.apollographql.com',
      ].filter((x) => typeof x === 'string'),
      match_origins: (ALLOWED_ORIGINS || '').split(',').filter(Boolean),
    },
    headers: {
      all: {
        request: [
          {
            propagate: {
              matching: '.*',
            },
          },
        ],
      },
    },
    supergraph: {
      listen: `127.0.0.1:${apolloRouterPort}`,
      introspection:
        NODE_ENV === 'development' ||
        (INTROSPECTION || '').trim().toLowerCase() === 'true',
    },
  };

  fs.writeFileSync(routerConfigPath, yaml.stringify(config));
};

export const startRouter = async (proxy) => {
  await createRouterConfig();
  console.log('Downloading router...');
  await downloadRouter();
  await supergraphCompose(proxy);
  console.log('Creating router config...');

  const devOptions = ['--dev'];

  routerProcess = spawn(
    routerPath,
    [
      ...devOptions,
      '--log',
      NODE_ENV === 'development' ? 'warn' : 'error',
      `--supergraph`,
      supergraphPath,
      `--config`,
      routerConfigPath,
    ],
    { stdio: 'inherit' },
  );
};
