import { sendCoreMessage, sendInboxMessage } from "../messageBroker";
import { PROBABILITY_CLOSED, PROBABILITY_OPEN, DIMENSION_MAP, FIELD_MAP, COLLECTION_MAP } from './constants';
import { IModels } from "../connectionResolver";
import * as dayjs from 'dayjs';
import * as isoWeek from 'dayjs/plugin/isoWeek';
import { getService, getServices, isEnabled } from "@erxes/api-utils/src/serviceDiscovery";
const util = require('util');

dayjs.extend(isoWeek);

export const buildUnwind = ({ fields }: { fields: string[] }) => {

  return (fields || []).map((field) => ({
    $unwind: `$${FIELD_MAP[field]}`
  }));
}

export const buildLookup = ({ fields, localField, foreignField, extraConditions = [], extraStages = [] }: {
  fields: string[];
  localField?: string;
  foreignField?: string;
  extraConditions?: any[];
  extraStages?: any[];
}) => {

  const lookups = fields.map((field) => {
    const conditions: any = [
      { $eq: [`$${foreignField ?? '_id'}`, "$$fieldId"] },
      ...extraConditions,
    ];

    const pipeline: any = [
      { $match: { $expr: { $and: conditions } } },
      ...extraStages,
    ];

    return [
      {
        $lookup: {
          from: COLLECTION_MAP[field],
          let: { fieldId: `$_id.${localField || DIMENSION_MAP[field]}` },
          pipeline,
          as: field,
        },
      },
      {
        $unwind: `$${field}`
      }
    ];
  });

  return [...lookups.flat()];
}

export const buildGroupBy = ({ fields, action, extraFields }: {
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
  }
}

export const buildAction = (measures: string[]): object => {
  const actions = {};

  (measures || []).forEach((measure) => {
    switch (measure) {
      case 'count':
        actions[measure] = { $sum: 1 };
        break;
      case 'totalAmount':
        actions[measure] = { $sum: { $cond: [{ $eq: ["$productsData.tickUsed", true] }, "$productsData.amount", 0] } };
        break
      case 'unusedAmount':
        actions[measure] = { $sum: { $cond: [{ $eq: ['$productsData.tickUsed', false] }, '$productsData.amount', 0] } };
        break;
      case 'averageAmount':
        actions[measure] = { $avg: { $cond: { if: { $eq: ["$productsData.tickUsed", true] }, then: "$productsData.amount", else: null } } };
        break;
      case 'forecastAmount':
        actions[measure] = { $sum: { $cond: { if: { $eq: ["$productsData.tickUsed", true] }, then: { $divide: [{ $multiply: ["$productsData.amount", "$probability"] }, 100] }, else: 0 } } }
        break;
      default:
        actions[measure] = { $sum: 1 };
        break;
    }
  });

  return actions;
}

const buildFormatType = (dateRange, startDate, endDate) => {
  let formatType = "%Y"

  if (dateRange?.toLowerCase().includes('day')) {
    formatType = '%Hh:%Mm:%Ss'
  }

  if (dateRange?.toLowerCase().includes('week')) {
    formatType = '%u'
  }

  if (dateRange?.toLowerCase().includes('month')) {
    formatType = "%Y-%V"
  }

  if (dateRange?.toLowerCase().includes('year')) {
    formatType = "%m"
  }

  if (dateRange === 'customDate' && startDate && endDate) {
    formatType = '%Y-%m-%d';
  }

  return formatType

}

export const getGoalStage = (goalType) => {

  return {
    $lookup: {
      from: "goals",
      let: { fieldId: goalType },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ['$_id', "$$fieldId"] }
              ]
            },
          },
        },
      ],
      as: "goal",
    },
  }
}

