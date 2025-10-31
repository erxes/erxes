import fetch from "node-fetch";
import { sendTRPCMessage } from "erxes-api-shared/utils";


// Send data to Erkhet plugin
export const toErkhet = async (models, syncLog, config, sendData, action) => {
  const postData = {
    token: config.apiToken,
    apiKey: config.apiKey,
    apiSecret: config.apiSecret,
    orderInfos: JSON.stringify(sendData),
  };

  /*sendRPCMessage(models, syncLog, "rpc_queue:erxes-automation-erkhet", {
    action,
    payload: JSON.stringify(postData),
    thirdService: true
  });*/
};


export const getPureDate = (date: Date) => {
  const ndate = new Date(date);
  const diffTimeZone = Number(process.env.TIMEZONE || 0) * 1000 * 60 * 60;
  return new Date(ndate.getTime() - diffTimeZone);
};


export const getConfig = async (subdomain, code, defaultValue?) => {
  return await sendTRPCMessage({
    subdomain,
    pluginName: "core",
    module: "core",
    method: "query",
    action: "getConfig",
    input: { code, defaultValue },
    defaultValue,
  });
};


export const sendCardInfo = async (subdomain, deal, config, value) => {
  const field = config.responseField.replace("customFieldsData.", "");

  await sendTRPCMessage({
    subdomain,
    pluginName: "sales",
    module: "deals",
    method: "mutation",
    action: "updateOne",
    input: {
      selector: { _id: deal._id },
      modifier: { $pull: { customFieldsData: { field } } },
    },
    defaultValue: {},
  });

  await sendTRPCMessage({
    subdomain,
    pluginName: "sales",
    module: "deals",
    method: "mutation",
    action: "updateOne",
    input: {
      selector: { _id: deal._id },
      modifier: {
        $push: {
          customFieldsData: { 
            field, 
            value, 
            stringValue: value },
        },
      },
    },
    defaultValue: {},
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
