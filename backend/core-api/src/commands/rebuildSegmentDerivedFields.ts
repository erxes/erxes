import * as dotenv from 'dotenv';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

/**
 * Recomputes the derived fields every segment reads, for one tenant.
 *
 *   npx tsx backend/core-api/src/commands/rebuildSegmentDerivedFields.ts \
 *     --subdomain=<subdomain>
 */

dotenv.config();

const args = process.argv.slice(2);
const getArg = (name: string) =>
  args
    .find((arg) => arg.startsWith(`${name}=`))
    ?.split('=')
    .slice(1)
    .join('=');

const SUBDOMAIN = getArg('--subdomain') || 'os';

type RebuildResult = { segments: number; rebuilt: number };

const rebuildSegmentDerivedFields = async () => {
  const result: RebuildResult | null = await sendTRPCMessage({
    subdomain: SUBDOMAIN,
    pluginName: 'core',
    module: 'segment',
    action: 'rebuildDerivedFields',
    method: 'mutation',
    input: undefined,
    defaultValue: null,
  });

  if (!result) {
    throw new Error(
      `core-api did not answer for subdomain "${SUBDOMAIN}". It has to be running - ` +
        'the derived fields are resolved through the plugin registry it holds. ' +
        'On a multi-tenant install pass --subdomain=<tenant>.',
    );
  }

  console.info(`\n  subdomain            ${SUBDOMAIN}`);
  console.info(`  segments scanned     ${result.segments}`);
  console.info(`  derived rebuilt      ${result.rebuilt}`);

  if (!result.rebuilt) {
    console.info('\nEvery segment already carried the current derived fields.');
    return;
  }

  console.info(
    `\n${result.rebuilt} segment(s) can be reached by record changes again.`,
  );
};

rebuildSegmentDerivedFields()
  .catch((error: unknown) => {
    console.error('Segment derived field rebuild failed', error);
    process.exitCode = 1;
  })
  .finally(() => {
    process.exit(process.exitCode ?? 0);
  });
