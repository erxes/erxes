import * as dotenv from 'dotenv';

import { ErxesProxyTarget } from '~/proxy/targets';
import { supergraphConfigPath, supergraphPath } from '~/apollo-router/paths';
import * as fs from 'fs';
import { execSync } from 'child_process';
import isSameFile from '~/util/is-same-file';
import * as yaml from 'yaml';

dotenv.config();

const { NODE_ENV, SUPERGRAPH_POLL_INTERVAL_MS } = process.env;

type SupergraphConfig = {
  federation_version: string;
  subgraphs: {
    [name: string]: {
      routing_url: string;
      schema: {
        subgraph_url: string;
      };
    };
  };
};

const writeSupergraphConfig = async (proxyTargets: ErxesProxyTarget[]) => {
  const superGraphConfigNext = supergraphConfigPath + '.next';
  const config: SupergraphConfig = {
    federation_version: '=2.9.3',
    subgraphs: {},
  };

  for (const { name, address } of proxyTargets) {
    const endpoint = `${address}/graphql`;
    config.subgraphs[name] = {
      routing_url: endpoint,
      schema: {
        subgraph_url: endpoint,
      },
    };
  }

  if (NODE_ENV === 'production') {
    if (fs.existsSync(supergraphConfigPath)) {
      return;
    }
    fs.writeFileSync(supergraphConfigPath, yaml.stringify(config), {
      encoding: 'utf-8',
    });
  } else {
    fs.writeFileSync(superGraphConfigNext, yaml.stringify(config), {
      encoding: 'utf-8',
    });

    if (
      !fs.existsSync(supergraphConfigPath) ||
      !isSameFile(supergraphConfigPath, superGraphConfigNext)
    ) {
      fs.cpSync(superGraphConfigNext, supergraphConfigPath, { force: true });
    }
  }
};

const supergraphComposeOnce = async () => {
  if (NODE_ENV === 'production') {
    execSync(
      `rover supergraph compose --config ${supergraphConfigPath} --output ${supergraphPath} --elv2-license=accept --log=error`,
    );
  } else {
    const superGraphqlNext = supergraphPath + '.next';

    execSync(
      `pnpm rover supergraph compose --config ${supergraphConfigPath} --output ${superGraphqlNext} --elv2-license=accept --client-timeout=80000`,
      // { stdio: ['ignore', 'ignore', 'ignore'] },
    );

    if (
      !fs.existsSync(supergraphPath) ||
      !isSameFile(supergraphPath, superGraphqlNext)
    ) {
      fs.cpSync(superGraphqlNext, supergraphPath, { force: true });
      console.log(`NEW Supergraph Schema was printed to ${supergraphPath}`);
    }
  }
};

export default async function supergraphCompose(
  proxyTargets: ErxesProxyTarget[],
) {
  await writeSupergraphConfig(proxyTargets);
  await supergraphComposeOnce();
  if (NODE_ENV === 'development') {
    setInterval(async () => {
      try {
        await supergraphComposeOnce();
      } catch (e: unknown) {
        if (e instanceof Error) {
          // Now you can safely access e.message or other Error properties
          console.log(e.message);
        } else {
          console.log('Unknown error:', e);
        }
      }
    }, Number(SUPERGRAPH_POLL_INTERVAL_MS) || 10_000);
  }
}
