import { sendCoreMessage, sendInboxMessage } from "../messageBroker";
import {
  MONTH_NAMES,
  NOW,
  PROBABILITY_CLOSED,
  PROBABILITY_OPEN,
  WEEKDAY_NAMES,
  DIMENSION_MAP,
  FIELD_MAP,
  COLLECTION_MAP
} from "./constants";
import { IModels } from "../connectionResolver";
import * as dayjs from "dayjs";
import { getService, getServices } from "@erxes/api-utils/src/serviceDiscovery";
const util = require("util");

export const buildUnwind = ({ fields }: { fields: string[] }) => {
  const unwinds = (fields || []).map(field => ({
    $unwind: `$${FIELD_MAP[field]}`
  }));

  return unwinds;
};

export const buildLookup = ({
  fields,
  localField,
  foreignField,
  extraConditions = [],
  extraStages = []
}: {
  fields: string[];
  localField?: string;
  foreignField?: string;
  extraConditions?: any[];
  extraStages?: any[];
}) => {
  const lookups = fields.map(field => {
    const conditions: any = [
      { $eq: [`$${foreignField ?? "_id"}`, "$$fieldId"] },
      ...extraConditions
    ];

    const pipeline: any = [
      { $match: { $expr: { $and: conditions } } },
      ...extraStages
    ];

    return [
      {
        $lookup: {
          from: COLLECTION_MAP[field],
          let: { fieldId: `$_id.${localField || DIMENSION_MAP[field]}` },
          pipeline,
          as: field
        }
      },
      {
        $unwind: `$${field}`
      }
    ];
  });

  return [...lookups.flat()];
};

export const buildGroupBy = ({
  fields,
  action,
  extraFields
}: {
  fields: string[];
  action: object;
  extraFields?: object;
}): object => {
  const groupBy = (fields || []).reduce((acc, field) => {
    acc[DIMENSION_MAP[field]] = `$${FIELD_MAP[field]}`;
    return acc;
  }, {});

  return {
    $group: {
      _id: groupBy,
      ...action,
      ...extraFields
    }
  };
};

