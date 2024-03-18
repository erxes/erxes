
import { IModels, generateModels } from './connectionResolver';
import {
    sendCoreMessage,
    sendTagsMessage,
    sendFormsMessage,
} from './messageBroker';
import * as dayjs from 'dayjs';

const NOW = new Date();

const DATE_RANGE_TYPES = [
    { label: 'All time', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'This Week', value: 'thisWeek' },
    { label: 'Last Week', value: 'lastWeek' },
    { label: 'This Month', value: 'thisMonth' },
    { label: 'Last Month', value: 'lastMonth' },
    { label: 'This Year', value: 'thisYear' },
    { label: 'Last Year', value: 'lastYear' },
    { label: 'Custom Date', value: 'customDate' },
];

const PROBABILITY_TICKET = [
    { label: '10%', value: '10' },
    { label: '20%', value: '20' },
    { label: '30%', value: '30' },
    { label: '40%', value: '40' },
    { label: '50%', value: '50' },
    { label: '60%', value: '60' },
    { label: '70%', value: '70' },
    { label: '80%', value: '80' },
    { label: '90%', value: '90' },
    { label: 'Resolved', value: 'Resolved' },
];

const PRIORITY = [
    { label: 'Critical', value: 'Critical' },
    { label: 'High', value: 'high' },
    { label: 'Medium', value: 'medium' },
    { label: 'Low', value: 'low' },
];
const PIPELINE_TYPE_TICKET = 'ticket';

const reportTemplates = [
    {
        serviceType: 'ticket',
        title: 'Tickets chart',
        serviceName: 'tickets',
        description: 'Tickets conversation charts',
        charts: [
            'TicketCustomProperties',
            'TicketAverageTimeToCloseOverTime',
            'TicketClosedTotalsByRep',
            'TicketTotalsByStatus',
            'TicketTotalsByLabelPriorityTag',
            'TicketTotalsOverTime',
            'TicketAverageTimeToCloseByRep',
            'TicketAverageTimeToClose',
            'TicketTotalsBySource',
            'TicketsCardCountAssignedUser',
            'TicketsStageDateRange',
        ],
        img: 'https://sciter.com/wp-content/uploads/2022/08/chart-js.png',
    },
];

