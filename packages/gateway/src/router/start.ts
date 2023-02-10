import * as dotenv from 'dotenv';
dotenv.config();

import { spawn, spawnSync, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as yaml from 'yaml';
import { ErxesProxyTarget } from 'src/proxy/targets';
import { dirTempPath, routerConfig, routerPath, supergraph } from './paths';
import supergraphCompose from './supergraph-compose';

const {
  DOMAIN,
  WIDGETS_DOMAIN,
  CLIENT_PORTAL_DOMAINS,
  ALLOWED_ORIGINS,
  NODE_ENV
} = process.env;

const downloadRouter = async () => {
  if (fs.existsSync(routerPath)) {
    return routerPath;
  }
  const args = [
    '-c',
    `cd ${dirTempPath} && curl -sSL https://router.apollo.dev/download/nix/v1.10.2 | sh`
  ];
  spawnSync('sh', args, { stdio: 'inherit' });
};

const createRouterConfig = () => {
  const rhaiPath = path.resolve(__dirname, 'rhai/main.rhai');

  const config = {
    rhai: {
      main: rhaiPath
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
      listen: '0.0.0.0:50000'
    }
  };
  fs.writeFileSync(routerConfig, yaml.stringify(config));
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
      supergraph,
      `--config`,
      routerConfig
    ],
    { stdio: 'inherit' }
  );

  return routerProcess;
};

export default startRouter;