export const buildAction = (measures: string[]): object => {
  const actions = {};

  measures.forEach(measure => {
    switch (measure) {
      case "count":
        actions[measure] = { $sum: 1 };
        break;
      case "totalAmount":
        actions[measure] = { $sum: "$productsData.amount" };
        break;
      case "unusedAmount":
        actions[measure] = {
          $sum: {
            $cond: [
              { $eq: ["$productsData.tickUsed", false] },
              "$productsData.amount",
              0
            ]
          }
        };
        break;
      case "averageAmount":
        actions[measure] = { $avg: "$productsData.amount" };
        break;
      case "forecastAmount":
        actions[measure] = {
          $sum: {
            $divide: [
              {
                $multiply: ["$productsData.amount", "$probability"]
              },
              100
            ]
          }
        };
        break;
      default:
        actions[measure] = { $sum: 1 };
        break;
    }
  });

  return actions;
};
export const buildPipeline = (filter, type, matchFilter) => {
  const {
    dimension,
    measure,
    userType = "userId",
    frequencyType,
    dateRange,
    startDate,
    endDate,
    dateRangeType = "createdAt"
  } = filter;

  const dimensions = Array.isArray(dimension)
    ? dimension
    : dimension?.split(",") || [];
  const measures = Array.isArray(measure) ? measure : measure?.split(",") || [];

  const pipeline: any[] = [];

  let formatType = "%Y";

  if (dateRange?.toLowerCase().includes("day")) {
    formatType = "%Hh:%Mm:%Ss";
  }

  if (dateRange?.toLowerCase().includes("week")) {
    formatType = "%u";
  }

  if (dateRange?.toLowerCase().includes("month")) {
    formatType = "%V";
  }

  if (dateRange?.toLowerCase().includes("year")) {
    formatType = "%m";
  }

  if (dateRange === "customDate" && startDate && endDate) {
    formatType = "%Y-%m-%d";
  }

  const dateFormat = frequencyType || formatType;

  if (dimensions.includes("tag")) {
    pipeline.push({ $unwind: "$tagIds" });
  }

  if (dimensions.includes("label")) {
    pipeline.push({ $unwind: "$labelIds" });
  }

  if (dimensions.includes("customer")) {
    pipeline.push(
      {
        $lookup: {
          from: "conformities",
          let: { fieldId: "$_id" },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ["$mainType", type]
                    }
                  },
                  {
                    $expr: {
                      $eq: ["$mainTypeId", "$$fieldId"]
                    }
                  },
                  {
                    $expr: {
                      $eq: ["$relType", "customer"]
                    }
                  }
                ]
              }
            }
          ],
          as: "conformity"
        }
      },
      {
        $unwind: "$conformity"
      }
    );
  }

  if (dimensions.includes("company")) {
    pipeline.push(
      {
        $lookup: {
          from: "conformities",
          let: { fieldId: "$_id" },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ["$mainType", type]
                    }
                  },
                  {
                    $expr: {
                      $eq: ["$mainTypeId", "$$fieldId"]
                    }
                  },
                  {
                    $expr: {
                      $eq: ["$relType", "company"]
                    }
                  }
                ]
              }
            }
          ],
          as: "conformity"
        }
      },
      {
        $unwind: "$conformity"
      }
    );
  }

  if (dimensions.includes("teamMember") && userType === "assignedUserIds") {
    pipeline.push({ $unwind: "$assignedUserIds" });
  }

  if (dimensions.includes("branch")) {
    pipeline.push({ $unwind: "$branchIds" });
  }

  if (dimensions.includes("department")) {
    pipeline.push({ $unwind: "$departmentIds" });
  }

  if (dimensions.includes("source")) {
    pipeline.push(
      {
        $unwind: "$sourceConversationIds"
      },
      {
        $lookup: {
          from: "conversations",
          let: { conversationId: "$sourceConversationIds" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$conversationId"]
                }
              }
            }
          ],
          as: "conversation"
        }
      },
      {
        $unwind: "$conversation"
      },
      {
        $lookup: {
          from: "integrations",
          let: { integrationId: "$conversation.integrationId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$integrationId"]
                }
              }
            }
          ],
          as: "integration"
        }
      },
      {
        $unwind: "$integration"
      }
    );
  }

  if (
    dimensions.includes("product") ||
    measures.some(m =>
      [
        "totalAmount",
        "averageAmount",
        "unusedAmount",
        "forecastAmount"
      ].includes(m)
    )
  ) {
    pipeline.push({ $unwind: "$productsData" });
  }

  if (dimensions.includes("pipeline") || measures.includes("forecastAmount")) {
    pipeline.push(
      {
        $lookup: {
          from: "purchases_stages",
          localField: "stageId",
          foreignField: "_id",
          as: "stage"
        }
      },
      {
        $unwind: "$stage"
      }
    );
  }

  if (dimensions.includes("board")) {
    pipeline.push(
      {
        $lookup: {
          from: "purchases_stages",
          localField: "stageId",
          foreignField: "_id",
          as: "stage"
        }
      },
      {
        $unwind: "$stage"
      },
      {
        $lookup: {
          from: "purchases_pipelines",
          localField: "stage.pipelineId",
          foreignField: "_id",
          as: "pipeline"
        }
      },
      {
        $unwind: "$pipeline"
      }
    );
  }

  if (measures.includes("forecastAmount")) {
    pipeline.push({
      $addFields: {
        probability: {
          $switch: {
            branches: [
              {
                case: {
                  $eq: ["$stage.probability", "Won"]
                },
                then: 100
              },
              {
                case: {
                  $eq: ["$stage.probability", "Done"]
                },
                then: 100
              },
              {
                case: {
                  $eq: ["$stage.probability", "Resolved"]
                },
                then: 100
              },
              {
                case: {
                  $eq: ["$stage.probability", "Lost"]
                },
                then: 0
              }
            ],
            default: {
              $toDouble: {
                $arrayElemAt: [
                  {
                    $split: ["$stage.probability", "%"]
                  },
                  0
                ]
              }
            }
          }
        }
      }
    });
  }

  const match: object = {
    ...matchFilter
  };

  if (measures.includes("forecastAmount")) {
    match["stage.probability"] = { $ne: null };
  }

  if (dimensions.includes("priority")) {
    match["priority"] = { $nin: [null, "", " "] };
  }

  if (dimensions.includes("teamMember")) {
    match[userType] = { $exists: true };
  }

  if (dimensions.includes("frequency")) {
    match[dateRangeType] = { $ne: null };
  }

  if (dimensions.includes("card")) {
    match["name"] = { $nin: [null, ""] };
  }

  pipeline.push({
    $match: match
  });

  const groupKeys: any = {};
  if (dimensions.includes("tag")) {
    groupKeys.tagId = "$tagIds";
  }

  if (dimensions.includes("card")) {
    groupKeys.cardName = "$name";
  }

  if (dimensions.includes("label")) {
    groupKeys.labelId = "$labelIds";
  }

  if (dimensions.includes("customer")) {
    groupKeys.customerId = "$conformity.relTypeId";
  }

  if (dimensions.includes("company")) {
    groupKeys.companyId = "$conformity.relTypeId";
  }

  if (dimensions.includes("priority")) {
    groupKeys.priority = "$priority";
  }

  if (dimensions.includes("status")) {
    groupKeys.status = "$status";
  }

  if (dimensions.includes("teamMember")) {
    groupKeys.userId = `$${userType}`;
  }

  if (dimensions.includes("branch")) {
    groupKeys.branchId = "$branchIds";
  }

  if (dimensions.includes("department")) {
    groupKeys.departmentId = "$departmentIds";
  }

  if (dimensions.includes("department")) {
    groupKeys.source = "$integration.kind";
  }

  if (dimensions.includes("product")) {
    groupKeys.productId = "$productsData.productId";
  }

  if (dimensions.includes("stage")) {
    groupKeys.stageId = "$stageId";
  }

  if (dimensions.includes("pipeline")) {
    groupKeys.pipelineId = "$stage.pipelineId";
  }

  if (dimensions.includes("board")) {
    groupKeys.boardId = "$pipeline.boardId";
  }

  if (dimensions.includes("source")) {
    groupKeys.source = "$integration.kind";
  }

  if (dimensions.includes("frequency")) {
    groupKeys.frequency = {
      $dateToString: {
        format: dateFormat,
        date: `$${dateRangeType}`
      }
    };
  }

  pipeline.push({
    $group: {
      _id: groupKeys,
      ...buildAction(measures),
      ...(dimensions.includes("frequency")
        ? { date: { $first: `$${dateRangeType}` } }
        : {})
    }
  });

  if (dimensions.includes("frequency")) {
    pipeline.push({ $sort: { _id: 1 } });
  }

  if (dimensions.includes("tag")) {
    pipeline.push(
      {
        $lookup: {
          from: "tags",
          let: { fieldId: "$_id.tagId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$fieldId"]
                }
              }
            }
          ],
          as: "tag"
        }
      },
      { $unwind: "$tag" }
    );
  }

  if (dimensions.includes("label")) {
    pipeline.push(
      {
        $lookup: {
          from: "pipeline_labels",
          let: { fieldId: "$_id.labelId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$fieldId"]
                }
              }
            }
          ],
          as: "label"
        }
      },
      { $unwind: "$label" }
    );
  }

  if (dimensions.includes("customer")) {
    pipeline.push(
      {
        $lookup: {
          from: "customers",
          let: { fieldId: "$_id.customerId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$fieldId"]
                }
              }
            }
          ],
          as: "customer"
        }
      },
      { $unwind: "$customer" }
    );
  }

  if (dimensions.includes("company")) {
    pipeline.push(
      {
        $lookup: {
          from: "companies",
          let: { fieldId: "$_id.companyId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$fieldId"]
                }
              }
            }
          ],
          as: "company"
        }
      },
      { $unwind: "$company" }
    );
  }

  if (dimensions.includes("teamMember")) {
    pipeline.push(
      {
        $lookup: {
          from: "users",
          let: { fieldId: "$_id.userId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$fieldId"] },
                    { $eq: ["$isActive", true] }
                  ]
                }
              }
            }
          ],
          as: "user"
        }
      },
      { $unwind: "$user" }
    );
  }

  if (dimensions.includes("branch")) {
    pipeline.push(
      {
        $lookup: {
          from: "branches",
          let: { fieldId: "$_id.branchId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$_id", "$$fieldId"] }]
                }
              }
            }
          ],
          as: "branch"
        }
      },
      { $unwind: "$branch" }
    );
  }

  if (dimensions.includes("department")) {
    pipeline.push(
      {
        $lookup: {
          from: "departments",
          let: { fieldId: "$_id.departmentId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$_id", "$$fieldId"] }]
                }
              }
            }
          ],
          as: "department"
        }
      },
      { $unwind: "$department" }
    );
  }

  if (dimensions.includes("product")) {
    pipeline.push(
      {
        $lookup: {
          from: "products",
          let: { fieldId: "$_id.productId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$_id", "$$fieldId"] }]
                }
              }
            }
          ],
          as: "product"
        }
      },
      { $unwind: "$product" }
    );
  }

  if (dimensions.includes("stage")) {
    pipeline.push(
      {
        $lookup: {
          from: "purchases_stages",
          let: { fieldId: "$_id.stageId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$_id", "$$fieldId"] }]
                }
              }
            }
          ],
          as: "stage"
        }
      },
      { $unwind: "$stage" }
    );
  }

  if (dimensions.includes("pipeline")) {
    pipeline.push(
      {
        $lookup: {
          from: "purchases_pipelines",
          let: { fieldId: "$_id.pipelineId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$_id", "$$fieldId"] }]
                }
              }
            }
          ],
          as: "pipeline"
        }
      },
      { $unwind: "$pipeline" }
    );
  }

  if (dimensions.includes("board")) {
    pipeline.push(
      {
        $lookup: {
          from: "purchases_boards",
          let: { fieldId: "$_id.boardId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$_id", "$$fieldId"] }]
                }
              }
            }
          ],
          as: "board"
        }
      },
      { $unwind: "$board" }
    );
  }

  const projectionFields: any = {
    _id: 0
  };

  measures.forEach(measure => {
    projectionFields[measure] = 1;
  });

  if (dimensions.includes("frequency")) {
    let projectStage: any = "$_id.frequency";

    if (dateFormat === "%u") {
      projectStage = {
        $arrayElemAt: [
          WEEKDAY_NAMES,
          { $subtract: [{ $toInt: "$_id.frequency" }, 1] }
        ]
      };
    }

    if (dateFormat === "%m") {
      projectStage = {
        $arrayElemAt: [
          MONTH_NAMES,
          { $subtract: [{ $toInt: "$_id.frequency" }, 1] }
        ]
      };
    }

    if (dateFormat === "%V") {
      projectStage = {
        $concat: [
          "Week ",
          "$_id.frequency",
          " ",
          {
            $dateToString: {
              format: "%m/%d",
              date: {
                $dateFromString: {
                  dateString: {
                    $concat: [
                      {
                        $dateToString: {
                          format: "%Y",
                          date: "$date"
                        }
                      },
                      "-W",
                      {
                        $dateToString: {
                          format: "%V",
                          date: "$date"
                        }
                      },
                      "-1"
                    ]
                  }
                }
              }
            }
          },
          "-",
          {
            $dateToString: {
              format: "%m/%d",
              date: {
                $dateFromString: {
                  dateString: {
                    $concat: [
                      {
                        $dateToString: {
                          format: "%Y",
                          date: "$date"
                        }
                      },
                      "-W",
                      {
                        $dateToString: {
                          format: "%V",
                          date: "$date"
                        }
                      },
                      "-7"
                    ]
                  }
                }
              }
            }
          }
        ]
      };
    }

    projectionFields.frequency = projectStage;
  }

  if (dimensions.includes("tag")) {
    projectionFields.tag = "$tag.name";
  }

  if (dimensions.includes("card")) {
    projectionFields.card = "$_id.cardName";
  }

  if (dimensions.includes("label")) {
    projectionFields.label = "$label.name";
  }

  if (dimensions.includes("customer")) {
    projectionFields.customer = "$customer.firstName";
  }

  if (dimensions.includes("company")) {
    projectionFields.company = "$company.primaryName";
  }

  if (dimensions.includes("priority")) {
    projectionFields.priority = "$_id.priority";
  }

  if (dimensions.includes("status")) {
    projectionFields.status = "$_id.status";
  }

  if (dimensions.includes("teamMember")) {
    projectionFields.teamMember = "$user.details.fullName";
  }

  if (dimensions.includes("branch")) {
    projectionFields.branch = "$branch.title";
  }

  if (dimensions.includes("department")) {
    projectionFields.department = "$department.title";
  }

  if (dimensions.includes("source")) {
    projectionFields.source = "$_id.source";
  }

  if (dimensions.includes("product")) {
    projectionFields.product = "$product.name";
  }

  if (dimensions.includes("stage")) {
    projectionFields.stage = "$stage.name";
  }

  if (dimensions.includes("pipeline")) {
    projectionFields.pipeline = "$pipeline.name";
  }

  if (dimensions.includes("board")) {
    projectionFields.board = "$board.name";
  }

  pipeline.push({ $project: projectionFields });

  return pipeline;
};

