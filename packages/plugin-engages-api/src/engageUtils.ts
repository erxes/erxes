import { fetchEs } from "@erxes/api-utils/src/elasticsearch";
import { CAMPAIGN_KINDS, CAMPAIGN_METHODS, CONTENT_TYPES } from "./constants";
import {
  IEngageMessage,
  IEngageMessageDocument,
  IScheduleDateDocument
} from "./models/definitions/engages";
import { isUsingElk } from "./utils";
import {
  sendInboxMessage,
  sendCoreMessage,
  sendClientPortalMessage
} from "./messageBroker";
import { getEnv } from "@erxes/api-utils/src";
import { IModels } from "./connectionResolver";
import { awsRequests } from "./trackers/engageTracker";
interface IEngageParams {
  engageMessage: IEngageMessageDocument;
  customersSelector: any;
  user;
}

interface ICustomerSelector {
  engageId?: string;
  customerIds?: string[];
  segmentIds?: string[];
  tagIds?: string[];
  brandIds?: string[];
}

interface ICheckCustomerParams {
  id?: string;
  customerIds?: string[];
  segmentIds?: string[];
  tagIds?: string[];
  brandIds?: string[];
}

export const generateCustomerSelector = async (
  subdomain,
  {
    engageId,
    customerIds,
    segmentIds = [],
    tagIds = [],
    brandIds = []
  }: ICustomerSelector
): Promise<any> => {
  // find matched customers
  let customerQuery: any = {};

  if (customerIds && customerIds.length > 0) {
    customerQuery = { _id: { $in: customerIds } };
  }

  if (tagIds.length > 0) {
    customerQuery = { tagIds: { $in: tagIds } };
  }

  const commonParams = { subdomain, isRPC: true };

  if (brandIds.length > 0) {
    const integrations = await sendInboxMessage({
      ...commonParams,
      action: "integrations.find",
      data: { query: { brandId: { $in: brandIds } } }
    });

    customerQuery = { integrationId: { $in: integrations.map(i => i._id) } };
  }

  if (segmentIds.length > 0) {
    const segments = await sendCoreMessage({
      ...commonParams,
      action: "segmentFind",
      data: { _id: { $in: segmentIds } }
    });

    let customerIdsBySegments: string[] = [];

    for (const segment of segments) {
      const options: any = { perPage: 5000, scroll: true };

      if (!segment.contentType.includes("contacts")) {
        options.returnAssociated = {
          mainType: segment.contentType,
          relType: "core:customer"
        };
      }

      const cIds = await sendCoreMessage({
        ...commonParams,
        action: "fetchSegment",
        data: {
          segmentId: segment._id,
          options
        }
      });

      if (
        engageId &&
        [
          "core:company",
          "sales:deal",
          "tasks:task",
          "tickets:ticket",
          "purchases:purchase"
        ].includes(segment.contentType)
      ) {
        const returnFields = [
          "name",
          "description",
          "closeDate",
          "createdAt",
          "modifiedAt",
          "customFieldsData"
        ];

        if (
          segment.contentType === "sales:deal" ||
          segment.contentType === "purchases:purchase"
        ) {
          returnFields.push("productsData");
        }
      }

      customerIdsBySegments = [...customerIdsBySegments, ...cIds];
    } // end segments loop

    customerQuery = { _id: { $in: customerIdsBySegments } };
  } // end segmentIds if

  return {
    ...customerQuery,
    $or: [{ isSubscribed: "Yes" }, { isSubscribed: { $exists: false } }]
  };
};

const timeCheckScheduledBroadcast = async (
  _id: string,
  models: IModels,
  scheduleDate?: IScheduleDateDocument
) => {
  const isValidScheduledBroadcast =
    scheduleDate && scheduleDate.type === "pre" && scheduleDate.dateTime;
  // Check for pre scheduled engages

  if (isValidScheduledBroadcast) {
    const dateTime = new Date(scheduleDate.dateTime || "");
    const now = new Date();
    const notRunNow = dateTime.getTime() > now.getTime();
    if (notRunNow) {
      await models.Logs.createLog(
        _id,
        "regular",
        `Broadcast will run at "${dateTime.toLocaleString()}"`
      );

      return true;
    }
  }
  return false;
};

