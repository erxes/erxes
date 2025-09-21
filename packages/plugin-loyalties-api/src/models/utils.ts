import * as dayjs from "dayjs";
import {
  sendClientPortalMessage,
  sendCommonMessage,
  sendCoreMessage,
} from "../messageBroker";

export const validCampaign = (doc) => {
  if (!doc.startDate || !doc.endDate || !doc.finishDateOfUse) {
    return;
  }

  if (doc.startDate.getTime() - new Date().getTime() < -24 * 1000 * 60 * 60) {
    throw new Error("The start date must be in the future");
  }

  if (doc.endDate && doc.startDate > doc.endDate) {
    throw new Error("The end date must be after from start date");
  }

  if (doc.finishDateOfUse && doc.endDate > doc.finishDateOfUse) {
    throw new Error("The finish date of use must be after from end date");
  }
};

export const randomBetween = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

const RandomTypes = {
  "0-9": "0123456789",
  "a-z": "abcdefghijklmnopqrstuvwxyz",
  "A-Z": "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "a-Z": "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "0-z": "0123456789abcdefghijklmnopqrstuvwxyz",
  "0-Z": "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "0-zZ": "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
};

const generateRandom = (type: string, len: number) => {
  const charSet = RandomTypes[type] || "0123456789";

  let randomString = "";

  for (let i = 0; i < len; i++) {
    const position = Math.floor(Math.random() * charSet.length);
    randomString = `${randomString}${charSet.substring(
      position,
      position + 1
    )}`;
  }

  return randomString;
};

export const getRandomNumber = (number) => {
  const re = /{ \[.-..?\] \* [0-9]* }/g;
  const items = number.match(/{ \[.-..?\] \* [0-9]* }|./g);

  const result: string[] = [];
  for (const item of items) {
    let str = item;

    if (re.test(str)) {
      const key = (str.match(/\[.-..?\]/g)[0] || "")
        .replace("[", "")
        .replace("]", "");
      let len = Number(
        (str.match(/ \* [0-9]* /g)[0] || "").substring(3) || "0"
      );
      if (isNaN(len)) {
        len = 8;
      }

      str = generateRandom(key, len);
    }

    result.push(str);
  }

  return result.join("");
};

export const getOwner = async (subdomain, ownerType, ownerId) => {
  switch (ownerType) {
    case "customer":
      return await sendCoreMessage({
        subdomain,
        action: "customers.findOne",
        data: { _id: ownerId },
        isRPC: true,
      });
    case "user":
      return await sendCoreMessage({
        subdomain,
        action: "users.findOne",
        data: { _id: ownerId },
        isRPC: true,
      });
    case "company":
      return await sendCoreMessage({
        subdomain,
        action: "companies.findOne",
        data: { _id: ownerId },
        isRPC: true,
      });
    case "cpUser":
      return await sendClientPortalMessage({
        subdomain,
        action: "clientPortalUsers.findOne",
        data: { _id: ownerId },
        isRPC: true,
        defaultValue: null,
      });
    default:
      return {};
  }
};

export const targetFilter = async ({ filter, params, subdomain }) => {
  const { stageId, number } = params;

  if (!stageId && !number) {
    return;
  }

  let stageIds: string[] = [];
  let dealIds: string[] = [];

  filter.serviceName = "sales";

  if (stageId) {
    stageIds = [stageId];
  }

  if (stageIds.length) {
    const deals = await sendCommonMessage({
      serviceName: "sales",
      subdomain,
      action: "deals.find",
      data: { stageId: { $in: stageIds } },
      isRPC: true,
      defaultValue: [],
    });

    dealIds = deals.map((d) => d._id);
  }

  if (number) {
    const dealsByNumber = await sendCommonMessage({
      serviceName: "sales",
      subdomain,
      action: "deals.find",
      data: { number: { $regex: `${number}`, $options: "mui" } },
      isRPC: true,
      defaultValue: [],
    });

    dealIds = dealIds.length
      ? dealIds.filter((id) => dealsByNumber.some((d) => d._id === id))
      : dealsByNumber.map((d) => d._id);
  }

  filter.targetId = {
    ...(filter.targetId || {}),
    $in: [...new Set(dealIds)],
  };
};

export const scoreActiveUsers = async ({ models }) => {
  const currentMonthStart = dayjs().subtract(1, "month").toDate();
  const currentMonthEnd = dayjs().toDate();

  const monthlyActiveUsersPipeline = [
    {
      $match: {
        createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd },
      },
    },
    {
      $group: {
        _id: "$ownerId",
      },
    },
    {
      $count: "count",
    },
  ];

  const [monthlyActiveUsers] = await models.ScoreLogs.aggregate(
    monthlyActiveUsersPipeline
  );

  const totalActiveUsersPipeline = [
    {
      $group: {
        _id: "$ownerId",
      },
    },
    {
      $count: "count",
    },
  ];

  const [totalActiveUsers] = await models.ScoreLogs.aggregate(
    totalActiveUsersPipeline
  );

  return {
    monthlyActiveUsers: monthlyActiveUsers?.count || 0,
    totalActiveUsers: totalActiveUsers?.count || 0,
  };
};