export const returnDateRange = (
  dateRange: string,
  startDate: Date,
  endDate: Date
) => {
  const startOfToday = new Date(NOW.setHours(0, 0, 0, 0));
  const endOfToday = new Date(NOW.setHours(23, 59, 59, 999));
  const startOfYesterday = new Date(
    dayjs(NOW).add(-1, "day").toDate().setHours(0, 0, 0, 0)
  );
  const startOfTheDayBeforeYesterday = new Date(
    dayjs(NOW).add(-2, "day").toDate().setHours(0, 0, 0, 0)
  );

  let $gte;
  let $lte;

  switch (dateRange) {
    case "today":
      $gte = startOfToday;
      $lte = endOfToday;
      break;
    case "yesterday":
      $gte = startOfYesterday;
      $lte = startOfToday;
      break;
    case "last72h":
      $gte = startOfTheDayBeforeYesterday;
      $lte = startOfToday;
      break;
    case "thisWeek":
      $gte = dayjs(NOW).startOf("week").toDate();
      $lte = dayjs(NOW).endOf("week").toDate();
      break;
    case "lastWeek":
      $gte = dayjs(NOW).add(-1, "week").startOf("week").toDate();
      $lte = dayjs(NOW).add(-1, "week").endOf("week").toDate();
      break;
    case "last2Week":
      $gte = dayjs(NOW).add(-2, "week").startOf("week").toDate();
      $lte = dayjs(NOW).add(-1, "week").endOf("week").toDate();
      break;
    case "last3Week":
      $gte = dayjs(NOW).add(-3, "week").startOf("week").toDate();
      $lte = dayjs(NOW).add(-1, "week").endOf("week").toDate();
      break;
    case "lastMonth":
      $gte = dayjs(NOW).add(-1, "month").startOf("month").toDate();
      $lte = dayjs(NOW).add(-1, "month").endOf("month").toDate();
      break;
    case "thisMonth":
      $gte = dayjs(NOW).startOf("month").toDate();
      $lte = dayjs(NOW).endOf("month").toDate();
      break;
    case "thisYear":
      $gte = dayjs(NOW).startOf("year").toDate();
      $lte = dayjs(NOW).endOf("year").toDate();
      break;
    case "lastYear":
      $gte = dayjs(NOW).add(-1, "year").startOf("year").toDate();
      $lte = dayjs(NOW).add(-1, "year").endOf("year").toDate();
      break;
    case "customDate":
      $gte = new Date(startDate);
      $lte = new Date(endDate);
      break;
    // all
    default:
      break;
  }

  if ($gte && $lte) {
    return { $gte, $lte };
  }

  return {};
};

