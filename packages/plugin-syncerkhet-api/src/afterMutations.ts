import { sendRPCMessage } from "./messageBrokerErkhet";
import { getPostData, getMoveData } from "./utils/ebarimtData";
import {
  productToErkhet,
  productCategoryToErkhet
} from "./utils/productToErkhet";
import { getConfig, sendCardInfo } from "./utils/utils";
import { customerToErkhet, companyToErkhet } from "./utils/customerToErkhet";
import { generateModels } from "./connectionResolver";
import { getIncomeData } from "./utils/incomeData";
import { userToErkhet } from "./utils/userToErkhet";

const allowTypes = {
  "core:user": ["create", "update"],
  "sales:deal": ["update"],
  "purchases:purchase": ["update"],
  "core:productCategory": ["create", "update", "delete"],
  "core:product": ["create", "update", "delete"],
  "core:customer": ["create", "update", "delete"],
  "core:company": ["create", "update", "delete"]
};

export const afterMutationHandlers = async (subdomain, params) => {
  const { type, action, user } = params;

  const models = await generateModels(subdomain);

  const syncLogDoc = {
    type: "",
    contentType: type,
    contentId: params.object._id,
    createdAt: new Date(),
    createdBy: user._id,
    consumeData: params,
    consumeStr: JSON.stringify(params)
  };

  if (!Object.keys(allowTypes).includes(type)) {
    return;
  }

  if (!allowTypes[type].includes(action)) {
    return;
  }

  let syncLog;

  try {
    if (type === "sales:deal") {
      if (action === "update") {
        const deal = params.updatedDocument;
        const oldDeal = params.object;
        const destinationStageId = deal.stageId || "";

        if (!(destinationStageId && destinationStageId !== oldDeal.stageId)) {
          return;
        }

        const mainConfig = await getConfig(subdomain, "ERKHET", {});
        if (
          !mainConfig ||
          !mainConfig.apiKey ||
          !mainConfig.apiSecret ||
          !mainConfig.apiToken
        ) {
          return;
        }

        const configs = await getConfig(subdomain, "ebarimtConfig", {});
        const moveConfigs = await getConfig(subdomain, "stageInMoveConfig", {});
        const returnConfigs = await getConfig(
          subdomain,
          "returnEbarimtConfig",
          {}
        );

        // return
        if (Object.keys(returnConfigs).includes(destinationStageId)) {
          syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);
          const returnConfig = {
            ...returnConfigs[destinationStageId],
            ...mainConfig
          };

          const orderInfos = [
            {
              orderId: deal._id,
              returnKind: returnConfig.returnType || "note"
            }
          ];

          const postData = {
            userEmail: returnConfig.userEmail,
            token: returnConfig.apiToken,
            apiKey: returnConfig.apiKey,
            apiSecret: returnConfig.apiSecret,
            orderInfos: JSON.stringify(orderInfos)
          };

          await sendRPCMessage(
            models,
            syncLog,
            "rpc_queue:erxes-automation-erkhet",
            {
              action: "get-response-return-order",
              isJson: true,
              isEbarimt: false,
              payload: JSON.stringify(postData),
              thirdService: true
            }
          );

          return;
        }

        // move
        if (Object.keys(moveConfigs).includes(destinationStageId)) {
          syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);
          const moveConfig = {
            ...moveConfigs[destinationStageId],
            ...(await getConfig(subdomain, "ERKHET", {}))
          };

          const postData = await getMoveData(subdomain, moveConfig, deal);

          const response = await sendRPCMessage(
            models,
            syncLog,
            "rpc_queue:erxes-automation-erkhet",
            {
              action: "get-response-inv-movement-info",
              isJson: true,
              isEbarimt: false,
              payload: JSON.stringify(postData),
              thirdService: true
            }
          );

          if (response.message || response.error) {
            const txt = JSON.stringify({
              message: response.message,
              error: response.error
            });
            if (moveConfig.responseField) {
              await sendCardInfo(subdomain, deal, moveConfig, txt);
            } else {
              console.log(txt);
            }
          }

          return;
        }

        // create sale
        if (Object.keys(configs).includes(destinationStageId)) {
          syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);
          const config = {
            ...configs[destinationStageId],
            ...(await getConfig(subdomain, "ERKHET", {}))
          };
          const postData = await getPostData(subdomain, config, deal);

          const response = await sendRPCMessage(
            models,
            syncLog,
            "rpc_queue:erxes-automation-erkhet",
            {
              action: "get-response-send-order-info",
              isEbarimt: false,
              payload: JSON.stringify(postData),
              isJson: true,
              thirdService: true
            }
          );

          if (response && (response.message || response.error)) {
            const txt = JSON.stringify({
              message: response.message,
              error: response.error
            });
            if (config.responseField) {
              await sendCardInfo(subdomain, deal, config, txt);
            } else {
              console.log(txt);
            }
          }
          return;
        }
        return;
      }
      return;
    }

    if (type === "purchases:purchase") {
      if (action === "update") {
        const purchase = params.updatedDocument;
        const oldPurchase = params.object;
        const destinationStageId = purchase.stageId || "";

        if (
          !(destinationStageId && destinationStageId !== oldPurchase.stageId)
        ) {
          return;
        }

        const mainConfig = await getConfig(subdomain, "ERKHET", {});
        if (
          !mainConfig ||
          !mainConfig.apiKey ||
          !mainConfig.apiSecret ||
          !mainConfig.apiToken
        ) {
          return;
        }

        const incomeConfigs = await getConfig(
          subdomain,
          "stageInIncomeConfig",
          {}
        );

        // income
        if (Object.keys(incomeConfigs).includes(destinationStageId)) {
          syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);
          const incomeConfig = {
            ...incomeConfigs[destinationStageId],
            ...mainConfig
          };

          const postData = await getIncomeData(
            subdomain,
            incomeConfig,
            purchase
          );

          const response = await sendRPCMessage(
            models,
            syncLog,
            "rpc_queue:erxes-automation-erkhet",
            {
              action: "get-response-inv-income-info",
              isJson: true,
              isEbarimt: false,
              payload: JSON.stringify(postData),
              thirdService: true
            }
          );

          if (response.message || response.error) {
            const txt = JSON.stringify({
              message: response.message,
              error: response.error
            });
            if (incomeConfig.responseField) {
              await sendCardInfo(subdomain, purchase, incomeConfig, txt);
            } else {
              console.log(txt);
            }
          }

          return;
        }
        return;
      }
      return;
    }

    if (type === "core:product") {
      const mainConfig = await getConfig(subdomain, "ERKHET", {});
      if (
        !mainConfig ||
        !mainConfig.apiKey ||
        !mainConfig.apiSecret ||
        !mainConfig.apiToken
      ) {
        return;
      }

      syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);
      if (action === "create") {
        productToErkhet(
          subdomain,
          models,
          mainConfig,
          syncLog,
          params,
          "create"
        );
        return;
      }
      if (action === "update") {
        productToErkhet(
          subdomain,
          models,
          mainConfig,
          syncLog,
          params,
          "update"
        );
        return;
      }
      if (action === "delete") {
        productToErkhet(
          subdomain,
          models,
          mainConfig,
          syncLog,
          params,
          "delete"
        );
        return;
      }
      return;
    }
    if (type === "core:productCategory") {
      const mainConfig = await getConfig(subdomain, "ERKHET", {});
      if (
        !mainConfig ||
        !mainConfig.apiKey ||
        !mainConfig.apiSecret ||
        !mainConfig.apiToken
      ) {
        return;
      }

      syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);
      if (action === "create") {
        productCategoryToErkhet(
          subdomain,
          models,
          mainConfig,
          syncLog,
          params,
          "createCategory"
        );
        return;
      }

      if (action === "update") {
        productCategoryToErkhet(
          subdomain,
          models,
          mainConfig,
          syncLog,
          params,
          "updateCategory"
        );
        return;
      }

      if (action === "delete") {
        productCategoryToErkhet(
          subdomain,
          models,
          mainConfig,
          syncLog,
          params,
          "deleteCategory"
        );
        return;
      }
    }

    if (type === "core:customer") {
      const mainConfig = await getConfig(subdomain, "ERKHET", {});
      if (
        !mainConfig ||
        !mainConfig.apiKey ||
        !mainConfig.apiSecret ||
        !mainConfig.apiToken
      ) {
        return;
      }

      syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);
      if (action === "create") {
        customerToErkhet(models, mainConfig, syncLog, params, "create");
        return;
      }

      if (action === "update") {
        customerToErkhet(models, mainConfig, syncLog, params, "update");
        return;
      }

      if (action === "delete") {
        customerToErkhet(models, mainConfig, syncLog, params, "delete");
        return;
      }
    }

    if (type === "core:company") {
      const mainConfig = await getConfig(subdomain, "ERKHET", {});
      if (
        !mainConfig ||
        !mainConfig.apiKey ||
        !mainConfig.apiSecret ||
        !mainConfig.apiToken
      ) {
        return;
      }
      syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);
      if (action === "create") {
        companyToErkhet(models, mainConfig, syncLog, params, "create");
        return;
      }

      if (action === "update") {
        companyToErkhet(models, mainConfig, syncLog, params, "update");
        return;
      }

      if (action === "delete") {
        companyToErkhet(models, mainConfig, syncLog, params, "delete");
        return;
      }
    }

    if (type === "core:user") {
      const mainConfig = await getConfig(subdomain, "ERKHET", {});
      if (
        !mainConfig ||
        !mainConfig.apiKey ||
        !mainConfig.apiSecret ||
        !mainConfig.apiToken
      ) {
        return;
      }

      if (action === "create" || action === "update") {
        const user = params.updatedDocument || params.object;
        const oldUser = params.object;

        if (!user.email) {
          return;
        }

        if (user.email === oldUser.email) {
          return;
        }

        syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);
        userToErkhet(models, mainConfig, syncLog, params, "create");
        return;
      }
    }
  } catch (e) {
    await models.SyncLogs.updateOne(
      { _id: syncLog._id },
      { $set: { error: e.message } }
    );
  }
};

export default allowTypes;
