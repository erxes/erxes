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

dotenv.config();

const { NODE_ENV, APOLLO_ROUTER_PORT, INTROSPECTION } = process.env;

let routerProcess: ChildProcess | undefined = undefined;
let hasRouterStarted = false;

const waitForRouterExit = async (signal: NodeJS.Signals) => {
  if (!routerProcess) {
    return;
  }

  const processToStop = routerProcess;

  await new Promise<void>((resolve) => {
    const timeout = setTimeout(resolve, 5000);

    processToStop.once('exit', () => {
      clearTimeout(timeout);
      resolve();
    });

    try {
      processToStop.kill(signal);
    } catch (e) {
      clearTimeout(timeout);
      console.error(e);
      resolve();
    }
  });

  if (routerProcess === processToStop) {
    routerProcess = undefined;
  }
};

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

const spawnRouter = () => {
  const devOptions = ['--dev'];

  routerProcess = spawn(
    routerPath,
    [
      ...(NODE_ENV === 'development' ? devOptions : []),
      '--log',
      NODE_ENV === 'development' ? 'warn' : 'error',
      `--supergraph`,
      supergraphPath,
      `--config`,
      routerConfigPath,
    ],
    { stdio: 'inherit' },
  );

  routerProcess.once('exit', (code, signal) => {
    console.error(
      `Apollo Router exited with code=${code ?? 'null'} signal=${
        signal ?? 'null'
      }`,
    );

    routerProcess = undefined;
  });
};

export const startRouter = async (proxy) => {
  await createRouterConfig();
  console.log('Downloading router...');
  await downloadRouter();
  await supergraphCompose(proxy);
  console.log('Creating router config...');

  spawnRouter();
  hasRouterStarted = true;
};

export const restartRouter = async (proxy) => {
  console.log('Restarting Apollo Router...');

  if (!hasRouterStarted) {
    await supergraphCompose(proxy);
    console.log('Apollo Router is not running yet; supergraph refreshed');
    return;
  }

  await waitForRouterExit('SIGTERM');
  await supergraphCompose(proxy);
  spawnRouter();
  console.log('Apollo Router restarted successfully');
};
