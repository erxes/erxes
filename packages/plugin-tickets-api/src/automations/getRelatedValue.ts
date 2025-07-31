import { IUser } from "@erxes/api-utils/src/types";
import { IModels } from "../connectionResolver";
import { sendCommonMessage, sendCoreMessage } from "../messageBroker";
import { getEnv } from "@erxes/api-utils/src";
import * as moment from "moment";

export const getRelatedValue = async (
  models: IModels,
  subdomain: string,
  target,
  targetKey,
  relatedValueProps: any = {}
) => {
  if (
    [
      "userId",
      "assignedUserId",
      "closedUserId",
      "ownerId",
      "createdBy",
    ].includes(targetKey)
  ) {
    const user = await sendCoreMessage({
      subdomain,
      action: "users.findOne",
      data: { _id: target[targetKey] },
      isRPC: true,
    });

    if (!!relatedValueProps[targetKey]) {
      const key = relatedValueProps[targetKey]?.key;
      return user[key];
    }

    return (
      (user && ((user.detail && user.detail.fullName) || user.email)) || ""
    );
  }

  if (
    ["participatedUserIds", "assignedUserIds", "watchedUserIds"].includes(
      targetKey
    )
  ) {
    const users = await sendCoreMessage({
      subdomain,
      action: "users.find",
      data: {
        query: {
          _id: { $in: target[targetKey] },
        },
      },
      isRPC: true,
    });

    if (!!relatedValueProps[targetKey]) {
      const { key, filter } = relatedValueProps[targetKey] || {};

      const result = users
        .filter((user) => (filter ? user[filter.key] === filter.value : user))
        .map((user) => user[key])
        .join(", ");
      return result;
    }

    return (
      users.map(
        (user) => (user.detail && user.detail.fullName) || user.email
      ) || []
    ).join(", ");
  }

  if (targetKey === "tagIds") {
    const tags = await sendCommonMessage({
      subdomain,
      serviceName: "core",
      action: "tagFind",
      data: { _id: { $in: target[targetKey] } },
      isRPC: true,
    });

    return (tags.map((tag) => tag.name) || []).join(", ");
  }

  if (targetKey === "labelIds") {
    const labels = await models.PipelineLabels.find({
      _id: { $in: target[targetKey] },
    });

    return (labels.map((label) => label.name) || []).join(", ");
  }

  if (["initialStageId", "stageId"].includes(targetKey)) {
    const stage = await models.Stages.findOne({
      _id: target[targetKey],
    });

    return (stage && stage.name) || "";
  }

  if (["sourceConversationIds"].includes(targetKey)) {
    const conversations = await sendCommonMessage({
      subdomain,
      serviceName: "inbox",
      action: "conversations.find",
      data: { _id: { $in: target[targetKey] } },
      isRPC: true,
    });

    return (conversations.map((c) => c.content) || []).join(", ");
  }

  if (["customers", "companies"].includes(targetKey)) {
    const relTypeConst = {
      companies: "company",
      customers: "customer",
    };

    const contactIds = await sendCoreMessage({
      subdomain,
      action: "conformities.savedConformity",
      data: {
        mainType: "ticket",
        mainTypeId: target._id,
        relTypes: [relTypeConst[targetKey]],
      },
      isRPC: true,
      defaultValue: [],
    });

    const upperCasedTargetKey =
      targetKey.charAt(0).toUpperCase() + targetKey.slice(1);

    const activeContacts = await sendCoreMessage({
      subdomain,
      action: `${targetKey}.findActive${upperCasedTargetKey}`,
      data: { selector: { _id: { $in: contactIds } } },
      isRPC: true,
      defaultValue: [],
    });

    if (relatedValueProps && !!relatedValueProps[targetKey]) {
      const { key, filter } = relatedValueProps[targetKey] || {};
      return activeContacts
        .filter((contacts) =>
          filter ? contacts[filter.key] === filter.value : contacts
        )
        .map((contacts) => contacts[key])
        .join(", ");
    }

    const result = activeContacts.map((contact) => contact?._id).join(", ");
    return result;
  }

  if (targetKey.includes("productsData")) {
    const [_parentFieldName, childFieldName] = targetKey.split(".");

    if (childFieldName === "amount") {
      return generateTotalAmount(target.productsData);
    }
  }

  if ((targetKey || "").includes("createdBy.")) {
    return await generateCreatedByFieldValue({ subdomain, target, targetKey });
  }

  if (targetKey.includes("customers.")) {
    const result = await generateCustomersFielValue({
      target,
      targetKey,
      subdomain,
    });
    return result;
  }
  if (targetKey.includes("customFieldsData.")) {
    return await generateCustomFieldsDataValue({
      target,
      targetKey,
      subdomain,
      relatedValueProps,
    });
  }

  if (targetKey === "link") {
    const DOMAIN = getEnv({
      name: "DOMAIN",
    });
    const stage = await models.Stages.getStage(target.stageId);
    const pipeline = await models.Pipelines.getPipeline(stage.pipelineId);
    const board = await models.Boards.getBoard(pipeline.boardId);

    return `${DOMAIN}/ticket/board?id=${board._id}&pipelineId=${pipeline._id}&itemId=${target._id}`;
  }

  if (targetKey === "pipelineLabels") {
    const labels = await models.PipelineLabels.find({
      _id: { $in: target?.labelIds || [] },
    }).lean();

    return `${labels.map(({ name }) => name).filter(Boolean) || "-"}`;
  }
  if (targetKey.includes("branches.")) {
    const branches = await sendCoreMessage({
      subdomain,
      action: "branches.find",
      data: {
        query: { _id: { $in: target?.branchIds || [] } },
        fields: { title: 1 },
      },
      isRPC: true,
      defaultValue: [],
    });

    return `${branches.map(({ title }) => title).filter(Boolean) || "-"}`;
  }

  if (
    [
      "createdAt",
      "startDate",
      "closeDate",
      "stageChangedDate",
      "modifiedAt",
    ].includes(targetKey)
  ) {
    const dateValue = targetKey[targetKey];
    return moment(dateValue).format("YYYY-MM-DD HH:mm");
  }

  return false;
};

