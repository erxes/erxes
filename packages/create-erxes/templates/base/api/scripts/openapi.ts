import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { OpenAPIGenerator } from '@orpc/openapi';
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4';

// Importing the router builds a pool but never connects. Generation needs no running services.
process.env.DATA_URL ??= 'postgres://localhost/contract_generation';

process.env.CORE_URL ??= 'http://localhost:9';

process.env.PLUGIN_SECRET ??= 'contract-generation'.padEnd(32, 'x');

const { router } = await import('../src/router.ts');
const { PLUGIN } = await import('../src/config.ts');
const { pool } = await import('../src/db/client.ts');

try {
  const document = await new OpenAPIGenerator({
    schemaConverters: [new ZodToJsonSchemaConverter()],
  }).generate(router, { info: { title: PLUGIN, version: 'v1' } });

  const target = process.argv[2] ?? resolve(import.meta.dirname, '../openapi.json');

  await writeFile(target, `${JSON.stringify(document, null, 2)}\n`);
} finally {
  await pool.end();
}
