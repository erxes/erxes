import { replacePlaceHolders } from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';

export const createTriageAction = async ({
  models,
  subdomain,
  action,
  execution,
}: {
  models: IModels;
  subdomain: string;
  action: any;
  execution: any;
}) => {
  const { config = {} } = action;
  const { target } = execution || {};

  // Replace placeholders in the action config with actual values from the trigger
  const triageData = await replacePlaceHolders({
    models,
    subdomain,
    actionData: config,
    target: target || {},
  });

  // Extract required fields
  const { name, description, teamId, priority } = triageData;

  if (!name) {
    throw new Error('Triage name is required');
  }

  if (!teamId) {
    throw new Error('Team ID is required');
  }

  // Create the triage ticket using the model
  const triage = await models.Triage.createTriage({
    triage: {
      name,
      description,
      teamId,
      priority: priority ? parseInt(priority, 10) : 0,
      createdBy: execution.userId || 'automation',
    },
    subdomain,
  });

  return triage;
};
