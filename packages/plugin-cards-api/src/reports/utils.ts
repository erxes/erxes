import { sendCoreMessage, sendFormsMessage } from "../messageBroker";
import { MONTH_NAMES, NOW, PROBABILITY_CLOSED, PROBABILITY_OPEN, WEEKDAY_NAMES } from './constants';
import { IModels } from "../connectionResolver";
import * as dayjs from 'dayjs';

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

    if (!dimension) {
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
                    ...matchFilter
                }
            },
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
                                        { $eq: ["$_id", "$$branchId"] },
                                        { $eq: ["$status", "active"] },
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
                    from: "departmentes",
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
                    let: { dealId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $and: [
                                    {
                                        $expr: {
                                            $eq: ["$mainType", "deal"],
                                        },
                                    },
                                    {
                                        $expr: {
                                            $eq: [
                                                "$mainTypeId",
                                                "$$dealId",
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
                    let: { dealId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $and: [
                                    {
                                        $expr: {
                                            $eq: ["$mainType", "deal"],
                                        },
                                    },
                                    {
                                        $expr: {
                                            $eq: [
                                                "$mainTypeId",
                                                "$$dealId",
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
                $unwind: "$productsData"
            },
            {
                $match: {
                    // HEZEE HAAGDSAN GEDGIIN MEDEH ARGA MEDHGU BGA TODRUULAH SHAARDLAGATAI 
                    // CREATEDAT BH NI ZUV ESEH 
                    // CLOSED GEDGIIG NI STATUS NI MEDEH ZUV ESEH 
                    // status: { $eq: "archived" },
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
                    amount: { $sum: "$productsData.amount" },
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

// ----------------------------------------------------------------  


export function taskClosedByRep(tickets: any) {
    // tslint:disable-next-line:no-shadowed-variable
    const ticketCounts: Record<string, number> = {};

    // Check if tickets is an array
    if (!Array.isArray(tickets)) {
    }

    tickets.forEach((ticket) => {
        const labelIds = (ticket.labelIds as string[]) || [];

        if (labelIds.length === 0) {
            return;
        }
        labelIds.forEach((ownerId) => {
            ticketCounts[ownerId] = (ticketCounts[ownerId] || 0) + 1;
        });
    });

    return ticketCounts;
}

export function taskClosedByTagsRep(tasks: any) {
    // tslint:disable-next-line:no-shadowed-variable
    const ticketCounts: Record<string, number> = {};

    // Check if tickets is an array
    if (!Array.isArray(tasks)) {
        throw new Error('Invalid input: tasks should be an array.');
    }

    tasks.forEach((ticket) => {
        const tagIds = (ticket.tagIds as string[]) || [];

        if (tagIds.length === 0) {
            return;
        }
        tagIds.forEach((ownerId) => {
            ticketCounts[ownerId] = (ticketCounts[ownerId] || 0) + 1;
        });
    });

    return ticketCounts;
}

export function departmentCount(tasks: any) {
    // tslint:disable-next-line:no-shadowed-variable
    const taskCounts: Record<string, number> = {};

    // Check if tasks is an array
    if (!Array.isArray(tasks)) {
        throw new Error('Invalid input: tasks should be an array.');
    }

    tasks.forEach((task) => {
        const tagIds = (task.departmentIds as string[]) || [];

        if (tagIds.length === 0) {
            return;
        }
        tagIds.forEach((ownerId) => {
            taskCounts[ownerId] = (taskCounts[ownerId] || 0) + 1;
        });
    });

    return taskCounts;
}

export function calculateTicketCounts(tickets: any, selectedUserIds: any) {
    // tslint:disable-next-line:no-shadowed-variable
    const ticketCounts: Record<string, number> = {};

    // Check if tickets is an array
    if (!Array.isArray(tickets)) {
        throw new Error('Invalid input: tickets should be an array.');
    }
    if (selectedUserIds.length > 0) {
        selectedUserIds.forEach((userId) => {
            ticketCounts[userId] = 0;
        });
    }

    tickets.forEach((ticket) => {
        const assignedUserIds = (ticket.assignedUserIds as string[]) || [];

        if (assignedUserIds.length === 0) {
            return;
        }
        if (selectedUserIds.length > 0) {
            assignedUserIds.forEach((ownerId) => {
                if (selectedUserIds.includes(ownerId)) {
                    ticketCounts[ownerId] = (ticketCounts[ownerId] || 0) + 1;
                }
            });
        } else {
            assignedUserIds.forEach((ownerId) => {
                ticketCounts[ownerId] = (ticketCounts[ownerId] || 0) + 1;
            });
        }
    });

    return ticketCounts;
}

export function amountProductData(deals: any[]): Promise<any[]> {
    return new Promise((resolve) => {
        const repAmounts: Record<string, any> = {};

        deals.forEach((deal) => {
            if (deal.productsData) {
                const { productsData } = deal;
                productsData.forEach((product) => {
                    if (product.amount) {
                        if (!repAmounts[deal.stageId]) {
                            repAmounts[deal.stageId] = {
                                totalAmount: 0,
                                stageId: deal.stageId,
                            };
                        }

                        repAmounts[deal.stageId].totalAmount += product.amount;
                    }
                });
            }
        });

        // Convert the repAmounts object into an array
        const resultArray = Object.values(repAmounts);

        resolve(resultArray);
    });
}

// Function to calculate the average deal amounts by rep
export function calculateAverageDealAmountByRep(deals: any, selectedUserIds: any) {
    const repAmounts = {};
    const dealCounts: Record<string, number> = {};

    if (selectedUserIds.length > 0) {
        selectedUserIds.forEach((userId) => {
            repAmounts[userId] = { totalAmount: 0, count: 0 };
            dealCounts[userId] = 0;
        });
    }
    deals.forEach((deal) => {
        if (deal.productsData && deal.status === 'active') {
            const { productsData } = deal;

            productsData.forEach((product) => {
                if (product.amount) {
                    const { assignedUserIds } = deal;
                    if (selectedUserIds.length > 0) {
                        assignedUserIds.forEach((userId) => {
                            if (selectedUserIds.includes(userId)) {
                                repAmounts[userId] = repAmounts[userId] || {
                                    totalAmount: 0,
                                    count: 0,
                                };
                                repAmounts[userId].totalAmount += product.amount;
                                repAmounts[userId].count += 1;

                                // If you want counts for each user, increment the deal count
                                dealCounts[userId] = (dealCounts[userId] || 0) + 1;
                            }
                        });
                    } else {
                        assignedUserIds.forEach((userId) => {
                            repAmounts[userId] = repAmounts[userId] || {
                                totalAmount: 0,
                                count: 0,
                            };
                            repAmounts[userId].totalAmount += product.amount;
                            repAmounts[userId].count += 1;
                        });
                    }
                }
            });
        }
    });

    const result: Array<{ userId: string; amount: string }> = [];

    // tslint:disable-next-line:forin
    for (const userId in repAmounts) {
        const { totalAmount, count } = repAmounts[userId];
        const averageAmount = count > 0 ? totalAmount / count : 0;

        result.push({ userId, amount: averageAmount.toFixed(3) });
    }

    return result;
}

export function calculateTicketTotalsByStatus(tickets: any) {
    const ticketTotals = {};

    // Loop through tickets
    tickets.forEach((ticket) => {
        const { status } = ticket;

        // Check if status exists
        if (status !== undefined && status !== null) {
            // Initialize or increment status count
            ticketTotals[status] = (ticketTotals[status] || 0) + 1;
        }
    });

    // Return the result
    return ticketTotals;
}

export function calculateTicketTotalsByLabelPriorityTag(tickets: any) {
    return tickets.reduce((ticketTotals: Record<string, number>, ticket) => {
        const labels = ticket.labelIds || [];
        const priority = ticket.priority || 'Default'; // Replace 'Default' with the default priority if not available
        const tags = ticket.tagIds || [];
        // Increment counts for each label
        labels.forEach((label) => {
            const labelKey = `labelIds:'${label}'`;
            ticketTotals[labelKey] = (ticketTotals[labelKey] || 0) + 1;
        });
        // Increment counts for each priority
        const priorityKey = `priority:'${priority}'`;
        ticketTotals[priorityKey] = (ticketTotals[priorityKey] || 0) + 1;

        // Increment counts for each tag
        tags.forEach((tag) => {
            const tagKey = `tagIds:'${tag}'`;
            ticketTotals[tagKey] = (ticketTotals[tagKey] || 0) + 1;
        });

        return ticketTotals;
    }, {});
}

export const calculateAverageTimeToClose = (tickets) => {
    // Filter out tickets without close dates
    const closedTickets = tickets.filter(
        (ticketItem) => ticketItem.modifiedAt && ticketItem.createdAt,
    );

    if (closedTickets.length === 0) {
        throw new Error('No closed tickets found.');
    }

    // Calculate time to close for each ticket in milliseconds
    const timeToCloseArray = closedTickets.map((ticketItem) => {
        const createdAt = new Date(ticketItem.createdAt).getTime();
        const modifiedAt = new Date(ticketItem.modifiedAt).getTime();

        // Check if both dates are valid
        if (!isNaN(createdAt) && !isNaN(modifiedAt)) {
            return modifiedAt - createdAt;
        }
    });

    // Filter out invalid date differences
    const validTimeToCloseArray = timeToCloseArray.filter(
        (time) => time !== null,
    );

    if (validTimeToCloseArray.length === 0) {
        throw new Error('No valid time differences found.');
    }

    const timeToCloseInHoursArray = validTimeToCloseArray.map((time) =>
        (time / (1000 * 60 * 60)).toFixed(3),
    );

    return timeToCloseInHoursArray;
};
export function convertHoursToHMS(durationInHours) {
    const hours = Math.floor(durationInHours);
    const minutes = Math.floor((durationInHours - hours) * 60);
    const seconds = Math.floor(((durationInHours - hours) * 60 - minutes) * 60);

    return { hours, minutes, seconds };
}
export const taskAverageTimeToCloseByLabel = async (tasks) => {
    const closedTasks = tasks.filter(
        (ticketItem) => ticketItem.modifiedAt && ticketItem.createdAt,
    );

    if (closedTasks.length === 0) {
        throw new Error('No closed Tasks found.');
    }

    // Calculate time to close for each ticket in milliseconds
    const timeToCloseArray = closedTasks.map((ticketItem) => {
        const createdAt = new Date(ticketItem.createdAt).getTime();
        const modifiedAt = new Date(ticketItem.modifiedAt).getTime();

        // Check if both dates are valid
        if (!isNaN(createdAt) && !isNaN(modifiedAt)) {
            return {
                timeDifference: modifiedAt - createdAt,
                stageId: ticketItem.stageId, // Include assignedUserIds
                labelIds: ticketItem.labelIds,
                tagIds: ticketItem.tagIds,
            };
        }
    });

    // Filter out invalid date differences
    const validTimeToCloseArray = timeToCloseArray.filter(
        (time) => time !== null,
    );

    if (validTimeToCloseArray.length === 0) {
        throw new Error('No valid time differences found.');
    }

    const timeToCloseInHoursArray = validTimeToCloseArray.map((time) => ({
        timeDifference: (time.timeDifference / (1000 * 60 * 60)).toFixed(3),
        stageId: time.stageId, // Include assignedUserIds
        labelIds: time.labelIds,
        tagIds: time.tagIds,
    }));

    return timeToCloseInHoursArray;
};

export const calculateAverageTimeToCloseUser = (
    tickets: any,
    selectedUserIds: any,
) => {
    // Filter out tickets without close dates
    const closedTickets = tickets.filter(
        (ticketItem) => ticketItem.modifiedAt && ticketItem.createdAt,
    );

    if (closedTickets.length === 0) {
        throw new Error('No closed tickets found.');
    }
    if (selectedUserIds.length > 0) {
        selectedUserIds.forEach((userId) => {
            closedTickets[userId] = 0;
        });
    }
    // Calculate time to close for each ticket in milliseconds
    const timeToCloseArray = closedTickets.map((ticketItem) => {
        const createdAt = new Date(ticketItem.createdAt).getTime();
        const modifiedAt = new Date(ticketItem.modifiedAt).getTime();
        const user_id = ticketItem.assignedUserIds;

        if (!isNaN(createdAt) && !isNaN(modifiedAt)) {
            if (selectedUserIds.length > 0) {
                const matchingUserIds = user_id.filter((result) =>
                    selectedUserIds.includes(result),
                );
                return {
                    timeDifference: modifiedAt - createdAt,
                    assignedUserIds: matchingUserIds, // Include assignedUserIds
                };
            } else {
                return {
                    timeDifference: modifiedAt - createdAt,
                    assignedUserIds: user_id, // Include assignedUserIds
                };
            }
        }
    });

    // Filter out invalid date differences
    const validTimeToCloseArray = timeToCloseArray.filter(
        (time) => time !== null,
    );

    if (validTimeToCloseArray.length === 0) {
        throw new Error('No valid time differences found.');
    }

    // Calculate the sum of timeDifference for each unique user
    const userTotals = {};

    validTimeToCloseArray.forEach((entry) => {
        if (entry !== null) {
            entry.assignedUserIds.forEach((userId) => {
                userTotals[userId] = (userTotals[userId] || 0) + entry.timeDifference;
            });
        }
    });

    const resultArray = Object.entries(userTotals).map(
        (
            value: [string, unknown],
            index: number,
            array: Array<[string, unknown]>,
        ) => {
            const [userId, timeDifferenceSum] = value;
            return {
                timeDifference: (timeDifferenceSum as number).toFixed(3),
                assignedUserIds: [userId],
            };
        },
    );
    return resultArray;
};

export function sumCountsByUserIdName(inputArray: any[]) {
    const resultMap = new Map<
        string,
        { count: number; fullName: string; _id: string }
    >();
    inputArray.forEach((userEntries) => {
        userEntries.forEach((entry) => {
            const userId = entry._id;
            const { count } = entry;

            if (resultMap.has(userId)) {
                resultMap.get(userId)!.count += count;
            } else {
                resultMap.set(userId, {
                    count,
                    fullName: entry.FullName,
                    _id: entry._id,
                });
            }
        });
    });

    return Array.from(resultMap.values());
}

function stageChangedDate(ticked: any[]) {
    const resultMap = new Map<
        string,
        { date: string; name: string; _id: string }
    >(
        Array.from(ticked, (t) => [
            t._id,
            {
                _id: t._id,
                name: t.name,
                date: new Date(t.stageChangedDate).toLocaleString(),
            },
        ]),
    );

    return Array.from(resultMap.values());
}
export async function filterData(filter: any, subdomain: any) {
    const {
        dateRange,
        startDate,
        endDate,
        assignedUserIds,
        branchIds,
        departmentIds,
        companyIds,
        stageId,
        stageIds,
        tagIds,
        pipelineLabels,
        groupIds,
        fieldIds,
        priority,
        attachment
    } = filter;
    const matchfilter = {};

    if (attachment === true) {
        matchfilter['attachments'] = { '$ne': [] };
    }

    if (attachment === false) {
        matchfilter['attachments'] = { '$eq': [] };
    }

    if (assignedUserIds) {
        matchfilter['assignedUserIds'] = { $in: assignedUserIds };
    }
    if (dateRange) {
        const dateFilter = returnDateRange(filter.dateRange, startDate, endDate);

        if (Object.keys(dateFilter).length) {
            matchfilter['createdAt'] = dateFilter;
        }
    }
    if (branchIds) {
        matchfilter['branchIds'] = { $in: branchIds };
    }
    if (departmentIds) {
        matchfilter['departmentIds'] = { $in: departmentIds };
    }

    if (stageId) {
        matchfilter['stageId'] = { $eq: stageId };
    }

    if (stageIds) {
        matchfilter['stageId'] = { $in: stageIds };
    }

    if (tagIds) {
        matchfilter['tagIds'] = { $in: tagIds };
    }
    if (pipelineLabels) {
        matchfilter['labelIds'] = { $in: pipelineLabels };
    }
    if (priority) {
        matchfilter['priority'] = { $eq: priority };
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

    // FIELD FILTER
    if (fieldIds && fieldIds.length) {
        matchfilter['customFieldsData.field'] = { $in: fieldIds };
    }

    // COMPANY FILTER
    if (companyIds) {
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

    return matchfilter;
}


export const returnStage = (resolve: string | string[]) => {
    ('');
    // Handle the case when resolve is an array
    const firstResolve = Array.isArray(resolve) ? resolve[0] : resolve;

    switch (firstResolve) {
        case '10':
            return '10%';
        case '20':
            return '30%';
        case '30':
            return '30%';
        case '40':
            return '40%';
        case '50':
            return '50%';
        case '60':
            return '60%';
        case '70':
            return '70%';
        case '80':
            return '80%';
        case '90':
            return '90%';
        case 'Won':
            return 'Won';
        case 'Lost':
            return 'Lost';
        case 'Done':
            return 'Done';
        case 'Resolved':
            return 'Resolved';
        default:
            return {};
    }
};

export const checkFilterParam = (param: any) => {
    return param && param.length;
};

export async function pipelineFilterData(
    filter: any,
    models: IModels,
    pipelineId: any,
    boardId: any,
    stageType: any,
) {
    let pipelineIds: string[] = [];
    let stageFilters = {};
    if (stageType) {
        const stageFilter = returnStage(stageType);
        // Check if stageFilter is not empty
        if (Object.keys(stageFilter).length) {
            stageFilters['probability'] = stageFilter;
        }
    }
    if (checkFilterParam(pipelineId)) {
        const findPipeline = await models?.Pipelines.find({
            _id: {
                $in: pipelineId,
            },
            type: 'deal',
            status: 'active',
        });
        if (findPipeline) {
            pipelineIds.push(...findPipeline.map((item) => item._id));
        }
    }
    if (checkFilterParam(boardId)) {
        const findBoard = await models?.Boards.find({
            _id: {
                $in: boardId,
            },
            type: 'deal',
        });
        if (findBoard) {
            const boardId = findBoard?.map((item) => item._id);
            const pipeline = await models?.Pipelines.find({
                boardId: {
                    $in: boardId,
                },
                type: 'deal',
                status: 'active',
            });
            if (pipeline) {
                pipelineIds.push(...pipeline.map((item: any) => item._id));
            }
        }
    }

    const stages = await models?.Stages.find({
        ...stageFilters,
        pipelineId: {
            $in: pipelineIds,
        },
        type: 'deal',
    });
    const pipeline = stages?.map((item) => item._id);

    const deals = await models?.Deals.find({
        ...filter,
        stageId: {
            $in: pipeline,
        },
    }).lean();

    if (deals) {
        const dealAmount = await amountProductData(deals);

        const dealAmountMap = {};
        dealAmount.forEach((item) => {
            dealAmountMap[item.stageId] = item.totalAmount;
        });

        // Assign totalAmount to each deal
        const groupStage = deals.map((deal) => ({
            ...deal,
            productCount: deal.productsData.length,
            totalAmount: dealAmountMap[deal.stageId],
        }));
        const title = 'Deals sales and average';

        const filteredGroupStage = groupStage.filter(
            (item: any) => typeof item.totalAmount === 'number',
        );

        // Sort the filtered array by totalAmount
        filteredGroupStage.sort((a, b) => a.totalAmount - b.totalAmount);

        // Extract sorted data and labels
        const data = filteredGroupStage.map((item: any) => item.totalAmount);
        const labels = filteredGroupStage.map(
            (item: any) => `Name: ${item.name}, Product Count: ${item.productCount}`,
        );

        const datasets = { title, data, labels };
        return datasets;
    } else {
        throw new Error('No deals found');
    }
}

export async function PipelineAndBoardFilter(
    pipelineId: string,
    boardId: string,
    stageType: string,
    stageId: string,
    type: string,
    models: IModels,
) {
    let pipelineIds: string[] = [];

    let stageFilters = {};
    if (stageType) {
        const stageFilter = returnStage(stageType);
        // Check if stageFilter is not empty
        if (Object.keys(stageFilter).length) {
            stageFilters['probability'] = stageFilter;
        }
    }

    if (checkFilterParam(boardId)) {
        const findPipeline = await models?.Pipelines.find({
            boardId: {
                $in: boardId,
            },
            type: type,
            status: 'active',
        });
        if (findPipeline) {
            pipelineIds.push(...findPipeline.map((item) => item._id));
        }
    }
    if (checkFilterParam(pipelineId)) {
        const findPipeline = await models?.Pipelines.find({
            _id: {
                $in: pipelineId,
            },
            type: type,
            status: 'active',
        });
        if (findPipeline) {
            pipelineIds.push(...findPipeline.map((item) => item._id));
        }
    }
    if (checkFilterParam(stageId)) {
        const findStages = await models?.Stages.find({
            ...stageFilters,
            _id: {
                $in: stageId,
            },
            type: type,
        });
        if (findStages) {
            const stage_ids = findStages?.map((item) => item._id);
            return stage_ids;
        }
    }
    let uniquePipelineIdsSet = new Set(pipelineIds);
    let uniquePipelineIds = Array.from(uniquePipelineIdsSet);
    const stages = await models?.Stages.find({
        ...stageFilters,
        pipelineId: {
            $in: uniquePipelineIds,
        },
        type: type,
    });
    const stage_ids = stages?.map((item) => item._id);
    return stage_ids;
}

export function QueryFilter(filterPipelineId: any, matchedFilter: any) {
    let constructedQuery: any = {};

    if (filterPipelineId && Object.keys(filterPipelineId).length > 0) {
        constructedQuery.stageId = { $in: filterPipelineId };
    }

    if (
        matchedFilter &&
        typeof matchedFilter === 'object' &&
        Object.keys(matchedFilter).length > 0
    ) {
        constructedQuery = {
            ...constructedQuery,
            ...matchedFilter,
        };
    }

    return constructedQuery;
}