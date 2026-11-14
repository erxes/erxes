/**
 * Writes the contract's generated files:  pnpm openapi [document.json]
 * - packages/contract/routes.json, every procedure's method and path without its
 *   schemas, which clients pass to `OpenAPILink` so they never load the tables.
 *   `pnpm check:generated` fails when the committed copy differs.
 * - the OpenAPI document the API serves at `/core/v1/openapi.json`, to the path given,
 *   so a contract change can be read as a diff of two documents. It isn't committed.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { coreContract } from '@erxes/core-contract';
import { isContractProcedure, minifyContractRouter } from '@orpc/contract';
import { generateOpenApi } from '~/rpc';
import { runCli, say } from './cli';

const write = async (target: string, json: string) => {
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, `${json}\n`);
  say(`wrote ${target}`);
};

/** Keeps the route fields `OpenAPILink` reads; summaries stay in the OpenAPI document. */
const clientRoute = (_key: string, value: unknown) => {
  if (!isContractProcedure(value)) return value;

  const { method, path, inputStructure, outputStructure } = value['~orpc'].route;

  return {
    '~orpc': { ...value['~orpc'], route: { method, path, inputStructure, outputStructure } },
  };
};

runCli(async () => {
  await write(
    resolve(import.meta.dirname, '../../../packages/contract/routes.json'),
    JSON.stringify(minifyContractRouter(coreContract), clientRoute, 2),
  );

  const document = process.argv[2];

  // Relative to where pnpm ran, not apps/api.
  if (document) {
    const target = resolve(process.env.INIT_CWD ?? '.', document);

    await write(target, JSON.stringify(await generateOpenApi(), null, 2));
  }
});
