import * as dayjs from "dayjs";
import * as isoWeek from 'dayjs/plugin/isoWeek';
import { sendClientPortalMessage, sendInboxMessage } from "../messageBroker";
import { generateModels } from "../connectionResolver";
import { GENDER_CHOICES } from "./constants";

dayjs.extend(isoWeek);

export const returnDateRange = (
  dateRange: string,
  startDate: Date,
  endDate: Date
) => {

  const NOW = new Date()

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

export const getIntegrationIds = async (query, subdomain) => {
  const integrations = await sendInboxMessage({
    subdomain,
    action: "integrations.find",
    data: { query },
    isRPC: true,
    defaultValue: []
  });

  const integrationIds = (integrations || []).map(
    integration => integration._id
  );

  return integrationIds;
};

export const buildMatchFilter = async (filter, subdomain, context?) => {
  const {
    brandIds,
    branchIds,
    departmentIds,
    integrationTypes,
    formIds,
    tagIds,
    groupIds,
    fieldIds,
    portalIds,
    channelIds,
    dateRange,
    formId,
    subFields,
    status,
    flowType
  } = filter;

  const models = await generateModels(subdomain);

  const matchfilter = {};

  // STATUS FILTER
  if (status) {
    matchfilter["status"] = { $eq: status };
  }

  // FLOW TYPE FILTER
  if (flowType) {
    matchfilter["leadData.loadType"] = { $eq: flowType };
  }

  // DEPARTMENT FILTER
  if (departmentIds && departmentIds.length) {
    matchfilter["departmentIds"] = { $in: departmentIds };
  }

  // FORM FILTER
  if (formIds && formIds.length) {
    const query = { formId: { $in: formIds } };
    const integrationIds = await getIntegrationIds(query, subdomain);

    matchfilter["relatedIntegrationIds"] = { $in: integrationIds };
  }

  // BRAND FILTER
  if (brandIds) {
    const query = { brandId: { $in: brandIds } };
    const integrationIds = await getIntegrationIds(query, subdomain);

    matchfilter["integrationId"] = { $in: integrationIds };
  }

  // TAG FILTER
  if (tagIds && tagIds.length) {
    matchfilter["tagIds"] = { $in: tagIds };
  }

  // if (branchIds && branchIds.length) {
  //     matchfilter['branchIds'] = { $in: branchIds };
  // }

  // if (departmentIds && departmentIds.length) {
  //     matchfilter['departmentIds'] = { $in: departmentIds };
  // }

  // SOURCE FILTER
  if (integrationTypes && integrationTypes.length) {
    const query = { kind: { $in: integrationTypes } };
    const integrationIds = await getIntegrationIds(query, subdomain);

    matchfilter["integrationId"] = { $in: integrationIds };
  }

  // CHANNEL FILTER
  if (channelIds && channelIds.length) {
    const channels = await sendInboxMessage({
      subdomain,
      action: "channels.find",
      data: {
        _id: { $in: channelIds }
      },
      isRPC: true,
      defaultValue: []
    });

    const integrationIds = (channels || []).flatMap(channel => [
      ...channel.integrationIds
    ]);

    matchfilter["integrationId"] = { $in: integrationIds };
  }

  // FORM FILTER
  if (formId) {

    if (context === 'form') {
      matchfilter["_id"] = { $eq: formId };
    }

    if (context === 'submission') {
      matchfilter["formId"] = { $eq: formId };
    }
  }

  // FIELD GROUP FILTER
  if (groupIds && groupIds.length) {
    const fields = await models.Fields.find({ groupId: { $in: groupIds } });

    const fieldIds = (fields || []).map(field => field._id);

    matchfilter["customFieldsData.field"] = { $in: fieldIds };
  }

  // FIELD FILTER
  if (fieldIds && fieldIds.length) {

    switch (context) {
      case 'form':
        matchfilter["submission.formFieldId"] = { $in: fieldIds };

        if (subFields?.length) {
          matchfilter['submission.value'] = { $in: subFields };
        }
        break;

      case 'submission':
        matchfilter["formFieldId"] = { $in: fieldIds };
        break;

      default:
        matchfilter["customFieldsData.field"] = { $in: fieldIds };

        if (subFields?.length) {
          matchfilter['customFieldValues'] = { $in: subFields };
        }
        break;
    }

  }

  //PORTAL FILTER
  if (portalIds && portalIds.length) {
    matchfilter["clientPortalId"] = { $in: portalIds };
  }

  // DATE FILTER
  if (dateRange) {
    const { startDate, endDate, dateRangeType = "createdAt" } = filter;
    const dateFilter = returnDateRange(dateRange, startDate, endDate);

    if (Object.keys(dateFilter).length) {
      matchfilter[dateRangeType] = dateFilter;
    }
  }

  return matchfilter;
};

export const getBusinnesPortalPipeline = (matchfilter, mode, kind?) => {
  const match = {
    $match: matchfilter
  };

  const groupById = {
    $group: {
      _id: { clientPortalId: "$clientPortalId" },
      count: { $sum: 1 }
    }
  };

  const groupByYear = {
    $group: {
      _id: {
        year: {
          $year: { $toDate: "$createdAt" }
        },
        clientPortalId: "$clientPortalId"
      },
      users: { $push: "$$ROOT" }
    }
  };

  const countByYear = {
    $group: {
      _id: "$_id.year",
      count: { $sum: { $size: "$users" } }
    }
  };

  const countByKind = {
    $group: {
      _id: "$client_portal.kind",
      count: { $sum: "$count" }
    }
  };

  const commonLookup = {
    $lookup: {
      from: "client_portals",
      let: { clientPortalId: "$_id.clientPortalId" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$_id", "$$clientPortalId"] },
                ...(kind ? [{ $eq: ["$kind", kind] }] : [])
              ]
            }
          }
        }
      ],
      as: "client_portal"
    }
  };

  const commonUnwind = {
    $unwind: "$client_portal"
  };

  const commonProject = {
    $project: {
      _id: 0,
      [mode]: "$_id",
      count: 1
    }
  };

  if (mode === "all") {
    return [
      match,
      groupById,
      commonLookup,
      commonUnwind,
      countByKind,
      commonProject
    ];
  }

  if (mode === "year") {
    return [
      match,
      groupByYear,
      commonLookup,
      commonUnwind,
      countByYear,
      commonProject
    ];
  }

  return [];
};

