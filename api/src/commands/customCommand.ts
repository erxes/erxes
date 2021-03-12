import * as dotenv from 'dotenv';
import { connect } from '../db/connection';
import { Permissions } from '../db/models';
import { IPermissionDocument } from '../db/models/definitions/permissions';

dotenv.config();

const fixPermissions = async (
  permissions: IPermissionDocument[],
  checkAction: string
) => {
  const ids: string[] = [];

  for (const perm of permissions) {
    if (
      perm.requiredActions &&
      perm.requiredActions.length > 0 &&
      !perm.requiredActions.includes(checkAction)
    ) {
      ids.push(perm._id);
    }
  }

  if (ids.length > 0) {
    console.log(`Fixing ${ids.length} permissions for action "${checkAction}"`);

    await Permissions.updateMany(
      { _id: { $in: ids } },
      { $push: { requiredActions: checkAction } }
    );
  }
};

const command = async () => {
  await connect();

  const inboxPermissions = await Permissions.find({
    module: 'inbox',
    action: 'inboxAll'
  });
  const brandPermissions = await Permissions.find({
    module: 'brands',
    action: 'brandsAll'
  });
  const channelPermissions = await Permissions.find({
    module: 'channels',
    action: 'channelsAll'
  });
  const productPermissions = await Permissions.find({
    module: 'products',
    action: 'productsAll'
  });

  await fixPermissions(inboxPermissions, 'conversationResolveAll');

  await fixPermissions(brandPermissions, 'exportBrands');

  await fixPermissions(channelPermissions, 'exportChannels');

  await fixPermissions(productPermissions, 'productsMerge');

  process.exit();
};

command();