export const buildPipeline = (filter, type, matchFilter) => {

  const { dimension, measure, userType = 'userId', frequencyType, dateRange, startDate, endDate, dateRangeType = "createdAt", sortBy, goalType, colDimension, rowDimension } = filter

  let dimensions

  if (colDimension?.length || rowDimension?.length) {
    dimensions = [...colDimension.map(col => col.value), ...rowDimension.map(row => row.value)]
  } else {
    dimensions = Array.isArray(dimension) ? dimension : dimension?.split(",") || []
  }

  const measures = Array.isArray(measure) ? measure : measure?.split(",") || []

  const pipeline: any[] = [];

  const actions = buildAction(measures)

  const formatType = buildFormatType(dateRange, startDate, endDate)

  const dateFormat = frequencyType || formatType

  if (dimensions.includes("tag")) {
    pipeline.push({ $unwind: "$tagIds" });
  }

  if (dimensions.includes("label")) {
    pipeline.push({ $unwind: "$labelIds" });
  }

  if (dimensions.includes("customer")) {
    pipeline.push({
        $lookup: {
          from: "conformities",
          let: { fieldId: "$_id" },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ["$mainType", type],
                    },
                  },
                  {
                    $expr: {
                      $eq: [
                        "$mainTypeId",
                        "$$fieldId",
                      ],
                    },
                  },
                  {
                    $expr: {
                      $eq: ["$relType", "customer"],
                    },
                  },
                ],
            },
          },
        ],
        as: "conformity",
      },
      },
      {
        $unwind: "$conformity",
      });
  }

  if (dimensions.includes("company")) {
    pipeline.push({
        $lookup: {
          from: "conformities",
          let: { fieldId: "$_id" },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ["$mainType", type],
                    },
                  },
                  {
                    $expr: {
                      $eq: [
                        "$mainTypeId",
                        "$$fieldId",
                      ],
                    },
                  },
                  {
                    $expr: {
                    $eq: ["$relType", "company"],
                  },
                },
              ],
            },
          },
        ],
        as: "conformity",
      },
    },
      {
        $unwind: "$conformity",
      });
  }

  if (dimensions.includes("assignedTo")) {
    pipeline.push({ $unwind: "$assignedUserIds" });
  }

  if (dimensions.includes("field") || filter?.subFields?.length) {
    pipeline.push(
      { $unwind: "$customFieldsData" },
      { $unwind: "$customFieldsData.value" },
      {
        $addFields: {
          customFieldValues: {
            $cond: {
              if: { $eq: [{ $type: "$customFieldsData.value" }, "object"] },
              then: { $map: { input: { $objectToArray: "$customFieldsData.value" }, as: "pair", in: "$$pair.v" } },
              else: ["$customFieldsData.value"]
            }
          }
        }
      },
      {
        $unwind: "$customFieldValues"
      },
    );
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
          as: 'conversation'
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
          as: 'integration'
        }
      },
      {
        $unwind: "$integration"
      }
    )
  }

  if (dimensions.includes("product") || measures.some(m => ["totalAmount", "averageAmount", "unusedAmount", "forecastAmount"].includes(m))) {
    pipeline.push({ $unwind: "$productsData" });
  }

  if (dimensions.includes("pipeline") || dimensions.includes("probability") || measures.includes("forecastAmount")) {
    pipeline.push(
      {
        $lookup: {
          from: `${COLLECTION_MAP[type]}_stages`,
          localField: "stageId",
          foreignField: "_id",
          as: "stage",
        },
      },
      {
        $unwind: "$stage",
      },
    );
  }

  if (dimensions.includes("board")) {
    pipeline.push(
      {
        $lookup: {
          from: `${COLLECTION_MAP[type]}_stages`,
          localField: "stageId",
          foreignField: "_id",
          as: "stage",
        },
      },
      {
        $unwind: "$stage",
      },
      {
        $lookup: {
          from: `${COLLECTION_MAP[type]}_pipelines`,
          localField: "stage.pipelineId",
          foreignField: "_id",
          as: "pipeline",
        },
      },
      {
        $unwind: "$pipeline",
      },
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
                  $eq: [
                    "$stage.probability",
                    "Done"
                  ]
                },
                then: 100
              },
              {
                case: {
                  $eq: [
                    "$stage.probability",
                    "Resolved"
                  ]
                },
                then: 100
              },
              {
                case: {
                  $eq: [
                    "$stage.probability",
                    "Lost"
                  ]
                },
                then: 0
              }
            ],
            default: {
              $toDouble: {
                $arrayElemAt: [
                  {
                    $split: [
                      "$stage.probability",
                      "%"
                    ]
                  },
                  0
                ]
              }
            }
          }
        }
      }
    })
  }

  const match: object = {}

  if (measures.includes("forecastAmount") || dimensions.includes('probability')) {
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
    match["name"] = { $nin: [null, ""] }
  }

  if (dimensions.includes('description')) {
    match["description"] = { $nin: ['', null] }
  }

  if (dimensions.includes('number')) {
    match["number"] = { $ne: null }
  }

  if (dimensions.includes("createdAt")) {
    match["createdAt"] = { $ne: null }
  }

  if (dimensions.includes("modifiedAt")) {
    match["modifiedAt"] = { $ne: null }
  }

  if (dimensions.includes("stageChangedDate")) {
    match["stageChangedDate"] = { $ne: null }
  }

  if (dimensions.includes("startDate")) {
    Object.assign(match, {
      startDate: { $ne: null },
      $expr: { $gte: [{ $year: "$startDate" }, 2020] }
    })
  }

  if (dimensions.includes("closeDate")) {
    Object.assign(match, {
      closeDate: { $ne: null },
      $expr: { $gte: [{ $year: "$closeDate" }, 2020] }
    })
  }

  if (dimensions.includes("createdBy")) {
    match["userId"] = { $ne: null }
  }

  if (dimensions.includes("modifiedBy")) {
    match["modifiedBy"] = { $ne: null }
  }

  if (dimensions.includes("assignedTo")) {
    match["assignedUserIds"] = { $ne: null }
  }

  pipeline.push({
    $match: { ...match, ...matchFilter }
  });

  const groupKeys: any = {};
  if (dimensions.includes("tag")) {
    groupKeys.tagId = "$tagIds";
  }

  if (dimensions.includes("card")) {
    groupKeys.cardName = "$name";
  }

  if (dimensions.includes("field")) {
    groupKeys.field = "$customFieldValues";
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

  if (dimensions.includes("description")) {
    groupKeys.description = "$description";
  }

  if (dimensions.includes("number")) {
    groupKeys.number = "$number";
  }

  if (dimensions.includes("startDate")) {
    groupKeys.startDate = "$startDate";
  }

  if (dimensions.includes("closeDate")) {
    groupKeys.closeDate = "$closeDate";
  }

  if (dimensions.includes("createdAt")) {
    groupKeys.createdAt = "$createdAt";
  }

  if (dimensions.includes("modifiedAt")) {
    groupKeys.modifiedAt = "$modifiedAt";
  }

  if (dimensions.includes("stageChangedDate")) {
    groupKeys.stageChangedDate = "$stageChangedDate";
  }

  if (dimensions.includes("isComplete")) {
    groupKeys.isComplete = "$isComplete";
  }

  if (dimensions.includes("modifiedBy")) {
    groupKeys.modifiedBy = "$modifiedBy";
  }

  if (dimensions.includes("createdBy")) {
    groupKeys.createdBy = "$userId";
  }

  if (dimensions.includes("assignedTo")) {
    groupKeys.assignedTo = "$assignedUserIds";
  }

  if (dimensions.includes("probability")) {
    groupKeys.probability = "$stage.probability";
  }

  if (dimensions.includes("frequency")) {
    groupKeys.frequency = {
      $dateToString: {
        format: dateFormat,
        date: `$${dateRangeType}`,
      },
    };
  }

  const groupKey: any = {
    $group: {
      _id: groupKeys,
      ...actions,
    }
  }

  if (dimensions.includes("card") || dimensions.includes("number")) {
    groupKey.$group.doc = { $first: "$$ROOT" };
  }

  pipeline.push(groupKey);

  if (dimensions.includes("card") || dimensions.includes("number")) {
    pipeline.push(
      {
        $lookup: {
          from: `${COLLECTION_MAP[type]}_stages`,
          localField: "doc.stageId",
          foreignField: "_id",
          as: "stage"
        }
      },
      {
        $unwind: "$stage"
      },
      {
        $lookup: {
          from: `${COLLECTION_MAP[type]}_pipelines`,
          localField: "stage.pipelineId",
          foreignField: "_id",
          as: "pipeline"
        }
      },
      {
        $unwind: "$pipeline"
      },
      {
        $lookup: {
          from: `${COLLECTION_MAP[type]}_boards`,
          localField: "pipeline.boardId",
          foreignField: "_id",
          as: "board"
        }
      },
      {
        $unwind: "$board"
      }
    )
  }

  if (dimensions.includes("frequency")) {
    pipeline.push({ $sort: { _id: 1 } })
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
          from: `${COLLECTION_MAP[type]}_pipeline_labels`,
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

  if (['createdBy', 'modifiedBy', 'assignedTo'].some(item => dimensions.includes(item))) {

    const conditions: any = [];

    if (dimensions.includes('createdBy')) {
      conditions.push({ $eq: ["$_id", "$$createdBy"] });
    }
    if (dimensions.includes('modifiedBy')) {
      conditions.push({ $eq: ["$_id", "$$modifiedBy"] });
    }
    if (dimensions.includes('assignedTo')) {
      conditions.push({ $eq: ["$_id", "$$assignedTo"] });
    }

    pipeline.push(
      {
        $lookup: {
          from: "users",
          let: {
            ...(dimensions.includes('createdBy') && { createdBy: "$_id.createdBy" }),
            ...(dimensions.includes('modifiedBy') && { modifiedBy: "$_id.modifiedBy" }),
            ...(dimensions.includes('assignedTo') && { assignedTo: "$_id.assignedTo" }),
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $or: conditions },
                    { $eq: ["$isActive", true] },
                  ]
                }
              }
            },
          ],
          as: "userDetails"
        }
      },
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
                  $and: [
                    { $eq: ["$_id", "$$fieldId"] },
                  ]
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
                  $and: [
                    { $eq: ["$_id", "$$fieldId"] },
                  ]
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
                  $and: [
                    { $eq: ["$_id", "$$fieldId"] },
                  ]
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
          from: `${COLLECTION_MAP[type]}_stages`,
          let: { fieldId: "$_id.stageId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$fieldId"] },
                  ]
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
          from: `${COLLECTION_MAP[type]}_pipelines`,
          let: { fieldId: "$_id.pipelineId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$fieldId"] },
                  ]
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
          from: `${COLLECTION_MAP[type]}_boards`,
          let: { fieldId: "$_id.boardId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$fieldId"] },
                  ]
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

  const addFields: any = {}

  if (dimensions.includes("createdBy")) {
    addFields['createdBy'] = {
      $arrayElemAt: [
        {
          $filter: {
            input: "$userDetails",
            as: "user",
            cond: {
              $eq: [
                "$$user._id",
                "$_id.createdBy"
              ]
            }
          }
        },
        0
      ]
    }
  }

  if (dimensions.includes("modifiedBy")) {
    addFields['modifiedBy'] = {
      $arrayElemAt: [
        {
          $filter: {
            input: "$userDetails",
            as: "user",
            cond: {
              $eq: [
                "$$user._id",
                "$_id.modifiedBy"
              ]
            }
          }
        },
        0
      ]
    }
  }

  if (dimensions.includes("assignedTo")) {
    addFields['assignedTo'] = {
      $arrayElemAt: [
        {
          $filter: {
            input: "$userDetails",
            as: "user",
            cond: {
              $eq: [
                "$$user._id",
                "$_id.assignedTo"
              ]
            }
          }
        },
        0
      ]
    }
  }

  if (['createdBy', 'modifiedBy', 'assignedTo'].some(item => dimensions.includes(item))) {
    pipeline.push({
      $addFields: {
        ...addFields
      }
    })
  }

  const projectionFields: any = {
    _id: 0,
  };

  if (isEnabled('goals') && goalType) {
    const goalStage = getGoalStage(goalType)

    if (goalStage) {
      pipeline.push(goalStage)
      projectionFields.goal = 1;
    }
    }

  (measures || []).forEach((measure) => {
    projectionFields[measure] = 1;
  });

  if (dimensions.includes("frequency")) {
    projectionFields.frequency = "$_id.frequency";
  }

  if (dimensions.includes("tag")) {
    projectionFields.tag = "$tag.name";
  }

  if (dimensions.includes("field")) {
    projectionFields.field = "$_id.field"
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

  if (dimensions.includes("description")) {
    projectionFields.description = "$_id.description";
  }

  if (dimensions.includes("number")) {
    projectionFields.number = "$_id.number";
  }

  if (dimensions.includes("startDate")) {
    projectionFields.startDate = "$_id.startDate";
  }

  if (dimensions.includes("closeDate")) {
    projectionFields.closeDate = "$_id.closeDate";
  }

  if (dimensions.includes("createdAt")) {
    projectionFields.createdAt = "$_id.createdAt";
  }

  if (dimensions.includes("modifiedAt")) {
    projectionFields.modifiedAt = "$_id.modifiedAt";
  }

  if (dimensions.includes("stageChangedDate")) {
    projectionFields.stageChangedDate = "$_id.stageChangedDate";
  }

  if (dimensions.includes("isComplete")) {
    projectionFields.isComplete = "$_id.isComplete";
  }

  if (dimensions.includes("createdBy")) {
    projectionFields.createdBy = "$createdBy";
  }

  if (dimensions.includes("modifiedBy")) {
    projectionFields.modifiedBy = "$modifiedBy";
  }

  if (dimensions.includes("assignedTo")) {
    projectionFields.assignedTo = "$assignedTo";
  }

  if (dimensions.includes("probability")) {
    projectionFields.probability = "$_id.probability";
  }

  if (dimensions.includes("card") || dimensions.includes("number")) {
    projectionFields.itemId = '$doc._id';
    projectionFields.pipelineId = '$pipeline._id';
    projectionFields.boardId = '$board._id';
  }

  pipeline.push({ $project: projectionFields });

  if (filter.amountRange) {

    let query = {}

    if (filter?.amountRange.min) {
      query = { $gte: parseInt(filter?.amountRange.min, 10) }
    }

    if (filter?.amountRange.max) {
      query = { $lte: parseInt(filter?.amountRange.max, 10) }
    }

    if (filter?.amountRange.min && filter?.amountRange.max) {
      query = { $gte: parseInt(filter?.amountRange.min, 10), $lte: parseInt(filter?.amountRange.max, 10) };
    }

    if (Object.values(query).length) {

      const additionalMatch = {}

      measures.map(m => {
        Object.assign(additionalMatch, { [m]: query })
      })

      pipeline.push({
        $match: additionalMatch
      });
    }
  }

  if (sortBy?.length) {
    const sortFields = (sortBy || []).reduce((acc, { field, direction }) => {
      acc[field] = direction;
      return acc;
    }, {});

    pipeline.push({ $sort: sortFields });
  }

  return pipeline;
}