export const getBusinessPortalCount = async (
  pipeline: any[],
  mode: string | number,
  subdomain: any
) => {
  const businessPortal = await sendClientPortalMessage({
    subdomain,
    isRPC: true,
    action: "clientPortalUsers.count",
    data: { pipeline },
    defaultValue: []
  });

  if (!businessPortal.length) {
    return [];
  }

  if (typeof mode === "string" && (mode === "all" || mode === "")) {
    return businessPortal;
  }

  if (typeof mode === "number") {
    return businessPortal[mode].count;
  }
};

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

export const buildPipeline = async (filter, matchFilter, type?) => {

  const { dimension, measure, colDimension, rowDimension, frequencyType, dateRange, startDate, endDate, dateRangeType = "createdAt" } = filter

  let dimensions

  if (colDimension?.length || rowDimension?.length) {
    dimensions = [...colDimension.map(col => col.value), ...rowDimension.map(row => row.value)]
  } else {
    dimensions = Array.isArray(dimension) ? dimension : dimension?.split(",") || []
  }

  const formatType = buildFormatType(dateRange, startDate, endDate)

  const dateFormat = frequencyType || formatType

  const measures = Array.isArray(measure) ? measure : measure?.split(",") || []

  const pipeline: any[] = []

  const matchStage = {}

  const expressions = {}

  const projectStage = {
    _id: 0
  }

  if (dimensions.includes("tag")) {
    pipeline.push({ $unwind: "$tagIds" })
  }

  if (dimensions.includes("integration") || dimensions.includes("source")) {
    pipeline.push({ $unwind: "$relatedIntegrationIds" })
  }

  if (dimensions.includes("field")) {
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
    )
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
                    $eq: ["$mainType", "customer"]
                  }
                },
                {
                  $expr: {
                    $eq: [
                      "$mainTypeId",
                      "$$fieldId"
                    ]
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
      },)
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
                    $eq: ["$mainType", "company"]
                  }
                },
                {
                  $expr: {
                    $eq: [
                      "$mainTypeId",
                      "$$fieldId"
                    ]
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
      },)
  }

  if (dimensions.includes("car")) {
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
                    $eq: ["$mainType", "customer"]
                  }
                },
                {
                  $expr: {
                    $eq: [
                      "$mainTypeId",
                      "$$fieldId"
                    ]
                  }
                },
                {
                  $expr: {
                    $eq: ["$relType", "car"]
                  }
                }
              ]
            }
          }
        ],
        as: "car_conformity"
      }
    },
      {
        $unwind: "$car_conformity"
      },)
  }

  if (dimensions.includes("source")) {
    pipeline.push(
      {
        $lookup: {
          from: "integrations",
          localField: "relatedIntegrationIds",
          foreignField: "_id",
          as: "integration"
        }
      },
      {
        $unwind: "$integration"
      })
  }

  if (dimensions.includes("industry")) {
    pipeline.push(
      {
        $addFields: {
          industryArray: { $split: ["$industry", ","] }
        }
      },
      {
        $unwind: "$industryArray"
      })
  }

  if (type) {

    if (type === 'client' || type === 'vendor') {
      pipeline.push(
        {
          $lookup: {
            from: "client_portal_users",
            localField: "_id",
            foreignField: "erxesCustomerId",
            as: "client_portal_user"
          }
        },
        {
          $unwind: "$client_portal_user"
        }
      )

      if (type === 'client') {
        pipeline.push(
          {
            $lookup: {
              from: "client_portals",
              let: { clientId: "$client_portal_user.clientPortalId" },
              pipeline: [
                {
                  $match: {
                    $and: [
                      {
                        $expr: {
                          $eq: ["$_id", "$$clientId"],
                        },
                      },
                      {
                        $expr: {
                          $eq: ["$kind", "client"],
                        },
                      },
                    ],
                  },
                },
              ],
              as: "client_portal"
            }
          },
          {
            $unwind: "$client_portal"
          }
        )
      }

      if (type === 'vendor') {
        pipeline.push(
          {
            $lookup: {
              from: "client_portals",
              let: { vendorId: "$client_portal_user.clientPortalId" },
              pipeline: [
                {
                  $match: {
                    $and: [
                      {
                        $expr: {
                          $eq: ["$_id", "$$vendorId"],
                        },
                      },
                      {
                        $expr: {
                          $eq: ["$kind", "vendor"],
                        },
                      },
                    ],
                  },
                },
              ],
              as: "client_portal"
            }
          },
          {
            $unwind: "$client_portal"
          }
        )
      }
    } else {
      matchStage['state'] = { $eq: type }
    }
  }

  if (dimensions.includes('primaryName')) {
    matchStage['firstName'] = { $nin: [null, ''] }
  }

  if (dimensions.includes('firstName')) {
    matchStage['firstName'] = { $nin: [null, ''] }
  }

  if (dimensions.includes('lastName')) {
    matchStage['lastName'] = { $nin: [null, ''] }
  }

  if (dimensions.includes('primaryEmail')) {
    matchStage['primaryEmail'] = { $nin: [null, ''] }
  }

  if (dimensions.includes('primaryPhone')) {
    matchStage['primaryPhone'] = { $nin: [null, ''] }
  }

  if (dimensions.includes('code')) {
    matchStage['code'] = { $nin: [null, ''] }
  }

  if (dimensions.includes('pronoun')) {
    matchStage['sex'] = { $in: [1, 2] }
  }

  if (dimensions.includes('isSubscribed')) {
    matchStage['isSubscribed'] = { $in: ["Yes", "No"] }
  }

  if (dimensions.includes('position')) {
    matchStage['position'] = { $nin: [null, ''] }
  }

  if (dimensions.includes('description')) {
    matchStage['description'] = { $nin: [null, ''] }
  }

  if (dimensions.includes('department')) {
    matchStage['department'] = { $nin: [null, ''] }
  }

  if (dimensions.includes('emailValidationStatus')) {
    matchStage['emailValidationStatus'] = { $nin: [null, ''] }
  }

  if (dimensions.includes('phoneValidationStatus')) {
    matchStage['phoneValidationStatus'] = { $nin: [null, ''] }
  }

  if (dimensions.includes('createdAt')) {
    matchStage['createdAt'] = { $ne: null }
  }

  if (dimensions.includes('modifiedAt')) {
    matchStage['modifiedAt'] = { $ne: null }
  }

  if (dimensions.includes('lastSeenAt')) {
    matchStage['lastSeenAt'] = { $ne: null }
  }

  if (dimensions.includes('birthDate')) {
    matchStage['birthDate'] = { $ne: null }
  }

  if (dimensions.includes("frequency")) {
    matchStage[dateRangeType] = { $ne: null };
  }

  if (dimensions.includes("status")) {
    matchStage["status"] = { $ne: null };
  }

  if (dimensions.includes("businessType")) {
    matchStage["businessType"] = { $nin: [null, ''] };
  }

  if (dimensions.includes("industry")) {
    matchStage["industryArray"] = { $ne: '' };
  }

  pipeline.push({ $match: { ...matchStage, ...matchFilter } });

  if (dimensions.includes('firstName')) {
    expressions['firstName'] = "$firstName"
  }

  if (dimensions.includes('lastName')) {
    expressions['lastName'] = "$firstName"
  }

  if (dimensions.includes('primaryName')) {
    expressions['primaryName'] = "$primaryName"
  }

  if (dimensions.includes('primaryEmail')) {
    expressions['primaryEmail'] = '$primaryEmail'
  }

  if (dimensions.includes('primaryPhone')) {
    expressions['primaryPhone'] = '$primaryPhone'
  }

  if (dimensions.includes('code')) {
    expressions['code'] = '$code'
  }

  if (dimensions.includes('pronoun')) {
    expressions['pronoun'] = '$sex'
  }

  if (dimensions.includes('isSubscribed')) {
    expressions['isSubscribed'] = '$isSubscribed'
  }

  if (dimensions.includes('position')) {
    expressions['position'] = '$position'
  }

  if (dimensions.includes('description')) {
    expressions['description'] = '$description'
  }

  if (dimensions.includes('department')) {
    expressions['department'] = '$department'
  }

  if (dimensions.includes('emailValidationStatus')) {
    expressions['emailValidationStatus'] = '$emailValidationStatus'
  }

  if (dimensions.includes('phoneValidationStatus')) {
    expressions['phoneValidationStatus'] = '$phoneValidationStatus'
  }

  if (dimensions.includes('createdAt')) {
    expressions['createdAt'] = '$createdAt'
  }

  if (dimensions.includes('modifiedAt')) {
    expressions['modifiedAt'] = '$modifiedAt'
  }

  if (dimensions.includes('lastSeenAt')) {
    expressions['lastSeenAt'] = '$lastSeenAt'
  }

  if (dimensions.includes('birthDate')) {
    expressions['birthDate'] = '$birthDate'
  }

  if (dimensions.includes("frequency")) {
    expressions['frequency'] = {
      $dateToString: {
        format: dateFormat,
        date: `$${dateRangeType}`,
      },
    };
  }

  if (dimensions.includes("tag")) {
    expressions['tag'] = '$tagIds'
  }

  if (dimensions.includes("integration")) {
    expressions['integration'] = '$relatedIntegrationIds'
  }

  if (dimensions.includes("source")) {
    expressions['source'] = '$integration.kind'
  }

  if (dimensions.includes("status")) {
    expressions['status'] = '$status'
  }

  if (dimensions.includes("field")) {
    expressions['field'] = '$customFieldValues'
  }

  if (dimensions.includes("businessType")) {
    expressions['businessType'] = '$businessType'
  }

  if (dimensions.includes("businessType")) {
    expressions['businessType'] = '$businessType'
  }

  if (dimensions.includes("owner")) {
    expressions['ownerId'] = '$ownerId'
  }

  if (dimensions.includes("industry")) {
    expressions['industry'] = '$industryArray'
  }

  if (dimensions.includes("company")) {
    expressions['company'] = '$conformity.relTypeId'
  }

  if (dimensions.includes("customer")) {
    expressions['customer'] = '$conformity.relTypeId'
  }

  if (dimensions.includes("car")) {
    expressions['car'] = '$car_conformity.relTypeId'
  }

  const groupStage = {
    _id: expressions,
    count: { $sum: 1 }
  }

  if (dimensions.includes("source")) {
    groupStage["source"] = { $first: "$integration" }
  }

  pipeline.push({ $group: groupStage });

  if (dimensions.includes("tag")) {
    pipeline.push({
      $lookup: {
        from: "tags",
        localField: "_id.tag",
        foreignField: "_id",
        as: "tag"
      }
    },
      {
        $unwind: "$tag"
      })
  }

  if (dimensions.includes("owner")) {
    pipeline.push({
      $lookup: {
        from: "users",
        localField: "_id.ownerId",
        foreignField: "_id",
        as: "user"
      }
    },
      {
        $unwind: "$user"
      })
  }

  if (dimensions.includes("integration") && !dimensions.includes("source")) {
    pipeline.push({
      $lookup: {
        from: "integrations",
        localField: "_id.integration",
        foreignField: "_id",
        as: "integration"
      }
    },
      {
        $unwind: "$integration"
      })
  }

  if (dimensions.includes("company")) {
    pipeline.push({
      $lookup: {
        from: "companies",
        localField: "_id.company",
        foreignField: "_id",
        as: "company"
      }
    },
      {
        $unwind: "$company"
      })
  }

  if (dimensions.includes("customer")) {
    pipeline.push({
      $lookup: {
        from: "customers",
        localField: "_id.customer",
        foreignField: "_id",
        as: "customer"
      }
    },
      {
        $unwind: "$customer"
      })
  }

  if (dimensions.includes("car")) {
    pipeline.push({
      $lookup: {
        from: "cars",
        localField: "_id.car",
        foreignField: "_id",
        as: "car"
      }
    },
      {
        $unwind: "$car"
      })
  }


  if (dimensions.includes("frequency")) {
    pipeline.push({ $sort: { _id: 1 } })
  }

  (measures || []).forEach((measure) => {
    projectStage[measure] = 1;
  });

  if (dimensions.includes('firstName')) {
    projectStage['firstName'] = "$_id.firstName"
  }

  if (dimensions.includes('lastName')) {
    projectStage['lastName'] = "$_id.lastName"
  }

  if (dimensions.includes('primaryName')) {
    projectStage['primaryName'] = '$_id.primaryName'
  }

  if (dimensions.includes('primaryEmail')) {
    projectStage['primaryEmail'] = '$_id.primaryEmail'
  }

  if (dimensions.includes('primaryPhone')) {
    projectStage['primaryPhone'] = '$_id.primaryPhone'
  }

  if (dimensions.includes('code')) {
    projectStage['code'] = '$_id.code'
  }

  if (dimensions.includes('pronoun')) {
    projectStage['pronoun'] = '$_id.pronoun'
  }

  if (dimensions.includes('isSubscribed')) {
    projectStage['isSubscribed'] = '$_id.isSubscribed'
  }

  if (dimensions.includes('position')) {
    projectStage['position'] = '$_id.position'
  }

  if (dimensions.includes('birthDate')) {
    projectStage['birthDate'] = '$_id.birthDate'
  }

  if (dimensions.includes("frequency")) {
    projectStage['frequency'] = "$_id.frequency";
  }

  if (dimensions.includes('description')) {
    projectStage['description'] = '$_id.description'
  }

  if (dimensions.includes('department')) {
    projectStage['department'] = '$_id.department'
  }

  if (dimensions.includes('emailValidationStatus')) {
    projectStage['emailValidationStatus'] = '$_id.emailValidationStatus'
  }

  if (dimensions.includes('phoneValidationStatus')) {
    projectStage['phoneValidationStatus'] = '$_id.phoneValidationStatus'
  }

  if (dimensions.includes('createdAt')) {
    projectStage['createdAt'] = '$_id.createdAt'
  }

  if (dimensions.includes('modifiedAt')) {
    projectStage['modifiedAt'] = '$_id.modifiedAt'
  }

  if (dimensions.includes('lastSeenAt')) {
    projectStage['lastSeenAt'] = '$_id.lastSeenAt'
  }

  if (dimensions.includes('birthDate')) {
    projectStage['birthDate'] = '$_id.birthDate'
  }

  if (dimensions.includes("frequency")) {
    projectStage['frequency'] = "$_id.frequency";
  }

  if (dimensions.includes("tag")) {
    projectStage['tag'] = "$tag.name";
  }

  if (dimensions.includes("integration")) {

    if (dimensions.includes("source")) {
      projectStage['integration'] = "$source.name";
    } else {
      projectStage['integration'] = "$integration.name";
    }
  }

  if (dimensions.includes("source")) {
    projectStage['source'] = "$_id.source";
  }

  if (dimensions.includes("status")) {
    projectStage['status'] = "$_id.status";
  }

  if (dimensions.includes("company")) {
    projectStage['company'] = "$company";
  }

  if (dimensions.includes("customer")) {
    projectStage['customer'] = "$customer";
  }

  if (dimensions.includes("car")) {
    projectStage['car'] = "$car";
  }

  if (dimensions.includes("field")) {
    projectStage['field'] = "$_id.field";
  }

  if (dimensions.includes('businessType')) {
    projectStage['businessType'] = '$_id.businessType'
  }

  if (dimensions.includes('owner')) {
    projectStage['owner'] = '$user'
  }

  if (dimensions.includes('industry')) {
    projectStage['industry'] = '$_id.industry'
  }

  pipeline.push({ $project: projectStage });

  return pipeline
}

