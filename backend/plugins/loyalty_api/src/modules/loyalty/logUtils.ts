// import {
//   putCreateLog as commonPutCreateLog,
//   putUpdateLog as commonPutUpdateLog,
//   putDeleteLog as commonPutDeleteLog,
//   LogDesc,
//   IDescriptions,
//   getSchemaLabels,
//   gatherNames,
// } from '@erxes/api-utils/src/logUtils';
import { IModels } from '~/connectionResolvers';
import { IAgent, IAgentDocument } from '~/modules/loyalty/@types/agents';
import { agentSchema } from '~/modules/loyalty/db/definitions/agents';
import { assignmentCampaignSchema } from '~/modules/loyalty/db/definitions/assignmentCampaigns';
import {
  donateCampaignSchema,
  donateAwardSchema,
} from '~/modules/loyalty/db/definitions/donateCampaigns';
import {
  lotteryCampaignSchema,
  lotteryAwardSchema,
} from '~/modules/loyalty/db/definitions/lotteryCampaigns';
import {
  spinCampaignSchema,
  spinAwardSchema,
} from '~/modules/loyalty/db/definitions/spinCampaigns';
import { voucherCampaignSchema } from '~/modules/loyalty/db/definitions/voucherCampaigns';

export const LOG_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
};

export const MODULE_NAMES = {
  VOUCHER: 'voucherCampaign',
  LOTTERY: 'lotteryCampaign',
  SPIN: 'spinCampaign',
  DONATE: 'donateCampaign',
  ASSINGNMENT: 'assignmentCampaign',
  AGENT: 'agent',
};

// const gatherAgentNames = async (
//   subdomain: string,
//   doc: IAgent | IAgentDocument,
//   prevList: LogDesc[],
// ) => {
//   let options: LogDesc[] = [];

//   if (prevList) {
//     options = prevList;
//   }

//   const params = { defaultValue: [], subdomain, isRPC: true };

//   if (doc.customerIds && doc.customerIds.length > 0) {
//     const customers = await sendCoreMessage({
//       ...params,
//       action: 'customers.find',
//       data: { _id: { $in: doc.customerIds } },
//     });

//     options = await gatherNames({
//       foreignKey: 'customerIds',
//       prevList: options,
//       nameFields: ['firstName'],
//       items: customers,
//     });
//   }

//   if (doc.companyIds && doc.companyIds.length > 0) {
//     const companies = await sendCoreMessage({
//       ...params,
//       action: 'companies.find',
//       data: { _id: { $in: doc.companyIds } },
//     });

//     options = await gatherNames({
//       foreignKey: 'companyIds',
//       prevList: options,
//       nameFields: ['primaryName'],
//       items: companies,
//     });
//   }

//   if (doc.productRuleIds && doc.productRuleIds.length > 0) {
//     const rules = await sendCoreMessage({
//       ...params,
//       action: 'productRules.find',
//       data: { _ids: doc.productRuleIds },
//     });

//     options = await gatherNames({
//       foreignKey: 'productRuleIds',
//       prevList: options,
//       nameFields: ['name'],
//       items: rules,
//     });
//   }

//   return options;
// };

// const gatherDescriptions = async (
//   _args,
//   subdomain,
//   params: any,
// ): Promise<IDescriptions> => {
//   const { action, object, updatedDocument, type } = params;
//   let extraDesc: LogDesc[] = [];
//   let description = `"${object.title}" has been ${action}d`;

//   if (type && type === MODULE_NAMES.AGENT) {
//     description = `"${object.number}" has been ${action}d`;
//     extraDesc = await gatherAgentNames(subdomain, object, extraDesc);

//     if (updatedDocument) {
//       extraDesc = await gatherAgentNames(subdomain, updatedDocument, extraDesc);
//     }
//   }

//   return { extraDesc, description };
// };

export const putDeleteLog = async (
  models: IModels,
  subdomain: string,
  logDoc,
  user,
) => {
  // const { description, extraDesc } = await gatherDescriptions(
  //   models,
  //   subdomain,
  //   {
  //     ...logDoc,
  //     action: LOG_ACTIONS.DELETE,
  //   },
  // );
  // await commonPutDeleteLog(
  //   subdomain,
  //   { ...logDoc, description, extraDesc, type: `loyalties:${logDoc.type}` },
  //   user,
  // );
};

export const putUpdateLog = async (
  models: IModels,
  subdomain: string,
  logDoc,
  user,
) => {
  // const { description, extraDesc } = await gatherDescriptions(
  //   models,
  //   subdomain,
  //   {
  //     ...logDoc,
  //     action: LOG_ACTIONS.UPDATE,
  //   },
  // );
  // await commonPutUpdateLog(
  //   subdomain,
  //   { ...logDoc, description, extraDesc, type: `loyalties:${logDoc.type}` },
  //   user,
  // );
};

export const putCreateLog = async (
  models: IModels,
  subdomain: string,
  logDoc,
  user,
) => {
  // const { description, extraDesc } = await gatherDescriptions(
  //   models,
  //   subdomain,
  //   {
  //     ...logDoc,
  //     action: LOG_ACTIONS.CREATE,
  //   },
  // );
  // sendCommonMessage({
  //   serviceName: 'core',
  //   subdomain,
  //   action: 'registerOnboardHistory',
  //   data: {
  //     type: `${logDoc.type}Create`,
  //     user,
  //   },
  // });
  // await commonPutCreateLog(
  //   subdomain,
  //   { ...logDoc, description, extraDesc, type: `loyalties:${logDoc.type}` },
  //   user,
  // );
};

export default {
  getSchemaLabels: ({ data: { type } }) => ({
    status: 'success',
    // data: getSchemaLabels(type, [
    //   {
    //     name: 'donateCampaign',
    //     schemas: [donateCampaignSchema, donateAwardSchema],
    //   },
    //   {
    //     name: 'lotteryCampaign',
    //     schemas: [lotteryCampaignSchema, lotteryAwardSchema],
    //   },
    //   { name: 'spinCampaign', schemas: [spinCampaignSchema, spinAwardSchema] },
    //   { name: 'assignmentCampaign', schemas: [assignmentCampaignSchema] },
    //   { name: 'voucherCampaign', schemas: [voucherCampaignSchema] },
    //   { name: MODULE_NAMES.AGENT, schemas: [agentSchema] },
    // ]),
  }),
};
