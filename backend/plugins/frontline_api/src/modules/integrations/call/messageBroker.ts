import { validateArgs } from './utils';

import { removeCustomers } from './helpers';
import { generateModels } from '~/connectionResolvers';
import {
  createIntegration,
  removeIntegration,
  updateIntegration,
} from '@/integrations/call/helpers';
import { selectRelevantCdr } from '@/integrations/call/services/cdrUtils';

export async function callCreateIntegration({ subdomain, data }) {
  try {
    return await createIntegration(subdomain, data);
  } catch (e) {
    return {
      status: 'error',
      errorMessage: `Failed to create integration: ${e.message}`,
    };
  }
}
export async function callUpdateIntegration({ subdomain, data }) {
  try {
    updateIntegration({ subdomain, data });
  } catch (e) {
    return {
      status: 'error',
      errorMessage: `Failed to update integration: ${e.message}`,
    };
  }
}

export async function callRemoveIntergration({ subdomain, data }) {
  try {
    removeIntegration({ subdomain, data });
  } catch (e) {
    return {
      status: 'error',
      errorMessage: `Failed to remove integration: ${e.message}`,
    };
  }
}

export async function callNotification({ subdomain, data }) {
  const models = await generateModels(subdomain);

  const { type } = data;

  switch (type) {
    case 'removeCustomers':
      await removeCustomers(models, data);
      break;

    default:
      break;
  }
}

export async function callGetHistory({ subdomain, data }) {
  try {
    const models = await generateModels(subdomain);
    const { erxesApiConversationId } = data;

    if (!erxesApiConversationId) {
      return {
        status: 'error',
        errorMessage: 'Conversation id not found.',
      };
    }

    const history = await models.CallHistory.findOne({
      conversationId: erxesApiConversationId,
    });
    return {
      status: 'success',
      data: history,
    };
  } catch (error) {
    return {
      status: 'error',
      errorMessage: 'Error processing call history:' + error,
    };
  }
}

export async function callGetCdr({ subdomain, data }) {
  try {
    validateArgs(data);

    const models = await generateModels(subdomain);
    const { erxesApiConversationId } = data;

    const histories = await models.CallCdrs.find({
      conversationId: erxesApiConversationId,
    });

    const selected = selectRelevantCdr(histories);

    return {
      status: 'success',
      data: selected,
    };
  } catch (error) {
    console.error('Error processing calls:getCallCdr', error);
    return {
      status: 'error',
      errorMessage: `Error processing call CDR: ${error.message || error}`,
    };
  }
}
