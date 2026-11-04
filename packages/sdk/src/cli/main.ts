import path from 'node:path';
import { parseArgs } from 'node:util';
import { buildExtension } from './build';
import { check } from './check';
import { codegen } from './codegen';
import { create } from './create';
import { dev } from './dev';
import { installExtension, LOCAL_GATEWAY } from './install';

const USAGE = `erxes-ext <command> [options]

Run inside an extension's directory, except create.

  create <id> [--host <plugin>]   scaffold ./<id>; run it in the repo's extensions/
  codegen [--schema <file|url>]   type server/operations against erxes, ui/src gql() against the extension
  check [--schema <file|url>]     codegen, then tsc over server/ and ui/src/
  build [--schema <file|url>]     write dist/<id>-<version>.erxext.json
  install [--url <gateway>] [--owner=<userId>]
                                  build, then install as the owner (ERXES_TOKEN, or --owner on a local stack)
  dev [--url <gateway>] [--owner=<userId>]
                                  install again on every change (runtime needs EXT_DEV_MODE=true)

Write --owner=<userId> with the =: a nanoid id can start with a dash.
--url defaults to ${LOCAL_GATEWAY}. --schema defaults to ERXES_SCHEMA, then
backend/gateway/generated/schema.graphql.`;

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    schema: { type: 'string' },
    url: { type: 'string' },
    owner: { type: 'string' },
    host: { type: 'string' },
    help: { type: 'boolean', short: 'h' },
  },
});

const [command, arg] = positionals;
const extDir = process.cwd();

const run = async () => {
  switch (command) {
    case 'create': {
      if (!arg) {
        throw new Error('usage: erxes-ext create <id> [--host <plugin>]');
      }

      const dir = await create(extDir, arg, values.host);
      console.log(
        `created ${
          path.relative(process.cwd(), dir) || '.'
        }. Run pnpm install, then erxes-ext build in it.`,
      );
      return;
    }
    case 'codegen': {
      const { operations } = await codegen(extDir, values.schema);
      console.log(`codegen done (${operations} erxes operation file(s))`);
      return;
    }
    case 'check':
      // The gql/ documents check needs are generated, and gitignored.
      await codegen(extDir, values.schema);
      check(extDir);
      console.log('typecheck clean');
      return;
    case 'build': {
      const { file, bytes } = await buildExtension(extDir, values);
      console.log(
        `${path.relative(process.cwd(), file)} (${Math.round(
          bytes / 1024,
        )} KB)`,
      );
      return;
    }
    case 'install': {
      const result = await installExtension(extDir, values);
      console.log(
        `installed ${result.id}@${result.version}${
          result.reactivated ? ' (reactivated)' : ''
        }`,
      );
      return;
    }
    case 'dev':
      await dev(extDir, values);
      return;
    default:
      console.log(USAGE);
      process.exitCode = command && !values.help ? 1 : 0;
  }
};

run().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