const generateCustomFieldsDataValue = async ({
  targetKey,
  subdomain,
  target,
  relatedValueProps,
}: {
  targetKey: string;
  subdomain: string;
  target: any;
  relatedValueProps: any;
}) => {
  const [_, fieldId] = targetKey.split("customFieldsData.");
  const customFieldData = (target?.customFieldsData || []).find(
    ({ field }) => field === fieldId
  );

  if (!customFieldData) {
    return;
  }

  const field = await sendCoreMessage({
    subdomain,
    action: "fields.findOne",
    data: {
      query: {
        _id: fieldId,
        $or: [
          { type: "users" },
          { type: "input", validation: { $in: ["date", "datetime"] } },
        ],
      },
    },
    isRPC: true,
    defaultValue: null,
  });

  if (!field) {
    return;
  }

  if (field?.type === "users") {
    console.log({ cusIds: customFieldData?.value });
    const users = await sendCoreMessage({
      subdomain,
      action: "users.find",
      data: {
        query: { _id: { $in: customFieldData?.value || [] } },
      },
      isRPC: true,
      defaultValue: [],
    });

    console.log({ relatedValueProps, targetKey });

    if (!!relatedValueProps[targetKey]) {
      const { key, filter } = relatedValueProps[targetKey] || {};

      console.log({ users: JSON.stringify(users) });

      const result = users
        .filter((user) => (filter ? user[filter.key] === filter.value : user))
        .map((user) => user[key])
        .join(", ");

      console.log({ result });

      return result;
    }

    return users
      .map(
        ({ details }) =>
          `${details?.firstName || ""} ${details?.lastName || ""}`
      )
      .filter(Boolean)
      .join(", ");
  }
  const isISODate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(
    customFieldData?.value
  );

  if (
    field?.type === "input" &&
    ["date", "datetime"].includes(field.validation) &&
    isISODate
  ) {
    return moment(customFieldData.value).format("YYYY-MM-DD HH:mm");
  }
};

