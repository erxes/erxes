import * as moment from "moment";
import { debugError } from "@erxes/api-utils/src/debuggers";
import { generateFieldsFromSchema } from "@erxes/api-utils/src/fieldUtils";
import redis from "@erxes/api-utils/src/redis";
import { getNextMonth, getToday } from "@erxes/api-utils/src";
import { IUserDocument } from "@erxes/api-utils/src/types";
import graphqlPubsub from "@erxes/api-utils/src/graphqlPubsub";
import { generateModels, IContext, IModels } from "./connectionResolver";
import {
  sendCoreMessage,
  sendCommonMessage,
  sendPurchasesMessage,
  sendSalesMessage,
  sendTasksMessage,
  sendTicketsMessage,
} from "./messageBroker";
import fetch from "node-fetch";

import * as admin from "firebase-admin";
import { CLOSE_DATE_TYPES } from "./constants";
import { IUser } from "./models/definitions/clientPortalUser";
import { isEnabled } from "@erxes/api-utils/src/serviceDiscovery";
import { IClientPortal } from "./models/definitions/clientPortal";

export const getConfig = async (
  code: string,
  subdomain: string,
  defaultValue?: string
) => {
  const configs = await sendCoreMessage({
    subdomain,
    action: "getConfigs",
    data: {},
    isRPC: true,
    defaultValue: [],
  });

  if (!configs[code]) {
    return defaultValue;
  }

  return configs[code];
};

export const generateFields = async ({ subdomain }) => {
  const models = await generateModels(subdomain);

  const { ClientPortalUsers } = models;

  const schema = ClientPortalUsers.schema as any;
  let fields: Array<{
    _id: number;
    name: string;
    group?: string;
    label?: string;
    type?: string;
    validation?: string;
    options?: string[];
    selectOptions?: Array<{ label: string; value: string }>;
  }> = [];

  if (schema) {
    fields = [...fields, ...(await generateFieldsFromSchema(schema, ""))];

    for (const name of Object.keys(schema.paths)) {
      const path = schema.paths[name];

      // extend fields list using sub schema fields
      if (path.schema) {
        fields = [
          ...fields,
          ...(await generateFieldsFromSchema(path.schema, `${name}.`)),
        ];
      }
    }
  }

  return fields;
};

export const sendSms = async (
  subdomain: string,
  type: string,
  phoneNumber: string,
  content: string
) => {
  if (type === "messagePro") {
    const MESSAGE_PRO_API_KEY = await getConfig(
      "MESSAGE_PRO_API_KEY",
      subdomain,
      ""
    );

    const MESSAGE_PRO_PHONE_NUMBER = await getConfig(
      "MESSAGE_PRO_PHONE_NUMBER",
      subdomain,
      ""
    );

    if (!MESSAGE_PRO_API_KEY || !MESSAGE_PRO_PHONE_NUMBER) {
      throw new Error("messaging config not set properly");
    }

    try {
      await fetch(
        "https://api.messagepro.mn/send?" +
          new URLSearchParams({
            key: MESSAGE_PRO_API_KEY,
            from: MESSAGE_PRO_PHONE_NUMBER,
            to: phoneNumber,
            text: content,
          })
      );

      return "sent";
    } catch (e) {
      debugError(e.message);
      throw new Error(e.message);
    }
  }

  const isServiceEnabled = await isEnabled(type);

  if (!isServiceEnabled) {
    throw new Error("messaging service not enabled");
  }

  await sendCommonMessage({
    serviceName: type,
    subdomain,
    action: "sendSms",
    data: {
      phoneNumber,
      content,
    },
  });
};

export const generateRandomPassword = (len: number = 10) => {
  const specials = "!@#$%^&*()_+{}:\"<>?|[];',./`~";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";

  const pick = (
    exclusions: string,
    string: string,
    min: number,
    max: number
  ) => {
    let n;
    let chars = "";

    if (max === undefined) {
      n = min;
    } else {
      n = min + Math.floor(Math.random() * (max - min + 1));
    }

    let i = 0;
    while (i < n) {
      const character = string.charAt(
        Math.floor(Math.random() * string.length)
      );
      if (exclusions.indexOf(character) < 0 && chars.indexOf(character) < 0) {
        chars += character;
        i++;
      }
    }

    return chars;
  };

  const shuffle = (string: string) => {
    const array = string.split("");
    let tmp;
    let current;
    let top = array.length;

    if (top) {
      while (--top) {
        current = Math.floor(Math.random() * (top + 1));
        tmp = array[current];
        array[current] = array[top];
        array[top] = tmp;
      }

      return array.join("");
    }
  };

  let password = "";

  password += pick(password, specials, 1, 1);
  password += pick(password, lowercase, 2, 3);
  password += pick(password, uppercase, 2, 3);
  password += pick(password, numbers, 3, 3);

  return shuffle(password);
};