export const returnDateRange = (
  dateRange: string,
  startDate: Date,
  endDate: Date,
) => {
  const NOW = new Date()

  let $gte;
  let $lte;

  switch (dateRange) {
    case 'today':
      $gte = dayjs(NOW).startOf('day').toDate();
      $lte = dayjs(NOW).endOf('day').toDate();
      break;
    case 'yesterday':
      $gte = dayjs(NOW).subtract(1, 'day').startOf('day').toDate();
      $lte = dayjs(NOW).subtract(1, 'day').endOf('day').toDate();
      break;
    case 'last72h':
      $gte = dayjs(NOW).subtract(3, 'day').startOf('day').toDate();
      $lte = dayjs(NOW).endOf('day').toDate();
      break;
    case 'thisWeek':
      $gte = dayjs(NOW).startOf('week').toDate();
      $lte = dayjs(NOW).endOf('week').toDate();
      break;
    case 'lastWeek':
      $gte = dayjs(NOW).add(-1, 'week').startOf('week').toDate();
      $lte = dayjs(NOW).add(-1, 'week').endOf('week').toDate();
      break;
    case 'last2Week':
      $gte = dayjs(NOW).subtract(14, 'day').startOf('day').toDate();
      $lte = dayjs(NOW).endOf('day').toDate();
      break;
    case 'last3Week':
      $gte = dayjs(NOW).add(-3, 'week').startOf('week').toDate();
      $lte = dayjs(NOW).add(-1, 'week').endOf('week').toDate();
      break;
    case 'lastMonth':
      $gte = dayjs(NOW).add(-1, 'month').startOf('month').toDate();
      $lte = dayjs(NOW).add(-1, 'month').endOf('month').toDate();
      break;
    case 'thisMonth':
      $gte = dayjs(NOW).startOf('month').toDate();
      $lte = dayjs(NOW).endOf('month').toDate();
      break;
    case 'thisYear':
      $gte = dayjs(NOW).startOf('year').toDate();
      $lte = dayjs(NOW).endOf('year').toDate();
      break;
    case 'lastYear':
      $gte = dayjs(NOW).add(-1, 'year').startOf('year').toDate();
      $lte = dayjs(NOW).add(-1, 'year').endOf('year').toDate();
      break;
    case 'customDate':
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

export const returnDueDateRange = (
  dueDateRange: string,
  dueType: string
) => {

  let $gte;
  let $lte;

  if (dueType === 'due') {
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

  if (dueType === 'overdue') {
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
    assetIds,
    dateRange,
    dueDateRange,
    integrationTypes,
    subFields,
    stageProbability
  } = filter;

  const matchfilter = {};

  // USER FILTER
  if (userIds?.length) {
    const { userType = 'userId' } = filter;

    if (userType === "closedBy") {

      const stageIds = await getStageIds({ ...filter, stageProbability: PROBABILITY_CLOSED }, type, model)

      const logs = await sendCoreMessage({
        subdomain,
        action: 'activityLogs.findMany',
        data: {
          query: {
            contentType: `sales:${type}`,
            createdBy: { $in: userIds },
            'content.destinationStageId': { $in: stageIds },
            action: 'moved',
          },
        },
        isRPC: true,
        defaultValue: [],
      });

      const contentIds = (logs || []).map(log => log.contentId);

      matchfilter['_id'] = { $in: contentIds };

    } else {
      matchfilter[userType] = { $in: userIds };
    }

  }

  // BRANCH FILTER
  if (branchIds?.length) {

    const branches = await sendCoreMessage({
      subdomain,
      action: `branches.findWithChild`,
      data: {
        query: { _id: { $in: branchIds } },
        fields: { _id: 1 },
      },
      isRPC: true,
      defaultValue: [],
    });

    matchfilter['branchIds'] = { $in: branches.map(branch => branch._id) };
  }

  // DEPARTMENT FILTER
  if (departmentIds?.length) {

    const departments = await sendCoreMessage({
      subdomain,
      action: `departments.findWithChild`,
      data: {
        query: { _id: { $in: departmentIds } },
        fields: { _id: 1 },
      },
      isRPC: true,
      defaultValue: [],
    });

    matchfilter['departmentIds'] = { $in: departments.map(department => department._id) };
  }

  // COMPANY FILTER
  if (companyIds?.length) {
    const mainTypeIds = await sendCoreMessage({
      subdomain,
      action: 'conformities.filterConformity',
      data: {
        mainType: 'company',
        mainTypeIds: companyIds,
        relType: type
      },
      isRPC: true,
      defaultValue: []
    })

    matchfilter['_id'] = { $in: mainTypeIds };
  }

  // CUSTOMER FILTER
  if (customerIds?.length) {
    const mainTypeIds = await sendCoreMessage({
      subdomain,
      action: 'conformities.filterConformity',
      data: {
        mainType: 'customer',
        mainTypeIds: customerIds,
        relType: type
      },
      isRPC: true,
      defaultValue: []
    })

    matchfilter['_id'] = { $in: mainTypeIds };
  }

  // SOURCE FILTER
  if (integrationTypes?.length) {
    const query = { kind: { $in: integrationTypes } }
    const integrationIds = await getIntegrationIds(query, subdomain)

    matchfilter['integration._id'] = { $in: integrationIds };
  }

  // PRODUCTS FILTER
  if (productIds?.length) {
    matchfilter['productsData.productId'] = { $in: productIds };
  }

  // TAG FILTER
  if (tagIds?.length) {

    const tags = await sendCoreMessage({
      subdomain,
      action: 'tagWithChilds',
      data: {
        query: { _id: { $in: tagIds } },
        fields: { _id: 1 },
      },
      isRPC: true,
      defaultValue: []
    })

    matchfilter['tagIds'] = { $in: tags.map(tag => tag._id) };
  }

  // BOARD FILTER
  if (boardId) {
    const stageIds = await getStageIds(filter, type, model)
    matchfilter['stageId'] = { $in: stageIds };
  }

  // PIPELINE FILTER
  if (pipelineIds?.length) {
    const stageIds = await getStageIds(filter, type, model)
    matchfilter['stageId'] = { $in: stageIds };
  }

  // STAGE FILTER
  if (stageIds?.length) {
    matchfilter['stageId'] = { $in: stageIds };
  }

  // LABEL FILTER
  if (labelIds?.length) {
    matchfilter['labelIds'] = { $in: labelIds };
  }

  // STATUS FILTER
  if (status) {

    if (status === 'closed') {
      const stageIds = await getStageIds({ ...filter, stageProbability: PROBABILITY_CLOSED }, type, model)
      matchfilter['stageId'] = { $in: stageIds };

    } else if (status === 'open') {
      const stageIds = await getStageIds({ ...filter, stageProbability: PROBABILITY_OPEN }, type, model)
      matchfilter['stageId'] = { $in: stageIds };

    } else {
      matchfilter['status'] = { $eq: status };
    }
  }

  if (stageProbability) {
    const stageIds = await getStageIds(filter, type, model)
    matchfilter['stageId'] = { $in: stageIds };
  }

  // PRIORITY FILTER
  if (priority) {
    matchfilter['priority'] = { $eq: priority };
  }

  // ATTACHEMNT FILTER
  if (attachment === true) {
    matchfilter['attachments'] = { '$ne': [] };
  }

  // ATTACHEMNT FILTER
  if (attachment === false) {
    matchfilter['attachments'] = { '$eq': [] };
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
    matchfilter['customFieldsData.field'] = { $in: fieldIds };

    if (subFields?.length) {
      matchfilter['customFieldValues'] = {
        $regex: subFields.map(field => `(?:^|,|\\s)${field}(?:,|$|\\s)`).join('|'),
        $options: 'i'
      };
    }
  }

  // CUSTOM PROPERTIES FIELD FILTER 
  if (assetIds?.length) {
    matchfilter['customFieldsData.value'] = { $in: assetIds };
  }

  // DATE FILTER
  if (dateRange) {
    const { startDate, endDate, dateRangeType = 'createdAt' } = filter;
    const dateFilter = returnDateRange(dateRange, startDate, endDate);

    if (Object.keys(dateFilter).length) {
      matchfilter[dateRangeType] = dateFilter;
    }
  }

  // DUE DATE FILTER
  if (dueDateRange) {
    const { dueType = 'due', dueDateRange = 'thisWeek', dateRangeType = 'closeDate' } = filter;
    const dateFilter = returnDueDateRange(dueDateRange, dueType);

    if (Object.keys(dateFilter).length) {
      matchfilter[dateRangeType] = dateFilter;
    }
  }

  return matchfilter;
}

const MEASURE_LABELS = {
  'count': 'Total Count',
  'totalAmount': 'Total Amount',
  'averageAmount': 'Average Amount',
  'unusedAmount': 'Unused Amount',
  'forecastAmount': 'Forecast Amount',
}

export const formatWeek = (frequency) => {

  let startOfDate, endOfDate

  const [year, week] = frequency?.split('-') || ''

  startOfDate = dayjs().year(year).isoWeek(week).startOf('isoWeek').format('MM/DD');
  endOfDate = dayjs().year(year).isoWeek(week).endOf('isoWeek').format('MM/DD');

  if (startOfDate && endOfDate) {
    return `Week ${week} ${startOfDate}-${endOfDate}`
  }

  return ''
}

export const formatMonth = (frequency) => {

  const MONTH_NAMES = {
    '01': 'January',
    '02': 'February',
    '03': 'March',
    '04': 'April',
    '05': 'May',
    '06': 'June',
    '07': 'July',
    '08': 'August',
    '09': 'September',
    '10': 'October',
    '11': 'November',
    '12': 'December',
  }

  return MONTH_NAMES[frequency]
}

export const formatWeekdays = (frequency) => {

  const WEEK_DAYS = {
    '1': 'Monday',
    '2': 'Tuesday',
    '3': 'Wednesday',
    '4': 'Thursday',
    '5': 'Friday',
    '6': 'Saturday',
    '7': 'Sunday',
  }

  return WEEK_DAYS[frequency]
}


export const formatFrequency = (frequencyType, frequency) => {

  let format = ''

  switch (frequencyType) {
    // Week of month (01-53)
    case '%Y-%V':
      format = formatWeek(frequency)
      break;
    // Month (01-12)
    case '%m':
      format = formatMonth(frequency)
      break;
    // Year - Month - Day - Hour - Minute - Second
    case '%Y-%m-%d %H:%M:%S':
      format = dayjs(new Date(frequency)).format('YYYY-MM-DD h:mm:ss A');
      break;
    // Day of week (1-7)
    case '%u':
      format = formatWeekdays(frequency)
      break;
    // Year (0000-9999)
    case '%Y':
    // Year - Month - Day
    case '%Y-%m-%d':
    // Hour - Minute - Second
    case '%Hh:%Mm:%Ss':
      format = frequency
      break;
    default:
      break;
  }

  return format
}

export const formatData = (data, filter, type) => {

  const { dateRange, startDate, endDate, frequencyType } = filter

  const formattedData = [...data]

  formattedData.forEach(item => {

    if (item.hasOwnProperty('frequency')) {
      const frequency = item['frequency']

      const formatData = frequencyType || buildFormatType(dateRange, startDate, endDate)

      item['frequency'] = formatFrequency(formatData, frequency)
    }

    ['createdBy', 'modifiedBy', 'assignedTo'].forEach(key => {
      if (item.hasOwnProperty(key)) {
        const user = item[key]
        item[key] = user.details?.fullName || `${user.details?.firstName} ${user.details?.lastName}` || user.email
      }
    });

    ['createdAt', 'modifiedAt', 'startDate', 'closeDate', 'stageChangedDate'].forEach(key => {
      if (item.hasOwnProperty(key)) {
        const date = item[key]
        item[key] = dayjs(date).format('YYYY/MM/DD h:mm A')
        }
    });

    ['count', 'totalAmount', 'averageAmount', 'unusedAmount', 'forecastAmount'].forEach(key => {
      if (item.hasOwnProperty(key) && MEASURE_LABELS[key]) {
        item[MEASURE_LABELS[key]] = item[key];
        delete item[key];
      }
    });

    if (item.hasOwnProperty('itemId') && item.hasOwnProperty('pipelineId') && item.hasOwnProperty('boardId')) {
      item.url = `/${type}/board?id=${item.boardId}&pipelineId=${item.pipelineId}&itemId=${item.itemId}`;

      ['boardId', 'pipelineId', 'itemId'].forEach((key) => delete item[key]);
    }
  })

  return formattedData
}

export const buildData = ({ chartType, data, filter, type }) => {

  const { measure, dimension, rowDimension, colDimension } = filter

  const formattedData = formatData(data, filter, type);

  switch (chartType) {
    case 'bar':
    case 'line':
    case 'pie':
    case 'doughnut':
    case 'radar':
    case 'polarArea':
      return buildChartData(formattedData, measure, dimension, filter)
    case 'table':
      return buildTableData(formattedData, measure, dimension, colDimension, rowDimension)
    case 'pivotTable':
      return buildPivotTableData(data, rowDimension, colDimension, measure)
    case 'number':
      return buildNumberData(formattedData, measure, dimension)
    default:
      return data
  }
}

export const buildNumberData = (data: any, measures: any, dimensions: any) => {

  const total = data?.[0] || {}

  const labels = Object.keys(total)
  const totals = Object.values(total)

  return { data: totals, labels }
}

export const buildChartData = (data: any, measures: any, dimensions: any, filter: any) => {

  const { src } = filter

  if (src && src === 'aputpm') {
    const datasets = (data || []).map(item => item[MEASURE_LABELS[measures[0]]])
    const labels = (data || []).map(item => item[dimensions[0]])

    return { data: datasets, labels };
  }

  const hasGoal = (data || []).every(obj => Array.isArray(obj?.goal) && obj?.goal?.length === 0);

  const datasets = (data || []).reduce(
    (acc, item) => {
      const label = (dimensions || []).map((dimension) => item[dimension]);

      const labelExists = acc.labels.some((existingLabel) =>
        existingLabel.every((value, index) => value === label[index])
      );

      if (!labelExists) {
        acc.labels.push(label);
      }

      (measures || []).forEach((measure) => {
        let dataset = acc.datasets.find((d) => d.label === MEASURE_LABELS[measure]);

        if (!dataset) {
          dataset = {
            label: MEASURE_LABELS[measure],
            data: [],
            borderWidth: 1,
            skipNull: true,
          };
          acc.datasets.push(dataset);
        }

        dataset.data.push(item[MEASURE_LABELS[measure]] || 0);
      });

      if (item.goal && !hasGoal) {
        let goalDataset = acc.datasets.find((d) => d.label === "Target");

        if (!goalDataset) {
          goalDataset = {
            label: "Target",
            data: [],
            borderWidth: 1,
            skipNull: true,
          };
          acc.datasets.push(goalDataset);
        }

        if (item?.hasOwnProperty('frequency')) {

          const specificPeriodGoals = item.goal?.[0]?.specificPeriodGoals || []
          const periodGoal = specificPeriodGoals.find(goal => goal.addMonthly.includes(item.frequency));

          if (periodGoal) {
            item.goal[0].target = periodGoal.addTarget;
          }
        }

        goalDataset.data.push(item.goal?.[0]?.target || null);
      }

      return acc;
    },
        {
          labels: [],
          datasets: [],
        }
    );

  return datasets
}

export const buildTableData = (data: any, measures: any, dimensions: any, colDimension: any[], rowDimension: any[]) => {

  if (colDimension?.length || rowDimension?.length) {
    dimensions = [...colDimension.map(col => col.value), ...rowDimension.map(row => row.value)]
  } else {
    dimensions = Array.isArray(dimensions) ? dimensions : dimensions?.split(",") || []
  }

  const reorderedData = data.map(item => {
    const order: any = {};

    if (dimensions?.length) {
      (dimensions || []).forEach(dimension => {
        order[dimension] = item[dimension];
      });
    }

    if (measures?.length) {
      (measures || []).forEach(measure => {
        order[measure] = item[MEASURE_LABELS[measure]];
      });
    }

    if (item.hasOwnProperty("url")) {
      order.url = item.url || ''
    }

    return order;
  });

  let total = '-'

  if (measures?.length) {
    total = data.reduce((acc, item) => {

      acc['total'] = dimensions?.length;

      (measures || []).forEach(measure => {
        if (item[MEASURE_LABELS[measure]] !== undefined) {
          acc[measure] = (acc[measure] || 0) + item[MEASURE_LABELS[measure]];
        }
      });

      return acc;
    }, {})
  }

  return { data: [...reorderedData, total], headers: [...dimensions, ...measures] }
}

export const buildOptions = (filter) => {
  const { target } = filter

  const options: any = {}

  if (target?.target) {
    options.plugins = {
      horizontalDottedLine: {
        targetValue: parseInt(target.target, 10)
      }
    };
  }

  return { options }
}

export const getStageIds = async (filter: any, type: string, models: IModels,) => {
  const { pipelineIds, boardId, stageIds, stageProbability } = filter;

  const pipelines = await models.Pipelines.find({
    ...(boardId ? { boardId: { $in: [boardId] } } : {}),
    ...(pipelineIds?.length ? { _id: { $in: pipelineIds } } : {}),
    type: type,
  })

  const getPipelineIds = (pipelines || []).map(pipeline => pipeline._id)

  const stages = await models.Stages.find({
    ...(stageProbability ? { probability: Array.isArray(stageProbability) ? { $in: stageProbability } : stageProbability } : {}),
    ...(stageIds?.length ? { _id: { $in: stageIds } } : {}),
    pipelineId: {
      $in: getPipelineIds,
        },
    type: type,
  })

  return (stages || []).map(stage => stage._id)
}

export const getIntegrationIds = async (query, subdomain) => {
  const integrations = await sendInboxMessage({
    subdomain,
    action: 'integrations.find',
    data: { query },
    isRPC: true,
    defaultValue: [],
  });

  return (integrations || []).map(integration => integration._id)
}

export const getIntegrationMeta = async () => {
  const serviceNames = await getServices();
  let metas: any = [];

  for (const serviceName of serviceNames) {
    const service = await getService(serviceName);
    const inboxIntegrations = (service?.config?.meta || {})?.inboxIntegrations || [];

    if (inboxIntegrations && inboxIntegrations.length > 0) {
      metas = metas.concat(inboxIntegrations);
    }
  }

  return metas;
};

export const getIntegrationsKinds = async () => {
  const metas = await getIntegrationMeta();

  const response = {
    messenger: 'Messenger',
    lead: 'Popups & forms',
    webhook: 'Webhook',
    booking: 'Booking',
    callpro: 'Callpro',
    imap: 'IMap',
    'facebook-messenger': 'Facebook messenger',
    'facebook-post': 'Facebook post',
    'instagram-messenger': 'Instagram messenger',
    calls: 'Phone call',
    client: 'Client Portal',
    vendor: 'Vendor Portal'
  };

  for (const meta of metas) {
    response[meta.kind] = meta.label;
  }

  return response;
};

const rx = /(\d+)|(\D+)/g;
const rd = /\d/;
const rz = /^0/;

export const naturalSort = (as: any = null, bs: any = null) => {
  if (bs !== null && as === null) {
    return 1;
  }
  if (as !== null && bs === null) {
    return -1;
  }

  if (typeof as === 'boolean') {
    return -1;
  }
  if (typeof bs === 'boolean') {
    return 1;
  }

  if (!as || as.trim() === "") {
    return 1;
  }
  if (!bs || bs.trim() === "") {
    return -1;
  }

  if (typeof as === 'number' && isNaN(as)) {
    return -1;
  }
  if (typeof bs === 'number' && isNaN(bs)) {
    return 1;
  }

  const nas = Number(as);
  const nbs = Number(bs);
  if (nas < nbs) {
    return -1;
  }
  if (nas > nbs) {
    return 1;
  }

  if (typeof as === 'number' && typeof bs !== 'number') {
    return -1;
  }
  if (typeof bs === 'number' && typeof as !== 'number') {
    return 1;
  }
  if (typeof as === 'number' && typeof bs === 'number') {
    return 0;
  }

  if (isNaN(nbs) && !isNaN(nas)) {
    return -1;
  }
  if (isNaN(nas) && !isNaN(nbs)) {
    return 1;
  }

  let a: any = String(as);
  let b: any = String(bs);
  if (a === b) {
    return 0;
  }
  if (!rd.test(a) || !rd.test(b)) {
    return a > b ? 1 : -1;
  }

  a = a.match(rx);
  b = b.match(rx);
  while (a.length && b.length) {
    const a1 = a.shift();
    const b1 = b.shift();
    if (a1 !== b1) {
      if (rd.test(a1) && rd.test(b1)) {
        return a1.replace(rz, '.0') - b1.replace(rz, '.0');
      }
      return a1 > b1 ? 1 : -1;
    }
  }
  return a.length - b.length;
};

export const getSort = (sorters: any, attr: any) => {
  if (sorters) {
    if (typeof sorters === 'function') {
      const sort = sorters(attr);
      if (typeof sort === 'function') {
        return sort;
      }
    } else if (attr in sorters) {
      return sorters[attr];
    }
  }
  return naturalSort;
};

export const arrSort = (attrs: any) => {
  let a;
  const sortersArr = (() => {
    const result: any[] = [];
    for (a of Array.from(attrs) as any) {
      result.push(getSort({}, a.value));
    }
    return result;
  })();
  return function (a: any, b: any) {
    for (const i of Object.keys(sortersArr || {}) as any) {
      const sorter = sortersArr[i];
      const comparison = sorter(a[i], b[i]);
      if (comparison !== 0) {
        return comparison;
      }
    }
    return 0;
  };
}

export const sortKeys = (keys: any, dimensions: any) => {
  return keys.sort(arrSort(dimensions));
}

const aggregator = (rowKey: any[], colKey: any[], vals?: string[]) => {
  const aggregatedValues: any = {};

  (vals || []).forEach((val) => {

    const value = MEASURE_LABELS[val]

    aggregatedValues[value] = 0;
  });

  return {
    push: function (record: any) {
      (vals || []).forEach((val) => {

        const value = MEASURE_LABELS[val]

        if (typeof record[value] === 'number') {
          aggregatedValues[value] += record[value];
        } else if (typeof record[value] === 'string') {
          aggregatedValues[value] += parseFloat(record[value]) || 0;
        }
      });
        },
    value: function () {
      return aggregatedValues['Total Count'];
    }
  };
};

const subarrays = (array: any[]) => array.map((d, i) => array.slice(0, i + 1));

export const transformData = (data, cols) => {
  return data.map(row => {
    const newRow = [...row];

    if (row.length < cols.length) {
      const lastIndex = newRow.length - 1;
      if (newRow[lastIndex] !== undefined && cols[lastIndex + 1]?.showTotal) {
        newRow[lastIndex] = `${newRow[lastIndex]} Total`;
      } else {
        return null;
      }
    }

    return newRow;
  }).filter(row => row !== null);
}

export const createPivotTable = (data: any, rows: any, cols: any, vals: any) => {
  const tree: any = {}
  const mainRowKeys: any[] = []
  const mainColKeys: any[] = []
  const rowTotals: any = {}
  const colTotals: any = {}
  const allTotal = aggregator([], [], vals);

  data.forEach((record: any) => {

    let colKeys: any[] = [];
    let rowKeys: any[] = [];

    for (const x of Array.from(cols) as any) {
      colKeys.push(x.value in record ? record[x.value] : 'null');
        }

    for (const x of Array.from(rows) as any) {
      rowKeys.push(x.value in record ? record[x.value] : 'null');
    }

    colKeys = subarrays(colKeys);
    rowKeys = subarrays(rowKeys);

    allTotal.push(record);

    for (const rowKey of rowKeys) {
      const flatRowKey = rowKey.join(String.fromCharCode(0));

      for (const colKey of colKeys) {
        const flatColKey = colKey.join(String.fromCharCode(0));

        if (rowKey.length !== 0) {
          if (!rowTotals[flatRowKey]) {
            mainRowKeys.push(rowKey);
            rowTotals[flatRowKey] = aggregator(rowKey, [], vals);
          }
          rowTotals[flatRowKey].push(record);
        }

        if (colKey.length !== 0) {
          if (!colTotals[flatColKey]) {
            mainColKeys.push(colKey);
            colTotals[flatColKey] = aggregator([], colKey, vals);
          }
          colTotals[flatColKey].push(record);
        }

        if (colKey.length !== 0 && rowKey.length !== 0) {
          if (!tree[flatRowKey]) {
            tree[flatRowKey] = {};
          }

          if (!tree[flatRowKey][flatColKey]) {
            tree[flatRowKey][flatColKey] = aggregator(
              rowKey,
              colKey,
              vals
            );
          }

          tree[flatRowKey][flatColKey].push(record);
        }
      }
    }
  })

  const sortedRowKeys = sortKeys(mainRowKeys, rows)
  const sortedColKeys = sortKeys(mainColKeys, cols)

  return {
    tree,
    rowKeys: sortedRowKeys,
    colKeys: sortedColKeys,
    rowTotals,
    colTotals,
    allTotal: allTotal.value()
  }
}

export const spanSize = (arr: any[], i: number, j: number) => {
  let x;
  if (i !== 0) {
    let asc, end;
    let noDraw = true;
    for (
      x = 0, end = j, asc = end >= 0;
      asc ? x <= end : x >= end;
      asc ? x++ : x--
    ) {
      if (arr[i - 1][x] !== arr[i][x]) {
        noDraw = false;
      }
    }
    if (noDraw) {
      return -1;
    }
  }
  let len = 0;
  while (i + len < arr.length) {
    let asc1, end1;
    let stop = false;
    for (
      x = 0, end1 = j, asc1 = end1 >= 0;
      asc1 ? x <= end1 : x >= end1;
      asc1 ? x++ : x--
    ) {
      if (arr[i][x] !== arr[i + len][x]) {
        stop = true;
      }
    }
    if (stop) {
      break;
        }
    len++;
  }
  return len;
};

export const buildPivotTableData = (data: any, rows: any[], cols: any[], value: any) => {

  const { tree, rowKeys, colKeys, rowTotals, colTotals, allTotal } = createPivotTable(data, rows, cols, value)

  const headers: any[] = [];

  const headerRows = (rows || []).map((row: any, rowIndex: any) => {

    return {
      content: row.value,
      rowspan: cols.length + 1,
      className: 'sticky-col pl-0'
    }
  });

  headers.push(headerRows);

  (cols || []).forEach((_, colIndex: number) => {
    const transformedColKeys = transformData(colKeys, cols)
    const headerCols: any[] = []

    transformedColKeys.forEach((colKey: any, colKeyIndex: number) => {
      const colspan = spanSize(transformedColKeys, colKeyIndex, colIndex);

      const colGap = cols.length - colKey.length;

      if (!colKey[colIndex]) {
        return null
      }

      const headerCell: any = {
        content: colKey[colIndex],
        colspan: colspan === -1 ? 0 : colspan
      };

      if (colGap) {
        const currentCol: any = cols[cols.length - colGap]
        headerCell.rowspan = currentCol.showTotal ? colGap + 1 : 0
      }

      headerCols.push(headerCell)
    });

    if (colIndex === 0) {

      let headerTotalColCell: any = {
        content: "Totals",
        rowspan: cols.length
      }

      if (!cols[0].showTotal) {
        headerTotalColCell = null
      }

      headers.push([...headerCols, headerTotalColCell])
    } else {
      headers.push(headerCols)
    }

  })

  const body: any[] = [];

  (rowKeys || []).map((rowKey: any, rowKeyIndex: number) => {

    const flatRowKey = rowKey.join(String.fromCharCode(0))

    const totalAggregator = rowTotals[flatRowKey]

    const rowGap = rows.length - rowKey.length

    const bodyRow: any[] = rowKey.map((row: any, rowIndex: number) => {

      const colspan = spanSize(rowKeys, rowKeyIndex, rowIndex);

      return {
        content: row,
        rowspan: colspan === -1 ? 0 : colspan === 1 ? colspan : rowGap ? colspan + 1 : colspan - 1,
        className: `pl-0 sticky-col ${rowGap ? 'subTotal' : ''}`
      }
    })

    let subTotalCell: any = null;

    const row = rows[rows.length - rowGap]

    if (rowGap && row.showTotal) {
      subTotalCell = {
        content: `${rowKey[rowKey.length - 1]} Total`,
        colspan: rowGap + 1,
        className: "pl-0 subTotal sticky-col"
      };
    }

    const bodyCol = colKeys.map((colKey: any, colIndex: number) => {

      const flatColKey = colKey.join(String.fromCharCode(0))

      const aggregator = tree[flatRowKey][flatColKey]

      const colGap = cols.length - colKey.length;

      const row = rows[rows.length - rowGap]
      const col = cols[cols.length - colGap]

      let bodyCell: any = {
        content: aggregator?.value() || '-',
        colspan: (colGap && !col.showTotal) ? 0 : 1,
        className: colGap || rowGap ? 'subTotal' : ''
      };

      if (rowGap) {
        bodyCell.rowspan = (rowGap && !row.showTotal) ? 0 : 1
      }

      if (colIndex === 0) {
        Object.assign(bodyCell, { className: `pl-0 ${colGap || rowGap ? 'subTotal' : ''}` })
      }

      return bodyCell
    })

    let totalColCell: any = {
      content: totalAggregator.value() / cols.length || '-',
      colspan: rowGap && !row.showTotal ? 0 : 1,
      className: "total"
    }

    if (!cols[0].showTotal) {
      totalColCell = null
    }

    body.push([...bodyRow, subTotalCell, ...bodyCol, totalColCell])
  })

  let totalRowCell: any = {
    content: "Totals",
    colspan: rows.length,
    className: "total sticky-col"
  }

  if (!rows[0].showTotal) {
    totalRowCell = null
  }

  const totalColCell = colKeys.map((colKey: any, colIndex: number) => {

    const totalAggregator = colTotals[colKey.join(String.fromCharCode(0))]

    const colGap = cols.length - colKey.length;
    const col = cols[cols.length - colGap]

    if (!rows[0].showTotal) {
      return null
    }

    const totalCell = {
      content: totalAggregator?.value() / rows.length || '-',
      colspan: (colGap && !col.showTotal) ? 0 : 1,
      className: "total"
    }

    if (colIndex === 0) {
      totalCell.className += ' pl-0';
    }

    return totalCell
  })

  let grandTotalCell: any = null

  if (rows[0].showTotal && cols[0].showTotal) {
    grandTotalCell = { content: allTotal, className: "total" }
  }

  body.push([totalRowCell, ...totalColCell, grandTotalCell])

  return { headers, body, rowAttributes: rows }
}