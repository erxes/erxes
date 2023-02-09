import * as dotenv from 'dotenv';

dotenv.config();

import { spawn, execSync, exec as execCb } from 'child_process';
import path from 'path';
import fs from 'fs';
import yaml from 'yaml';
import { promisify } from 'util';
import { ErxesProxyTarget } from 'src/proxy/targets';
const {
  NODE_ENV,
  DOMAIN,
  WIDGETS_DOMAIN,
  CLIENT_PORTAL_DOMAINS,
  ALLOWED_ORIGINS,
  PLUGINS_INTERNAL_PORT,
  PORT,
  RABBITMQ_HOST,
  MESSAGE_BROKER_PREFIX
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
  const config = {
    rhai: {
      main: 'main.rhai'
    },
    cors: {
      origins: [
        DOMAIN ? DOMAIN : 'http://localhost:3000',
        WIDGETS_DOMAIN ? WIDGETS_DOMAIN : 'http://localhost:3200',
        ...(CLIENT_PORTAL_DOMAINS || '').split(','),
        'https://studio.apollographql.com',
        ...(ALLOWED_ORIGINS || '').split(',').map(c => c && RegExp(c))
      ],
      allow_credentials: true
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
  proxyTargets: ErxesProxyTarget[],
  pollIntervalMs?: number
) => {
  await createSupergraphConfig(proxyTargets.filter(t => t.name !== 'router'));
  await createRouterConfig();

  await supergraphCompose();
  if (pollIntervalMs && pollIntervalMs > 0) {
    setInterval(async () => {
      try {
        await supergraphCompose();
      } catch (e) {
        console.error(e.message);
      }
    }, pollIntervalMs);
  }

  spawn(
    `./temp/router`,
    [
      '--dev',
      '--hot-reload',
      `--supergraph`,
      superGraphql,
      `--config`,
      routerConfig
    ],
    { stdio: 'inherit' }
  );
};

export default startRouter;
