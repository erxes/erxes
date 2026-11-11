import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { generateOpenApi } from '~/rpc';

// Writes the contract's OpenAPI document, the same one the API serves.
// `pnpm check:generated` fails when the committed copy differs.
const target = resolve(import.meta.dirname, '../../../packages/contract/openapi.json');

const run = async () => {
  await writeFile(target, `${JSON.stringify(await generateOpenApi(), null, 2)}\n`);
  console.info(`wrote ${target}`);
};

void run();
