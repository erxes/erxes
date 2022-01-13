import { IUserDocument } from '@erxes/common-types';

import { RABBITMQ_QUEUES } from './constants';

export interface ILogDataParams {
  type: string;
  description?: string;
  object: any;
  newData?: object;
  extraDesc?: object[];
  updatedDocument?: any;
  extraParams?: any;
}

interface IFinalLogParams extends ILogDataParams {
  action: string;
}

export const LOG_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
};

// interface ISubAfterMutations {
//   [action: string]: {
//     callBack: void;
//   };
// }
// interface IAfterMutations {
//   [type: string]: ISubAfterMutations[];
// }

// const callAfterMutations: IAfterMutations[] | {} = {};

// export const callAfterMutation = async (
//   params: IFinalLogParams,
//   user: IUserDocument
// ) => {
//   if (!callAfterMutations) {
//     return;
//   }

//   const { type, action } = params;

//   // not used type in plugins
//   if (!callAfterMutations[type]) {
//     return;
//   }

//   // not used this type's action in plugins
//   if (!callAfterMutations[type][action]) {
//     return;
//   }

//   try {
//     for (const handler of callAfterMutations[type][action]) {
//       await handler({}, params, {
//         user,
//         models: allModels,
//         memoryStorage,
//         graphqlPubsub,
//         messageBroker
//       });
//     }
//   } catch (e) {
//     throw new Error(e.message);
//   }
// };

export type LogDesc = {
  [key: string]: any;
} & { name: any };

export interface IDescriptionParams {
  action: string;
  type: string;
  obj: any;
  updatedDocument?: any;
  extraParams?: any;
}

export type DescriptionHelper = (params: IDescriptionParams) => { extraDesc: LogDesc[], description: string };

export const putCreateLog = async (
  messageBroker,
  // descriptionHelper: DescriptionHelper,
  params: ILogDataParams,
  user: IUserDocument
) => {
  // first param takes all models inside an object
  // await sendToWebhook({}, { action: LOG_ACTIONS.CREATE, type: params.type, params });

  // call after mutation

  // send to automations trigger
  messageBroker().sendMessage(RABBITMQ_QUEUES.AUTOMATIONS_TRIGGER, {
    type: `${params.type}`,
    targets: [params.object]
  });

  return putLog(
    messageBroker,
    {
      ...params,
      action: LOG_ACTIONS.CREATE,
    },
    user
  );
};

/**
 * Prepares a create log request to log server
 * @param params Log document params
 * @param user User information from mutation context
 */
export const putUpdateLog = async (
  messageBroker,
  params: ILogDataParams,
  user: IUserDocument
) => {
  return putLog(
    messageBroker,
    {
      ...params,
      action: LOG_ACTIONS.UPDATE,
    },
    user
  );
};

/**
 * Prepares a create log request to log server
 * @param params Log document params
 * @param user User information from mutation context
 */
export const putDeleteLog = async (
  messageBroker,
  // descriptionHelper: DescriptionHelper,
  params: ILogDataParams,
  user: IUserDocument
) => {
  return putLog(
    messageBroker,
    {
      ...params,
      action: LOG_ACTIONS.DELETE
    },
    user
  );
};

const putLog = async (
  messageBroker,
  params: IFinalLogParams,
  user: IUserDocument
) => {
  try {
    return messageBroker().sendMessage('putLog', {
      ...params,
      createdBy: user._id,
      unicode: user.username || user.email || user._id,
      object: JSON.stringify(params.object),
      newData: JSON.stringify(params.newData),
      extraDesc: JSON.stringify(params.extraDesc),
    });
  } catch (e) {
    return e.message;
  }
};
