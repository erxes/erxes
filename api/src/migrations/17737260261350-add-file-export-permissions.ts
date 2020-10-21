import { connect } from '../db/connection';
import { Permissions } from '../db/models';

const updatePermissions = async (action: string, moduleName: string, permName: string) => {
  const permissions = await Permissions.find({ action, module: moduleName });

  for (const perm of permissions) {
    const requiredActions = perm.requiredActions;

    requiredActions.push(permName);

    await Permissions.updateOne({ _id: perm._id }, { $set: { requiredActions } });
  }
};

module.exports.up = async () => {
  await connect();

  await updatePermissions('dealsAll', 'deals', 'exportDeals');

  await updatePermissions('tasksAll', 'tasks', 'exportTasks');

  await updatePermissions('ticketsAll', 'tickets', 'exportTickets');

  await updatePermissions('brandsAll', 'brands', 'exportBrands');

  await updatePermissions('channelsAll', 'channels', 'exportChannels');

  await updatePermissions('permissionsAll', 'permissions', 'exportPermissions');

  await updatePermissions('usersAll', 'users', 'exportUsers');
};