export const returnDueDateRange = (dueDateRange: string, dueType: string) => {
  let $gte;
  let $lte;

  if (dueType === "due") {
    switch (dueDateRange) {
      case "today":
        $gte = new Date();
        $lte = new Date(new Date().setHours(23, 59, 59, 999));
        break;
      case "thisWeek":
        $gte = new Date();
        $lte = new Date(new Date().getTime() + 604800000);
        break;
      case "thisMonth":
        $gte = new Date();
        $lte = new Date(new Date().getTime() + 2592000000);
        break;
      case "thisYear":
        $gte = new Date();
        $lte = new Date(new Date().getFullYear() + 1, 0, 1);
        break;
      default:
        break;
    }
  }

  if (dueType === "overdue") {
    switch (dueDateRange) {
      case "today":
        $gte = new Date(new Date().setHours(0, 0, 0, 0));
        $lte = new Date();
        break;
      case "thisWeek":
        $gte = new Date(new Date().getTime() - 604800000);
        $lte = new Date();
        break;
      case "thisMonth":
        $gte = new Date(new Date().getTime() - 2592000000);
        $lte = new Date();
        break;
      case "thisYear":
        $gte = new Date(new Date().getFullYear() - 1, 0, 1);
        $lte = new Date();
        break;
      default:
        break;
    }
  }

  if ($gte && $lte) {
    return { $gte, $lte };
  }

  return {};
};