const generateCustomersFielValue = async ({
  targetKey,
  subdomain,
  target,
}: {
  targetKey: string;
  subdomain: string;
  target: any;
}) => {
  const [_, fieldName] = targetKey.split(".");

  const customerIds = await sendCoreMessage({
    subdomain,
    action: "conformities.savedConformity",
    data: {
      mainType: "ticket",
      mainTypeId: target._id,
      relTypes: ["customer"],
    },
    isRPC: true,
    defaultValue: [],
  });

  const customers: any[] =
    (await sendCoreMessage({
      subdomain,
      action: "customers.find",
      data: { _id: { $in: customerIds } },
      isRPC: true,
      defaultValue: [],
    })) || [];

  if (fieldName === "email") {
    return customers
      .map((customer) =>
        customer?.primaryEmail
          ? customer?.primaryEmail
          : (customer?.emails || [])[0]
      )
      .filter(Boolean)
      .join(", ");
  }
  if (fieldName === "phone") {
    return customers
      .map((customer) =>
        customer?.primaryPhone
          ? customer?.primaryPhone
          : (customer?.phones || [])[0]
      )
      .filter(Boolean)
      .join(", ");
  }
  if (fieldName === "fullName") {
    return customers
      .map(({ firstName = "", lastName = "" }) => `${firstName} ${lastName}`)
      .filter(Boolean)
      .join(", ");
  }
};

const generateCreatedByFieldValue = async ({
  targetKey,
  subdomain,
  target,
}: {
  targetKey: string;
  subdomain: string;
  target: any;
}) => {
  const [_, userField] = targetKey.split(".");
  const user = (await sendCoreMessage({
    subdomain,
    action: "users.findOne",
    data: { _id: target?.userId },
    isRPC: true,
  })) as { positionIds: string[] } & IUser;
  if (userField === "branch") {
    const branches = await sendCoreMessage({
      subdomain,
      action: "branches.find",
      data: { query: { _id: { $in: user?.branchIds || [] } } },
      isRPC: true,
      defaultValue: [],
    });

    const branch = (branches || [])[0] || {};

    return `${branch?.title || ""}`;
  }
  if (userField === "department") {
    console.log({ ids: user?.departmentIds });
    const departments = await sendCoreMessage({
      subdomain,
      action: "departments.find",
      data: { _id: { $in: user?.departmentIds || [] } },
      isRPC: true,
      defaultValue: [],
    });

    console.log({ deps: JSON.stringify(departments) });

    const department = (departments || [])[0] || {};
    console.log({ department });

    return `${department?.title || ""}`;
  }

  if (userField === "phone") {
    const { details } = user || {};

    return `${details?.operatorPhone || ""}`;
  }

  if (userField === "email") {
    return `${user?.email || "-"}`;
  }

  if (userField === "fullName") {
    const { details, username } = user || {};
    return (
      details?.fullName ||
      `${details?.firstName || ""} ${details?.lastName || ""}` ||
      username ||
      "-"
    );
  }

  if (userField === "position") {
    if (user?.positionIds?.length) {
      const positions: any[] = await sendCoreMessage({
        subdomain,
        action: "positions.find",
        data: { query: { _id: { $in: user?.positionIds || [] } } },
        isRPC: true,
        defaultValue: [],
      });

      return (positions || [])
        .map(({ title }) => title)
        .filter(Boolean)
        .join(", ");
    }
    return user?.details?.position;
  }
};

const generateTotalAmount = (productsData) => {
  let totalAmount = 0;

  (productsData || []).forEach((product) => {
    if (product.tickUsed) {
      return;
    }

    totalAmount += product?.amount || 0;
  });

  return totalAmount;
};