export const buildFormPipeline = async (filter, matchFilter, context?) => {

  const { dimension, measure, colDimension, rowDimension, frequencyType, dateRange, startDate, endDate, dateRangeType = "createdDate" } = filter

  let dimensions

  if (colDimension?.length || rowDimension?.length) {
    dimensions = [...colDimension.map(col => col.value), ...rowDimension.map(row => row.value)]
  } else {
    dimensions = Array.isArray(dimension) ? dimension : dimension?.split(",") || []
  }

  const formatType = buildFormatType(dateRange, startDate, endDate)

  const dateFormat = frequencyType || formatType

  const measures = Array.isArray(measure) ? measure : measure?.split(",") || []

  const pipeline: any[] = []

  const matchStage = {}

  const expressions = {}

  const projectStage = {
    _id: 0
  }

  if (dimensions.includes('department')) {
    pipeline.push({ $unwind: "$departmentIds" })
  }

  if (dimensions.includes('tag')) {
    pipeline.push({ $unwind: "$tagIds" })
  }

  if (context === 'form' && (dimensions.includes('field') || filter?.subFields?.length)) {
    pipeline.push({
      $lookup: {
        from: "form_submissions",
        localField: "_id",
        foreignField: "formId",
        as: "submission"
      }
    },
      {
        $unwind: "$submission"
      },
      {
        $unwind: "$submission.value"
      },)
  }

  if (dimensions.includes('integrationType')) {
    pipeline.push({
      $lookup: {
        from: "integrations",
        localField: "integrationId",
        foreignField: "_id",
        as: "integration"
      }
    },
      {
        $unwind: "$integration"
      },)
  }

  if (dimensions.includes('brand')) {
    matchStage['brandId'] = { $nin: [null, ''] }
  }

  if (dimensions.includes('department')) {
    matchStage['departmentIds'] = { $nin: [null, ''] }
  }

  if (dimensions.includes('integration')) {
    matchStage['integrationId'] = { $nin: [null, ''] }
  }

  if (dimensions.includes('tag')) {
    matchStage['tagIds'] = { $nin: [null, ''] }
  }

  if (dimensions.includes('status')) {
    matchStage['status'] = { $nin: [null, ''] }
  }

  if (dimensions.includes('visibility')) {
    matchStage['visibility'] = { $nin: [null, ''] }
  }

  if (dimensions.includes('type')) {
    matchStage['type'] = { $nin: [null, ''] }
  }

  if (dimensions.includes('flowType')) {
    matchStage['leadData.loadType'] = { $nin: [null, ''] }
  }

  if (dimensions.includes('conformationType')) {
    matchStage['leadData.successAction'] = { $nin: [null, ''] }
  }

  if (dimensions.includes('numberOfPages')) {
    matchStage['numberOfPages'] = { $nin: [null, ''] }
  }

  if (dimensions.includes('createdAt')) {
    matchStage['createdDate'] = { $nin: [null, ''] }
  }

  if (dimensions.includes('createdBy')) {
    matchStage['createdUserId'] = { $nin: [null, ''] }
  }

  if (dimensions.includes('submittedAt')) {
    matchStage['submittedAt'] = { $nin: [null, ''] }
  }

  if (dimensions.includes('submittedBy')) {
    matchStage['customerId'] = { $nin: [null, ''] }
  }

  if (dimensions.includes('contentType')) {
    matchStage['contentType'] = { $nin: [null, ''] }
  }

  if (dimensions.includes("frequency")) {
    matchStage[dateRangeType] = { $ne: null };
  }

  if (dimensions.includes("teamMember")) {
    matchStage['userId'] = { $ne: null };
  }

  pipeline.push({ $match: { ...matchStage, ...matchFilter } });

  if (dimensions.includes("department")) {
    expressions['department'] = '$departmentIds'
  }

  if (dimensions.includes("brand")) {
    expressions['brand'] = '$brandId'
  }

  if (dimensions.includes("integration")) {
    expressions['integration'] = '$integrationId'
  }

  if (dimensions.includes("integrationType")) {
    expressions['integrationType'] = '$integration.kind'
  }

  if (dimensions.includes("tag")) {
    expressions['tag'] = '$tagIds'
  }

  if (dimensions.includes("status")) {
    expressions['status'] = '$status'
  }

  if (dimensions.includes("visibility")) {
    expressions['visibility'] = '$visibility'
  }

  if (dimensions.includes("type")) {
    expressions['type'] = '$type'
  }

  if (dimensions.includes('flowType')) {
    expressions['flowType'] = '$leadData.loadType'
  }

  if (dimensions.includes('conformationType')) {
    expressions['conformationType'] = '$leadData.successAction'
  }

  if (dimensions.includes('numberOfPages')) {
    expressions['numberOfPages'] = '$numberOfPages'
  }

  if (dimensions.includes('createdAt')) {
    expressions['createdAt'] = '$createdDate'
  }

  if (dimensions.includes('createdBy')) {
    expressions['createdBy'] = '$createdUserId'
  }

  if (dimensions.includes('field')) {
    if (context === 'form') {
      expressions['field'] = '$submission.value'
    }

    if (context === 'submission') {
      expressions['field'] = '$formFieldId'
    }
  }

  if (dimensions.includes('form')) {
    expressions['form'] = '$formId'
  }

  if (dimensions.includes('contentType')) {
    expressions['contentType'] = '$contentType'
  }

  if (dimensions.includes('teamMember')) {
    expressions['teamMember'] = '$userId'
  }

  if (dimensions.includes('submittedAt')) {
    expressions['submittedAt'] = '$submittedAt'
  }

  if (dimensions.includes('submittedBy')) {
    expressions['submittedBy'] = '$customerId'
  }

  if (dimensions.includes("frequency")) {
    expressions['frequency'] = {
      $dateToString: {
        format: dateFormat,
        date: `$${dateRangeType}`,
      },
    };
  }

  const groupStage = {
    _id: expressions,
    count: { $sum: 1 }
  }

  pipeline.push({ $group: groupStage });

  if (dimensions.includes("brand")) {
    pipeline.push({
      $lookup: {
        from: "brands",
        localField: "_id.brand",
        foreignField: "_id",
        as: "brand"
      }
    },
      {
        $unwind: "$brand"
      })
  }

  if (dimensions.includes("department")) {
    pipeline.push({
      $lookup: {
        from: "departments",
        localField: "_id.department",
        foreignField: "_id",
        as: "department"
      }
    },
      {
        $unwind: "$department"
      })
  }

  if (dimensions.includes("tag")) {
    pipeline.push({
      $lookup: {
        from: "tags",
        localField: "_id.tag",
        foreignField: "_id",
        as: "tag"
      }
    },
      {
        $unwind: "$tag"
      })
  }

  if (dimensions.includes("integration")) {
    pipeline.push({
      $lookup: {
        from: "integrations",
        localField: "_id.integration",
        foreignField: "_id",
        as: "integration"
      }
    },
      {
        $unwind: "$integration"
      })
  }

  if (dimensions.includes("createdBy")) {
    pipeline.push({
      $lookup: {
        from: "users",
        let: { userId: "$_id.createdBy" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$userId"] },
              isActive: true
            }
          }
        ],
        as: "user"
      }
    },
      {
        $unwind: "$user"
      })
  }

  if (dimensions.includes("teamMember")) {
    pipeline.push({
      $lookup: {
        from: "users",
        let: { userId: "$_id.teamMember" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$userId"] },
              isActive: true
            }
          }
        ],
        as: "teamMember"
      }
    },
      {
        $unwind: "$teamMember"
      })
  }

  if (dimensions.includes("submittedBy")) {
    pipeline.push({
      $lookup: {
        from: "customers",
        localField: "_id.submittedBy",
        foreignField: "_id",
        as: "submittedBy"
      }
    },
      {
        $unwind: "$submittedBy"
      })
  }

  if (dimensions.includes("form")) {
    pipeline.push({
      $lookup: {
        from: "forms",
        localField: "_id.form",
        foreignField: "_id",
        as: "form"
      }
    },
      {
        $unwind: "$form"
      },)
  }

  if (dimensions.includes("field") && context === 'submission') {
    pipeline.push({
      $lookup: {
        from: "form_fields",
        localField: "_id.field",
        foreignField: "_id",
        as: "form_field"
      }
    },
      {
        $unwind: "$form_field"
      })
  }

  if (dimensions.includes("frequency")) {
    pipeline.push({ $sort: { _id: 1 } })
  }

  (measures || []).forEach((measure) => {
    projectStage[measure] = 1;
  });

  if (dimensions.includes('brand')) {
    projectStage['brand'] = "$brand.name"
  }

  if (dimensions.includes('department')) {
    projectStage['department'] = "$department.title"
  }

  if (dimensions.includes('integration')) {
    projectStage['integration'] = "$integration.name"
  }

  if (dimensions.includes('integrationType')) {
    projectStage['integrationType'] = "$_id.integrationType"
  }

  if (dimensions.includes("tag")) {
    projectStage['tag'] = "$tag.name";
  }

  if (dimensions.includes("status")) {
    projectStage['status'] = "$_id.status";
  }

  if (dimensions.includes("visibility")) {
    projectStage['visibility'] = "$_id.visibility";
  }

  if (dimensions.includes("frequency")) {
    projectStage['frequency'] = "$_id.frequency";
  }

  if (dimensions.includes("type")) {
    projectStage['type'] = "$_id.type";
  }

  if (dimensions.includes("flowType")) {
    projectStage['flowType'] = "$_id.flowType";
  }

  if (dimensions.includes("conformationType")) {
    projectStage['conformationType'] = "$_id.conformationType";
  }

  if (dimensions.includes("numberOfPages")) {
    projectStage['numberOfPages'] = "$_id.numberOfPages";
  }

  if (dimensions.includes("createdAt")) {
    projectStage['createdAt'] = "$_id.createdAt";
  }

  if (dimensions.includes("createdBy")) {
    projectStage['createdBy'] = "$user";
  }

  if (dimensions.includes("submittedAt")) {
    projectStage['submittedAt'] = "$_id.submittedAt";
  }

  if (dimensions.includes("submittedBy")) {
    projectStage['submittedBy'] = "$submittedBy";
  }

  if (dimensions.includes("teamMember")) {
    projectStage['teamMember'] = "$teamMember";
  }

  if (dimensions.includes("form")) {
    projectStage['form'] = "$form";
  }

  if (dimensions.includes("contentType")) {
    projectStage['contentType'] = "$_id.contentType";
  }

  if (dimensions.includes("frequency")) {
    projectStage['frequency'] = "$_id.frequency";
  }

  if (dimensions.includes("field")) {
    if (context === 'form') {
      projectStage['field'] = "$_id.field";
    }

    if (context === 'submission') {
      projectStage['field'] = "$form_field.text";
    }
  }

  pipeline.push({ $project: projectStage });

  return pipeline
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