export const buildMatchFilter = async (filter, type, subdomain, model) => {
  const {
    userIds,
    boardId,
    pipelineIds,
    stageIds,
    companyIds,
    customerIds,
    productIds,
    status,
    priority,
    attachment,
    branchIds,
    departmentIds,
    tagIds,
    labelIds,
    groupIds,
    fieldIds,
    dateRange,
    dueDateRange,
    integrationTypes
  } = filter;

  const matchfilter = {};

  // USER FILTER
  if (userIds?.length) {
    const { userType = "userId" } = filter;
    matchfilter[userType] = { $in: userIds };
  }

  // BRANCH FILTER
  if (branchIds?.length) {
    matchfilter["branchIds"] = { $in: branchIds };
  }

  // DEPARTMENT FILTER
  if (departmentIds?.length) {
    matchfilter["departmentIds"] = { $in: departmentIds };
  }

  // COMPANY FILTER
  if (companyIds?.length) {
    const mainTypeIds = await sendCoreMessage({
      subdomain,
      action: "conformities.filterConformity",
      data: {
        mainType: "company",
        mainTypeIds: companyIds,
        relType: type
      },
      isRPC: true,
      defaultValue: []
    });

    matchfilter["_id"] = { $in: mainTypeIds };
  }

  // CUSTOMER FILTER
  if (customerIds?.length) {
    const mainTypeIds = await sendCoreMessage({
      subdomain,
      action: "conformities.filterConformity",
      data: {
        mainType: "customer",
        mainTypeIds: customerIds,
        relType: type
      },
      isRPC: true,
      defaultValue: []
    });

    matchfilter["_id"] = { $in: mainTypeIds };
  }

  // SOURCE FILTER
  if (integrationTypes?.length) {
    const query = { kind: { $in: integrationTypes } };
    const integrationIds = await getIntegrationIds(query, subdomain);

    matchfilter["integration._id"] = { $in: integrationIds };
  }

  // PRODUCTS FILTER
  if (productIds?.length) {
    matchfilter["productsData.productId"] = { $in: productIds };
  }

  // TAG FILTER
  if (tagIds?.length) {
    matchfilter["tagIds"] = { $in: tagIds };
  }

  // BOARD FILTER
  if (boardId) {
    const stageIds = await getStageIds(filter, type, model);
    matchfilter["stageId"] = { $in: stageIds };
  }

  // PIPELINE FILTER
  if (pipelineIds?.length) {
    const stageIds = await getStageIds(filter, type, model);
    matchfilter["stageId"] = { $in: stageIds };
  }

  // STAGE FILTER
  if (stageIds?.length) {
    matchfilter["stageId"] = { $in: stageIds };
  }

  // LABEL FILTER
  if (labelIds?.length) {
    matchfilter["labelIds"] = { $in: labelIds };
  }

  // STATUS FILTER
  if (status) {
    if (status === "closed") {
      const stageIds = await getStageIds(
        { ...filter, stageProbability: PROBABILITY_CLOSED[type] },
        type,
        model
      );
      matchfilter["stageId"] = { $in: stageIds };
    } else if (status === "open") {
      const stageIds = await getStageIds(
        { ...filter, stageProbability: PROBABILITY_OPEN },
        type,
        model
      );
      matchfilter["stageId"] = { $in: stageIds };
    } else {
      matchfilter["status"] = { $eq: status };
    }
  }

  // PRIORITY FILTER
  if (priority) {
    matchfilter["priority"] = { $eq: priority };
  }

  // ATTACHEMNT FILTER
  if (attachment === true) {
    matchfilter["attachments"] = { $ne: [] };
  }

  // ATTACHEMNT FILTER
  if (attachment === false) {
    matchfilter["attachments"] = { $eq: [] };
  }

  // FIELD GROUP FILTER
  if (groupIds?.length) {
    const fields = await sendCoreMessage({
      subdomain,
      action: "fields.find",
      data: {
        query: {
          groupId: { $in: groupIds }
        }
      },
      isRPC: true,
      defaultValue: []
    });

    const fieldIds = (fields || []).map(field => field._id);

    matchfilter["customFieldsData.field"] = { $in: fieldIds };
  }

  // CUSTOM PROPERTIES FIELD FILTER
  if (fieldIds?.length) {
    matchfilter["customFieldsData.field"] = { $in: fieldIds };
  }

  // DATE FILTER
  if (dateRange) {
    const { startDate, endDate, dateRangeType = "createdAt" } = filter;
    const dateFilter = returnDateRange(dateRange, startDate, endDate);

    if (Object.keys(dateFilter).length) {
      matchfilter[dateRangeType] = dateFilter;
    }
  }

  // DUE DATE FILTER
  if (dueDateRange) {
    const {
      dueType = "due",
      dueDateRange = "thisWeek",
      dateRangeType = "closeDate"
    } = filter;
    const dateFilter = returnDueDateRange(dueDateRange, dueType);

    if (Object.keys(dateFilter).length) {
      matchfilter[dateRangeType] = dateFilter;
    }
  }

  return matchfilter;
};

export const buildData = ({ chartType, data, measure, dimension }) => {
  switch (chartType) {
    case "bar":
    case "line":
    case "pie":
    case "doughnut":
    case "radar":
    case "polarArea":
      return buildChartData(data, measure, dimension);
    case "table":
      return buildTableData(data, measure, dimension);
    default:
      return data;
  }
};

export const buildChartData = (data: any, measures: any, dimensions: any) => {
  const datasets = (data || []).map(item => item[measures[0]]);
  const labels = (data || []).map(item => item[dimensions[0]]);

  return { data: datasets, labels };
};

export const buildTableData = (data: any, measures: any, dimensions: any) => {
  const reorderedData = data.map(item => {
    const order = {};

    dimensions.forEach(dimension => {
      order[dimension] = item[dimension];
    });

    measures.forEach(measure => {
      order[measure] = item[measure];
    });
    return order;
  });

  const total = data.reduce((acc, item) => {
    measures.forEach(measure => {
      if (item[measure] !== undefined) {
        acc[measure] = (acc[measure] || 0) + item[measure];
      }
    });

    return acc;
  }, {});

  return { data: [...reorderedData, total] };
};