const chartTemplates = [
    {
        templateType: 'TicketCustomProperties',
        name: 'Ticket Custom Properties',
        chartTypes: [
            'bar',
            'line',
            'pie',
            'doughnut',
            'radar',
            'polarArea',
            'table',
        ],
        // Bar Chart Table
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string,
        ) => {
            const { pipelineId, boardId, stageId, stageType } = filter;
            const matchedFilter = await filterData(filter);
            const filterPipelineId = await PipelineAndBoardFilter(
                pipelineId,
                boardId,
                stageId,
                stageType,
                // //PIPELINE_TYPE_DEAL,
                'deal',
                models,
            );
            const customFieldsDataFilter = filter.fieldsGroups;

            const title: string = 'Ticket Custom Properties';
            let query = await QueryFilter(filterPipelineId, matchedFilter);

            const ticket = await models?.Tickets.find({
                ...query,
            }).lean();

            if (ticket) {
                const idCounts = {};
                ticket.forEach((ticketItem) => {
                    ticketItem.customFieldsData.forEach((fieldData) => {
                        if (fieldData.value && Array.isArray(fieldData.value)) {
                            fieldData.value.forEach((obj) => {
                                const id = Object.keys(obj)[0];
                                idCounts[id] = (idCounts[id] || 0) + 1;
                            });
                        }
                    });
                });

                const fields = Object.keys(idCounts).map((id) => ({
                    _id: id,
                    count: idCounts[id],
                }));
                const customProperty = fields.map((result) => result._id);

                let customField;
                if (customFieldsDataFilter) {
                    customField = customFieldsDataFilter;
                } else {
                    customField = customProperty;
                }

                const fieldsGroups = await sendFormsMessage({
                    subdomain,
                    action: 'fields.find',
                    data: {
                        query: {
                            _id: {
                                $in: customField,
                            },
                        },
                    },
                    isRPC: true,
                });

                let result = fieldsGroups.map((field) => {
                    let correspondingData = fields.find((item) => item._id === field._id);
                    if (correspondingData) {
                        return {
                            _id: correspondingData._id,
                            label: field.text,
                            count: correspondingData.count,
                        };
                    }

                    return null; // Handle if no corresponding data is found
                });

                result.sort((a, b) => a.count - b.count);

                const data: number[] = result.map((item) => item.count);
                const labels: string[] = result.map((item) => item.label);

                const datasets = {
                    title,
                    data,
                    labels,
                };
                return datasets;
            } else {
                const datasets = {
                    title,
                    data: [],
                    labels: [],
                };
                return datasets;
            }
        },
        filterTypes: [
            {
                fieldName: 'dateRange',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'date',
                fieldOptions: DATE_RANGE_TYPES,
                fieldLabel: 'Select date range',
                fieldDefaultValue: 'all',
            },
            {
                fieldName: 'branchIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'branches',
                fieldLabel: 'Select branches',
            },
            {
                fieldName: 'departmentIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'departments',
                fieldLabel: 'Select departments',
            },
            {
                fieldName: 'boardId',
                fieldType: 'select',
                fieldQuery: 'boards',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,
                fieldLabel: 'Select a board',
            },
            {
                fieldName: 'pipelineId',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'pipelines',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,
                logics: [
                    {
                        logicFieldName: 'boardId',
                        logicFieldVariable: 'boardId',
                    },
                ],
                fieldLabel: 'Select pipeline',
            },
            {
                fieldName: 'stageId',
                fieldType: 'select',
                fieldQuery: 'stages',
                multi: false,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                logics: [
                    {
                        logicFieldName: 'pipelineId',
                        logicFieldVariable: 'pipelineId',
                    },
                ],
                fieldLabel: 'Select stage',
            },
            {
                fieldName: 'stageType',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'stages',
                fieldOptions: PROBABILITY_TICKET,
                fieldLabel: 'Select Probability',
            },
            {
                fieldName: 'priority',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'stages',
                fieldOptions: PRIORITY,
                fieldLabel: 'Select Stage priority',
            },
            {
                fieldName: 'contentType',
                fieldType: 'select',
                fieldQuery: 'fieldsGetTypes',
                fieldValueVariable: 'contentType',
                fieldLabelVariable: 'description',
                multi: false,
                fieldLabel: 'Select properties type ',
            },
            {
                fieldName: 'fieldsGroups',
                fieldType: 'groups',
                fieldQuery: 'fieldsGroups',
                fieldValueVariable: 'fields',
                fieldLabelVariable: 'name',
                logics: [
                    {
                        logicFieldName: 'contentType',
                        logicFieldVariable: 'contentType',
                    },
                ],
                multi: true,
                fieldLabel: 'Select custom properties',
            },
        ],
    },
    {
        templateType: 'TicketsStageDateRange',
        name: 'Tickets Stage Date Range',
        chartTypes: [
            'bar',
            'line',
            'pie',
            'doughnut',
            'radar',
            'polarArea',
            'table',
        ],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string,
        ) => {
            const selectedUserIds = filter.assignedUserIds || [];
            const matchedFilter = await filterData(filter);
            const { pipelineId, boardId, stageId, stageType } = filter;
            const filterPipelineId = await PipelineAndBoardFilter(
                pipelineId,
                boardId,
                stageType,
                stageId,
                //PIPELINE_TYPE_DEAL,
                'deal',
                models,
            );
            let query = await QueryFilter(filterPipelineId, matchedFilter);

            let ticketCounts = await models?.Tickets.find({
                ...query,
            }).lean();

            if (ticketCounts) {
                const data = await Promise.all(
                    ticketCounts.map(async (item) => {
                        const getTotalRespondedUsers = await sendCoreMessage({
                            subdomain,
                            action: 'users.find',
                            data: {
                                query: {
                                    _id:
                                        selectedUserIds.length > 0
                                            ? { $in: selectedUserIds }
                                            : { $in: item.assignedUserIds },
                                },
                            },
                            isRPC: true,
                            defaultValue: [],
                        });

                        const processedUsers = await Promise.all(
                            getTotalRespondedUsers.map(async (user) => {
                                const fullName = user.details?.fullName || user.email;
                                const counts = await models?.Tickets.countDocuments({
                                    status: 'active',
                                    assignedUserIds: user._id,
                                });
                                return {
                                    FullName: fullName,
                                    _id: user._id,
                                    count: counts || 0,
                                };
                            }),
                        );

                        // Flatten the array of arrays and remove duplicates based on _id
                        const uniqueData = processedUsers.reduce((acc, val) => {
                            acc[val._id] = val;
                            return acc;
                        }, {});

                        return Object.values(uniqueData);
                    }),
                );

                const filteredData = data.filter((arr) => arr.length > 0);
                const uniqueUserEntries = Array.from(
                    new Set(filteredData.map((entry) => JSON.stringify(entry))),
                    (str) => JSON.parse(str),
                );

                const summedResultArray =
                    await sumCountsByUserIdName(uniqueUserEntries);
                const filteredResult =
                    selectedUserIds.length > 0
                        ? summedResultArray.filter((user) =>
                            selectedUserIds.includes(user._id),
                        )
                        : summedResultArray;

                filteredResult.sort((a, b) => a.count - b.count);

                // Extract sorted data and labels
                const setData = filteredResult.map((item: any) => item.count);
                const setLabels = filteredResult.map((item: any) => item.fullName);

                const title = 'Tickets Stage Date Range';
                const datasets = { title, data: setData, labels: setLabels };
                return datasets;
            } else {
                throw new Error('No dealCounts found');
            }
        },

        filterTypes: [
            {
                fieldName: 'dateRange',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'date',
                fieldOptions: DATE_RANGE_TYPES,
                fieldLabel: 'Select date range',
                fieldDefaultValue: 'all',
            },
            {
                fieldName: 'branchIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'branches',
                fieldLabel: 'Select branches',
            },
            {
                fieldName: 'departmentIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'departments',
                fieldLabel: 'Select departments',
            },
            {
                fieldName: 'boardId',
                fieldType: 'select',
                fieldQuery: 'boards',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,

                fieldLabel: 'Select boards',
            },
            {
                fieldName: 'pipelineId',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'pipelines',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,
                logics: [
                    {
                        logicFieldName: 'boardId',
                        logicFieldVariable: 'boardId',
                    },
                ],
                fieldLabel: 'Select pipeline',
            },
            {
                fieldName: 'stageId',
                fieldType: 'select',
                fieldQuery: 'stages',
                multi: false,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                logics: [
                    {
                        logicFieldName: 'pipelineId',
                        logicFieldVariable: 'pipelineId',
                    },
                ],
                fieldLabel: 'Select stage',
            },
            {
                fieldName: 'stageType',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'stages',
                fieldOptions: PROBABILITY_TICKET,
                fieldLabel: 'Select Probability',
            },
            {
                fieldName: 'priority',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'stages',
                fieldOptions: PRIORITY,
                fieldLabel: 'Select Stage priority',
            },
        ],
    },
    {
        templateType: 'TicketsCardCountAssignedUser',
        name: 'Tickets Count and  Assigned User',
        chartTypes: [
            'bar',
            'line',
            'pie',
            'doughnut',
            'radar',
            'polarArea',
            'table',
        ],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string,
        ) => {
            const selectedUserIds = filter.assignedUserIds || [];
            const matchedFilter = await filterData(filter);
            const { pipelineId, boardId, stageId, stageType } = filter;
            const filterPipelineId = await PipelineAndBoardFilter(
                pipelineId,
                boardId,
                stageType,
                stageId,
                //PIPELINE_TYPE_DEAL,
                'deal',
                models,
            );
            let query = await QueryFilter(filterPipelineId, matchedFilter);

            let tickedCounts = await models?.Tickets.find({
                ...query,
            }).lean();

            if (tickedCounts) {
                const data = await Promise.all(
                    tickedCounts.map(async (item) => {
                        const getTotalRespondedUsers = await sendCoreMessage({
                            subdomain,
                            action: 'users.find',
                            data: {
                                query: {
                                    _id:
                                        selectedUserIds.length > 0
                                            ? { $in: selectedUserIds }
                                            : { $in: item.assignedUserIds },
                                },
                            },
                            isRPC: true,
                            defaultValue: [],
                        });

                        const processedUsers = await Promise.all(
                            getTotalRespondedUsers.map(async (user) => {
                                const fullName = user.details?.fullName || user.email;
                                const counts = await models?.Tickets.countDocuments({
                                    status: 'active',
                                    assignedUserIds: user._id,
                                });
                                return {
                                    FullName: fullName,
                                    _id: user._id,
                                    count: counts || 0,
                                };
                            }),
                        );

                        // Flatten the array of arrays and remove duplicates based on _id
                        const uniqueData = processedUsers.reduce((acc, val) => {
                            acc[val._id] = val;
                            return acc;
                        }, {});

                        return Object.values(uniqueData);
                    }),
                );

                const filteredData = data.filter((arr) => arr.length > 0);
                const uniqueUserEntries = Array.from(
                    new Set(filteredData.map((entry) => JSON.stringify(entry))),
                    (str) => JSON.parse(str),
                );

                const summedResultArray =
                    await sumCountsByUserIdName(uniqueUserEntries);
                const filteredResult =
                    selectedUserIds.length > 0
                        ? summedResultArray.filter((user) =>
                            selectedUserIds.includes(user._id),
                        )
                        : summedResultArray;

                filteredResult.sort((a, b) => a.count - b.count);

                // Extract sorted data and labels
                const setData = filteredResult.map((item: any) => item.count);
                const setLabels = filteredResult.map((item: any) => item.fullName);

                const title = 'Tickets Count and  Assigned User';
                const datasets = { title, data: setData, labels: setLabels };
                return datasets;
            } else {
                throw new Error('No dealCounts found');
            }
        },

        filterTypes: [
            {
                fieldName: 'assignedUserIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'users',
                fieldLabel: 'Select assigned users',
            },
            {
                fieldName: 'dateRange',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'date',
                fieldOptions: DATE_RANGE_TYPES,
                fieldLabel: 'Select date range',
                fieldDefaultValue: 'all',
            },
            {
                fieldName: 'branchIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'branches',
                fieldLabel: 'Select branches',
            },
            {
                fieldName: 'departmentIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'departments',
                fieldLabel: 'Select departments',
            },
            {
                fieldName: 'boardId',
                fieldType: 'select',
                fieldQuery: 'boards',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,
                fieldLabel: 'Select boards',
            },
            {
                fieldName: 'pipelineId',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'pipelines',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,
                logics: [
                    {
                        logicFieldName: 'boardId',
                        logicFieldVariable: 'boardId',
                    },
                ],
                fieldLabel: 'Select pipeline',
            },
            {
                fieldName: 'stageId',
                fieldType: 'select',
                fieldQuery: 'stages',
                multi: false,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                logics: [
                    {
                        logicFieldName: 'pipelineId',
                        logicFieldVariable: 'pipelineId',
                    },
                ],
                fieldLabel: 'Select stage',
            },
            {
                fieldName: 'stageType',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'stages',
                fieldOptions: PROBABILITY_TICKET,
                fieldLabel: 'Select Probability',
            },
            {
                fieldName: 'priority',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'stages',
                fieldOptions: PRIORITY,
                fieldLabel: 'Select Stage priority',
            },
        ],
    },

    {
        templateType: 'TicketAverageTimeToCloseOverTime',
        name: 'Ticket average time to close over time',
        chartTypes: [
            'bar',
            'line',
            'pie',
            'doughnut',
            'radar',
            'polarArea',
            'table',
        ],
        // Bar Chart Table
        getChartResult: async (
            filter: any,
            models: IModels,
            dimension: any,
            subdomain: string,
        ) => {
            const { pipelineId, boardId, stageId, stageType } = filter;
            const matchedFilter = await filterData(filter);
            const filterPipelineId = await PipelineAndBoardFilter(
                pipelineId,
                boardId,
                stageType,
                stageId,
                PIPELINE_TYPE_TICKET,
                models,
            );
            let query = await QueryFilter(filterPipelineId, matchedFilter);
            const ticket = await models?.Tickets.find({
                ...query,
            }).lean();
            if (!ticket || ticket.length === 0) {
                throw new Error(
                    'No ticket found in the database matching the specified criteria.',
                );
            }

            const title =
                'View the average amount of time it takes your reps to close tickets. See how this tracks over time.';
            const ticketData = await calculateAverageTimeToClose(ticket);

            // Create an array of objects containing both duration and label
            const dataWithLabels = ticketData.map((duration) => {
                const { hours, minutes, seconds } = convertHoursToHMS(duration);
                const label = `${hours}h ${minutes}m ${seconds}s`;
                return { duration, label };
            });

            // Sort the array based on duration
            dataWithLabels.sort((a, b) => a.duration - b.duration);

            // Extract sorted labels and durations
            const labels = dataWithLabels.map((entry) => entry.label);
            const sortedTicketData = dataWithLabels.map((entry) => entry.duration);

            const datasets = { title, ticketData: sortedTicketData, labels };

            return datasets;
        },
        filterTypes: [
            {
                fieldName: 'assignedUserIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'users',
                fieldLabel: 'Select assigned users',
            },
            {
                fieldName: 'dateRange',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'date',
                fieldOptions: DATE_RANGE_TYPES,
                fieldLabel: 'Select date range',
                fieldDefaultValue: 'all',
            },
            {
                fieldName: 'branchIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'branches',
                fieldLabel: 'Select branches',
            },
            {
                fieldName: 'departmentIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'departments',
                fieldLabel: 'Select departments',
            },
            {
                fieldName: 'boardId',
                fieldType: 'select',
                fieldQuery: 'boards',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,
                fieldLabel: 'Select boards',
            },
            {
                fieldName: 'pipelineId',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'pipelines',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,
                logics: [
                    {
                        logicFieldName: 'boardId',
                        logicFieldVariable: 'boardId',
                    },
                ],
                fieldLabel: 'Select pipeline',
            },
            {
                fieldName: 'stageId',
                fieldType: 'select',
                fieldQuery: 'stages',
                multi: false,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                logics: [
                    {
                        logicFieldName: 'pipelineId',
                        logicFieldVariable: 'pipelineId',
                    },
                ],
                fieldLabel: 'Select stage',
            },
            {
                fieldName: 'stageType',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'stages',
                fieldOptions: PROBABILITY_TICKET,
                fieldLabel: 'Select Probability',
            },
            {
                fieldName: 'priority',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'stages',
                fieldOptions: PRIORITY,
                fieldLabel: 'Select Stage priority',
            },
        ],
    },

    {
        templateType: 'TicketClosedTotalsByRep',
        name: 'Ticket closed totals by rep',
        chartTypes: [
            'bar',
            'line',
            'pie',
            'doughnut',
            'radar',
            'polarArea',
            'table',
        ],
        // Bar Chart Table
        getChartResult: async (
            filter: any,
            models: IModels,
            dimension: any,
            subdomain: string,
        ) => {
            const { pipelineId, boardId, stageId, stageType } = filter;
            const matchedFilter = await filterData(filter);
            const filterPipelineId = await PipelineAndBoardFilter(
                pipelineId,
                boardId,
                stageType,
                stageId,
                PIPELINE_TYPE_TICKET,
                models,
            );
            let query = await QueryFilter(filterPipelineId, matchedFilter);

            const selectedUserIds = filter.assignedUserIds || [];
            const tickets = await models?.Tickets.find({
                ...query,
            }).lean();

            // Calculate ticket counts
            const ticketCounts = calculateTicketCounts(tickets, selectedUserIds);
            // Convert the counts object to an array of objects with ownerId and count
            const countsArray = Object.entries(ticketCounts).map(
                // tslint:disable-next-line:no-shadowed-variable
                ([ownerId, count]) => ({
                    ownerId,
                    count,
                }),
            );

            // Sort the array based on ticket counts

            // Extract unique ownerIds for user lookup
            const ownerIds = countsArray.map((item) => item.ownerId);

            // Fetch information about assigned users
            const getTotalAssignedUsers = await sendCoreMessage({
                subdomain,
                action: 'users.find',
                data: {
                    query: { _id: { $in: ownerIds } },
                },
                isRPC: true,
                defaultValue: [],
            });
            // Create a map for faster user lookup
            const assignedUsersMap = getTotalAssignedUsers.reduce((acc, user) => {
                acc[user._id] = user.details; // Assuming details contains user information
                return acc;
            }, {});

            const sort = ownerIds.map((ownerId) => {
                const user = assignedUsersMap[ownerId];
                const count = ticketCounts[ownerId];

                // Check if user exists and has a fullName property
                const name = user && user.fullName ? user.fullName : 'Unknown';

                return {
                    name: name,
                    count: count || 0, // Set count to 0 if not found in ticketCounts
                };
            });

            // Sort the array by count in descending order
            sort.sort((a, b) => b.count - a.count);

            const title =
                'View the total number of tickets closed by their assigned owner';

            // Reverse both data and labels arrays to achieve the desired order
            const data = sort.map((t: any) => t.count).reverse();
            const labels = sort.map((t: any) => t.name).reverse();

            const datasets = { title, data, labels };
            return datasets;
        },

        filterTypes: [
            {
                fieldName: 'assignedUserIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'users',
                fieldLabel: 'Select assigned users',
            },
            {
                fieldName: 'dateRange',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'date',
                fieldOptions: DATE_RANGE_TYPES,
                fieldLabel: 'Select date range',
                fieldDefaultValue: 'all',
            },
            {
                fieldName: 'branchIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'branches',
                fieldLabel: 'Select branches',
            },
            {
                fieldName: 'departmentIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'departments',
                fieldLabel: 'Select departments',
            },
            {
                fieldName: 'boardId',
                fieldType: 'select',
                fieldQuery: 'boards',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,
                fieldLabel: 'Select boards',
            },
            {
                fieldName: 'pipelineId',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'pipelines',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,
                logics: [
                    {
                        logicFieldName: 'boardId',
                        logicFieldVariable: 'boardId',
                    },
                ],
                fieldLabel: 'Select pipeline',
            },
            {
                fieldName: 'stageId',
                fieldType: 'select',
                fieldQuery: 'stages',
                multi: false,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                logics: [
                    {
                        logicFieldName: 'pipelineId',
                        logicFieldVariable: 'pipelineId',
                    },
                ],
                fieldLabel: 'Select stage',
            },
            {
                fieldName: 'stageType',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'stages',
                fieldOptions: PROBABILITY_TICKET,
                fieldLabel: 'Select Probability',
            },
            {
                fieldName: 'priority',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'stages',
                fieldOptions: PRIORITY,
                fieldLabel: 'Select Stage priority',
            },
        ],
    },
    {
        templateType: 'TicketTotalsByStatus',
        name: 'Ticket totals by status',
        chartTypes: [
            'bar',
            'line',
            'pie',
            'doughnut',
            'radar',
            'polarArea',
            'table',
        ],
        // Bar Chart Table
        getChartResult: async (
            filter: any,
            models: IModels,
            dimension: any,
            subdomain: string,
        ) => {
            const { pipelineId, boardId, stageId, stageType } = filter;
            const matchedFilter = await filterData(filter);
            const filterPipelineId = await PipelineAndBoardFilter(
                pipelineId,
                boardId,
                stageType,
                stageId,
                PIPELINE_TYPE_TICKET,
                models,
            );
            let query = await QueryFilter(filterPipelineId, matchedFilter);

            const tickets = await models?.Tickets.find({
                ...query,
            }).lean();
            const ticketTotalsByStatus = calculateTicketTotalsByStatus(tickets);

            const countsArray: any[] = Object.entries(ticketTotalsByStatus).map(
                ([status, count]) => ({
                    status,
                    count: count as number, // Ensure count is recognized as a number
                }),
            );
            countsArray.sort((a, b) => b.count - a.count);

            const title =
                'View the total number of tickets in each part of your support queue';
            countsArray.sort((a, b) => b.count - a.count);
            const labels = Object.values(countsArray).map((t: any) => t.status);
            const data = Object.values(countsArray).map((t: any) => t.count);

            const datasets = { title, data, labels };
            return datasets;
        },

        filterTypes: [
            {
                fieldName: 'dateRange',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'date',
                fieldOptions: DATE_RANGE_TYPES,
                fieldLabel: 'Select date range',
                fieldDefaultValue: 'all',
            },
            {
                fieldName: 'branchIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'branches',
                fieldLabel: 'Select branches',
            },
            {
                fieldName: 'departmentIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'departments',
                fieldLabel: 'Select departments',
            },
            {
                fieldName: 'boardId',
                fieldType: 'select',
                fieldQuery: 'boards',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,
                fieldLabel: 'Select boards',
            },
            {
                fieldName: 'pipelineId',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'pipelines',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,
                logics: [
                    {
                        logicFieldName: 'boardId',
                        logicFieldVariable: 'boardId',
                    },
                ],
                fieldLabel: 'Select pipeline',
            },
            {
                fieldName: 'stageId',
                fieldType: 'select',
                fieldQuery: 'stages',
                multi: false,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                logics: [
                    {
                        logicFieldName: 'pipelineId',
                        logicFieldVariable: 'pipelineId',
                    },
                ],
                fieldLabel: 'Select stage',
            },
            {
                fieldName: 'stageType',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'stages',
                fieldOptions: PROBABILITY_TICKET,
                fieldLabel: 'Select Probability',
            },
            {
                fieldName: 'priority',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'stages',
                fieldOptions: PRIORITY,
                fieldLabel: 'Select Stage priority',
            },
        ],
    },

    {
        templateType: 'TicketTotalsOverTime',
        name: 'Ticket totals over time',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],

        // Bar Chart Table
        getChartResult: async (
            filter: any,
            models: IModels,
            dimension: any,
            subdomain: string,
        ) => {
            const { pipelineId, boardId, stageId, stageType } = filter;
            const matchedFilter = await filterData(filter);
            const filterPipelineId = await PipelineAndBoardFilter(
                pipelineId,
                boardId,
                stageType,
                stageId,
                PIPELINE_TYPE_TICKET,
                models,
            );
            let query = await QueryFilter(filterPipelineId, matchedFilter);

            const totalTicked = await models?.Tickets.find({
                ...query,
            }).sort({
                createdAt: -1,
            });

            const monthNames: string[] = [];
            const monthlyTickedCount: number[] = [];

            if (totalTicked) {
                const now = new Date(); // Get the current date
                const startOfYear = new Date(now.getFullYear(), 0, 1); // Get the start of the year
                const endOfYear = new Date(now.getFullYear(), 12, 31); // Get the start of the year
                const endRange = dayjs(
                    new Date(totalTicked.at(-1)?.createdAt || endOfYear),
                );

                let startRange = dayjs(startOfYear);

                while (startRange < endRange) {
                    monthNames.push(startRange.format('MMMM'));

                    const getStartOfNextMonth = startRange.add(1, 'month').toDate();
                    const getTickedCountOfMonth = totalTicked.filter(
                        (ticked) =>
                            new Date(ticked.createdAt || '').getTime() >=
                            startRange.toDate().getTime() &&
                            new Date(ticked.createdAt || '').getTime() <
                            getStartOfNextMonth.getTime(),
                    );
                    monthlyTickedCount.push(getTickedCountOfMonth.length);
                    startRange = startRange.add(1, 'month');
                }
            }
            const label = 'View the total number of tickets created over a set time';
            const datasets = [
                { label, data: monthlyTickedCount, labels: monthNames },
            ];
            return datasets;
        },
        filterTypes: [
            {
                fieldName: 'dateRange',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'date',
                fieldOptions: DATE_RANGE_TYPES,
                fieldLabel: 'Select date range',
                fieldDefaultValue: 'all',
            },
            {
                fieldName: 'branchIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'branches',
                fieldLabel: 'Select branches',
            },
            {
                fieldName: 'departmentIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'departments',
                fieldLabel: 'Select departments',
            },
            {
                fieldName: 'boardId',
                fieldType: 'select',
                fieldQuery: 'boards',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,
                fieldLabel: 'Select boards',
            },
            {
                fieldName: 'pipelineId',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'pipelines',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,
                logics: [
                    {
                        logicFieldName: 'boardId',
                        logicFieldVariable: 'boardId',
                    },
                ],
                fieldLabel: 'Select pipeline',
            },
            {
                fieldName: 'stageId',
                fieldType: 'select',
                fieldQuery: 'stages',
                multi: false,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                logics: [
                    {
                        logicFieldName: 'pipelineId',
                        logicFieldVariable: 'pipelineId',
                    },
                ],
                fieldLabel: 'Select stage',
            },
            {
                fieldName: 'stageType',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'stages',
                fieldOptions: PROBABILITY_TICKET,
                fieldLabel: 'Select Probability',
            },
            {
                fieldName: 'priority',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'stages',
                fieldOptions: PRIORITY,
                fieldLabel: 'Select Stage priority',
            },
        ],
    },
    {
        templateType: 'TicketTotalsByLabelPriorityTag',
        name: 'Ticket totals by label/priority/tag/',
        chartTypes: [
            'bar',
            'line',
            'pie',
            'doughnut',
            'radar',
            'polarArea',
            'table',
        ],

        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string,
        ) => {
            const { pipelineId, boardId, stageId, stageType } = filter;
            const matchedFilter = await filterData(filter);
            const filterPipelineId = await PipelineAndBoardFilter(
                pipelineId,
                boardId,
                stageId,
                stageType,
                //PIPELINE_TYPE_DEAL,
                'deal',
                models,
            );
            let query = await QueryFilter(filterPipelineId, matchedFilter);

            const tickets = await models?.Tickets.find({
                ...query,
            }).lean();

            if (!Array.isArray(tickets)) {
                throw new Error('Invalid data: tickets is not an array.');
            }

            // Calculate ticket totals by label, priority, and tag
            const ticketTotals = calculateTicketTotalsByLabelPriorityTag(tickets);
            let labelIds: string[] = [];
            let tagIds: string[] = [];
            let priorities: string[] = [];

            Object.entries(ticketTotals).forEach(([key, value]) => {
                if (key.startsWith('labelIds:')) {
                    labelIds.push(key.replace('labelIds:', ''));
                } else if (key.startsWith('tagIds:')) {
                    tagIds.push(key.replace('tagIds:', ''));
                } else if (key.startsWith('priority:')) {
                    priorities.push(key.replace('priority:', ''));
                }
            });

            // Remove single quotes from both tagIds and labelIds
            tagIds = tagIds.map((tagId) => tagId.replace(/'/g, ''));
            labelIds = labelIds.map((labelId) => labelId.replace(/'/g, ''));
            priorities = priorities.map((priority) => priority.replace(/'/g, ''));

            const tagInfo = await sendTagsMessage({
                subdomain,
                action: 'find',
                data: {
                    _id: { $in: tagIds || [] },
                },
                isRPC: true,
                defaultValue: [],
            });
            const tagNames = tagInfo.map((tag) => tag.name);

            const labels = await models?.PipelineLabels.find({
                _id: { $in: labelIds },
            });
            if (!labels || labels.length === 0) {
                return { title: '', data: [], labels: [] };
            }
            const labelNames = labels.map((label) => label.name);

            const allLabels = [...priorities, ...labelNames, ...tagNames];

            const simplifiedLabels = allLabels.map((label) =>
                label.replace(/(labelIds:|tagIds:|')/g, ''),
            );

            const title =
                '  View the total number of ticket totals by label/priority/tag/ ';

            const data = Object.values(ticketTotals);

            const datasets = { title, data, labels: simplifiedLabels };

            return datasets;
        },
        filterTypes: [
            {
                fieldName: 'dateRange',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'date',
                fieldOptions: DATE_RANGE_TYPES,
                fieldLabel: 'Select date range',
                fieldDefaultValue: 'all',
            },
            {
                fieldName: 'branchIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'branches',
                fieldLabel: 'Select branches',
            },
            {
                fieldName: 'departmentIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'departments',
                fieldLabel: 'Select departments',
            },
            {
                fieldName: 'boardId',
                fieldType: 'select',
                fieldQuery: 'boards',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,
                fieldLabel: 'Select boards',
            },
            {
                fieldName: 'pipelineId',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'pipelines',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,
                logics: [
                    {
                        logicFieldName: 'boardId',
                        logicFieldVariable: 'boardId',
                    },
                ],
                fieldLabel: 'Select pipeline',
            },
            {
                fieldName: 'stageId',
                fieldType: 'select',
                fieldQuery: 'stages',
                multi: false,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                logics: [
                    {
                        logicFieldName: 'pipelineId',
                        logicFieldVariable: 'pipelineId',
                    },
                ],
                fieldLabel: 'Select stage',
            },
            {
                fieldName: 'stageType',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'stages',
                fieldOptions: PROBABILITY_TICKET,
                fieldLabel: 'Select Probability',
            },
            {
                fieldName: 'priority',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'stages',
                fieldOptions: PRIORITY,
                fieldLabel: 'Select Stage priority',
            },
        ],
    },
    {
        templateType: 'TicketAverageTimeToCloseByRep',
        name: 'Ticket average time to close by rep',
        chartTypes: [
            'bar',
            'line',
            'pie',
            'doughnut',
            'radar',
            'polarArea',
            'table',
        ],
        // Bar Chart Table
        getChartResult: async (
            filter: any,
            models: IModels,
            dimension: any,
            subdomain: string,
        ) => {
            const { pipelineId, boardId, stageType, stageId } = filter;
            const selectedUserIds = filter.assignedUserIds || [];
            const matchedFilter = await filterData(filter);
            const filterPipelineId = await PipelineAndBoardFilter(
                pipelineId,
                boardId,
                stageId,
                stageType,
                //PIPELINE_TYPE_DEAL,
                'deal',
                models,
            );
            let query = await QueryFilter(filterPipelineId, matchedFilter);
            let tickets;

            tickets = await models?.Tickets.find({
                ...query,
            });
            const ticketData = await calculateAverageTimeToCloseUser(
                tickets,
                selectedUserIds,
            );

            const getTotalAssignedUsers = await Promise.all(
                tickets.map(async (result) => {
                    return await sendCoreMessage({
                        subdomain,
                        action: 'users.find',
                        data: {
                            query: {
                                _id:
                                    selectedUserIds.length > 0
                                        ? { $in: selectedUserIds }
                                        : { $in: result.assignedUserIds },
                            },
                        },
                        isRPC: true,
                        defaultValue: [],
                    });
                }),
            );

            const result: any[] = [];
            const uniqueUserIds = new Set();

            for (const assignedUser of getTotalAssignedUsers) {
                assignedUser.forEach((itemsAdd) => {
                    // Use forEach instead of map
                    const ticket = ticketData?.find((item) =>
                        item.assignedUserIds.includes(itemsAdd._id),
                    );

                    if (ticket && !uniqueUserIds.has(itemsAdd._id)) {
                        uniqueUserIds.add(itemsAdd._id); // Add the user ID to the Set
                        result.push({
                            timeDifference: ticket.timeDifference,
                            assignedUserIds: ticket.assignedUserIds,
                            FullName: itemsAdd.details?.fullName || '',
                        });
                    }
                });
            }
            result.sort((a, b) => a.timeDifference - b.timeDifference);

            const data = Object.values(result).map((t: any) => t.timeDifference);
            const labels = Object.values(result).map((t: any) => t.FullName);

            const title =
                'View the average amount of time it takes for a rep to close a ticket';

            const datasets = {
                title,
                data,
                labels,
            };

            return datasets;
        },
        filterTypes: [
            {
                fieldName: 'assignedUserIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'users',
                fieldLabel: 'Select assigned users',
            },
            {
                fieldName: 'dateRange',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'date',
                fieldOptions: DATE_RANGE_TYPES,
                fieldLabel: 'Select date range',
                fieldDefaultValue: 'all',
            },
            {
                fieldName: 'branchIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'branches',
                fieldLabel: 'Select branches',
            },
            {
                fieldName: 'departmentIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'departments',
                fieldLabel: 'Select departments',
            },
            {
                fieldName: 'boardId',
                fieldType: 'select',
                fieldQuery: 'boards',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,
                fieldLabel: 'Select boards',
            },
            {
                fieldName: 'pipelineId',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'pipelines',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,
                logics: [
                    {
                        logicFieldName: 'boardId',
                        logicFieldVariable: 'boardId',
                    },
                ],
                fieldLabel: 'Select pipeline',
            },
            {
                fieldName: 'stageId',
                fieldType: 'select',
                fieldQuery: 'stages',
                multi: false,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                logics: [
                    {
                        logicFieldName: 'pipelineId',
                        logicFieldVariable: 'pipelineId',
                    },
                ],
                fieldLabel: 'Select stage',
            },
            {
                fieldName: 'stageType',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'stages',
                fieldOptions: PROBABILITY_TICKET,
                fieldLabel: 'Select Probability',
            },
            {
                fieldName: 'priority',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'stages',
                fieldOptions: PRIORITY,
                fieldLabel: 'Select Stage priority',
            },
        ],
    },
    {
        templateType: 'TicketTotalsBySource',
        name: 'Ticket totals by source',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
        // Table
        getChartResult: async (
            filter: any,
            models: IModels,
            dimension: any,
            subdomain: string,
        ) => {
            const { pipelineId, boardId, stageId, stageType } = filter;
            const matchedFilter = await filterData(filter);
            const filterPipelineId = await PipelineAndBoardFilter(
                pipelineId,
                boardId,
                stageId,
                stageType,
                ////PIPELINE_TYPE_DEAL,
                'deal',
                models,
            );
            let query = await QueryFilter(filterPipelineId, matchedFilter);
            const ticket = await models?.Tickets.find({
                ...query,
                sourceConversationIds: { $exists: true, $ne: [] },
            }).lean();
            if (!ticket || ticket.length === 0) {
                throw new Error(
                    'No ticket found in the database matching the specified criteria.',
                );
            }
            const data = [ticket.length];
            const labels = ['total'];
            const title = 'Ticket totals by source';

            const datasets = [{ title, data, labels }];
            return datasets;
        },
        filterTypes: [
            {
                fieldName: 'dateRange',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'date',
                fieldOptions: DATE_RANGE_TYPES,
                fieldLabel: 'Select date range',
                fieldDefaultValue: 'all',
            },
            {
                fieldName: 'branchIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'branches',
                fieldLabel: 'Select branches',
            },
            {
                fieldName: 'departmentIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'departments',
                fieldLabel: 'Select departments',
            },
            {
                fieldName: 'boardId',
                fieldType: 'select',
                fieldQuery: 'boards',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,
                fieldLabel: 'Select boards',
            },
            {
                fieldName: 'pipelineId',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'pipelines',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,
                logics: [
                    {
                        logicFieldName: 'boardId',
                        logicFieldVariable: 'boardId',
                    },
                ],
                fieldLabel: 'Select pipeline',
            },
            {
                fieldName: 'stageId',
                fieldType: 'select',
                fieldQuery: 'stages',
                multi: false,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                logics: [
                    {
                        logicFieldName: 'pipelineId',
                        logicFieldVariable: 'pipelineId',
                    },
                ],
                fieldLabel: 'Select stage',
            },
            {
                fieldName: 'stageType',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'stages',
                fieldOptions: PROBABILITY_TICKET,
                fieldLabel: 'Select Probability',
            },
            {
                fieldName: 'priority',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'stages',
                fieldOptions: PRIORITY,
                fieldLabel: 'Select Stage priority',
            },
        ],
    },

    {
        templateType: 'TicketAverageTimeToClose',
        name: 'Ticket average time to close',
        chartTypes: [
            'bar',
            'line',
            'pie',
            'doughnut',
            'radar',
            'polarArea',
            'table',
        ],
        // Table
        getChartResult: async (
            filter: any,
            models: IModels,
            dimension: any,
            subdomain: string,
        ) => {
            const { pipelineId, boardId, stageId, stageType } = filter;
            const matchedFilter = await filterData(filter);
            const filterPipelineId = await PipelineAndBoardFilter(
                pipelineId,
                boardId,
                stageId,
                stageType,
                //PIPELINE_TYPE_DEAL,
                'deal',
                models,
            );
            let query = await QueryFilter(filterPipelineId, matchedFilter);
            const ticket = await models?.Tickets.find({
                ...query,
            }).lean();
            if (!ticket || ticket.length === 0) {
                throw new Error(
                    'No ticket found in the database matching the specified criteria.',
                );
            }
            const data = await calculateAverageTimeToClose(ticket);

            const dataWithLabels = data.map((duration) => {
                const { hours, minutes, seconds } = convertHoursToHMS(duration);
                const label = `${hours}h ${minutes}m ${seconds}s`;
                return { duration, label };
            });

            dataWithLabels.sort((a, b) => a.duration - b.duration);

            const labels = dataWithLabels.map((entry) => entry.label);
            const sortedData = dataWithLabels.map((entry) => entry.duration);

            const title =
                'View the average amount of time it takes for your reps to close tickets';

            const datasets = { title, data: sortedData, labels };

            return datasets;
        },
        filterTypes: [
            {
                fieldName: 'assignedUserIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'users',
                fieldLabel: 'Select assigned users',
            },
            {
                fieldName: 'dateRange',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'date',
                fieldOptions: DATE_RANGE_TYPES,
                fieldLabel: 'Select date range',
                fieldDefaultValue: 'all',
            },
            {
                fieldName: 'branchIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'branches',
                fieldLabel: 'Select branches',
            },
            {
                fieldName: 'departmentIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'departments',
                fieldLabel: 'Select departments',
            },
            {
                fieldName: 'boardId',
                fieldType: 'select',
                fieldQuery: 'boards',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,
                fieldLabel: 'Select boards',
            },
            {
                fieldName: 'pipelineId',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'pipelines',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,
                logics: [
                    {
                        logicFieldName: 'boardId',
                        logicFieldVariable: 'boardId',
                    },
                ],
                fieldLabel: 'Select pipeline',
            },
            {
                fieldName: 'stageId',
                fieldType: 'select',
                fieldQuery: 'stages',
                multi: false,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                logics: [
                    {
                        logicFieldName: 'pipelineId',
                        logicFieldVariable: 'pipelineId',
                    },
                ],
                fieldLabel: 'Select stage',
            },
            {
                fieldName: 'stageType',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'stages',
                fieldOptions: PROBABILITY_TICKET,
                fieldLabel: 'Select Probability',
            },
            {
                fieldName: 'priority',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'stages',
                fieldOptions: PRIORITY,
                fieldLabel: 'Select Stage priority',
            },
        ],
    },
]

const getChartResult = async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    const { templateType, filter, dimension } = data;

    const template =
        chartTemplates.find((t) => t.templateType === templateType) || ({} as any);

    return template.getChartResult(models, filter, dimension, subdomain);
};


export default {
    chartTemplates,
    reportTemplates,
    getChartResult
};


const checkFilterParam = (param: any) => {
    return param && param.length;
};

const returnDateRange = (dateRange: string, startDate: Date, endDate: Date) => {
    const startOfToday = new Date(NOW.setHours(0, 0, 0, 0));
    const endOfToday = new Date(NOW.setHours(23, 59, 59, 999));
    const startOfYesterday = new Date(
        dayjs(NOW).add(-1, 'day').toDate().setHours(0, 0, 0, 0),
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
        case 'thisWeek':
            $gte = dayjs(NOW).startOf('week').toDate();
            $lte = dayjs(NOW).endOf('week').toDate();
            break;

        case 'lastWeek':
            $gte = dayjs(NOW).add(-1, 'week').startOf('week').toDate();
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
            $gte = startDate;
            $lte = endDate;
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
const returnStage = (resolve: string | string[]) => {
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

function filterData(filter: any) {
    const {
        dateRange,
        startDate,
        endDate,
        assignedUserIds,
        branchIds,
        departmentIds,
        stageId,
        tagIds,
        pipelineLabels,
        fieldsGroups,
        priority,
    } = filter;
    const matchfilter = {};

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
        matchfilter['stageId'] = { $in: stageId };
    }
    if (tagIds) {
        matchfilter['tagIds'] = { $in: tagIds };
    }
    if (pipelineLabels) {
        matchfilter['labelIds'] = { $in: pipelineLabels };
    }
    if (priority) {
        matchfilter['priority'] = { $in: priority };
    }

    return matchfilter;
}
async function PipelineAndBoardFilter(
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
function QueryFilter(filterPipelineId: any, matchedFilter: any) {
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

function calculateTicketTotalsByLabelPriorityTag(tickets: any) {
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

const calculateAverageTimeToClose = (tickets) => {
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

const calculateAverageTimeToCloseUser = (
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

function convertHoursToHMS(durationInHours) {
    const hours = Math.floor(durationInHours);
    const minutes = Math.floor((durationInHours - hours) * 60);
    const seconds = Math.floor(((durationInHours - hours) * 60 - minutes) * 60);

    return { hours, minutes, seconds };
}

function calculateTicketTotalsByStatus(tickets: any) {
    const ticketTotals = {};

    // Loop through tickets
    tickets.forEach((ticket) => {
        const status = ticket.status;

        // Check if status exists
        if (status !== undefined && status !== null) {
            // Initialize or increment status count
            ticketTotals[status] = (ticketTotals[status] || 0) + 1;
        }
    });

    // Return the result
    return ticketTotals;
}

function calculateTicketCounts(tickets: any, selectedUserIds: any) {
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

function sumCountsByUserIdName(inputArray: any[]) {
    const resultMap = new Map<
        string,
        { count: number; fullName: string; _id: string }
    >();
    inputArray.forEach((userEntries) => {
        userEntries.forEach((entry) => {
            const userId = entry._id;
            const count = entry.count;

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