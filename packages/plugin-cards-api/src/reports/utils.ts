import { sendCoreMessage, sendFormsMessage, sendInboxMessage } from "../messageBroker";
import { MONTH_NAMES, NOW, PROBABILITY_CLOSED, PROBABILITY_OPEN, WEEKDAY_NAMES } from './constants';
import { IModels } from "../connectionResolver";
import * as dayjs from 'dayjs';
import { getService, getServices } from "@erxes/api-utils/src/serviceDiscovery";

export const buildLookup = (from, field, extraConditions = [], extraStages = []) => {
    const conditions = [
        { $eq: ["$_id", "$$fieldId"] },
        ...extraConditions,
    ]

    const pipeline = [
        { $match: { $expr: { $and: conditions } } },
        ...extraStages
    ]

    return {
        from,
        let: { fieldId: `$${field}` },
        pipeline,
        as: 'lookup'
    }
}

export const returnDateRange = (
    dateRange: string,
    startDate: Date,
    endDate: Date,
) => {
    const startOfToday = new Date(NOW.setHours(0, 0, 0, 0));
    const endOfToday = new Date(NOW.setHours(23, 59, 59, 999));
    const startOfYesterday = new Date(dayjs(NOW).add(-1, 'day').toDate().setHours(0, 0, 0, 0),);
    const startOfTheDayBeforeYesterday = new Date(dayjs(NOW).add(-2, 'day').toDate().setHours(0, 0, 0, 0),);

    let $gte;
    let $lte;

    switch (dateRange) {
        case 'today':
            $gte = startOfToday;
            $lte = endOfToday;
            break;
        case 'yesterday':
            $gte = startOfYesterday;
            $lte = startOfToday;
            break;
        case 'last72h':
            $gte = startOfTheDayBeforeYesterday;
            $lte = startOfToday;
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
            $gte = dayjs(NOW).add(-2, 'week').startOf('week').toDate();
            $lte = dayjs(NOW).add(-1, 'week').endOf('week').toDate();
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
        dateRange,
        dueDateRange,
        integrationTypes
    } = filter;

    const matchfilter = {};

    // USER FILTER
    if (userIds && userIds.length) {
        const { userType = 'userId' } = filter;
        matchfilter[userType] = { $in: userIds };
    }

    // BRANCH FILTER
    if (branchIds && branchIds.length) {
        matchfilter['branchIds'] = { $in: branchIds };
    }

    // DEPARTMENT FILTER
    if (departmentIds && departmentIds.length) {
        matchfilter['departmentIds'] = { $in: departmentIds };
    }

    // COMPANY FILTER
    if (companyIds && companyIds.length) {
        const conformities = await sendCoreMessage({
            subdomain,
            action: 'conformities.findConformities',
            data: {
                relType: "company",
                relTypeId: { $in: companyIds }
            },
            isRPC: true,
            defaultValue: []
        })

        const mainTypeIds = conformities.map(conformity => conformity.mainTypeId)

        matchfilter['_id'] = { $in: mainTypeIds };
    }

    // CUSTOMER FILTER
    if (customerIds && customerIds.length) {
        const conformities = await sendCoreMessage({
            subdomain,
            action: 'conformities.findConformities',
            data: {
                relType: "customer",
                relTypeId: { $in: customerIds }
            },
            isRPC: true,
            defaultValue: []
        })

        const mainTypeIds = conformities.map(conformity => conformity.mainTypeId)

        matchfilter['_id'] = { $in: mainTypeIds };
    }

    // SOURCE FILTER
    if (integrationTypes && integrationTypes.length) {
        const query = { kind: { $in: integrationTypes } }
        const integrationIds = await getIntegrationIds(query, subdomain)

        matchfilter['integration._id'] = { $in: integrationIds };
    }

    // PRODUCTS FILTER
    if (productIds && productIds.length) {
        matchfilter['productsData.productId'] = { $in: productIds };
    }

    // TAG FILTER
    if (tagIds && tagIds.length) {
        matchfilter['tagIds'] = { $in: tagIds };
    }

    // BOARD FILTER
    if (boardId) {
        const stageIds = await getStageIds(filter, type, model)
        matchfilter['stageId'] = { $in: stageIds };
    }

    // PIPELINE FILTER
    if (pipelineIds && pipelineIds.length) {
        const stageIds = await getStageIds(filter, type, model)
        matchfilter['stageId'] = { $in: stageIds };
    }

    // STAGE FILTER
    if (stageIds && stageIds.length) {
        matchfilter['stageId'] = { $in: stageIds };
    }

    // LABEL FILTER
    if (labelIds && labelIds.length) {
        matchfilter['labelIds'] = { $in: labelIds };
    }

    // STATUS FILTER
    if (status) {

        if (status === 'closed') {
            const stageIds = await getStageIds({ ...filter, stageProbability: PROBABILITY_CLOSED[type] }, type, model)
            matchfilter['stageId'] = { $in: stageIds };

        } else if (status === 'open') {
            const stageIds = await getStageIds({ ...filter, stageProbability: PROBABILITY_OPEN }, type, model)
            matchfilter['stageId'] = { $in: stageIds };

        } else {
            matchfilter['status'] = { $eq: status };
        }
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
    if (groupIds && groupIds.length) {
        const fields = await sendFormsMessage({
            subdomain,
            action: 'fields.find',
            data: {
                query: {
                    groupId: { $in: groupIds }
                }
            },
            isRPC: true,
            defaultValue: []
        })

        const fieldIds = (fields || []).map(field => field._id)

        matchfilter['customFieldsData.field'] = { $in: fieldIds };
    }

    // CUSTOM PROPERTIES FIELD FILTER 
    if (fieldIds && fieldIds.length) {
        matchfilter['customFieldsData.field'] = { $in: fieldIds };
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

export const getDimensionPipeline = async (filter, type, subdomain, models) => {
    const { dimension } = filter

    const matchFilter = await buildMatchFilter(filter, type, subdomain, models)

    const pipeline: any[] = []

    if (!dimension || dimension === 'count') {
        return pipeline
    }

    // TAG DIMENSION
    if (dimension === 'tag') {
        pipeline.push(...[
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
                    from: 'tags',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'tag'
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
        ])
    }

    // LABEL DIMENSION
    if (dimension === 'label') {
        pipeline.push(...[
            {
                $unwind: "$labelIds",
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
                    count: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: "pipeline_labels",
                    localField: "_id",
                    foreignField: "_id",
                    as: "label",
                },
            },
            {
                $unwind: "$label",
            },
            {
                $project: {
                    _id: "$label.name",
                    count: 1
                }
            }
        ])
    }

    // PRIOPRITY DIMENSION
    if (dimension === 'priority') {
        pipeline.push(...[
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
        ])
    }

    // STATUS DIMENSION
    if (dimension === 'status') {
        pipeline.push(...[
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
        ])
    }

    // TEAM MEMBER DIMENSION
    if (dimension === 'teamMember') {

        const { userType = 'userId' } = filter

        pipeline.push(...[
            {
                $match: {
                    [userType]: { $exists: true },
                    ...matchFilter
                }
            },
            ...(userType === 'assignedUserIds' ? [{ $unwind: "$assignedUserIds" }] : []),
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
                                        { $eq: ["$isActive", true] },
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
                    count: 1,
                },
            },
        ])
    }

    // BRANCH DIMENSION
    if (dimension === 'branch') {
        pipeline.push(...[
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
                                    $and: [
                                        { $eq: ["$_id", "$$branchId"] }
                                    ]
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
                    count: 1,
                },
            },
        ])
    }

    // DEPARTMENT DIMENSION
    if (dimension === 'department') {
        pipeline.push(...[
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
                                        { $eq: ["$status", "active"] },
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
                    count: 1,
                },
            },
        ])
    }

    // COMPANY DIMENSION
    if (dimension === 'company') {
        pipeline.push(...[
            {
                $match: {
                    status: "active",
                    ...matchFilter
                },
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
            },
            {
                $group: {
                    _id: "$conformity.relTypeId",
                    count: { $sum: 1 },
                },
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
                                            $eq: ["$_id", "$$companyId"],
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                    as: "company",
                },
            },
            {
                $unwind: "$company",
            },
            {
                $project: {
                    _id: "$company.primaryName",
                    count: 1,
                },
            },
        ])
    }

    // CUSTOMER DIMENSION
    if (dimension === 'customer') {
        pipeline.push(...[
            {
                $match: {
                    ...matchFilter
                },
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
            },
            {
                $group: {
                    _id: "$conformity.relTypeId",
                    count: { $sum: 1 },
                },
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
                                            $eq: ["$_id", "$$customerId"],
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                    as: "customer",
                },
            },
            {
                $unwind: "$customer",
            },
            {
                $project: {
                    _id: {
                        $switch: {
                            branches: [
                                { case: { $ne: ["$customer.firstName", null] }, then: "$customer.firstName" },
                                { case: { $ne: ["$customer.lastName", null] }, then: "$customer.lastName" },
                                { case: { $ne: ["$customer.middleName", null] }, then: "$customer.middleName" },
                                { case: { $ne: ["$customer.primaryEmail", null] }, then: "$customer.primaryEmail" },
                                { case: { $ne: ["$customer.primaryPhone", null] }, then: "$customer.primaryPhone" },
                                { case: { $ne: ["$customer.visitorContactInfo.phone", null] }, then: "$customer.visitorContactInfo.phone" },
                                { case: { $ne: ["$customer.visitorContactInfo.email", null] }, then: "$customer.visitorContactInfo.email" }
                            ],
                            default: "Unknown"
                        }
                    },
                    count: 1,
                },
            },
        ])
    }

    // SOURCE DIMENSION
    if (dimension === 'source') {
        pipeline.push(...[
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
        ])
    }

    // PRODUCT DIMENSION
    if (dimension === 'product') {
        pipeline.push(...[
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
                    as: "product",
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
        ])
    }

    // STAGE DIMENSION
    if (dimension === 'stage') {

        pipeline.push(...[
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
                    from: 'stages',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'stage'
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
        ])
    }

    // PIPELINE DIMENSION
    if (dimension === 'pipeline') {

        pipeline.push(...[
            {
                $match: {
                    ...matchFilter
                }
            },
            {
                $lookup: {
                    from: "stages",
                    localField: "stageId",
                    foreignField: "_id",
                    as: "stage",
                },
            },
            {
                $unwind: "$stage",
            },
            {
                $group: {
                    _id: "$stage.pipelineId",
                    count: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: "pipelines",
                    localField: "_id",
                    foreignField: "_id",
                    as: "pipeline",
                },
            },
            {
                $unwind: "$pipeline",
            },
            {
                $project: {
                    _id: "$pipeline.name",
                    count: 1,
                },
            },
        ])
    }

    // BOARD DIMENSION
    if (dimension === 'board') {

        pipeline.push(...[
            {
                $match: {
                    ...matchFilter
                }
            },
            {
                $lookup: {
                    from: "stages",
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
                    from: "pipelines",
                    localField: "stage.pipelineId",
                    foreignField: "_id",
                    as: "pipeline",
                },
            },
            {
                $unwind: "$pipeline",
            },
            {
                $group: {
                    _id: "$pipeline.boardId",
                    count: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: "boards",
                    localField: "_id",
                    foreignField: "_id",
                    as: "board",
                },
            },
            {
                $unwind: "$board",
            },
            {
                $project: {
                    _id: "$board.name",
                    count: 1,
                },
            },
        ])
    }

    // FREQUENCY DIMENSION
    if (dimension === 'frequency') {

        const { frequencyType, dateRange, startDate, endDate, dateRangeType = "createdAt" } = filter

        let formatType = "%Y"

        if (dateRange && dateRange.toLowerCase().includes('day')) {
            formatType = '%Hh:%Mm:%Ss'
        }

        if (dateRange && dateRange.toLowerCase().includes('week')) {
            formatType = '%u'
        }

        if (dateRange && dateRange.toLowerCase().includes('month')) {
            formatType = "%V"
        }

        if (dateRange && dateRange.toLowerCase().includes('year')) {
            formatType = "%m"
        }

        if (dateRange === 'customDate' && startDate && endDate) {
            formatType = '%Y-%m-%d';
        }

        const dateFormat = frequencyType || formatType

        let projectStage: any = [
            {
                $project: {
                    _id: 1,
                    count: 1,
                    amount: 1
                }
            }
        ]

        if (dateFormat === '%u') {
            projectStage = [
                {
                    $project: {
                        _id: {
                            $arrayElemAt: [WEEKDAY_NAMES, { $subtract: [{ $toInt: "$_id" }, 1] }]
                        },
                        count: 1,
                        amount: 1
                    }
                }
            ];
        }

        if (dateFormat === '%m') {
            projectStage = [
                {
                    $project: {
                        _id: {
                            $arrayElemAt: [MONTH_NAMES, { $subtract: [{ $toInt: "$_id" }, 1] }],
                        },
                        count: 1,
                        amount: 1
                    },
                }
            ]
        }

        if (dateFormat === '%V') {
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
                                                                date: "$createdAt",
                                                            },
                                                        },
                                                        "-W",
                                                        {
                                                            $dateToString: {
                                                                format: "%V",
                                                                date: "$createdAt",
                                                            },
                                                        },
                                                        "-1",
                                                    ],
                                                },
                                            },
                                        },
                                    },
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
                                                                date: "$createdAt",
                                                            },
                                                        },
                                                        "-W",
                                                        {
                                                            $dateToString: {
                                                                format: "%V",
                                                                date: "$createdAt",
                                                            },
                                                        },
                                                        "-7",
                                                    ],
                                                },
                                            },
                                        },
                                    },
                                },
                            ],
                        },
                        count: 1,
                        amount: 1
                    },
                }
            ]
        }

        pipeline.push(...[
            {
                $match: {
                    [dateRangeType]: { $ne: null },
                    ...matchFilter
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: dateFormat,
                            date: `$${dateRangeType}`,
                        },
                    },
                    createdAt: { $first: `$${dateRangeType}` },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
            ...projectStage
        ])
    }

    pipeline.push(...[
        {
            $project: {
                _id: 0,
                key: "$_id",
                count: 1
            }
        }
    ])

    return pipeline
}

export const getStageIds = async (filter: any, type: string, models: IModels,) => {
    const { pipelineIds, boardId, stageIds, stageProbability } = filter;

    const pipelines = await models.Pipelines.find({
        ...(boardId ? { boardId: { $in: [boardId] } } : {}),
        ...(pipelineIds && pipelineIds.length ? { _id: { $in: pipelineIds } } : {}),
        type: type,
    })

    const getPipelineIds = (pipelines || []).map(pipeline => pipeline._id)

    const stages = await models.Stages.find({
        ...(stageProbability ? { probability: Array.isArray(stageProbability) ? { $in: stageProbability } : stageProbability } : {}),
        ...(stageIds && stageIds.length ? { _id: { $in: stageIds } } : {}),
        pipelineId: {
            $in: getPipelineIds,
        },
        type: type,
    })

    const getStageIds = (stages || []).map(stage => stage._id)

    return getStageIds
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
        const inboxIntegrations =
            (service.config.meta || {}).inboxIntegrations || [];

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