const checkAlreadyRun = async (_id, kind, title, runCount, models: IModels) => {
  const isValid = kind === CAMPAIGN_KINDS.MANUAL;
  if (!isValid) return false;

  const isAlreadyRun = runCount && runCount > 0;

  if (isAlreadyRun) {
    await models.Logs.createLog(
      _id,
      "regular",
      `Broadcast "${title}" has already run before`
    );

    return true;
  }
  return false;
};

export const send = async (
  models: IModels,
  subdomain: string,
  engageMessage: IEngageMessageDocument,
  forceCreateConversation?: boolean
) => {
  const {
    customerIds,
    segmentIds,
    customerTagIds,
    brandIds,
    fromUserId,
    scheduleDate,
    _id,
    kind,
    runCount,
    title
  } = engageMessage;

  const notRunNow = await timeCheckScheduledBroadcast(
    _id,
    models,
    scheduleDate
  );

  if (notRunNow) {
    return;
  }

  const user = await findUser(subdomain, fromUserId);

  if (!user) {
    throw new Error("User not found");
  }

  if (!engageMessage.isLive) {
    return;
  }

  const isAlreadyRun = await checkAlreadyRun(
    _id,
    kind,
    title,
    runCount,
    models
  );

  if (isAlreadyRun) {
    return;
  }

  const customersSelector = await generateCustomerSelector(subdomain, {
    engageId: engageMessage._id,
    customerIds,
    segmentIds,
    tagIds: customerTagIds,
    brandIds
  });

  if (engageMessage.method === CAMPAIGN_METHODS.EMAIL) {
    return sendEmailOrSms(
      models,
      subdomain,
      { engageMessage, customersSelector, user },
      "sendEngage"
    );
  }

  if (engageMessage.method === CAMPAIGN_METHODS.SMS) {
    return sendEmailOrSms(
      models,
      subdomain,
      { engageMessage, customersSelector, user },
      "sendEngageSms"
    );
  }

  if (
    engageMessage.method === CAMPAIGN_METHODS.MESSENGER &&
    forceCreateConversation
  ) {
    const brandId =
      (engageMessage.messenger && engageMessage.messenger.brandId) || "";
    const integrations = await sendInboxMessage({
      subdomain,
      action: "integrations.find",
      data: { query: { brandId, kind: "messenger" } },
      isRPC: true,
      defaultValue: null
    });

    if (integrations?.length === 0) {
      throw new Error("The Brand doesn't have Messenger Integration ");
    }

    if (integrations?.length > 1) {
      throw new Error("The Brand has multiple integrations");
    }

    const integration = integrations[0];

    if (!integration || !brandId) {
      throw new Error("Integration not found or brandId is not provided");
    }

    const erxesCustomerIds = await sendCoreMessage({
      subdomain,
      action: "customers.getCustomerIds",
      data: customersSelector,
      isRPC: true,
      defaultValue: []
    });

    for (const customerId of erxesCustomerIds || []) {
      await models.EngageMessages.createVisitorOrCustomerMessages({
        brandId,
        integrationId: integration._id,
        customer: await sendCoreMessage({
          subdomain,
          action: "customers.findOne",
          data: { _id: customerId },
          isRPC: true,
          defaultValue: null
        }),
        visitorId: undefined,
        browserInfo: {}
      });
    }

    const receiversLength = erxesCustomerIds?.length || 0;

    if (receiversLength > 0) {
      await models.EngageMessages.updateOne(
        { _id: engageMessage._id },
        {
          $set: {
            totalCustomersCount: receiversLength
          }
        }
      );
    }
  }

  if (engageMessage.method === CAMPAIGN_METHODS.NOTIFICATION) {
    return sendNotifications(models, subdomain, {
      engageMessage,
      customersSelector,
      user
    });
  }
};

