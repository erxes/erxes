import * as dotenv from 'dotenv';

import { spawn, ChildProcess, execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as yaml from 'yaml';
import * as net from 'net';
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
let isIntentionalRouterStop = false;
const intentionallyStoppedRouters = new WeakSet<ChildProcess>();
let routerRecoverTimer: NodeJS.Timeout | undefined;
let routerRecoverAttempt = 0;

const waitForRouterReady = async (timeoutMs = 15_000) => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (!routerProcess || routerProcess.exitCode !== null) {
      throw new Error('Apollo Router exited before it became ready');
    }

    const isReady = await new Promise<boolean>((resolve) => {
      const socket = net.createConnection({
        host: '127.0.0.1',
        port: apolloRouterPort,
      });

      socket.once('connect', () => {
        socket.destroy();
        resolve(true);
      });

      socket.once('error', () => {
        socket.destroy();
        resolve(false);
      });

      socket.setTimeout(500, () => {
        socket.destroy();
        resolve(false);
      });
    });

    if (isReady) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error('Apollo Router did not become ready in time');
};

const scheduleRouterRecovery = () => {
  if (!hasRouterStarted || routerRecoverTimer) {
    return;
  }

  const targets = global.currentTargets;
  if (!targets?.length) {
    return;
  }

  routerRecoverAttempt += 1;
  const delayMs = Math.min(30_000, 1000 * routerRecoverAttempt);

  routerRecoverTimer = setTimeout(async () => {
    routerRecoverTimer = undefined;

    try {
      console.error('Attempting to recover Apollo Router...');
      await restartRouter(targets);
      routerRecoverAttempt = 0;
    } catch (e) {
      console.error(e);
      scheduleRouterRecovery();
    }
  }, delayMs);
};

const waitForRouterExit = async (signal: NodeJS.Signals) => {
  if (!routerProcess) {
    return;
  }

  const processToStop = routerProcess;
  let didExit = false;

  isIntentionalRouterStop = true;
  intentionallyStoppedRouters.add(processToStop);

  await new Promise<void>((resolve) => {
    const timeout = setTimeout(resolve, 5000);

    processToStop.once('exit', () => {
      didExit = true;
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

  if (!didExit && processToStop.exitCode === null) {
    try {
      processToStop.kill('SIGKILL');
    } catch (e) {
      console.error(e);
    }
  }

  isIntentionalRouterStop = false;

  if (routerProcess === processToStop) {
    routerProcess = undefined;
  }
};

export const stopRouter = (signal: NodeJS.Signals) => {
  if (!routerProcess) {
    return;
  }
  try {
    intentionallyStoppedRouters.add(routerProcess);
    isIntentionalRouterStop = true;
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

  const spawnedRouter = spawn(
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

  routerProcess = spawnedRouter;

  spawnedRouter.once('exit', (code, signal) => {
    console.error(
      `Apollo Router exited with code=${code ?? 'null'} signal=${
        signal ?? 'null'
      }`,
    );

    if (routerProcess === spawnedRouter) {
      routerProcess = undefined;
    }

    if (
      !isIntentionalRouterStop &&
      !intentionallyStoppedRouters.has(spawnedRouter)
    ) {
      scheduleRouterRecovery();
    }
  });
};

export const startRouter = async (proxy) => {
  await createRouterConfig();
  console.log('Downloading router...');
  await downloadRouter();
  await supergraphCompose(proxy);
  console.log('Creating router config...');

  spawnRouter();
  await waitForRouterReady();
  hasRouterStarted = true;
  routerRecoverAttempt = 0;
};

export const restartRouter = async (proxy) => {
  console.log('Restarting Apollo Router...');

  await supergraphCompose(proxy);

  if (!hasRouterStarted) {
    console.log('Apollo Router is not running yet; supergraph refreshed');
    return;
  }

  await waitForRouterExit('SIGTERM');
  spawnRouter();
  await waitForRouterReady();
  routerRecoverAttempt = 0;
  console.log('Apollo Router restarted successfully');
};
