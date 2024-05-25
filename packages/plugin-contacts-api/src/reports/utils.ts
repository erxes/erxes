import * as dayjs from 'dayjs';
import { MONTH_NAMES, NOW } from './constants';
import { getService, getServices } from "@erxes/api-utils/src/serviceDiscovery";
import { sendClientPortalMessage, sendFormsMessage, sendInboxMessage } from '../messageBroker';

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

export const getIntegrationIds = async (query, subdomain) => {
    const integrations = await sendInboxMessage({
        subdomain,
        action: 'integrations.find',
        data: { query },
        isRPC: true,
        defaultValue: []
    })

    const integrationIds = (integrations || []).map(integration => integration._id)

    return integrationIds
}

export const buildMatchFilter = async (filter, subdomain) => {
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
    } = filter;

    const matchfilter = {};

    // FORM FILTER
    if (formIds?.length) {
        const query = { formId: { $in: formIds } }
        const integrationIds = await getIntegrationIds(query, subdomain)

        matchfilter['relatedIntegrationIds'] = { $in: integrationIds };
    }

    // BRAND FILTER
    if (brandIds?.length) {
        const query = { brandId: { $in: brandIds } }
        const integrationIds = await getIntegrationIds(query, subdomain)

        matchfilter['integrationId'] = { $in: integrationIds };
    }

    // TAG FILTER
    if (tagIds?.length) {
        matchfilter['tagIds'] = { $in: tagIds };
    }

    if (branchIds?.length) {
        matchfilter['branchIds'] = { $in: branchIds };
    }

    if (departmentIds?.length) {
        matchfilter['departmentIds'] = { $in: departmentIds };
    }

    // SOURCE FILTER
    if (integrationTypes?.length) {
        const query = { kind: { $in: integrationTypes } }
        const integrationIds = await getIntegrationIds(query, subdomain)

        matchfilter['integrationId'] = { $in: integrationIds };
    }

    // CHANNEL FILTER
    if (channelIds?.length) {
        const channels = await sendInboxMessage({
            subdomain,
            action: "channels.find",
            data: {
                _id: { $in: channelIds }
            },
            isRPC: true,
            defaultValue: []
        })

        const integrationIds = (channels || []).flatMap(channel => [...channel.integrationIds])

        matchfilter['integrationId'] = { $in: integrationIds };
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

    // FIELD FILTER
    if (fieldIds?.length) {
        matchfilter['customFieldsData.field'] = { $in: fieldIds };
    }

    //PORTAL FILTER
    if (portalIds?.length) {
        matchfilter['clientPortalId'] = { $in: portalIds };
    }

    // DATE FILTER
    if (dateRange) {
        const { startDate, endDate } = filter;
        const dateFilter = returnDateRange(dateRange, startDate, endDate);

        if (Object.keys(dateFilter).length) {
            matchfilter['createdAt'] = dateFilter;
        }
    }

    return matchfilter;
};

export const getBusinnesPortalPipeline = (matchfilter, mode, kind?) => {

    const match = {
        $match: matchfilter
    }

    const groupById = {
        $group: {
            _id: { clientPortalId: "$clientPortalId" },
            count: { $sum: 1 },
        },
    }

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
    }

    const countByYear = {
        $group: {
            _id: "$_id.year",
            count: { $sum: { $size: "$users" } }
        }
    }

    const countByKind = {
        $group: {
            _id: "$client_portal.kind",
            count: { $sum: "$count" },
        },
    }

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
                    },
                },
            ],
            as: "client_portal",
        },
    }

    const commonUnwind = {
        $unwind: "$client_portal",
    }

    const commonProject = {
        $project: {
            _id: 0,
            [mode]: "$_id",
            count: 1,
        },
    }

    if (mode === "all") {
        return [
            match,
            groupById,
            commonLookup,
            commonUnwind,
            countByKind,
            commonProject
        ]
    }

    if (mode === "year") {
        return [
            match,
            groupByYear,
            commonLookup,
            commonUnwind,
            countByYear,
            commonProject
        ]
    }

    return []
}

export const getBusinessPortalCount = async (pipeline: any[], mode: string | number, subdomain: any) => {
    const businessPortal = await sendClientPortalMessage({
        subdomain,
        isRPC: true,
        action: 'clientPortalUsers.count',
        data: { pipeline },
        defaultValue: []
    })

    if (!businessPortal.length) {
        return []
    }

    if (typeof mode === 'string' && (mode === "all" || mode === "")) {
        return businessPortal
    }

    if (typeof mode === 'number') {
        return businessPortal[mode].count
    }
}