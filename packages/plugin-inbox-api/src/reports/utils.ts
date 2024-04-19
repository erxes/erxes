import * as dayjs from 'dayjs';
import { MONTH_NAMES, NOW, STATUS_KIND, WEEKDAY_NAMES } from './constants';
import { getService, getServices } from '@erxes/api-utils/src/serviceDiscovery';
import { getIntegrationMeta } from '../utils';
import { sendCoreMessage } from '../messageBroker';

export const getDates = (startDate: Date, endDate: Date) => {
    const result: { start: Date; end: Date; label: string }[] = [];
    let currentDate = new Date(startDate);

    // Loop through each day between start and end dates
    while (dayjs(currentDate) <= dayjs(endDate)) {
        // Calculate the start date of the current day (00:00:00)
        let startOfDay = new Date(currentDate);
        startOfDay.setHours(0, 0, 0, 0);

        // Calculate the end date of the current day (23:59:59)
        let endOfDay = new Date(currentDate);
        endOfDay.setHours(23, 59, 59, 999);

        // Add the start and end dates of the current day to the result array
        result.push({
            start: startOfDay,
            end: endOfDay,
            label: dayjs(startOfDay).format('M/D dd'),
        });

        // Move to the next day
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
};

export const getMonths = (startDate: Date, endDate: Date) => {
    // Initialize an array to store the results
    const result: { start: Date; end: Date; label: string }[] = [];

    // Clone the start date to avoid modifying the original date
    let currentDate = new Date(startDate);

    // Loop through each month between start and end dates
    while (dayjs(currentDate) <= dayjs(endDate)) {
        // Get the year and month of the current date
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // Calculate the start date of the current month
        const startOfMonth = new Date(year, month, 1);

        // Calculate the end date of the current month
        const endOfMonth = new Date(year, month + 1, 0);

        // Add the start and end dates of the current month to the result array
        result.push({
            start: startOfMonth,
            end: endOfMonth,
            label: MONTH_NAMES[startOfMonth.getMonth()],
        });

        // Move to the next month
        currentDate.setMonth(month + 1);
    }

    return result;
};

export const getWeeks = (startDate: Date, endDate: Date) => {
    // Initialize an array to store the results
    const result: { start: Date; end: Date; label: string }[] = [];

    // Clone the start date to avoid modifying the original date
    let currentDate = new Date(startDate);
    let weekIndex = 1;
    // Move to the first day of the week (Sunday)
    currentDate.setDate(currentDate.getDate() - currentDate.getDay());

    // Loop through each week between start and end dates
    while (dayjs(currentDate) <= dayjs(endDate)) {
        // Calculate the start date of the current week
        const startOfWeek = new Date(currentDate);

        // Calculate the end date of the current week (Saturday)
        const endOfWeek = new Date(currentDate);
        endOfWeek.setDate(endOfWeek.getDate() + 6);

        const dateFormat = 'M/D';
        const label = `Week ${weekIndex} ${dayjs(startOfWeek).format(
            dateFormat,
        )} - ${dayjs(endOfWeek).format(dateFormat)}`;

        // Add the start and end dates of the current week to the result array
        result.push({ start: startOfWeek, end: endOfWeek, label });

        // Move to the next week
        currentDate.setDate(currentDate.getDate() + 7);
        weekIndex++;
    }

    return result;
};

export const returnDateRange = (
    dateRange: string,
    startDate: Date,
    endDate: Date,
) => {
    const startOfToday = new Date(NOW.setHours(0, 0, 0, 0));
    const endOfToday = new Date(NOW.setHours(23, 59, 59, 999));
    const startOfYesterday = new Date(
        dayjs(NOW).add(-1, 'day').toDate().setHours(0, 0, 0, 0),
    );
    const startOfTheDayBeforeYesterday = new Date(
        dayjs(NOW).add(-2, 'day').toDate().setHours(0, 0, 0, 0),
    );

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

export const returnDateRanges = (
    dateRange: string,
    $gte: Date,
    $lte: Date,
    customDateFrequencyType?: string,
) => {
    let dateRanges;

    if (dateRange.toLowerCase().includes('week')) {
        dateRanges = getDates($gte, $lte);
    }
    if (dateRange.toLowerCase().includes('month')) {
        dateRanges = getWeeks($gte, $lte);
    }
    if (dateRange.toLowerCase().includes('year')) {
        dateRanges = getMonths($gte, $lte);
    }

    if (dateRange === 'customDate') {
        if (customDateFrequencyType) {
            switch (customDateFrequencyType) {
                case 'byMonth':
                    dateRanges = getMonths($gte, $lte);
                    return dateRanges;
                case 'byWeek':
                    dateRanges = getWeeks($gte, $lte);
                    return dateRanges;
            }
        }
        // by date
        dateRanges = getDates($gte, $lte);
    }

    return dateRanges;
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

export const getIntegrationIds = async (query, models) => {
    const integrations = await models.Integrations.find(query)

    return (integrations || []).map(integration => integration._id)
}

export const buildMatchFilter = async (filter, subdomain, models, field?) => {
    const {
        userIds,
        assignedUserIds,
        closedUserIds,
        respondedUserIds,
        brandIds,
        branchIds,
        departmentIds,
        integrationTypes,
        formIds,
        tagIds,
        status,
        groupIds,
        fieldIds,
        portalIds,
        channelIds,
        dateRange,
        closedDateRange
    } = filter;

    const matchfilter = {};

    const userFieldType = field ? field : 'assignedUserId'

    // STATUS FILTER
    if (status && status !== 'all') {

        if (status === "unassigned") {
            matchfilter['assignedUserId'] = null
        } else {
            matchfilter['status'] = { $eq: status };
        }
    }

    // DEPARTMENT FILTER
    if (departmentIds && departmentIds.length) {
        const users = await sendCoreMessage({
            subdomain,
            action: 'users.find',
            data: {
                query: {
                    departmentIds: { $in: departmentIds },
                    isActive: true,
                },
            },
            isRPC: true,
            defaultValue: [],
        });

        const userIds = users.map(user => user._id)

        matchfilter[userFieldType] = { $in: userIds };
    }

    // BRANCH FILTER
    if (branchIds && branchIds.length) {
        const users = await sendCoreMessage({
            subdomain,
            action: 'users.find',
            data: {
                query: { branchIds: { $in: branchIds }, isActive: true },
            },
            isRPC: true,
            defaultValue: [],
        });

        const userIds = users.map(user => user._id)

        matchfilter[userFieldType] = { $in: userIds };
    }

    // BRAND FILTER
    if (brandIds && brandIds.length) {
        const query = { brandId: { $in: brandIds } }
        const integrationIds = await getIntegrationIds(query, models)

        matchfilter['integrationId'] = { $in: integrationIds };
    }

    // SOURCE FILTER
    if (integrationTypes && integrationTypes.length) {
        const query = { kind: { $in: integrationTypes } }
        const integrationIds = await getIntegrationIds(query, models)

        matchfilter['integrationId'] = { $in: integrationIds };
    }

    //ASSIGNED USER FILTER
    if (assignedUserIds && assignedUserIds.length) {
        matchfilter['assignedUserId'] = { $in: assignedUserIds };
    }

    //RESPONDED USER FILTER
    if (respondedUserIds && respondedUserIds.length) {
        matchfilter['firstRespondedUserId'] = { $in: respondedUserIds };
    }

    // TAG FILTER
    if (tagIds && tagIds.length) {
        matchfilter['tagIds'] = { $in: tagIds };
    }

    //CLOSED USER FILTER
    if (closedUserIds && closedUserIds.length) {
        matchfilter['closedUserId'] = { $in: closedUserIds };
    }

    // DATE FILTER
    if (dateRange) {
        const { startDate, endDate, dateRangeType = 'createdAt' } = filter;
        const dateFilter = returnDateRange(dateRange, startDate, endDate);

        if (Object.keys(dateFilter).length) {
            matchfilter[dateRangeType] = dateFilter;
        }
    }

    if (closedDateRange) {
        const { startDate, endDate, dateRangeType = 'closedAt' } = filter;
        const dateFilter = returnDateRange(closedDateRange, startDate, endDate);

        if (Object.keys(dateFilter).length) {
            matchfilter[dateRangeType] = dateFilter;
        }
    }

    return matchfilter;
};

export const getDimensionPipeline = async (filter, subdomain, models) => {
    const { dimension, status } = filter

    const statusAt = status === 'closed' ? "closedAt" : "createdAt"
    const statusBy = status === 'closed' ? "closedUserId" : "assignedUserId"

    const matchfilter = await buildMatchFilter(filter, subdomain, models)

    const pipeline: any[] = []

    if (!dimension) {
        return pipeline
    }

    if (dimension === 'status') {
        pipeline.push(...[
            {
                $match: matchfilter
            },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: {
                        $switch: {
                            branches: [
                                { case: { $eq: ["$_id", "open"] }, then: "Open" },
                                { case: { $eq: ["$_id", "engageVisitorAuto"] }, then: "Auto-Engaged" },
                                { case: { $eq: ["$_id", "new"] }, then: "New" },
                                { case: { $eq: ["$_id", "closed"] }, then: "Closed" },
                            ],
                            default: "Unknown",
                        },
                    },
                    count: 1,
                },
            },
        ])
    }

    if (dimension === 'source') {
        pipeline.push(...[
            {
                $match: matchfilter
            }, {
                $group: {
                    _id: "$integrationId",
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "integrations",
                    let: { integrationId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$_id", "$$integrationId"],
                                },
                            },
                        },
                    ],
                    as: "integration",
                },
            },
            {
                $unwind: "$integration",
            },
            {
                $group: {
                    _id: "$integration.kind",
                    count: { $sum: "$count" },
                },
            },
            {
                $project: {
                    _id: {
                        $switch: {
                            branches: [
                                { case: { $eq: ["$_id", "messenger"] }, then: "XOS Messenger" },
                                { case: { $eq: ["$_id", "email"] }, then: "Email" },
                                { case: { $eq: ["$_id", "calls"] }, then: "Call" },
                                { case: { $eq: ["$_id", "callpro"] }, then: "Callpro" },
                                { case: { $eq: ["$_id", "sms"] }, then: "SMS" },
                                { case: { $eq: ["$_id", "lead"] }, then: "Lead" },
                                { case: { $eq: ["$_id", "facebook-messenger"] }, then: "Facebook Messenger" },
                                { case: { $eq: ["$_id", "facebook-post"] }, then: "Facebook Post" },
                            ],
                            default: "$_id",
                        },
                    },
                    count: 1,
                },
            },
        ])
    }

    if (dimension === 'tag') {

        const { tagIds } = filter

        pipeline.push(...[
            {
                $match: matchfilter,
            },
            {
                $unwind: "$tagIds"
            },
            {
                $group: {
                    _id: '$tagIds',
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "tags",
                    let: {
                        tagId: "$_id",
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$_id", "$$tagId"],
                                },
                            },
                        },
                    ],
                    as: "tag",
                },
            },
            {
                $unwind: "$tag",
            },
            ...(tagIds && tagIds.length ? [{ $match: { _id: { $in: tagIds } } }] : []),
            {
                $project: {
                    _id: "$tag.name",
                    count: 1
                }
            }
        ])
    }

    if (dimension === 'department') {

        const { departmentIds } = filter

        pipeline.push(...[
            {
                $match: {
                    [statusBy]: { $exists: true, $ne: null },
                    ...matchfilter
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: `${statusBy}`,
                    foreignField: "_id",
                    as: "user",
                },
            },
            {
                $unwind: "$user"
            },
            {
                $unwind: "$user.departmentIds"
            },
            {
                $group: {
                    _id: "$user.departmentIds",
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'departments',
                    localField: "_id",
                    foreignField: "_id",
                    as: "department"
                }
            },
            {
                $unwind: "$department"
            },
            ...(departmentIds && departmentIds.length ? [{ $match: { _id: { $in: departmentIds } } }] : []),
            {
                $project: {
                    _id: "$department.title",
                    count: 1
                }
            },
        ])
    }

    if (dimension === 'branch') {

        const { branchIds } = filter

        pipeline.push(...[
            {
                $match: {
                    [statusBy]: { $exists: true, $ne: null },
                    ...matchfilter
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: `${statusBy}`,
                    foreignField: "_id",
                    as: "user",
                },
            },
            {
                $unwind: "$user"
            },
            {
                $unwind: "$user.branchIds"
            },
            {
                $group: {
                    _id: "$user.branchIds",
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'branches',
                    localField: "_id",
                    foreignField: "_id",
                    as: "branch"
                }
            },
            {
                $unwind: "$branch"
            },
            ...(branchIds && branchIds.length ? [{ $match: { _id: { $in: branchIds } } }] : []),
            {
                $project: {
                    _id: "$branch.title",
                    count: 1
                }
            },
        ])
    }

    if (dimension === 'brand') {
        pipeline.push(...[
            {
                $match: {
                    integrationId: {
                        $exists: true,
                        $ne: null
                    },
                    ...matchfilter
                },
            },
            {
                $lookup: {
                    from: "integrations",
                    localField: "integrationId",
                    foreignField: "_id",
                    as: "integration",
                },
            },
            {
                $unwind: "$integration",
            },
            {
                $group: {
                    _id: "$integration.brandId",
                    count: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: "brands",
                    localField: "_id",
                    foreignField: "_id",
                    as: "brand",
                },
            },
            {
                $unwind: "$brand",
            },
            {
                $project: {
                    _id: "$brand.name",
                    count: 1,
                },
            },
        ])
    }

    if (dimension === 'teamMember') {
        pipeline.push(...[
            {
                $match: matchfilter
            },
            {
                $group: {
                    _id: `$${statusBy}`,
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "users",
                    foreignField: "_id",
                    localField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: "$user"
            },
            {
                $project: {
                    _id: "$user.details.fullName",
                    count: 1,
                },
            },
        ])
    }

    if (dimension === 'frequency') {
        const { frequencyType, status, dateRange, startDate, endDate } = filter


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

        pipeline.push(...[
            {
                $match: matchfilter
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: dateFormat,
                            date: `$${statusAt}`,
                        },
                    },
                    createdAt: { $first: `$${statusAt}` },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } }
        ])

        if (dateFormat === '%u') {
            pipeline.push({
                $project: {
                    _id: {
                        $arrayElemAt: [WEEKDAY_NAMES, { $subtract: [{ $toInt: "$_id" }, 1] }]
                    },
                    count: 1
                }
            });
        }

        if (dateFormat === '%m') {
            pipeline.push({
                $project: {
                    _id: {
                        $arrayElemAt: [MONTH_NAMES, { $subtract: [{ $toInt: "$_id" }, 1] }]
                    },
                    count: 1
                }
            });
        }

        if (dateFormat === '%V') {
            pipeline.push(...[
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
                    },
                }
            ])
        }
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

export const calculateAverage = (arr: number[]) => {
    if (!arr || !arr.length) {
        return 0; // Handle division by zero for an empty array
    }

    const sum = arr.reduce((acc, curr) => acc + curr, 0);
    return (sum / arr.length);
};
