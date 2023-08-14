import * as dotenv from 'dotenv';
dotenv.config();

import { spawn, spawnSync, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as yaml from 'yaml';
import { ErxesProxyTarget } from 'src/proxy/targets';
import {
  routerConfigPath,
  routerPath,
  supergraphPath,
  downloadsPath
} from './paths';
import supergraphCompose from './supergraph-compose';
// import * as getPort from 'get-port';

const {
  DOMAIN,
  WIDGETS_DOMAIN,
  CLIENT_PORTAL_DOMAINS,
  ALLOWED_ORIGINS,
  NODE_ENV,
  APOLLO_ROUTER_PORT
} = process.env;

// let _apolloRouterPort: number | undefined;
// export const getApolloRouterPort = async (): Promise<number> => {
// if(!_apolloRouterPort) {
//   _apolloRouterPort = Number(APOLLO_ROUTER_PORT) || (await getPort());
// }
// if(!_apolloRouterPort){
//   throw new Error("Cannot find free port for Apollo Router");
// }
// console.log("router port ", _apolloRouterPort);
// return _apolloRouterPort;
// }

export const apolloRouterPort = Number(APOLLO_ROUTER_PORT) || 50_000;

const downloadRouter = async () => {
  if (NODE_ENV === 'production') {
    // router must be already inside the image
    return;
  }
  if (fs.existsSync(routerPath)) {
    return routerPath;
  }
  const args = [
    '-c',
    `cd ${downloadsPath} && curl -sSL https://router.apollo.dev/download/nix/v1.26.0 | sh`
  ];
  spawnSync('sh', args, { stdio: 'inherit' });
};

const createRouterConfig = async () => {
  if (NODE_ENV === 'production' && fs.existsSync(routerConfigPath)) {
    // Don't rewrite in production if it exists. Delete and restart to update the config
    return;
  }
  // const rhaiPath = path.resolve(__dirname, 'rhai/main.rhai');

  const config = {
    include_subgraph_errors: {
      all: true
    },
    rhai: {
      scripts: path.resolve(__dirname, 'rhai'),
      main: 'main.rhai'
    },
    cors: {
      allow_credentials: true,
      origins: [
        DOMAIN ? DOMAIN : 'http://localhost:3000',
        WIDGETS_DOMAIN ? WIDGETS_DOMAIN : 'http://localhost:3200',
        ...(CLIENT_PORTAL_DOMAINS || '').split(','),
        'https://studio.apollographql.com'
      ].filter(x => typeof x === 'string'),
      match_origins: (ALLOWED_ORIGINS || '').split(',').filter(Boolean)
    },
    headers: {
      all: {
        request: [
          {
            propagate: {
              matching: '.*'
            }
          }
        ]
      }
    },
    supergraph: {
      listen: `127.0.0.1:${apolloRouterPort}`
    }
  };

  fs.writeFileSync(routerConfigPath, yaml.stringify(config));
};

const startRouter = async (
  proxyTargets: ErxesProxyTarget[]
): Promise<ChildProcess> => {
  await supergraphCompose(proxyTargets);
  await createRouterConfig();
  downloadRouter();

  const devOptions = ['--dev', '--hot-reload'];

  const routerProcess = spawn(
    routerPath,
    [
      ...(NODE_ENV === 'development' ? devOptions : []),
      '--log',
      NODE_ENV === 'development' ? 'warn' : 'error',
      `--supergraph`,
      supergraphPath,
      `--config`,
      routerConfigPath
    ],
    { stdio: 'inherit' }
  );

  return routerProcess;
};

export default startRouter;
