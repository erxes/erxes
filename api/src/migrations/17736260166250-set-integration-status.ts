import { connect } from '../db/connection';
import { Integrations, Permissions } from '../db/models';

module.exports.up = async () => {
  await connect();

  await Integrations.updateMany({}, { $set: { isActive: true } });

  const permissions = await Permissions.find({
    action: 'integrationsAll',
    module: 'integrations'
  });

  for (const perm of permissions) {
    const requiredActions = perm.requiredActions;

    requiredActions.push('integrationsArchive');

    await Permissions.updateOne(
      { _id: perm._id },
      { $set: { requiredActions } }
    );
  }
};
