import * as dotenv from 'dotenv';
dotenv.config();

import { ErxesProxyTarget } from 'src/proxy/targets';
import { supergraphConfig, supergraph } from './paths';
import * as fs from 'fs';
import { execSync } from 'child_process';
import isSameFile from '../util/is-same-file';
import * as yaml from 'yaml';
// import { promisify } from "util";
// const exec = promisify(execCb);

const { NODE_ENV } = process.env;

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
  const superGraphConfigNext = supergraphConfig + '.next';
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
    !fs.existsSync(supergraphConfig) ||
    !isSameFile(supergraphConfig, superGraphConfigNext)
  ) {
    execSync(`cp ${superGraphConfigNext}  ${supergraphConfig}`);
  }
};

const supergraphComposeOnce = async () => {
  const superGraphqlNext = supergraph + '.next';
  execSync(
    `yarn rover supergraph compose --config ${supergraphConfig} --output ${superGraphqlNext}`,
    { stdio: 'ignore' }
  );
  if (!fs.existsSync(supergraph) || !isSameFile(supergraph, superGraphqlNext)) {
    execSync(`cp ${superGraphqlNext} ${supergraph}`);
    console.log(`Supergraph Schema was printed to ${supergraph}`);
  }
};

export default async function supergraphCompose(
  proxyTargets: ErxesProxyTarget[]
) {
  await createSupergraphConfig(proxyTargets);
  await supergraphComposeOnce();
  if (NODE_ENV === 'development') {
    setInterval(async () => {
      try {
        await supergraphComposeOnce();
      } catch (e) {
        console.error(e.message);
      }
    }, 6000);
  }
}