export const formatData = (data, filter) => {

  const { dateRange, startDate, endDate, frequencyType } = filter

  const formattedData = [...data]

  formattedData.forEach(item => {

    if (item.hasOwnProperty('frequency')) {
      const frequency = item['frequency']

      const formatData = frequencyType || buildFormatType(dateRange, startDate, endDate)

      item['frequency'] = formatFrequency(formatData, frequency)
    }

    if (item.hasOwnProperty('field')) {
      const field = item['field']

      item['field'] = field?.value || field
    }

    if (item.hasOwnProperty('pronoun')) {
      const pronoun = item['pronoun']

      item['pronoun'] = GENDER_CHOICES[pronoun] || "Unknown"
    }

    if (item.hasOwnProperty('form')) {
      const form = item['form']

      item['form'] = form.name || form.title
    }

    ['owner', 'createdBy', 'teamMember'].forEach(key => {
      if (item.hasOwnProperty(key)) {
        const user = item[key]

        if (user) {

          item[key] = user.details?.fullName
            || (user.details?.firstName && user.details?.lastName ? `${user.details.firstName} ${user.details.lastName}` : null)
            || user.email
            || user.PrimaryEmail
            || user.PrimaryPhone
            || "Unknown"

        }
      }
    });

    if (item.hasOwnProperty('company')) {
      const company = item['company']

      if (company) {
        item['company'] = company.primaryName
          || company.PrimaryEmail
          || company.PrimaryPhone
          || "Unknown"
      }
    }

    ['customer', 'submittedBy'].forEach(key => {
      if (item.hasOwnProperty(key)) {
        const customer = item[key]

        if (customer) {
          item[key] = (customer?.firstName && customer?.lastName ? `${customer.firstName} ${customer.lastName}` : null)
            || customer.firstName
            || customer.lastName
            || customer.PrimaryEmail
            || customer.PrimaryPhone
            || "Unknown"
        }
      }
    });

    if (item.hasOwnProperty('car')) {
      const car = item['car']

      if (car) {
        item['car'] = car.plateNumber || car.vinNumber
      }
    }

    ['createdAt', 'modifiedAt', 'lastSeenAt', 'birthDate', 'submittedAt'].forEach(key => {
      if (item.hasOwnProperty(key)) {
        const date = item[key]
        item[key] = dayjs(date).format('YYYY/MM/DD h:mm A')
      }
    });

    ['count'].forEach(key => {
      if (item.hasOwnProperty(key) && MEASURE_LABELS[key]) {
        item[MEASURE_LABELS[key]] = item[key];
        delete item[key];
      }
    });
  })

  return formattedData
}

export const buildData = ({ chartType, data, filter }) => {

  const { measure, dimension, rowDimension, colDimension } = filter

  const formattedData = formatData(data, filter);

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