export const getDimensionPipeline = async (filter, type, subdomain, models) => {
  const { dimension } = filter;

  const matchFilter = await buildMatchFilter(filter, type, subdomain, models);

  const pipeline: any[] = [];

  if (!dimension || dimension === "count") {
    return pipeline;
  }

  // TAG DIMENSION
  if (dimension === "tag") {
    pipeline.push(
      ...[
        {
          $unwind: "$tagIds"
        },
        {
          $match: {
            status: { $eq: "active" },
            ...matchFilter
          }
        },
        {
          $group: {
            _id: "$tagIds",
            count: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: "tags",
            localField: "_id",
            foreignField: "_id",
            as: "tag"
          }
        },
        {
          $unwind: "$tag"
        },
        {
          $project: {
            _id: "$tag.name",
            count: 1
          }
        }
      ]
    );
  }

  // LABEL DIMENSION
  if (dimension === "label") {
    pipeline.push(
      ...[
        {
          $unwind: "$labelIds"
        },
        {
          $match: {
            status: { $eq: "active" },
            ...matchFilter
          }
        },
        {
          $group: {
            _id: "$labelIds",
            count: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: "pipeline_labels",
            localField: "_id",
            foreignField: "_id",
            as: "label"
          }
        },
        {
          $unwind: "$label"
        },
        {
          $project: {
            _id: "$label.name",
            count: 1
          }
        }
      ]
    );
  }

  // PRIOPRITY DIMENSION
  if (dimension === "priority") {
    pipeline.push(
      ...[
        {
          $match: {
            priority: { $nin: [null, ""] },
            ...matchFilter
          }
        },
        {
          $group: {
            _id: "$priority",
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: "$_id",
            count: 1
          }
        }
      ]
    );
  }

  // STATUS DIMENSION
  if (dimension === "status") {
    pipeline.push(
      ...[
        {
          $match: {
            status: { $ne: null },
            ...matchFilter
          }
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: "$_id",
            count: 1
          }
        }
      ]
    );
  }

  // TEAM MEMBER DIMENSION
  if (dimension === "teamMember") {
    const { userType = "userId" } = filter;

    pipeline.push(
      ...[
        {
          $match: {
            [userType]: { $exists: true },
            ...matchFilter
          }
        },
        ...(userType === "assignedUserIds"
          ? [{ $unwind: "$assignedUserIds" }]
          : []),
        {
          $group: {
            _id: `$${userType}`,
            count: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: "users",
            let: { userId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$_id", "$$userId"] },
                      { $eq: ["$isActive", true] }
                    ]
                  }
                }
              }
            ],
            as: "user"
          }
        },
        { $unwind: "$user" },
        {
          $project: {
            _id: "$user.details.fullName",
            count: 1
          }
        }
      ]
    );
  }

  // BRANCH DIMENSION
  if (dimension === "branch") {
    pipeline.push(
      ...[
        {
          $unwind: "$branchIds"
        },
        {
          $match: {
            ...matchFilter
          }
        },
        {
          $group: {
            _id: "$branchIds",
            count: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: "branches",
            let: { branchId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ["$_id", "$$branchId"] }]
                  }
                }
              }
            ],
            as: "branch"
          }
        },
        { $unwind: "$branch" },
        {
          $project: {
            _id: "$branch.title",
            count: 1
          }
        }
      ]
    );
  }

  // DEPARTMENT DIMENSION
  if (dimension === "department") {
    pipeline.push(
      ...[
        {
          $unwind: "$departmentIds"
        },
        {
          $match: {
            ...matchFilter
          }
        },
        {
          $group: {
            _id: "$departmentIds",
            count: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: "departments",
            let: { departmentId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$_id", "$$departmentId"] },
                      { $eq: ["$status", "active"] }
                    ]
                  }
                }
              }
            ],
            as: "department"
          }
        },
        { $unwind: "$department" },
        {
          $project: {
            _id: "$department.title",
            count: 1
          }
        }
      ]
    );
  }

  // COMPANY DIMENSION
  if (dimension === "company") {
    pipeline.push(
      ...[
        {
          $match: {
            status: "active",
            ...matchFilter
          }
        },
        {
          $lookup: {
            from: "conformities",
            let: { fieldId: "$_id" },
            pipeline: [
              {
                $match: {
                  $and: [
                    {
                      $expr: {
                        $eq: ["$mainType", type]
                      }
                    },
                    {
                      $expr: {
                        $eq: ["$mainTypeId", "$$fieldId"]
                      }
                    },
                    {
                      $expr: {
                        $eq: ["$relType", "company"]
                      }
                    }
                  ]
                }
              }
            ],
            as: "conformity"
          }
        },
        {
          $unwind: "$conformity"
        },
        {
          $group: {
            _id: "$conformity.relTypeId",
            count: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: "companies",
            let: { companyId: "$_id" },
            pipeline: [
              {
                $match: {
                  $and: [
                    {
                      $expr: {
                        $eq: ["$_id", "$$companyId"]
                      }
                    }
                  ]
                }
              }
            ],
            as: "company"
          }
        },
        {
          $unwind: "$company"
        },
        {
          $project: {
            _id: "$company.primaryName",
            count: 1
          }
        }
      ]
    );
  }

  // CUSTOMER DIMENSION
  if (dimension === "customer") {
    pipeline.push(
      ...[
        {
          $match: {
            ...matchFilter
          }
        },
        {
          $lookup: {
            from: "conformities",
            let: { fieldId: "$_id" },
            pipeline: [
              {
                $match: {
                  $and: [
                    {
                      $expr: {
                        $eq: ["$mainType", type]
                      }
                    },
                    {
                      $expr: {
                        $eq: ["$mainTypeId", "$$fieldId"]
                      }
                    },
                    {
                      $expr: {
                        $eq: ["$relType", "customer"]
                      }
                    }
                  ]
                }
              }
            ],
            as: "conformity"
          }
        },
        {
          $unwind: "$conformity"
        },
        {
          $group: {
            _id: "$conformity.relTypeId",
            count: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: "customers",
            let: { customerId: "$_id" },
            pipeline: [
              {
                $match: {
                  $and: [
                    {
                      $expr: {
                        $eq: ["$_id", "$$customerId"]
                      }
                    }
                  ]
                }
              }
            ],
            as: "customer"
          }
        },
        {
          $unwind: "$customer"
        },
        {
          $project: {
            _id: {
              $switch: {
                branches: [
                  {
                    case: { $ne: ["$customer.firstName", null] },
                    then: "$customer.firstName"
                  },
                  {
                    case: { $ne: ["$customer.lastName", null] },
                    then: "$customer.lastName"
                  },
                  {
                    case: { $ne: ["$customer.middleName", null] },
                    then: "$customer.middleName"
                  },
                  {
                    case: { $ne: ["$customer.primaryEmail", null] },
                    then: "$customer.primaryEmail"
                  },
                  {
                    case: { $ne: ["$customer.primaryPhone", null] },
                    then: "$customer.primaryPhone"
                  },
                  {
                    case: { $ne: ["$customer.visitorContactInfo.phone", null] },
                    then: "$customer.visitorContactInfo.phone"
                  },
                  {
                    case: { $ne: ["$customer.visitorContactInfo.email", null] },
                    then: "$customer.visitorContactInfo.email"
                  }
                ],
                default: "Unknown"
              }
            },
            count: 1
          }
        }
      ]
    );
  }

  // SOURCE DIMENSION
  if (dimension === "source") {
    pipeline.push(
      ...[
        {
          $unwind: "$sourceConversationIds"
        },
        {
          $lookup: {
            from: "conversations",
            let: { conversationId: "$sourceConversationIds" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$conversationId"]
                  }
                }
              }
            ],
            as: "conversation"
          }
        },
        {
          $unwind: "$conversation"
        },
        {
          $lookup: {
            from: "integrations",
            let: { integrationId: "$conversation.integrationId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$integrationId"]
                  }
                }
              }
            ],
            as: "integration"
          }
        },
        {
          $unwind: "$integration"
        },
        {
          $match: {
            ...matchFilter
          }
        },
        {
          $group: {
            _id: "$integration.kind",
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 1,
            count: 1
          }
        }
      ]
    );
  }

  // PRODUCT DIMENSION
  if (dimension === "product") {
    pipeline.push(
      ...[
        {
          $unwind: "$productsData"
        },
        {
          $match: {
            ...matchFilter
          }
        },
        {
          $group: {
            _id: "$productsData.productId",
            count: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: "products",
            let: { productId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$_id", "$$productId"] },
                      { $eq: ["$status", "active"] }
                    ]
                  }
                }
              }
            ],
            as: "product"
          }
        },
        {
          $unwind: "$product"
        },
        {
          $project: {
            _id: "$product.name",
            count: 1
          }
        }
      ]
    );
  }

  // STAGE DIMENSION
  if (dimension === "stage") {
    pipeline.push(
      ...[
        {
          $match: {
            ...matchFilter
          }
        },
        {
          $group: {
            _id: "$stageId",
            count: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: "purchases_stages",
            localField: "_id",
            foreignField: "_id",
            as: "stage"
          }
        },
        {
          $unwind: "$stage"
        },
        {
          $project: {
            _id: "$stage.name",
            count: 1
          }
        }
      ]
    );
  }

  // PIPELINE DIMENSION
  if (dimension === "pipeline") {
    pipeline.push(
      ...[
        {
          $match: {
            ...matchFilter
          }
        },
        {
          $lookup: {
            from: "purchases_stages",
            localField: "stageId",
            foreignField: "_id",
            as: "stage"
          }
        },
        {
          $unwind: "$stage"
        },
        {
          $group: {
            _id: "$stage.pipelineId",
            count: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: "purchases_pipelines",
            localField: "_id",
            foreignField: "_id",
            as: "pipeline"
          }
        },
        {
          $unwind: "$pipeline"
        },
        {
          $project: {
            _id: "$pipeline.name",
            count: 1
          }
        }
      ]
    );
  }

  // BOARD DIMENSION
  if (dimension === "board") {
    pipeline.push(
      ...[
        {
          $match: {
            ...matchFilter
          }
        },
        {
          $lookup: {
            from: "purchases_stages",
            localField: "stageId",
            foreignField: "_id",
            as: "stage"
          }
        },
        {
          $unwind: "$stage"
        },
        {
          $lookup: {
            from: "purchases_pipelines",
            localField: "stage.pipelineId",
            foreignField: "_id",
            as: "pipeline"
          }
        },
        {
          $unwind: "$pipeline"
        },
        {
          $group: {
            _id: "$pipeline.boardId",
            count: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: "purchases_boards",
            localField: "_id",
            foreignField: "_id",
            as: "board"
          }
        },
        {
          $unwind: "$board"
        },
        {
          $project: {
            _id: "$board.name",
            count: 1
          }
        }
      ]
    );
  }

  // FREQUENCY DIMENSION
  if (dimension === "frequency") {
    const {
      frequencyType,
      dateRange,
      startDate,
      endDate,
      dateRangeType = "createdAt"
    } = filter;

    let formatType = "%Y";

    if (dateRange?.toLowerCase().includes("day")) {
      formatType = "%Hh:%Mm:%Ss";
    }

    if (dateRange?.toLowerCase().includes("week")) {
      formatType = "%u";
    }

    if (dateRange?.toLowerCase().includes("month")) {
      formatType = "%V";
    }

    if (dateRange?.toLowerCase().includes("year")) {
      formatType = "%m";
    }

    if (dateRange === "customDate" && startDate && endDate) {
      formatType = "%Y-%m-%d";
    }

    const dateFormat = frequencyType || formatType;

    let projectStage: any = [
      {
        $project: {
          _id: 1,
          count: 1,
          amount: 1
        }
      }
    ];

    if (dateFormat === "%u") {
      projectStage = [
        {
          $project: {
            _id: {
              $arrayElemAt: [
                WEEKDAY_NAMES,
                { $subtract: [{ $toInt: "$_id" }, 1] }
              ]
            },
            count: 1,
            amount: 1
          }
        }
      ];
    }

    if (dateFormat === "%m") {
      projectStage = [
        {
          $project: {
            _id: {
              $arrayElemAt: [
                MONTH_NAMES,
                { $subtract: [{ $toInt: "$_id" }, 1] }
              ]
            },
            count: 1,
            amount: 1
          }
        }
      ];
    }

    if (dateFormat === "%V") {
      projectStage = [
        {
          $project: {
            _id: {
              $concat: [
                "Week ",
                "$_id",
                " ",
                {
                  $dateToString: {
                    format: "%m/%d",
                    date: {
                      $dateFromString: {
                        dateString: {
                          $concat: [
                            {
                              $dateToString: {
                                format: "%Y",
                                date: "$createdAt"
                              }
                            },
                            "-W",
                            {
                              $dateToString: {
                                format: "%V",
                                date: "$createdAt"
                              }
                            },
                            "-1"
                          ]
                        }
                      }
                    }
                  }
                },
                "-",
                {
                  $dateToString: {
                    format: "%m/%d",
                    date: {
                      $dateFromString: {
                        dateString: {
                          $concat: [
                            {
                              $dateToString: {
                                format: "%Y",
                                date: "$createdAt"
                              }
                            },
                            "-W",
                            {
                              $dateToString: {
                                format: "%V",
                                date: "$createdAt"
                              }
                            },
                            "-7"
                          ]
                        }
                      }
                    }
                  }
                }
              ]
            },
            count: 1,
            amount: 1
          }
        }
      ];
    }

    pipeline.push(
      ...[
        {
          $match: {
            [dateRangeType]: { $ne: null },
            ...matchFilter
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: dateFormat,
                date: `$${dateRangeType}`
              }
            },
            createdAt: { $first: `$${dateRangeType}` },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } },
        ...projectStage
      ]
    );
  }

  pipeline.push(
    ...[
      {
        $project: {
          _id: 0,
          key: "$_id",
          count: 1
        }
      }
    ]
  );

  return pipeline;
};

