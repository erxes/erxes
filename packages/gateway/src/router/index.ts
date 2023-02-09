import { spawn, execSync, exec as execCb } from 'child_process';
import path from 'path';
import fs from 'fs';
import yaml from 'yaml';
import { promisify } from 'util';
import { ErxesProxyTarget } from 'src/proxy/targets';

const exec = promisify(execCb);

const superGraphConfig = path.resolve(__dirname, 'temp/supergraph.yaml');
const superGraphql = path.resolve(__dirname, 'temp/supergraph.graphql');

const routerConfig = path.resolve(__dirname, 'router.yaml');

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

const main = async (
  proxyTargets: ErxesProxyTarget[],
  pollIntervalMs?: number
) => {
  await createSupergraphConfig(proxyTargets.filter(t => t.name !== 'router'));
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

export default main;
