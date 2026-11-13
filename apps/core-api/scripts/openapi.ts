/**
 * Writes the contract's generated files:  pnpm openapi
 * - packages/contract/openapi.json, the OpenAPI document the API serves.
 * - packages/contract/routes.json, every procedure's method and path without its
 *   schemas, which clients pass to `OpenAPILink` so they never load the tables.
 * `pnpm check:generated` fails when a committed copy differs.
 */
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { coreContract } from '@erxes/core-contract';
import { isContractProcedure, minifyContractRouter } from '@orpc/contract';
import { generateOpenApi } from '~/rpc';
import { runCli, say } from './cli';

const contractDir = resolve(import.meta.dirname, '../../../packages/contract');

const write = async (name: string, json: string) => {
  const target = resolve(contractDir, name);

  await writeFile(target, `${json}\n`);
  say(`wrote ${target}`);
};

/** Keeps the route fields `OpenAPILink` reads; summaries stay in openapi.json. */
const clientRoute = (_key: string, value: unknown) => {
  if (!isContractProcedure(value)) return value;

  const { method, path, inputStructure, outputStructure } = value['~orpc'].route;

  return {
    '~orpc': { ...value['~orpc'], route: { method, path, inputStructure, outputStructure } },
  };
};

runCli(async () => {
  await write('openapi.json', JSON.stringify(await generateOpenApi(), null, 2));
  await write('routes.json', JSON.stringify(minifyContractRouter(coreContract), clientRoute, 2));
});
