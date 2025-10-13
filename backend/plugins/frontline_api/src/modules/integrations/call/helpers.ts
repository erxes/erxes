import { getEnv } from 'erxes-api-shared/utils';
import { IModels, generateModels } from '~/connectionResolvers';
import {
  checkForExistingIntegrations,
  getDomain,
  updateIntegrationQueueNames,
  updateIntegrationQueues,
} from '@/integrations/call/utils';

export const createIntegration = async (subdomain: string, data: any) => {
  const ENDPOINT_URL = getEnv({ name: 'CALL_ENDPOINT_URL' });
  const domain = getDomain(subdomain);

  const models = await generateModels(subdomain);
  const { integrationId, data: doc } = data;

  try {
    const docData = JSON.parse(doc);

    const updateData = {
      inboxId: integrationId,
      ...docData,
    };

    let integrationData = await checkForExistingIntegrations(
      subdomain,
      updateData,
      integrationId,
    );

    // if no existing integration found, use updateData to create
    if (!integrationData) {
      integrationData = updateData;
    }

    // Create new integration
    let integration;

    try {
      integration = await models.CallIntegrations.create(integrationData);
    } catch (error) {
      if (error.code === 11000) {
        console.error('Duplicate key error:', error.keyPattern);
        console.error('Duplicate value:', error.keyValue);
        // Handle duplicate - maybe update instead?
      } else {
        console.error('Creation error:', error);
      }
      throw error;
    }

    // Update queues if present
    try {
      await updateIntegrationQueueNames(
        subdomain,
        integration.inboxId,
        integration.queues,
      );
    } catch (err: any) {
      console.error('Failed to update queue names:', err.message);
    }

    // Register endpoint if available
    if (ENDPOINT_URL) {
      const requestBody: any = {
        domain,
        erxesApiId: integration._id,
        subdomain,
      };

      if (integration.srcTrunk) requestBody.srcTrunk = integration.srcTrunk;
      if (integration.dstTrunk) requestBody.dstTrunk = integration.dstTrunk;
      await fetch(`${ENDPOINT_URL}/register-endpoint`, {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return { status: 'success' };
  } catch (error: any) {
    // Rollback Integration if creation fails
    await models.CallIntegrations.deleteOne({ inboxId: integrationId });
    await models.Integrations.deleteOne({ _id: integrationId });

    const duplicateErrors: Record<string, string> = {
      wsServer:
        'Duplicate queue detected. Queues must be unique across integrations.',
      srcTrunk: 'Duplicate srcTrunk detected.',
      dstTrunk: 'Duplicate dstTrunk detected.',
    };

    let errorMessage = `Error creating integration: ${error.message}`;
    if (error?.keyPattern) {
      for (const key of Object.keys(duplicateErrors)) {
        if (error.keyPattern[key]) {
          errorMessage = duplicateErrors[key];
          break;
        }
      }
    }

    return { status: 'error', errorMessage };
  }
};

export const updateIntegration = async ({
  subdomain,
  data: { integrationId, doc },
}) => {
  try {
    const details = JSON.parse(doc.data);
    const models = await generateModels(subdomain);

    const integration = await models.CallIntegrations.findOne({
      inboxId: integrationId,
    }).lean();

    if (!integration) {
      return { status: 'error', errorMessage: 'Integration not found.' };
    }

    // Update queues
    const updatedQueues = await updateIntegrationQueues(
      subdomain,
      integrationId,
      details,
    );

    // Update queue names this function role is detect which incoming call queue
    await updateIntegrationQueueNames(subdomain, integrationId, updatedQueues);

    // Notify external endpoint if necessary
    const ENDPOINT_URL = getEnv({ name: 'CALL_ENDPOINT_URL' });
    const domain = getDomain(subdomain);
    if (ENDPOINT_URL) {
      try {
        const requestBody = {
          domain,
          erxesApiId: integration._id,
          subdomain,
        } as any;

        if (details.srcTrunk) {
          requestBody.srcTrunk = details.srcTrunk;
        }
        if (details.dstTrunk) {
          requestBody.dstTrunk = details.dstTrunk;
        }

        await fetch(`${ENDPOINT_URL}/update-endpoint`, {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (e) {
        console.error('Failed to update endpoint:', e.message);
      }
    }

    // Verify the update
    const updatedIntegration = await models.CallIntegrations.findOne({
      inboxId: integrationId,
    });
    if (!updatedIntegration) {
      return {
        status: 'error',
        errorMessage: 'Integration not found after update.',
      };
    }

    return { status: 'success' };
  } catch (error) {
    console.error('Error in consumeRPCQueue:', error.message);
    return {
      status: 'error',
      errorMessage: error?.keyPattern?.wsServer
        ? 'Duplicate queue detected. Queues must be unique across integrations.'
        : error?.keyPattern?.srcTrunk
        ? 'Duplicate srcTrunk detected.'
        : error?.keyPattern?.dstTrunk
        ? 'Duplicate dstTrunk detected.'
        : `Error creating integration: ${error?.message}`,
    };
  }
};

export const removeIntegration = async ({
  subdomain,
  data: { integrationId },
}) => {
  const models = await generateModels(subdomain);

  const integration = await models.CallIntegrations.findOne({
    inboxId: integrationId,
  });

  if (!integration) {
    throw new Error('Integration not found');
  }

  const { _id, wsServer } = integration;

  if (wsServer) {
    await models.CallCustomers.deleteMany({
      inboxIntegrationId: integrationId,
    });

    await models.CallIntegrations.deleteOne({ _id });
  }

  const ENDPOINT_URL = getEnv({ name: 'CALL_ENDPOINT_URL' });
  const domain = getDomain(subdomain);

  if (ENDPOINT_URL) {
    // send domain to core endpoints
    try {
      await fetch(`${ENDPOINT_URL}/remove-endpoint`, {
        method: 'POST',
        body: JSON.stringify({
          erxesApiId: integration._id,
          domain,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (e) {
      throw new Error(e.message);
    }
  }

  return {
    status: 'success',
  };
};

export const removeCustomers = async (models: IModels, params) => {
  const { customerIds } = params;
  const selector = { erxesApiId: { $in: customerIds } };

  await models.CallCustomers.deleteMany(selector);
};
