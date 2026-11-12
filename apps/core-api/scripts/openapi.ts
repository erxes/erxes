/**
 * Writes the contract's OpenAPI document, the one the API serves, to
 * packages/contract/openapi.json:  pnpm openapi
 * `pnpm check:generated` fails when the committed copy differs.
 */
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { generateOpenApi } from '~/rpc';
import { runCli, say } from './cli';

const target = resolve(import.meta.dirname, '../../../packages/contract/openapi.json');

runCli(async () => {
  await writeFile(target, `${JSON.stringify(await generateOpenApi(), null, 2)}\n`);
  say(`wrote ${target}`);
});
