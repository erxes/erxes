// Uninstalls an extension through the gateway, as the owner. With --purge it
// also drops the extension's collections.
//
//   npx tsx scripts/uninstall.ts <extId> <ownerUserId> [--purge]
import { redis } from 'erxes-api-shared/utils';
import { postAsUser } from './session';

const [extId, ownerId, flag] = process.argv.slice(2);

const main = async () => {
  if (!extId || !ownerId) {
    throw new Error('usage: uninstall.ts <extId> <ownerUserId> [--purge]');
  }

  const { status, body } = await postAsUser(ownerId, `/uninstall/${extId}`, {
    purge: flag === '--purge',
  });

  console.log(JSON.stringify({ status, body }));
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
