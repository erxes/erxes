import * as dayjs from 'dayjs';
import { KIND_MAP, MEASURE_LABELS, STATUS_LABELS } from './constants';
import { sendCoreMessage } from '../messageBroker';
import * as isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

export const returnDateRange = (
    dateRange: string,
    startDate: Date,
    endDate: Date,
) => {
    const NOW = new Date();

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

export const getIntegrationIds = async (query, models) => {
    const integrations = await models.Integrations.find(query)

    return (integrations || []).map(integration => integration._id)
}

export const buildMatchFilter = async (filter, subdomain, models, field?) => {
    const {
        assignedUserIds,
        closedUserIds,
        respondedUserIds,
        brandIds,
        branchIds,
        departmentIds,
        integrationTypes,
        tagIds,
        status,
        dateRange,
        closedDateRange
    } = filter;

    const matchfilter = {};

    const userFieldType = field || 'assignedUserId'

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

    if (brandIds?.length || integrationTypes?.length) {
        const query = {
            ...(brandIds?.length && { brandId: { $in: brandIds } }),
            ...(integrationTypes?.length && { kind: { $in: integrationTypes } })
        }

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

export const buildAction = (measures: string[]): object => {
    const actions = {};

    (measures || []).forEach((measure) => {
        switch (measure) {
            case 'count':
                actions[measure] = { $sum: 1 };
                break;
            case 'averageResponseTime':
                actions[measure] = {
                    $push: {
                        firstRespondedDate: "$firstRespondedDate",
                        createdAt: "$createdAt",
                    }
                };
                break;
            case 'averageCloseTime':
                actions[measure] = {
                    $push: {
                        closedAt: "$closedAt",
                        createdAt: "$createdAt",
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

export const getDimensionPipeline = async (filter, subdomain, models) => {
    const { dimension, measure, colDimension, rowDimension, frequencyType = '%m', sortBy, userType } = filter

    let dimensions

    if (colDimension?.length || rowDimension?.length) {
        dimensions = [...colDimension.map(col => col.value), ...rowDimension.map(row => row.value)]
    } else {
        dimensions = Array.isArray(dimension) ? dimension : dimension?.split(",") || []
    }

    const measures = Array.isArray(measure) ? measure : measure?.split(",") || []

    const pipeline: any[] = [];

    const matchFilter = await buildMatchFilter(filter, subdomain, models, userType)

    if (dimensions?.includes('tag')) {
        pipeline.push({
            $unwind: "$tagIds"
        })
    }

    if (dimensions?.includes('channel')) {
        pipeline.push(
            {
                $lookup: {
                    from: "channels",
                    localField: "integrationId",
                    foreignField: "integrationIds",
                    as: "channel"
                }
            },
            {
                $unwind: "$channel"
            }
        )
    }

    if (dimensions?.includes('brand') || dimensions?.includes('source')) {
        pipeline.push(
            {
                $lookup: {
                    from: "integrations",
                    localField: "integrationId",
                    foreignField: "_id",
                    as: "integration"
                }
            },
            {
                $unwind: "$integration"
            }
        )
    }

    if (dimensions?.includes('branch') || dimensions?.includes('department')) {

        const currentUserType = userType || 'assignedUserId'

        pipeline.push(
            {
                $lookup: {
                    from: "users",
                    let: { userId: `$${currentUserType}` },
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
            }
        )
    }

    if (dimensions?.includes('branch')) {
        pipeline.push({
            $unwind: "$user.branchIds"
        })
    }

    if (dimensions?.includes('department')) {
        pipeline.push({
            $unwind: "$user.departmentIds"
        })
    }

    const matchStage = {};

    if ((dimensions || []).includes('source')) {
        matchStage['integrationId'] = { $ne: null };
    }

    if ((dimensions || []).includes('frequency')) {
        matchStage['createdAt'] = { $ne: null };
    }

    if ((dimensions || []).includes('assignedTo')) {
        matchStage['assignedUserId'] = { $ne: null };
    }

    if ((dimensions || []).includes('resolvedBy')) {
        matchStage['closedUserId'] = { $ne: null };
    }

    if ((dimensions || []).includes('firstRespondedBy')) {
        matchStage['firstRespondedUserId'] = { $ne: null };
    }

    if (dimensions.includes("createdAt") || measures?.includes('averageCloseTime') || measures?.includes('averageResponseTime')) {
        matchStage["createdAt"] = { $ne: null }
    }

    if (dimensions.includes("updatedAt")) {
        matchStage["updatedAt"] = { $ne: null }
    }

    if (dimensions.includes("closedAt") || measures?.includes('averageCloseTime')) {
        matchStage["closedAt"] = { $ne: null }
    }

    if (dimensions.includes("firstRespondedAt") || measures?.includes('averageResponseTime')) {
        matchStage["firstRespondedDate"] = { $ne: null }
    }

    if (dimensions.includes("content")) {
        matchStage["content"] = { $nin: [null, ""] }
    }

    if (dimensions.includes("messageCount")) {
        matchStage["messageCount"] = { $ne: null }
    }

    pipeline.push({
        $match: { ...matchStage, ...matchFilter }
    });

    const groupStage: any = {
        $group: {
            _id: {},
            ...buildAction(measures),
        },
    };

    if ((dimensions || []).includes('source')) {
        groupStage.$group._id['source'] = '$integration.kind';
    }

    if ((dimensions || []).includes('tag')) {
        groupStage.$group._id['tag'] = '$tagIds';
    }

    if ((dimensions || []).includes('branch')) {
        groupStage.$group._id['branch'] = '$user.branchIds';
    }

    if ((dimensions || []).includes('department')) {
        groupStage.$group._id['department'] = '$user.departmentIds';
    }

    if ((dimensions || []).includes('status')) {
        groupStage.$group._id['status'] = '$status';
    }

    if ((dimensions || []).includes('assignedTo')) {
        groupStage.$group._id['assignedTo'] = '$assignedUserId';
    }

    if ((dimensions || []).includes('resolvedBy')) {
        groupStage.$group._id['resolvedBy'] = '$closedUserId';
    }

    if ((dimensions || []).includes('firstRespondedBy')) {
        groupStage.$group._id['firstRespondedBy'] = '$firstRespondedUserId';
    }

    if (dimensions.includes("createdAt")) {
        groupStage.$group._id["createdAt"] = "$createdAt"
    }

    if (dimensions.includes("updatedAt")) {
        groupStage.$group._id["updatedAt"] = "$updatedAt"
    }

    if (dimensions.includes("closedAt")) {
        groupStage.$group._id["closedAt"] = "$closedAt"
    }

    if (dimensions.includes("firstRespondedAt")) {
        groupStage.$group._id["firstRespondedAt"] = "$firstRespondedDate"
    }

    if (dimensions.includes("content")) {
        groupStage.$group._id["content"] = "$content"
    }

    if (dimensions.includes("messageCount")) {
        groupStage.$group._id["messageCount"] = "$messageCount"
    }

    if (dimensions.includes("channel")) {
        groupStage.$group._id["channel"] = "$channel._id"
        groupStage.$group["channel"] = { $first: "$channel" }
    }

    if (dimensions.includes("brand")) {
        groupStage.$group._id["brand"] = "$integration.brandId"
    }

    if ((dimensions || []).includes('frequency')) {
        groupStage.$group._id['frequency'] = {
            $dateToString: {
                format: `${frequencyType}`,
                date: '$createdAt',
            },
        };
    }

    pipeline.push(groupStage);

    if ((dimensions || []).includes('tag')) {
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

    if ((dimensions || []).includes('brand')) {
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

    if ((dimensions || []).includes('branch')) {
        pipeline.push({
            $lookup: {
                from: "branches",
                localField: "_id.branch",
                foreignField: "_id",
                as: "branch"
            }
        },
            {
                $unwind: "$branch"
            })
    }

    if ((dimensions || []).includes('department')) {
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

    if ((dimensions || []).includes('assignedTo')) {
        pipeline.push({
            $lookup: {
                from: "users",
                let: { assignedTo: "$_id.assignedTo" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$_id", "$$assignedTo"] }, isActive: true } }
                ],
                as: "assignedUser"
            }
        }, { $unwind: "$assignedUser" })

        if (measures?.includes('averageResponseTime') || measures?.includes('averageCloseTime')) {
            pipeline.push({
                $lookup: {
                    from: "departments",
                    localField: "assignedUser.departmentIds",
                    foreignField: "_id",
                    as: "assignedUserDepartments"
                }
            })
        }
    }

    if ((dimensions || []).includes('resolvedBy')) {
        pipeline.push({
            $lookup: {
                from: "users",
                let: { resolvedBy: "$_id.resolvedBy" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$_id", "$$resolvedBy"] }, isActive: true } }
                ],
                as: "resolvedUser"
            }
        }, { $unwind: "$resolvedUser" })

        if (measures?.includes('averageResponseTime') || measures?.includes('averageCloseTime')) {
            pipeline.push({
                $lookup: {
                    from: "departments",
                    localField: "resolvedUser.departmentIds",
                    foreignField: "_id",
                    as: "resolvedUserDepartments"
                }
            })
        }
    }

    if ((dimensions || []).includes('firstRespondedBy')) {
        pipeline.push({
            $lookup: {
                from: "users",
                let: { firstRespondedBy: "$_id.firstRespondedBy" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$_id", "$$firstRespondedBy"] }, isActive: true } }
                ],
                as: "firstRespondedUser"
            }
        }, { $unwind: "$firstRespondedUser" })

        if (measures?.includes('averageResponseTime') || measures?.includes('averageCloseTime')) {
            pipeline.push({
                $lookup: {
                    from: "departments",
                    localField: "firstRespondedUser.departmentIds",
                    foreignField: "_id",
                    as: "firstRespondedUserDepartments"
                }
            })
        }
    }

    let workHours: any[] = []

    const projectStage = {
        $project: {
            _id: 0,
        },
    };

    (measures || []).forEach((measure) => {
        projectStage.$project[measure] = 1;
    });

    if ((dimensions || []).includes('tag')) {
        projectStage.$project['tag'] = '$tag.name';
    }

    if ((dimensions || []).includes('channel')) {
        projectStage.$project['channel'] = '$channel.name';
    }

    if ((dimensions || []).includes('brand')) {
        projectStage.$project['brand'] = "$brand.name";
    }

    if ((dimensions || []).includes('branch')) {
        projectStage.$project['branch'] = "$branch.title";
    }

    if ((dimensions || []).includes('department')) {
        projectStage.$project['department'] = "$department.title";
        workHours.push({ $ifNull: [["$department.workhours"], []] });
    }

    if ((dimensions || []).includes('source')) {
        projectStage.$project['source'] = '$_id.source';
    }

    if ((dimensions || []).includes('status')) {
        projectStage.$project['status'] = '$_id.status';
    }

    if ((dimensions || []).includes('content')) {
        projectStage.$project['content'] = '$_id.content';
    }

    if ((dimensions || []).includes('messageCount')) {
        projectStage.$project['messageCount'] = '$_id.messageCount';
    }

    if (dimensions.includes("frequency")) {
        projectStage.$project['frequency'] = "$_id.frequency";
    }

    if (dimensions.includes("assignedTo")) {
        projectStage.$project['assignedTo'] = "$assignedUser";
        workHours.push({ $ifNull: ["$assignedUserDepartments.workhours", []] });
    }

    if (dimensions.includes("resolvedBy")) {
        projectStage.$project['resolvedBy'] = "$resolvedUser";
        workHours.push({ $ifNull: ["$resolvedUserDepartments.workhours", []] });
    }

    if (dimensions.includes("firstRespondedBy")) {
        projectStage.$project['firstRespondedBy'] = "$firstRespondedUser"
        workHours.push({ $ifNull: ["$firstRespondedUserDepartments.workhours", []] });
    }

    if (dimensions.includes("createdAt")) {
        projectStage.$project["createdAt"] = "$_id.createdAt"
    }

    if (dimensions.includes("updatedAt")) {
        projectStage.$project["updatedAt"] = "$_id.updatedAt"
    }

    if (dimensions.includes("closedAt")) {
        projectStage.$project["closedAt"] = "$_id.closedAt"
    }

    if (dimensions.includes("firstRespondedAt")) {
        projectStage.$project["firstRespondedAt"] = "$_id.firstRespondedAt"
    }

    if (workHours.length > 0) {
        projectStage.$project['workHours'] = { $setUnion: { $concatArrays: workHours } }
    }

    pipeline.push(projectStage)

    if (sortBy?.length) {
        const sortFields = (sortBy || []).reduce((acc, { field, direction }) => {
            acc[field] = direction;
            return acc;
        }, {});

        pipeline.push({ $sort: sortFields });
    }

    return pipeline
}

export const calculateAverage = (arr: number[]) => {
    if (!arr || !arr.length) {
        return 0; // Handle division by zero for an empty array
    }

    const sum = arr.reduce((acc, curr) => acc + curr, 0);
    return (sum / arr.length);
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

export const isWeekday = (date) => {
    const day = date.getDay();
    return day !== 0 && day !== 6; // 0 = Sunday, 6 = Saturday
}

const workSchedules = new Map();

export const calculateBusinessDuration = (start, end, workHour) => {
    if (!workHour) {
        return end.diff(start);
    }

    const cacheKey = `${start}-${end}-${JSON.stringify(workHour)}`;
    if (workSchedules.has(cacheKey)) {
        return workSchedules.get(cacheKey);
    }

    const daySchedules = new Map();
    const startTime = start.startOf('day');
    const endTime = end.endOf('day');
    const daysDiff = endTime.diff(startTime, 'days');

    for (const [day, schedule] of Object.entries(workHour) as any) {
        if (!schedule.inactive) {
            const [startHour, startMin] = schedule.startFrom.split(':').map(Number);
            const [endHour, endMin] = schedule.endTo.split(':').map(Number);
            const [lunchStartHour, lunchStartMin] = schedule.lunchStartFrom.split(':').map(Number);
            const [lunchEndHour, lunchEndMin] = schedule.lunchEndTo.split(':').map(Number);

            const workStart = startHour * 60 + startMin;
            const workEnd = endHour * 60 + endMin;
            const lunchStart = lunchStartHour * 60 + lunchStartMin;
            const lunchEnd = lunchEndHour * 60 + lunchEndMin;

            const workingMinutes = (workEnd - workStart) - (lunchEnd - lunchStart);
            daySchedules.set(day, workingMinutes * 60 * 1000);
        }
    }

    let totalMilliseconds = 0;
    let currentDay = start.clone();

    for (let i = 0; i <= daysDiff; i++) {
        const dayOfWeek = currentDay.format('dddd');
        const dailyMilliseconds = daySchedules.get(dayOfWeek);

        if (dailyMilliseconds) {
            if (i === 0) {
                const dayStart = currentDay.clone().startOf('day');
                const validStart = dayStart.add(workHour[dayOfWeek].startFrom);
                if (start.isAfter(validStart)) {
                    const reduction = start.diff(validStart);
                    totalMilliseconds += Math.max(0, dailyMilliseconds - reduction);
                } else {
                    totalMilliseconds += dailyMilliseconds;
                }
            }
            else if (i === daysDiff) {
                const dayEnd = currentDay.clone().endOf('day');
                const validEnd = dayEnd.subtract(workHour[dayOfWeek].endTo);
                if (end.isBefore(validEnd)) {
                    const reduction = validEnd.diff(end);
                    totalMilliseconds += Math.max(0, dailyMilliseconds - reduction);
                } else {
                    totalMilliseconds += dailyMilliseconds;
                }
            }
            else {
                totalMilliseconds += dailyMilliseconds;
            }
        }

        currentDay = currentDay.add(1, 'day');
    }

    workSchedules.set(cacheKey, totalMilliseconds);
    return totalMilliseconds;
};

export const extractWorkHours = (workHours: any) => {

    if (!workHours?.length || workHours.every(workhour => workhour === null)) return;

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const result = {} as Record<string, any>;

    const schedules = workHours.filter(Boolean);

    for (const day of days) {
        const daySchedules = schedules
            .map(schedule => schedule[day])
            .filter(Boolean);

        if (!daySchedules.length || daySchedules.every(schedule => schedule.inactive)) {
            result[day] = { inactive: true };
            continue;
        }

        const activeSchedules = daySchedules.filter(schedule => !schedule.inactive);
        const firstActive = activeSchedules[0];

        result[day] = {
            startFrom: activeSchedules.reduce((earliest, current) =>
                !current.startFrom ? earliest :
                    !earliest ? current.startFrom :
                        current.startFrom < earliest ? current.startFrom : earliest
                , null),
            endTo: activeSchedules.reduce((latest, current) =>
                !current.endTo ? latest :
                    !latest ? current.endTo :
                        current.endTo > latest ? current.endTo : latest
                , null),
            lunchStartFrom: firstActive?.lunchStartFrom,
            lunchEndTo: firstActive?.lunchEndTo
        };
    }

    return result;
};

export const formatData = (data, filter) => {

    const { dateRange, startDate, endDate, frequencyType } = filter

    const dateCache = new Map();

    const parseDate = (dateStr) => {
        if (!dateCache.has(dateStr)) {
            dateCache.set(dateStr, dayjs(dateStr));
        }
        return dateCache.get(dateStr);
    };

    const formattedData = [...data]

    formattedData.forEach((item) => {

        if (item.hasOwnProperty('frequency')) {
            const frequency = item['frequency']

            const formatData = frequencyType || buildFormatType(dateRange, startDate, endDate)

            item['frequency'] = formatFrequency(formatData, frequency)
        }

        if (item.hasOwnProperty('status')) {
            const status = item['status']

            item['status'] = STATUS_LABELS[status] || item['status']
        }

        if (item.hasOwnProperty('source')) {
            const source = item['source']

            item['source'] = KIND_MAP[source] || item['source']
        }

        ['assignedTo', 'resolvedBy', 'firstRespondedBy'].forEach(key => {
            if (item.hasOwnProperty(key)) {
                const user = item[key]

                if (user) {
                    item[key] = user.details?.fullName
                        || (user.details?.firstName && user.details?.lastName ? `${user.details.firstName} ${user.details.lastName}` : null)
                        || user.email
                        || user.PrimaryEmail
                        || user.PrimaryPhone
                        || "-"
                }
            }
        });

        ['createdAt', 'updatedAt', 'closedAt', 'firstRespondedAt'].forEach(key => {
            if (item.hasOwnProperty(key)) {
                const date = item[key]
                item[key] = dayjs(date).format('YYYY/MM/DD h:mm A')
            }
        });

        ["averageResponseTime", "averageCloseTime"].forEach(key => {
            if (item[key]?.length > 0) {

                const { workHours } = item

                const workHour = extractWorkHours(workHours)

                const chunkSize = 100;
                let total = 0;

                for (let i = 0; i < item[key].length; i += chunkSize) {
                    const chunk = item[key].slice(i, i + chunkSize);

                    const chunkTotal = chunk.reduce((acc, range) => {
                        const createdTime = parseDate(range.createdAt);
                        const resolvedTime = parseDate(range.closedAt || range.firstRespondedDate);
                        return acc + calculateBusinessDuration(createdTime, resolvedTime, workHour);
                    }, 0);

                    total += chunkTotal;
                }

                item[MEASURE_LABELS[key]] = total / item[key].length || 0;
                delete item[key];
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