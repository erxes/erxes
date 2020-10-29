import { moduleObjects } from '../data/permissions/actions/permission';
import { connect } from '../db/connection';
import { Permissions, Users, UsersGroups } from '../db/models';

/**
 * Updating existing user's user group and permissions
 *
 */
module.exports.up = async () => {
  await connect();

  if (await UsersGroups.findOne({ name: 'Admin' })) {
    return Promise.resolve('done');
  }

  const userGroup = await UsersGroups.create({
    name: 'Admin',
    description: 'Admin permission'
  });
  const moduleKeys = Object.keys(moduleObjects);
  const groupId = userGroup._id;

  await Users.updateMany(
    { isActive: { $exists: false } },
    { $set: { isActive: true } }
  );
  await Users.updateMany({}, { $set: { groupIds: [groupId] } });

  // Creating permissions according to user groups
  for (const key of moduleKeys) {
    const module = moduleObjects[key];
    const moduleName = module.name;

    for (const action of module.actions) {
      const { use = [], name } = action;
      const doc = { module: moduleName, allowed: true, action: name, groupId };

      if (use.length > 0) {
        await Permissions.create({ ...doc, requiredActions: use });
        break;
      }

      await Permissions.create(doc);
    }
  }

  return Promise.resolve('ok');
};
