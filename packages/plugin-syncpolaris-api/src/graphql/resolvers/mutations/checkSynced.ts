// import { getConfig, sendCardInfo } from '../../../utils/utils';
// import { getPostData as getPostDataOrders } from '../../../utils/orders';
// import { getMoveData, getPostData } from '../../../utils/ebarimtData';
import { generateModels, IContext } from '../../../connectionResolver';
// import { sendCardsMessage, sendPosMessage } from '../../../messageBroker';
// import { sendRPCMessage, sendTRPCMessage } from '../../../messageBrokerErkhet';

const checkSyncedMutations = {
  async toCheckSynced(
    _root,
    { ids }: { ids: string[] },
    { subdomain }: IContext
  ) {
    // const config = await getConfig(subdomain, 'ERKHET', {});
    // if (!config.apiToken || !config.apiKey || !config.apiSecret) {
    //   throw new Error('Erkhet config not found');
    // }
    // const postData = {
    //   token: config.apiToken,
    //   apiKey: config.apiKey,
    //   apiSecret: config.apiSecret,
    //   orderIds: JSON.stringify(ids)
    // };
    // const response = await sendTRPCMessage(
    //   'rpc_queue:erxes-automation-erkhet',
    //   {
    //     action: 'check-order-synced',
    //     payload: JSON.stringify(postData),
    //     thirdService: true
    //   }
    // );
    // const result = JSON.parse(response);
    // if (result.status === 'error') {
    //   throw new Error(result.message);
    // }
    // const data = result.data || {};
    // return (Object.keys(data) || []).map(_id => {
    //   const res: any = data[_id] || {};
    //   return {
    //     _id,
    //     isSynced: res.isSynced,
    //     syncedDate: res.date,
    //     syncedBillNumber: res.bill_number,
    //     syncedCustomer: res.customer
    //   };
    // });
  },

  async toSyncLoans(
    _root,
    {
      dealIds,
      configStageId,
      dateType
    }: { dealIds: string[]; configStageId: string; dateType: string },
    { subdomain, user }: IContext
  ) {
    // const result: { skipped: string[]; error: string[]; success: string[] } = {
    //   skipped: [],
    //   error: [],
    //   success: []
    // };
    // const configs = await getConfig(subdomain, 'ebarimtConfig', {});
    // const moveConfigs = await getConfig(subdomain, 'stageInMoveConfig', {});
    // const mainConfig = await getConfig(subdomain, 'ERKHET', {});
    // const models = await generateModels(subdomain);
    // const deals = await sendCardsMessage({
    //   subdomain,
    //   action: 'deals.find',
    //   data: { _id: { $in: dealIds } },
    //   isRPC: true
    // });
    // const syncLogDoc = {
    //   contentType: 'cards:deal',
    //   createdAt: new Date(),
    //   createdBy: user._id
    // };
    // for (const deal of deals) {
    //   const syncedStageId = configStageId || deal.stageId;
    //   if (Object.keys(configs).includes(syncedStageId)) {
    //     const syncLog = await models.SyncLogs.syncLogsAdd({
    //       ...syncLogDoc,
    //       contentId: deal._id,
    //       consumeData: deal,
    //       consumeStr: JSON.stringify(deal)
    //     });
    //     try {
    //       const config = {
    //         ...configs[syncedStageId],
    //         ...mainConfig
    //       };
    //       const postData = await getPostData(subdomain, config, deal, dateType);
    //       const response = await sendRPCMessage(
    //         models,
    //         syncLog,
    //         'rpc_queue:erxes-automation-erkhet',
    //         {
    //           action: 'get-response-send-order-info',
    //           isEbarimt: false,
    //           payload: JSON.stringify(postData),
    //           thirdService: true,
    //           isJson: true
    //         }
    //       );
    //       if (response.message || response.error) {
    //         const txt = JSON.stringify({
    //           message: response.message,
    //           error: response.error
    //         });
    //         if (config.responseField) {
    //           await sendCardInfo(subdomain, deal, config, txt);
    //         } else {
    //           console.log(txt);
    //         }
    //       }
    //       if (response.error) {
    //         result.error.push(deal._id);
    //         continue;
    //       }
    //       result.success.push(deal._id);
    //       continue;
    //     } catch (e) {
    //       await models.SyncLogs.updateOne(
    //         { _id: syncLog._id },
    //         { $set: { error: e.message } }
    //       );
    //     }
    //   }
    //   if (Object.keys(moveConfigs).includes(syncedStageId)) {
    //     const syncLog = await models.SyncLogs.syncLogsAdd({
    //       ...syncLogDoc,
    //       contentId: deal._id,
    //       consumeData: deal,
    //       consumeStr: JSON.stringify(deal)
    //     });
    //     try {
    //       const config = {
    //         ...moveConfigs[syncedStageId],
    //         ...mainConfig
    //       };
    //       const postData = await getMoveData(subdomain, config, deal, dateType);
    //       const response = await sendRPCMessage(
    //         models,
    //         syncLog,
    //         'rpc_queue:erxes-automation-erkhet',
    //         {
    //           action: 'get-response-inv-movement-info',
    //           isEbarimt: false,
    //           payload: JSON.stringify(postData),
    //           thirdService: true,
    //           isJson: true
    //         }
    //       );
    //       if (response.message || response.error) {
    //         const txt = JSON.stringify({
    //           message: response.message,
    //           error: response.error
    //         });
    //         if (config.responseField) {
    //           await sendCardInfo(subdomain, deal, config, txt);
    //         } else {
    //           console.log(txt);
    //         }
    //       }
    //       if (response.error) {
    //         result.error.push(deal._id);
    //         continue;
    //       }
    //       result.success.push(deal._id);
    //       continue;
    //     } catch (e) {
    //       await models.SyncLogs.updateOne(
    //         { _id: syncLog._id },
    //         { $set: { error: e.message } }
    //       );
    //     }
    //   }
    //   result.skipped.push(deal._id);
    // }
    // return result;
  }
};

export default checkSyncedMutations;
