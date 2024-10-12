import fetch from "node-fetch";
import { IUserDocument } from "@erxes/api-utils/src/types";
import { IModels } from "../connectionResolver";
import { sendSalesMessage, sendCoreMessage } from "../messageBroker";
import { sendRPCMessage } from "../messageBrokerErkhet";

export const getSyncLogDoc = (params: {
  type: string;
  user: IUserDocument;
  object: any;
  brandId?: string;
}) => {
  const { type, user, brandId } = params;

  return {
    type: "",
    brandId,
    contentType: type,
    contentId: params.object._id,
    createdAt: new Date(),
    createdBy: user?._id,
    consumeData: params,
    consumeStr: JSON.stringify(params)
  };
};

export const toErkhet = (models, syncLog, config, sendData, action) => {
  const postData = {
    token: config.apiToken,
    apiKey: config.apiKey,
    apiSecret: config.apiSecret,
    orderInfos: JSON.stringify(sendData)
  };

  sendRPCMessage(models, syncLog, "rpc_queue:erxes-automation-erkhet", {
    action,
    payload: JSON.stringify(postData),
    thirdService: true
  });
};

export const getCoreConfig = async (subdomain, code, defaultValue?) => {
  return await sendCoreMessage({
    subdomain,
    action: "getConfig",
    data: { code, defaultValue },
    isRPC: true
  });
};

export const getConfig = async (models: IModels, code, defaultValue?) => {
  return models.Configs.getConfig(code, defaultValue);
};

export const sendCardInfo = async (subdomain, deal, config, value) => {
  const field = config.responseField.replace("customFieldsData.", "");

  await sendSalesMessage({
    subdomain,
    action: "deals.updateOne",
    data: {
      selector: { _id: deal._id },
      modifier: {
        $pull: {
          customFieldsData: { field }
        }
      }
    },
    isRPC: true
  });

  await sendSalesMessage({
    subdomain,
    action: "deals.updateOne",
    data: {
      selector: { _id: deal._id },
      modifier: {
        $push: {
          customFieldsData: {
            field,
            value,
            stringValue: value
          }
        }
      }
    },
    isRPC: true
  });
};

export const getCompanyInfo = async ({ checkTaxpayerUrl, no }: { checkTaxpayerUrl: string, no: string }) => {
  const tinre = /(^\d{11}$)|(^\d{12}$)|(^\d{14}$)/;
  if (tinre.test(no)) {
    const result = await fetch(
      // `https://api.ebarimt.mn/api/info/check/getInfo?tin=${tinNo}`
      `${checkTaxpayerUrl}/getInfo?tin=${no}`
    ).then(r => r.json());

    return { status: "checked", result, tin: no };
  }

  const re = /(^[А-ЯЁӨҮ]{2}\d{8}$)|(^\d{7}$)/giu;

  if (!re.test(no)) {
    return { status: "notValid" };
  }

  const info = await fetch(
    // `https://api.ebarimt.mn/api/info/check/getTinInfo?regNo=${rd}`
    `${checkTaxpayerUrl}/getTinInfo?regNo=${no}`
  ).then(r => r.json());

  if (info?.status !== 200) {
    return { status: "notValid" };
  }

  const tinNo = info.data;

  const result = await fetch(
    // `https://api.ebarimt.mn/api/info/check/getInfo?tin=${tinNo}`
    `${checkTaxpayerUrl}/getInfo?tin=${tinNo}`
  ).then(r => r.json());

  return { status: "checked", result, tin: tinNo };
};