const sendEmailOrSms = async (
  models: IModels,
  subdomain,
  { engageMessage, customersSelector, user }: IEngageParams,
  action: "sendEngage" | "sendEngageSms"
) => {
  const engageMessageId = engageMessage._id;

  const MINUTELY =
    engageMessage.scheduleDate && engageMessage.scheduleDate.type === "minute";

  if (!(engageMessage.kind === CAMPAIGN_KINDS.AUTO && MINUTELY)) {
    await models.Logs.createLog(
      engageMessageId,
      "regular",
      `Run at ${new Date()}`
    );
  }

  // customer info will be prepared at contacts api
  sendCoreMessage({
    isRPC: false,
    action: "customers.prepareEngageCustomers",
    subdomain,
    data: {
      engageMessage,
      customersSelector,
      action,
      user
    }
  });
};

const sendCampaignNotification = async (models, subdomain, doc) => {
  const { groupId } = doc;
  try {
    await sendClientPortalMessage({
      subdomain,
      action: "sendNotification",
      data: doc,
      isRPC: false
    }).then(async () => {
      await models.Logs.createLog(groupId, "success", "Notification sent");
      await models.EngageMessages.updateOne(
        { _id: groupId },
        { $inc: { runCount: 1 } }
      );
    });
  } catch (e) {
    await models.Logs.createLog(groupId, "failure", e.message);
  }
};

const sendNotifications = async (
  models: IModels,
  subdomain,
  { engageMessage, customersSelector, user }: IEngageParams
) => {
  const { notification, cpId } = engageMessage;
  const engageMessageId = engageMessage._id;

  const erxesCustomerIds = await sendCoreMessage({
    subdomain,
    action: "customers.getCustomerIds",
    data: customersSelector,
    isRPC: true,
    defaultValue: []
  });

  const cpUserIds =
    ((await sendClientPortalMessage({
      subdomain,
      isRPC: true,
      action: "clientPortalUsers.getIds",
      data: {
        clientPortalId: cpId,
        erxesCustomerId: { $in: [...erxesCustomerIds] }
      }
    })) as string[]) || [];

  if (cpUserIds.length === 0) {
    await models.Logs.createLog(
      engageMessageId,
      "regular",
      `No client portal user found`
    );

    return;
  }

  if (cpUserIds.length > 0) {
    await models.Logs.createLog(
      engageMessageId,
      "regular",
      `Preparing to send Notification to "${cpUserIds.length}" customers`
    );
  }

  const doc = {
    createdUser: user,
    receivers: cpUserIds,
    title: notification?.title || "",
    content: notification?.content || "",
    notifType: "engage",
    isMobile: notification?.isMobile || false,
    link: "",
    groupId: engageMessageId
  };

  const receiversLength = doc.receivers.length || 0;

  if (receiversLength > 0) {
    await models.EngageMessages.updateOne(
      { _id: doc.groupId },
      {
        $set: {
          totalCustomersCount: receiversLength
        }
      }
    );
  }

  await sendCampaignNotification(models, subdomain, doc);
};

// check & validate campaign doc
export const checkCampaignDoc = async (
  models: IModels,
  subdomain: string,
  doc: IEngageMessage
) => {
  const {
    brandIds = [],
    kind,
    method,
    scheduleDate,
    segmentIds = [],
    customerTagIds = [],
    customerIds = [],
    fromUserId
  } = doc;

  const noDate =
    !scheduleDate ||
    (scheduleDate && scheduleDate.type === "pre" && !scheduleDate.dateTime);

  if (
    kind === CAMPAIGN_KINDS.AUTO &&
    method === CAMPAIGN_METHODS.EMAIL &&
    noDate
  ) {
    throw new Error("Schedule date & type must be chosen in auto campaign");
  }

  if (
    kind !== CAMPAIGN_KINDS.VISITOR_AUTO &&
    !(
      brandIds.length > 0 ||
      segmentIds.length > 0 ||
      customerTagIds.length > 0 ||
      customerIds.length > 0
    )
  ) {
    throw new Error("One of brand or segment or tag must be chosen");
  }

  if (method === CAMPAIGN_METHODS.EMAIL) {
    const user = await findUser(subdomain, fromUserId);

    if (!user) {
      throw new Error("From user must be specified");
    }

    if (!user.email) {
      throw new Error(`From user email is not specified: ${user.username}`);
    }

    const verifiedEmails: any =
      (await awsRequests.getVerifiedEmails(models)) || [];

    if (!verifiedEmails.includes(user.email)) {
      throw new Error(`From user email "${user.email}" is not verified in AWS`);
    }
  }

  if (method === CAMPAIGN_METHODS.NOTIFICATION) {
    if (!doc.notification || !doc.title || !doc?.notification.content) {
      throw new Error(
        "Required fields are missing. Please fill in all mandatory fields."
      );
    }
    if (!doc.cpId) {
      throw new Error(
        'Please select "Clientportal" in the notification campaign'
      );
    }
  }
};

