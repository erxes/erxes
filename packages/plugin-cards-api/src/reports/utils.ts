import { sendCoreMessage, sendFormsMessage, sendInboxMessage } from "../messageBroker";
import { MONTH_NAMES, NOW, PROBABILITY_CLOSED, PROBABILITY_OPEN, WEEKDAY_NAMES } from './constants';
import { IModels } from "../connectionResolver";
import * as dayjs from 'dayjs';
import { getService, getServices } from "@erxes/api-utils/src/serviceDiscovery";

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

export const getDateFilter = (dateRange, startDate, endDate) => {
    const dateFilter = returnDateRange(dateRange, startDate, endDate);

    return Object.keys(dateFilter).length ? dateFilter : {}
}

export const getConformityIds = async (type: string, ids: string[], subdomain: any) => {
    const conformities = await sendCoreMessage({
        subdomain,
        action: 'conformities.findConformities',
        data: {
            relType: type,
            relTypeId: { $in: ids }
        },
        isRPC: true,
        defaultValue: [],
    });

    return conformities.map(conformity => conformity.mainTypeId)
}

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
        const { userType = 'userId' } = filter;
        matchfilter[userType] = { $in: userIds };
    }

    // BRANCH FILTER
    if (branchIds?.length) {
        matchfilter['branchIds'] = { $in: branchIds };
    }

    // DEPARTMENT FILTER
    if (departmentIds?.length) {
        matchfilter['departmentIds'] = { $in: departmentIds };
    }

    // COMPANY FILTER
    if (companyIds?.length) {
        const mainTypeIds = getConformityIds('company', companyIds, subdomain)

        matchfilter['_id'] = { $in: mainTypeIds };
    }

    // CUSTOMER FILTER
    if (customerIds?.length) {
        const mainTypeIds = getConformityIds('customer', customerIds, subdomain)

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
        matchfilter['tagIds'] = { $in: tagIds };
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
    if (groupIds?.length) {
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
    if (fieldIds?.length) {
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

export const buildLookup = ({ type, from, localField, foreignField, extraConditions }: { type: string, from: string, localField?: string, foreignField?: string, extraConditions?: object[] }) => {

    const lookup = {
        $lookup: {
            from,
            let: { fieldId: `$${localField ?? "_id"}` },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $eq: [`$${foreignField ?? '_id'}`, "$$fieldId"] },
                                ...(extraConditions?.length ? extraConditions : [])
                            ]
                        }
                    }
                },
            ],
            as: type,
        },
    }

    const unwind = {
        $unwind: `$${type}`
    }

    return [lookup, unwind]
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

        const lookup = buildLookup({ type: 'tag', from: "tags" })

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
            ...lookup,
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

        const lookup = buildLookup({ type: 'label', from: "pipeline_labels" })

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
            ...lookup,
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

        const extraConditions = [
            { $eq: ["$isActive", true] }
        ]

        const lookup = buildLookup({ type: 'user', from: "users", extraConditions })

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
            ...lookup,
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

        const lookup = buildLookup({ type: 'branch', from: "branches" })

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
            ...lookup,
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

        const extraConditions = [
            { $eq: ["$status", "active"] },
        ]
        const lookup = buildLookup({ type: "department", from: "departments", extraConditions })

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
            ...lookup,
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

        const extraConditions = [
            { $eq: ["$mainType", type] },
            { $eq: ["$relType", "company"] }
        ]

        const conformityLookup = buildLookup({ type: 'conformity', from: "conformities", foreignField: "mainTypeId", extraConditions })
        const companyLookup = buildLookup({ type: 'company', from: "companies" })

        pipeline.push(...[
            {
                $match: {
                    status: "active",
                    ...matchFilter
                },
            },
            ...conformityLookup,
            {
                $group: {
                    _id: "$conformity.relTypeId",
                    count: { $sum: 1 },
                },
            },
            ...companyLookup,
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

        const extraConditions = [
            { $eq: ["$mainType", type] },
            { $eq: ["$relType", "customer"] }
        ]

        const conformityLookup = buildLookup({ type: 'conformity', from: "conformities", foreignField: "mainTypeId", extraConditions })
        const customerLookup = buildLookup({ type: 'customer', from: "customers" })

        pipeline.push(...[
            {
                $match: {
                    ...matchFilter
                },
            },
            ...conformityLookup,
            {
                $group: {
                    _id: "$conformity.relTypeId",
                    count: { $sum: 1 },
                },
            },
            ...customerLookup,
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

        const conversationLookup = buildLookup({ type: "conversation", from: "conversations", localField: "sourceConversationIds" })
        const integrationLookup = buildLookup({ type: "integration", from: "integrations", localField: "conversation.integrationId" })
        pipeline.push(...[
            {
                $unwind: "$sourceConversationIds"
            },
            ...conversationLookup,
            ...integrationLookup,
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

        const extraConditions = [
            { $eq: ["$status", "active"] }
        ]

        const productLookup = buildLookup({ type: 'product', from: 'products', extraConditions })

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
            ...productLookup,
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

        const stageLookup = buildLookup({ type: 'stage', from: 'stages' })

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
            ...stageLookup,
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

        if (dateRange?.toLowerCase().includes('day')) {
            formatType = '%Hh:%Mm:%Ss'
        }

        if (dateRange?.toLowerCase().includes('week')) {
            formatType = '%u'
        }

        if (dateRange?.toLowerCase().includes('month')) {
            formatType = "%V"
        }

        if (dateRange?.toLowerCase().includes('year')) {
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
            service.config?.meta?.inboxIntegrations || [];

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