export const initFirebase = async (subdomain: string): Promise<void> => {
  const config = await sendCoreMessage({
    subdomain,
    action: "configs.findOne",
    data: {
      query: {
        code: "GOOGLE_APPLICATION_CREDENTIALS_JSON",
      },
    },
    isRPC: true,
    defaultValue: null,
  });

  if (!config) {
    return;
  }

  const codeString = config.value || "value";

  if (codeString[0] === "{" && codeString[codeString.length - 1] === "}") {
    const serviceAccount = JSON.parse(codeString);

    if (serviceAccount.private_key) {
      try {
        await admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      } catch (e) {
        console.error(`initFireBase error: ${e.message}`);
      }
    }
  }
};
interface IMobileConfig {
  channelId?: string;
  sound?: string;
}
interface ISendNotification {
  receivers: string[];
  title: string;
  content: string;
  notifType: "system" | "engage";
  link: string;
  createdUser?: IUserDocument;
  isMobile?: boolean;
  eventData?: any | null;
  mobileConfig?: IMobileConfig;
  groupId?: string;
  type?: string;
}

export const sendNotification = async (
  models: IModels,
  subdomain: string,
  doc: ISendNotification
) => {
  const {
    createdUser,
    receivers,
    title,
    content,
    notifType,
    isMobile,
    eventData,
    mobileConfig,
    type,
  } = doc;

  const link = doc.link;

  // remove duplicated ids
  const receiverIds = [...Array.from(new Set(receivers))];

  // collecting emails
  const recipients = await models.ClientPortalUsers.find({
    _id: { $in: receiverIds },
  }).lean();

  // collect recipient emails
  const toEmails: string[] = [];

  for (const recipient of recipients) {
    if (
      recipient.notificationSettings &&
      recipient.notificationSettings.receiveByEmail &&
      recipient.email
    ) {
      toEmails.push(recipient.email);
    }

    const notification =
      await models.ClientPortalNotifications.createNotification(
        {
          type,
          title,
          link,
          content,
          receiver: recipient._id,
          notifType,
          clientPortalId: recipient.clientPortalId,
          eventData,
          groupId: doc?.groupId || "",
        },
        createdUser && createdUser._id
      );

    graphqlPubsub.publish(`clientPortalNotificationInserted:${recipient._id}`, {
      clientPortalNotificationInserted: {
        _id: notification._id,
        type: type,
        userId: recipient._id,
        title: notification.title,
        content: notification.content,
        link: notification.link,
        groupId: notification.groupId,
        eventData,
      },
    });
  }

  sendCoreMessage({
    subdomain,
    action: "sendEmail",
    data: {
      toEmails,
      title: "Notification",
      template: {
        name: "notification",
        data: {
          notification: { ...doc, link },
        },
      },
      modifier: (data: any, email: string) => {
        const user = recipients.find((item) => item.email === email);

        if (user) {
          data.uid = user._id;
        }
      },
    },
  });

  if (isMobile) {
    if (!admin.apps.length) {
      await initFirebase(subdomain);
    }
    const transporter = admin.messaging();
    const deviceTokens: string[] = [];

    for (const recipient of recipients) {
      if (recipient.deviceTokens) {
        deviceTokens.push(...recipient.deviceTokens);
      }
    }

    const expiredTokens = [""];
    const chunkSize = 500;

    if (deviceTokens.length > 1) {
      const tokenChunks = [] as string[][];

      if (deviceTokens.length > chunkSize) {
        for (let i = 0; i < deviceTokens.length; i += chunkSize) {
          const chunk = deviceTokens.slice(i, i + chunkSize);
          tokenChunks.push(chunk);
        }
      } else {
        tokenChunks.push(deviceTokens);
      }

      for (const tokensChunk of tokenChunks) {
        try {
          const multicastMessage = {
            tokens: tokensChunk,
            notification: { title, body: content },
            data: eventData || {},
            android: {
              notification: {
                sound: mobileConfig?.sound,
                channelId: mobileConfig?.channelId,
              },
            },
            apns: {
              payload: {
                aps: {
                  sound: mobileConfig?.sound,
                },
              },
            },
          };

          await transporter.sendEachForMulticast(multicastMessage);
        } catch (e) {
          debugError(
            `Error occurred during Firebase multicast send: ${e.message}`
          );
          expiredTokens.push(...tokensChunk);
        }
      }
    } else {
      for (const token of deviceTokens) {
        try {
          await transporter.send({
            token,
            notification: { title, body: content },
            data: eventData || {},
          });
        } catch (e) {
          debugError(`Error occurred during firebase send: ${e.message}`);
          expiredTokens.push(token);
        }
      }
    }
    if (expiredTokens.length > 0) {
      await models.ClientPortalUsers.updateMany(
        {},
        { $pull: { deviceTokens: { $in: expiredTokens } } }
      );
    }
  }
};

