import { IUserDocument } from '../db/models/definitions/users';
import { sendRPCMessage } from '../messageBroker';
import { graphqlPubsub } from '../pubsub';
import { IFinalLogParams } from './logUtils';

const checkAutomation = async (kind: string, body: any, user: IUserDocument) => {
  const data = {
    ...body,
    userId: user._id,
    kind,
  };

  const apiAutomationResponse = await sendRPCMessage({
    action: 'get-response-check-automation',
    data,
  });

  if (apiAutomationResponse.response.length === 0) {
    return;
  }

  try {
    graphqlPubsub.publish('automationResponded', {
      automationResponded: {
        userId: user._id,
        responseId: Math.random(),
        content: apiAutomationResponse.response,
      },
    });
  } catch (e) {
    // Any other error is serious
    if (e.message !== 'Configuration does not exist') {
      throw e;
    }
  }
};

let automationKind = '';
let automationBody = {};

const changeDeal = (params: IFinalLogParams) => {
  const updateDeal = params.updatedDocument || params.newData || params.object;
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

const changeListCompany = (params: IFinalLogParams) => {
  automationKind = 'changeListCompany';
  automationBody = {
    action: params.action,
    oldCode: params.object.code,
    doc: params.updatedDocument || params.newData || params.object,
  };
};

const changeListCustomer = (params: IFinalLogParams) => {
  automationKind = 'changeListCustomer';
  automationBody = {
    action: params.action,
    oldCode: params.object.code,
    doc: params.updatedDocument || params.newData || params.object,
  };
};

const changeListProduct = (params: IFinalLogParams) => {
  automationKind = 'changeListProduct';
  automationBody = {
    action: params.type === 'product-category' ? params.action.concat('Category') : params.action,
    oldCode: params.object.code,
    doc: params.updatedDocument || params.newData || params.object,
  };
};

export const automationHelper = async ({ params, user }: { params: IFinalLogParams; user: IUserDocument }) => {
  switch (params.type) {
    case 'deal':
      changeDeal(params);
      break;

    case 'company':
      changeListCompany(params);
      break;

    case 'customer':
      changeListCustomer(params);
      break;

    case 'product':
      changeListProduct(params);
      break;

    case 'product-category':
      changeListProduct(params);
    default:
      break;
  }

  if (automationKind && automationBody) {
    checkAutomation(automationKind, automationBody, user);
  }
};
