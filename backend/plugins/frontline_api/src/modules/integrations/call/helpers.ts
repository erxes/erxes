import { getEnv } from 'erxes-api-shared/utils';
import { IModels, generateModels } from '~/connectionResolvers';
import {
  checkForExistingIntegrations,
  getDomain,
  updateIntegrationQueueNames,
  updateIntegrationQueues,
} from '~/modules/integrations/call/utils';

export const createIntegration = async (subdomain: string, data) => {
  const ENDPOINT_URL = getEnv({ name: 'ENDPOINT_URL' });
  const domain = getDomain(subdomain);

  const models = await generateModels(subdomain);

  const { integrationId, data: doc } = data;

  try {
    const docData = JSON.parse(doc);

    const updateData = {
      inboxId: integrationId,
      ...docData,
    };
    const checkedIntegration = await checkForExistingIntegrations(
      subdomain,
      updateData,
      integrationId,
    );
    if (checkedIntegration) {
      const integration = await (
        await models
      ).CallIntegrations.create({
        ...checkedIntegration,
      });
      try {
        await updateIntegrationQueueNames(
          subdomain,
          integration?.inboxId,
          integration.queues,
        );
      } catch (error) {
        console.error('Failed to update queue names:', error.message);
      }

      if (ENDPOINT_URL) {
        // send domain to core endpoints
        try {
          const requestBody = {
            domain,
            erxesApiId: integration._id,
            subdomain,
          } as any;

          if (integration.srcTrunk) {
            requestBody.srcTrunk = integration.srcTrunk;
          }
          if (integration.dstTrunk) {
            requestBody.dstTrunk = integration.dstTrunk;
          }
          if (integration) {
            requestBody.callQueues = integration.queues;
          }
          await fetch(`${ENDPOINT_URL}/register-endpoint`, {
            method: 'POST',
            body: JSON.stringify({
              ...requestBody,
            }),
            headers: { 'Content-Type': 'application/json' },
          });
        } catch (e) {
          await (
            await models
          ).CallIntegrations.deleteOne({ _id: integration._id });
          throw e;
        }
      }
    }

    return { status: 'success' };
  } catch (error) {
    await (await models).Integrations.deleteOne({ inboxId: integrationId });
    return {
      status: 'error',
      errorMessage: error.keyPattern.wsServer
        ? 'Duplicate queue detected. Queues must be unique across integrations.'
        : error.keyPattern.srcTrunk
        ? 'Duplicate srcTrunk detected.'
        : error.keyPattern.dstTrunk
        ? 'Duplicate dstTrunk detected.'
        : `Error creating integration: ${error.message}`,
    };
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
    const ENDPOINT_URL = getEnv({ name: 'ENDPOINT_URL' });
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
        if (updatedQueues) {
          requestBody.callQueues = updatedQueues;
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
    console.log(error?.keyPattern, 'key pattern');
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

  const ENDPOINT_URL = getEnv({ name: 'ENDPOINT_URL' });

  if (ENDPOINT_URL) {
    // send domain to core endpoints
    try {
      await fetch(`${ENDPOINT_URL}/remove-endpoint`, {
        method: 'POST',
        body: JSON.stringify({
          erxesApiId: integration._id,
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