export const customFieldsDataByFieldCode = async (object, subdomain) => {
  const customFieldsData =
    object.customFieldsData && object.customFieldsData.toObject
      ? object.customFieldsData.toObject()
      : object.customFieldsData || [];

  const fieldIds = customFieldsData.map((data) => data.field);

  const fields = await sendCommonMessage({
    serviceName: "core",
    subdomain,
    action: "fields.find",
    data: {
      query: {
        _id: { $in: fieldIds },
      },
    },
    isRPC: true,
    defaultValue: [],
  });

  const fieldCodesById = {};

  for (const field of fields) {
    fieldCodesById[field._id] = field.code;
  }

  const results: any = {};

  for (const data of customFieldsData) {
    results[fieldCodesById[data.field]] = {
      ...data,
    };
  }

  return results;
};

export const sendAfterMutation = async (
  subdomain: string,
  type: string,
  action: string,
  object: any,
  newData: any,
  extraDesc: any
) => {
  const value = await redis.get("afterMutations");
  const afterMutations = JSON.parse(value || "{}");

  if (
    afterMutations[type] &&
    afterMutations[type][action] &&
    afterMutations[type][action].length
  ) {
    for (const service of afterMutations[type][action]) {
      sendCommonMessage({
        serviceName: service,
        subdomain,
        action: "afterMutation",
        data: {
          type,
          action,
          object,
          newData,
          extraDesc,
        },
      });
    }
  }
};

export const getCards = async (
  type: "ticket" | "deal" | "task" | "purchase",
  context: IContext,
  args: any
) => {
  const { subdomain, models, cpUser } = context;
  if (!cpUser) {
    throw new Error("Login required");
  }

  const cp = await models.ClientPortals.getConfig(cpUser.clientPortalId);

  const pipelineId = cp[type + "PipelineId"];

  if (!pipelineId || pipelineId.length === 0) {
    return [];
  }

  const customer = await sendCoreMessage({
    subdomain,
    action: "customers.findOne",
    data: {
      _id: cpUser.erxesCustomerId,
    },
    isRPC: true,
  });

  if (!customer) {
    return [];
  }

  const conformities = await sendCoreMessage({
    subdomain,
    action: "conformities.getConformities",
    data: {
      mainType: "customer",
      mainTypeIds: [customer._id],
      relTypes: [type],
    },
    isRPC: true,
    defaultValue: [],
  });

  if (conformities.length === 0) {
    return [];
  }

  const cardIds: string[] = [];

  for (const c of conformities) {
    if (c.relType === type && c.mainType === "customer") {
      cardIds.push(c.relTypeId);
    }

    if (c.mainType === type && c.relType === "customer") {
      cardIds.push(c.mainTypeId);
    }
  }

  let stages = [] as any;

  switch (type) {
    case "ticket":
      stages = await sendTicketsMessage({
        subdomain,
        action: "stages.find",
        data: {
          pipelineId,
        },
        isRPC: true,
        defaultValue: [],
      });
      break;
    case "deal":
      stages = await sendSalesMessage({
        subdomain,
        action: "stages.find",
        data: {
          pipelineId,
        },
        isRPC: true,
        defaultValue: [],
      });
      break;
    case "task":
      stages = await sendTasksMessage({
        subdomain,
        action: "stages.find",
        data: {
          pipelineId,
        },
        isRPC: true,
        defaultValue: [],
      });
      break;
    case "purchase":
      stages = await sendPurchasesMessage({
        subdomain,
        action: "stages.find",
        data: {
          pipelineId,
        },
        isRPC: true,
        defaultValue: [],
      });
      break;
  }

  if (stages.length === 0) {
    return [];
  }

  const stageIds = stages.map((stage) => stage._id);

  let oneStageId = "";
  if (args.stageId) {
    if (stageIds.includes(args.stageId)) {
      oneStageId = args.stageId;
    } else {
      oneStageId = "noneId";
    }
  }

  interface IDate {
    month: number;
    year: number;
  }

  const dateSelector = (date: IDate) => {
    const { year, month } = date;

    const start = new Date(Date.UTC(year, month, 1, 0, 0, 0));
    const end = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0));

    return {
      $gte: start,
      $lte: end,
    };
  };

  const message = {
    subdomain,
    action: `${type}s.find`,
    data: {
      _id: { $in: cardIds },
      status: { $regex: "^((?!archived).)*$", $options: "i" },
      stageId: oneStageId ? oneStageId : { $in: stageIds },
      ...(args?.priority && { priority: { $in: args?.priority || [] } }),
      ...(args?.labelIds && { labelIds: { $in: args?.labelIds || [] } }),
      ...(args?.closeDateType && {
        closeDate: getCloseDateByType(args.closeDateType),
      }),
      ...(args?.userIds && { assignedUserIds: { $in: args?.userIds || [] } }),
      ...(args?.date && { closeDate: dateSelector(args.date) }),
    },
    isRPC: true,
    defaultValue: [],
  };

  switch (type) {
    case "deal":
      return sendSalesMessage(message);
    case "task":
      return sendTasksMessage(message);
    case "ticket":
      return sendTicketsMessage(message);
    case "purchase":
      return sendPurchasesMessage(message);
  }
};