export const scorePoint = async ({ doc, models, filter }) => {
  const { stageId, number } = doc;

  const refundedTargetIds = await models.ScoreLogs.distinct("targetId", {
    action: "refund",
  });

  let filterAggregate: any[] = [];

  if (stageId || number) {
    const lookup = [
      {
        $lookup: {
          from: "deals",
          localField: "targetId",
          foreignField: "_id",
          as: "target",
        },
      },
      {
        $unwind: "$target",
      },
    ];

    filterAggregate.push(...lookup);
  }

  const totalPointEarned = {
    $sum: {
      $cond: {
        if: { $eq: ["$action", "add"] },
        then: "$changeScore",
        else: 0,
      },
    },
  };

  const totalPointRedeemed = {
    $sum: {
      $cond: {
        if: { $eq: ["$action", "subtract"] },
        then: { $abs: "$changeScore" },
        else: 0,
      },
    },
  };

  const pointPipeline = [
    ...filterAggregate,
    {
      $match: {
        ...filter,
        targetId: {
          $nin: refundedTargetIds,
          ...(filter.targetId || {}),
        },
      },
    },
    {
      $group: {
        _id: null,
        totalPointEarned: totalPointEarned,
        totalPointRedeemed: totalPointRedeemed,
      },
    },
    {
      $project: {
        totalPointEarned: 1,
        totalPointRedeemed: 1,
        totalPointBalance: {
          $subtract: ["$totalPointEarned", "$totalPointRedeemed"],
        },
      },
    },
  ];

  const [points] = await models.ScoreLogs.aggregate(pointPipeline);

  return {
    totalPointEarned: points?.totalPointEarned || 0,
    totalPointRedeemed: points?.totalPointRedeemed || 0,
    totalPointBalance: points?.totalPointBalance || 0,
  };
};

export const scoreProducts = async ({ doc, models, filter }) => {
  const { stageId, number } = doc;

  let filterAggregate: any[] = [];

  if (stageId || number) {
    const lookup = [
      {
        $lookup: {
          from: "deals",
          localField: "targetId",
          foreignField: "_id",
          as: "target",
        },
      },
      {
        $unwind: "$target",
      },
    ];

    filterAggregate.push(...lookup);
  }

  const [mostRedeemedProductCategory] = await models.ScoreLogs.aggregate([
    ...filterAggregate,
    {
      $match: {
        ...filter,
        targetId: {
          ...(filter.targetId || {}),
          $exists: true,
        },
      },
    },
    {
      $lookup: {
        from: "deals",
        localField: "targetId",
        foreignField: "_id",
        as: "dealTarget",
      },
    },
    {
      $unwind: {
        path: "$dealTarget",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: "$dealTarget.productsData",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "pos_orders",
        localField: "targetId",
        foreignField: "_id",
        as: "orderTarget",
      },
    },
    {
      $unwind: {
        path: "$orderTarget",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: "$orderTarget.items",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        productId: {
          $ifNull: [
            "$orderTarget.items.productId",
            "$dealTarget.productsData.productId",
          ],
        },
      },
    },
    {
      $group: {
        _id: "$productId",
        count: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    {
      $lookup: {
        from: "product_categories",
        localField: "product.categoryId",
        foreignField: "_id",
        as: "productCategory",
      },
    },
    { $unwind: "$productCategory" },
    {
      $group: {
        _id: "$productCategory._id",
        name: { $first: "$productCategory.name" },
        totalCount: { $sum: "$count" },
      },
    },
    {
      $sort: { totalCount: -1 },
    },
    { $limit: 1 },
  ]);

  return {
    mostRedeemedProductCategory: mostRedeemedProductCategory?.name || "",
  };
};

export const scoreStatistic = async ({ doc, models, subdomain, filter }) => {
  const { monthlyActiveUsers, totalActiveUsers } = await scoreActiveUsers({
    models,
  });

  const { totalPointEarned, totalPointRedeemed, totalPointBalance } =
    await scorePoint({
      doc,
      models,
      filter,
    });

  const { mostRedeemedProductCategory } = await scoreProducts({
    doc,
    models,
    filter,
  });

  const redemptionRate = totalPointEarned
    ? (totalPointRedeemed / totalPointEarned) * 100
    : 0;

  return {
    totalPointEarned,
    totalPointRedeemed,
    totalPointBalance,
    mostRedeemedProductCategory,
    redemptionRate,
    activeLoyaltyMembers: totalActiveUsers,
    monthlyActiveUsers,
  };
};
