import * as dotenv from 'dotenv';
dotenv.config();

import { spawn, execSync, exec as execCb, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as yaml from 'yaml';
import { promisify } from 'util';
import { ErxesProxyTarget } from 'src/proxy/targets';
import downloadRouter from './download-router';

const {
  DOMAIN,
  WIDGETS_DOMAIN,
  CLIENT_PORTAL_DOMAINS,
  ALLOWED_ORIGINS,
  NODE_ENV
} = process.env;

const exec = promisify(execCb);

const superGraphConfig = path.resolve(__dirname, 'temp/supergraph.yaml');
const superGraphql = path.resolve(__dirname, 'temp/supergraph.graphql');

const routerConfig = path.resolve(__dirname, 'temp/router.yaml');

const isSameFile = (path1: string, path2: string): boolean => {
  const file1 = fs.readFileSync(path1);
  const file2 = fs.readFileSync(path2);
  return file1.equals(file2);
};

type SupergraphConfig = {
  federation_version: number;
  subgraphs: {
    [name: string]: {
      routing_url: string;
      schema: {
        subgraph_url: string;
      };
    };
  };
};

const createSupergraphConfig = (proxyTargets: ErxesProxyTarget[]) => {
  const superGraphConfigNext = superGraphConfig + '.next';
  const config: SupergraphConfig = {
    federation_version: 2,
    subgraphs: {}
  };

  for (const { name, address } of proxyTargets) {
    const endpoint = `${address}/graphql`;
    config.subgraphs[name] = {
      routing_url: endpoint,
      schema: {
        subgraph_url: endpoint
      }
    };
  }
  fs.writeFileSync(superGraphConfigNext, yaml.stringify(config));

  if (
    !fs.existsSync(superGraphConfig) ||
    !isSameFile(superGraphConfig, superGraphConfigNext)
  ) {
    execSync(`cp ${superGraphConfigNext}  ${superGraphConfig}`);
  }
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

const supergraphCompose = async () => {
  const superGraphqlNext = superGraphql + '.next';
  await exec(
    `npx rover supergraph compose --config ${superGraphConfig} --output ${superGraphqlNext}`
  );
  if (
    !fs.existsSync(superGraphql) ||
    !isSameFile(superGraphql, superGraphqlNext)
  ) {
    execSync(`cp ${superGraphqlNext} ${superGraphql}`);
  }
};

const startRouter = async (
  proxyTargets: ErxesProxyTarget[]
): Promise<ChildProcess> => {
  await createSupergraphConfig(proxyTargets.filter(t => t.name !== 'graphql'));
  await createRouterConfig();
  const routerPath = await downloadRouter();

  await supergraphCompose();
  if (NODE_ENV === 'development') {
    setInterval(async () => {
      try {
        await supergraphCompose();
      } catch (e) {
        console.error(e.message);
      }
    }, 6000);
  }

  const devOptions = ['--dev', '--hot-reload'];

  const routerProcess = spawn(
    routerPath,
    [
      ...(NODE_ENV === 'development' ? devOptions : []),
      '--log',
      NODE_ENV === 'development' ? 'warn' : 'error',
      `--supergraph`,
      superGraphql,
      `--config`,
      routerConfig
    ],
    { stdio: 'inherit' }
  );

  return routerProcess;
};

export default startRouter;
