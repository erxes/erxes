import { IUserDocument } from '../db/models/definitions/users';
import { debugBase } from '../debuggers';
import { sendRPCMessage } from '../messageBroker';
import { graphqlPubsub } from '../pubsub';
import { IFinalLogParams } from './logUtils';
import { getEnv } from './utils';

const checkAutomation = async (kind: string, body: any, user: IUserDocument) => {
  const data = {
    ...body,
    userId: user._id,
    kind,
  };

  const NODE_ENV = getEnv({ name: 'NODE_ENV' });

  if (NODE_ENV === 'test') {
    return;
  }

  const apiAutomationResponse = await sendRPCMessage(
    {
      action: 'get-response-check-automation',
      data,
    },
    'rpc_queue:erxes-api_erxes-automations',
  );

  debugBase(`pull responseeeee 99999999999999999999`);
  if (apiAutomationResponse.response.length === 0) {
    return;
  }

  try {
    const responseId = Math.random().toString();
    debugBase(`publish 10101101010101010`);
    graphqlPubsub.publish('automationResponded', {
      automationResponded: {
        userId: user._id,
        responseId,
        sessionCode: user.sessionCode || '',
        content: apiAutomationResponse.response,
      },
    });
    debugBase(`published 10101101010101010`);
  } catch (e) {
    // Any other error is serious
    if (e.message !== 'Configuration does not exist') {
      throw e;
    }
  }
};

let automationKind = '';
let automationBody = {};

const changeDeal = async (params: IFinalLogParams) => {
  const updateDeal = params.newData || params.updatedDocument || params.object;
  const oldDeal = params.object;
  const destinationStageId = updateDeal.stageId || '';

  if (destinationStageId && destinationStageId !== oldDeal.stageId) {
    automationKind = 'changeDeal';
    automationBody = {
      deal: params.object,
      sourceStageId: oldDeal.stageId,
      destinationStageId,
    };
  }
};

const changeListCompany = async (params: IFinalLogParams) => {
  automationKind = 'changeListCompany';
  automationBody = {
    action: params.action,
    oldCode: params.object.code,
    doc: params.updatedDocument || params.newData || params.object,
  };
};

const changeListCustomer = async (params: IFinalLogParams) => {
  automationKind = 'changeListCustomer';
  automationBody = {
    action: params.action,
    oldCode: params.object.code,
    doc: params.updatedDocument || params.newData || params.object,
  };
};

const changeListProduct = async (params: IFinalLogParams) => {
  automationKind = 'changeListProduct';
  automationBody = {
    action: params.type === 'product-category' ? params.action.concat('Category') : params.action,
    oldCode: params.object.code,
    doc: params.updatedDocument || params.newData || params.object,
  };
};

export const automationHelper = async ({ params, user }: { params: IFinalLogParams; user: IUserDocument }) => {
  automationKind = '';
  automationBody = {};

  switch (params.type) {
    case 'deal':
      await changeDeal(params);
      break;

    case 'company':
      await changeListCompany(params);
      break;

    case 'customer':
      await changeListCustomer(params);
      break;

    case 'product':
      await changeListProduct(params);
      break;

    case 'product-category':
      await changeListProduct(params);

    default:
      break;
  }

  if (automationKind && Object.keys(automationBody).length > 0) {
    await checkAutomation(automationKind, automationBody, user);
  }
};