export const findElk = async (subdomain: string, index: string, query) => {
  const response = await fetchEs({
    subdomain,
    action: "search",
    index,
    body: {
      query
    },
    defaultValue: { hits: { hits: [] } }
  });

  return response.hits.hits.map(hit => {
    return {
      _id: hit._id,
      ...hit._source
    };
  });
};

// find user from elastic or mongo
export const findUser = async (subdomain, userId?: string) => {
  const user = await sendCoreMessage({
    isRPC: true,
    subdomain,
    data: { _id: userId },
    action: "users.findOne"
  });

  return user;
};

// check customer exists from elastic or mongo
export const checkCustomerExists = async (
  subdomain: string,
  params: ICheckCustomerParams
) => {
  const { id, customerIds, segmentIds, tagIds, brandIds } = params;
  if (!isUsingElk()) {
    const customersSelector = {
      _id: id,
      state: { $ne: CONTENT_TYPES.VISITOR },
      ...(await generateCustomerSelector(subdomain, {
        customerIds,
        segmentIds,
        tagIds,
        brandIds
      }))
    };

    const customer = await sendCoreMessage({
      subdomain,
      action: "customers.findOne",
      data: customersSelector,
      isRPC: true
    });

    return customer;
  }

  if (!id) {
    return false;
  }

  const must: any[] = [
    { terms: { state: [CONTENT_TYPES.CUSTOMER, CONTENT_TYPES.LEAD] } }
  ];

  must.push({
    term: {
      _id: id
    }
  });

  if (customerIds && customerIds.length > 0) {
    must.push({ terms: { _id: customerIds } });
  }

  if (tagIds && tagIds.length > 0) {
    must.push({ terms: { tagIds } });
  }

  if (brandIds && brandIds.length > 0) {
    const integraiontIds = await findElk(subdomain, "integrations", {
      bool: {
        must: [{ terms: { "brandId.keyword": brandIds } }]
      }
    });

    must.push({
      terms: {
        integrationId: integraiontIds.map(e => e._id)
      }
    });
  }

  if (segmentIds && segmentIds.length > 0) {
    const segments = await findElk(subdomain, "segments", {
      bool: {
        must: [{ terms: { _id: segmentIds } }]
      }
    });

    let customerIdsBySegments: string[] = [];

    for (const segment of segments) {
      const cIds = await sendCoreMessage({
        isRPC: true,
        subdomain,
        action: "fetchSegment",
        data: { segmentId: segment._id }
      });

      customerIdsBySegments = [...customerIdsBySegments, ...cIds];
    }

    must.push({
      terms: {
        _id: customerIdsBySegments
      }
    });
  }

  must.push({
    bool: {
      should: [
        { term: { isSubscribed: "yes" } },
        {
          bool: {
            must_not: {
              exists: {
                field: "isSubscribed"
              }
            }
          }
        }
      ]
    }
  });

  const customers = await findElk(subdomain, "customers", {
    bool: {
      filter: {
        bool: {
          must
        }
      }
    }
  });

  return customers.length > 0;
};
