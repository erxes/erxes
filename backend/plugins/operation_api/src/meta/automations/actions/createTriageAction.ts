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
    target,
  });

  // Validate required fields
  if (!triageData.teamId) {
    throw new Error('teamId is required to create a triage ticket');
  }

  if (!triageData.name) {
    throw new Error('name is required to create a triage ticket');
  }

  // Prepare triage creation data
  const triageInput = {
    name: triageData.name,
    description: triageData.description || '',
    teamId: triageData.teamId,
    priority: triageData.priority ? parseInt(triageData.priority, 10) : 0,
    createdBy: execution.userId || 'system', // Use execution userId if available
  };

  try {
    // Create the triage ticket using the model's createTriage method
    const triage = await models.Triage.createTriage({
      triage: triageInput,
      subdomain,
    });

    return {
      name: triage.name,
      targetId: triage._id,
      teamId: triage.teamId,
      number: triage.number,
    };
  } catch (error) {
    console.error('Error creating triage ticket:', error);
    throw new Error(`Failed to create triage ticket: ${error.message}`);
  }
};
