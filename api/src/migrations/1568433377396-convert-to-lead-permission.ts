import { connect } from '../db/connection';
import { Permissions } from '../db/models';

module.exports.up = async () => {
  await connect();

  const integrationPermissions = await Permissions.find({
    module: 'integrations'
  });

  for (const permission of integrationPermissions) {
    const requiredActions = permission.requiredActions || [];
    const updatedActions: string[] = [];

    for (const action of requiredActions) {
      switch (action) {
        case 'integrationsCreateFormIntegration': {
          updatedActions.push('integrationsCreateLeadIntegration');

          break;
        }
        case 'integrationsEditFormIntegration': {
          updatedActions.push('integrationsEditLeadIntegration');

          break;
        }
        default: {
          updatedActions.push(action);
        }
      }
    }

    permission.requiredActions = updatedActions;

    permission.save();
  }
};
