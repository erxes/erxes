// Builds an extension and installs it on the tenant through the gateway, as
// the owner: the same request Settings > Extensions sends for an upload.
//
//   npx tsx scripts/install.ts <extDir> <ownerUserId>
import { redis } from 'erxes-api-shared/utils';
import { packageExtension } from './package';
import { postAsUser } from './session';

const [extDir, ownerId] = process.argv.slice(2);

const main = async () => {
  if (!extDir || !ownerId) {
    throw new Error('usage: install.ts <extDir> <ownerUserId>');
  }

  const bundle = await packageExtension(extDir);
  const { status, body } = await postAsUser(ownerId, '/install', bundle);

  console.log(
    JSON.stringify({
      status,
      body,
      workerBytes: bundle.code.length,
      uiFiles: bundle.ui ? Object.keys(bundle.ui.files).length : 0,
    }),
  );
  process.exitCode = status === 200 ? 0 : 1;
};

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => {
    redis.disconnect();
    process.exit();
  });