export const getCloseDateByType = (closeDateType: string) => {
  if (closeDateType === CLOSE_DATE_TYPES.NEXT_DAY) {
    const tommorrow = moment().add(1, "days");

    return {
      $gte: new Date(tommorrow.startOf("day").toISOString()),
      $lte: new Date(tommorrow.endOf("day").toISOString()),
    };
  }

  if (closeDateType === CLOSE_DATE_TYPES.NEXT_WEEK) {
    const monday = moment()
      .day(1 + 7)
      .format("YYYY-MM-DD");
    const nextSunday = moment()
      .day(7 + 7)
      .format("YYYY-MM-DD");

    return {
      $gte: new Date(monday),
      $lte: new Date(nextSunday),
    };
  }

  if (closeDateType === CLOSE_DATE_TYPES.NEXT_MONTH) {
    const now = new Date();
    const { start, end } = getNextMonth(now);

    return {
      $gte: new Date(start),
      $lte: new Date(end),
    };
  }

  if (closeDateType === CLOSE_DATE_TYPES.NO_CLOSE_DATE) {
    return { $exists: false };
  }

  if (closeDateType === CLOSE_DATE_TYPES.OVERDUE) {
    const now = new Date();
    const today = getToday(now);

    return { $lt: today };
  }
};

export const getUserName = (data: IUser) => {
  if (!data) {
    return null;
  }

  if (data.firstName || data.lastName) {
    return data.firstName + " " + data.lastName;
  }

  if (data.email || data.username || data.phone) {
    return data.email || data.username || data.phone;
  }

  return "Unknown";
};

export const getUserCards = async (
  userId: string,
  contentType: string,
  models: IModels,
  subdomain
) => {
  const cardIds = await models.ClientPortalUserCards.find({
    cpUserId: userId,
    contentType,
  }).distinct("contentTypeId");

  const message = {
    subdomain,
    action: `${contentType}s.find`,
    data: {
      _id: { $in: cardIds },
    },
    isRPC: true,
    defaultValue: [],
  };

  let cards = [];

  switch (contentType) {
    case "deal":
      cards = await sendSalesMessage(message);
      break;
    case "task":
      cards = await sendTasksMessage(message);
      break;
    case "ticket":
      cards = await sendTicketsMessage(message);
      break;
    case "purchase":
      cards = await sendPurchasesMessage(message);
      break;
  }

  return cards;
};

export const fetchUserFromToki = async (
  token: string,
  clientPortal: IClientPortal
) => {
  if (!clientPortal.tokiConfig) {
    throw new Error("Toki configs are not set");
  }

  if (!clientPortal.tokiConfig.apiKey) {
    throw new Error("Toki api key is not set");
  }

  const testApiUrl = "qams-api.toki.mn";
  const prodApiUrl = "ms-api.toki.mn";

  const apiKey = clientPortal.tokiConfig.apiKey;
  const apiUrl = clientPortal.tokiConfig.production ? prodApiUrl : testApiUrl;

  try {
    const response = await fetch(
      `https://${apiUrl}/third-party-service/v1/shoppy/user`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "api-key": apiKey,
        },
      }
    );

    const contentType = response.headers.get("content-type");

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Toki API Error (${response.status}): ${errorText}`);
    }

    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Expected JSON but received: ${text}`);
    }
  } catch (err: any) {
    console.error(err);
    throw new Error(`Failed to fetch user from Toki: ${err.message}`);
  }
};
