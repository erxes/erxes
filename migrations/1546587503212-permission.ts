import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';
import { moduleObjects } from '../src/data/permissions/actions/permission';
import { Permissions, Users, UsersGroups } from '../src/db/models';

dotenv.config();

/**
 * Updating existing user's user group and permissions
 *
 */
module.exports.up = next => {
  const { MONGO_URL = '' } = process.env;

  mongoose.connect(
    MONGO_URL,
    { useNewUrlParser: true, useCreateIndex: true },
    async () => {
      if (await UsersGroups.findOne({ name: 'Admin' })) {
        return next();
      }

      const userGroup = await UsersGroups.create({ name: 'Admin', description: 'Admin permission' });
      const moduleKeys = Object.keys(moduleObjects);
      const groupId = userGroup._id;

      await Users.updateMany({ isActive: { $exists: false } }, { $set: { isActive: true } });
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

      next();
    },
  );
};