export const getStageIds = async (
  filter: any,
  type: string,
  models: IModels
) => {
  const { pipelineIds, boardId, stageIds, stageProbability } = filter;

  const pipelines = await models.Pipelines.find({
    ...(boardId ? { boardId: { $in: [boardId] } } : {}),
    ...(pipelineIds?.length ? { _id: { $in: pipelineIds } } : {}),
    type: type
  });

  const getPipelineIds = (pipelines || []).map(pipeline => pipeline._id);

  const stages = await models.Stages.find({
    ...(stageProbability
      ? {
          probability: Array.isArray(stageProbability)
            ? { $in: stageProbability }
            : stageProbability
        }
      : {}),
    ...(stageIds?.length ? { _id: { $in: stageIds } } : {}),
    pipelineId: {
      $in: getPipelineIds
    },
    type: type
  });

  const getStageIds = (stages || []).map(stage => stage._id);

  return getStageIds;
};

export const getIntegrationIds = async (query, subdomain) => {
  const integrations = await sendInboxMessage({
    subdomain,
    action: "integrations.find",
    data: { query },
    isRPC: true,
    defaultValue: []
  });

  return (integrations || []).map(integration => integration._id);
};

export const getIntegrationMeta = async () => {
  const serviceNames = await getServices();
  let metas: any = [];

  for (const serviceName of serviceNames) {
    const service = await getService(serviceName);
    const inboxIntegrations =
      (service?.config?.meta || {})?.inboxIntegrations || [];

    if (inboxIntegrations && inboxIntegrations.length > 0) {
      metas = metas.concat(inboxIntegrations);
    }
  }

  return metas;
};

export const getIntegrationsKinds = async () => {
  const metas = await getIntegrationMeta();

  const response = {
    messenger: "Messenger",
    lead: "Popups & forms",
    webhook: "Webhook",
    booking: "Booking",
    callpro: "Callpro",
    imap: "IMap",
    "facebook-messenger": "Facebook messenger",
    "facebook-post": "Facebook post",
    "instagram-messenger": "Instagram messenger",
    calls: "Phone call",
    client: "Client Portal",
    vendor: "Vendor Portal"
  };

  for (const meta of metas) {
    response[meta.kind] = meta.label;
  }

  return response;
};
