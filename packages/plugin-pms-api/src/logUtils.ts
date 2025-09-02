import * as _ from "underscore";
import {
  putCreateLog as commonPutCreateLog,
  putDeleteLog as commonPutDeleteLog,
  putUpdateLog as commonPutUpdateLog,
} from "@erxes/api-utils/src/logUtils";

import { generateModels, IModels } from "./connectionResolver";
import { IUserDocument } from "@erxes/api-utils/src/types";
import { sendCoreMessage } from "./messageBroker";

export type LogDesc = {
  [key: string]: any;
} & { name: any };

/**
 * @param object - Previous state of the object
 * @param newData - Requested update data
 * @param updatedDocument - State after any updates to the object
 */
export interface ILogDataParams {
  type: string;
  description?: string;
  object: any;
  newData?: object;
  extraDesc?: object[];
  updatedDocument?: any;
}

/**
 * Prepares a create log request to log server
 * @param params Log document params
 * @param user User information from mutation context
 */
export const putCreateLog = async (
  models: IModels,
  subdomain: string,
  params: ILogDataParams,
  user: IUserDocument
) => {
  return commonPutCreateLog(
    subdomain,
    {
      ...params,
      type: `pms:${params.type}`,
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
  models: IModels,
  subdomain: string,
  params: ILogDataParams,
  user: IUserDocument
) => {
  return commonPutUpdateLog(
    subdomain,
    {
      ...params,
      type: `pms:${params.type}`,
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
  models: IModels,
  subdomain: string,
  params: ILogDataParams,
  user: IUserDocument
) => {
  return commonPutDeleteLog(
    subdomain,
    { ...params, type: `pms:${params.type}` },
    user
  );
};
export default {
  collectItems: async ({ subdomain, data }) => {
    const { contentId } = data;
    console.log("logs pms", data);
    // const customer = await sendCoreMessage({
    //   subdomain,
    //   action: "customers.findOne",
    //   isRPC: true,
    //   data: {
    //     _id: contentId
    //   }
    // });

    // if (!customer?.primaryPhone) {
    //   return {
    //     status: "success",
    //     data: []
    //   };
    // }

    // const models = await generateModels(subdomain);
    // const histories = await models.History.find({
    //   customerPhone: customer.primaryPhone
    // });

    // const results: any = [];
    // for (const history of histories) {

    //   const user = await sendCoreMessage({
    //     subdomain,
    //     action: "users.findOne",
    //     data: {
    //       _id: history.createdBy
    //     },
    //     isRPC: true
    //   });

    //   results.push({
    //     _id: history._id,
    //     contentType: "calls:customer",
    //     createdAt: history.createdAt,
    //     contentTypeDetail: {
    //       history,
    //       conversationMessages: messages ? messages : [],
    //       assignedUser: user ? { details: user.details, _id: user._id } : {}
    //     }
    //   });
    // }
    return {
      status: "success",
      data: [],
    };
  },
};
