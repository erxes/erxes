import { connect } from '../db/connection';
import { Permissions } from '../db/models';

module.exports.up = async () => {
  await connect();

  const permissions = await Permissions.find({ action: 'integrationsAll', module: 'integrations' });

  for (const perm of permissions) {
    const requiredActions = perm.requiredActions;

    requiredActions.push('integrationsEdit');

    await Permissions.updateOne({ _id: perm._id }, { $set: { requiredActions } });
  }
};
