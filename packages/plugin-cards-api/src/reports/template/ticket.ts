import { IModels } from "../../connectionResolver";
import { sendCoreMessage, sendTagsMessage } from "../../messageBroker";
import { ATTACHMENT_TYPES, CUSTOM_PROPERTIES_TICKET, DATE_RANGE_TYPES, PIPELINE_TYPE_DEAL, PIPELINE_TYPE_TICKET, PRIORITY, PROBABILITY_TICKET } from "../constants";
import { PipelineAndBoardFilter, QueryFilter, calculateAverageTimeToClose, calculateAverageTimeToCloseUser, calculateTicketCounts, calculateTicketTotalsByLabelPriorityTag, calculateTicketTotalsByStatus, convertHoursToHMS, filterData, getStageIds, sumCountsByUserIdName } from "../utils";
import * as dayjs from 'dayjs';

export const ticketCharts = [
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
            const matchedFilter = await filterData(filter, subdomain);
            const { pipelineId, boardId, stageId, stageType } = filter;
            const filterPipelineId = await PipelineAndBoardFilter(
                pipelineId,
                boardId,
                stageType,
                stageId,
                PIPELINE_TYPE_DEAL,
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
            const matchedFilter = await filterData(filter, subdomain);
            const { pipelineId, boardId, stageId, stageType } = filter;
            const filterPipelineId = await PipelineAndBoardFilter(
                pipelineId,
                boardId,
                stageType,
                stageId,
                PIPELINE_TYPE_DEAL,
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
            const matchedFilter = await filterData(filter, subdomain);
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
            const matchedFilter = await filterData(filter, subdomain);
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
            const matchedFilter = await filterData(filter, subdomain);
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
            const matchedFilter = await filterData(filter, subdomain);
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
            const matchedFilter = await filterData(filter, subdomain);
            const filterPipelineId = await PipelineAndBoardFilter(
                pipelineId,
                boardId,
                stageId,
                stageType,
                PIPELINE_TYPE_DEAL,
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
            const matchedFilter = await filterData(filter, subdomain);
            const filterPipelineId = await PipelineAndBoardFilter(
                pipelineId,
                boardId,
                stageId,
                stageType,
                PIPELINE_TYPE_DEAL,
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
            const matchedFilter = await filterData(filter, subdomain);
            const filterPipelineId = await PipelineAndBoardFilter(
                pipelineId,
                boardId,
                stageId,
                stageType,
                PIPELINE_TYPE_DEAL,
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
            const matchedFilter = await filterData(filter, subdomain);
            const filterPipelineId = await PipelineAndBoardFilter(
                pipelineId,
                boardId,
                stageId,
                stageType,
                PIPELINE_TYPE_DEAL,
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
    {
        templateType: 'TicketCountInEachPipeline',
        name: 'Ticket Count In Each Pipeline',
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

            const matchedFilter = await filterData(filter, subdomain);

            const boards = await models?.Boards.find()

            const boardIds = (boards || []).map(board => board._id)

            const pipeline = [
                {
                    $match: {
                        ...matchedFilter,
                        status: "active",
                    },
                },
                {
                    $group: {
                        _id: "$stageId",
                        count: { $sum: 1 },
                    },
                },
                {
                    $lookup: {
                        from: "stages",
                        let: { stageId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ["$_id", "$$stageId"] },
                                    type: PIPELINE_TYPE_TICKET,
                                    ...(pipelineId ? { pipelineId: pipelineId } : {}),
                                },
                            },
                            {
                                $lookup: {
                                    from: "pipelines",
                                    let: { pipelineId: "$pipelineId" },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: { $eq: ["$_id", "$$pipelineId"] },
                                                type: PIPELINE_TYPE_TICKET,
                                                status: "active",
                                                boardId: {
                                                    $in: boardId ? [boardId] : boardIds,
                                                },
                                                ...(pipelineId ? { _id: pipelineId } : {}),
                                            },
                                        },
                                    ],
                                    as: "pipeline",
                                },
                            },
                            { $unwind: "$pipeline" },
                        ],
                        as: "stage",
                    },
                },
                { $unwind: "$stage" },
                {
                    $group: {
                        _id: "$stage.pipeline._id",
                        name: { $first: "$stage.pipeline.name" },
                        count: { $sum: "$count" },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        pipeline: "$name",
                        count: 1,
                    },
                },
            ]

            const tickets = await models.Tickets.aggregate(pipeline)

            const ticketCountByPipeline = (tickets || []).reduce((acc, { pipeline, count }) => {
                acc[pipeline] = count

                return acc
            }, {})

            const getTotalTickets = Object.values(ticketCountByPipeline);
            const getTotalIds = Object.keys(ticketCountByPipeline);

            const data = getTotalTickets;
            const labels = getTotalIds;

            const title = 'Ticket Count In Each Pipeline';

            const datasets = { title, data, labels };

            return datasets;
        },
        filterTypes: [
            {
                fieldName: 'attachment',
                fieldType: 'select',
                fieldOptions: ATTACHMENT_TYPES,
                fieldLabel: 'Select attachment',
            },
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
        ],
    },
    {
        templateType: 'TicketCountByCompanies',
        name: 'Ticket Count By Companies',
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
            const { pipelineId, boardId, stageId } = filter;

            const matchedFilter = await filterData(filter, subdomain);

            if (boardId || pipelineId || stageId) {
                const stageIds = await getStageIds(filter, PIPELINE_TYPE_TICKET, models)
                matchedFilter['stageId'] = { $in: stageIds }
            }

            const pipeline = [
                {
                    $match: { ...matchedFilter, status: "active" }
                },
                {
                    $lookup: {
                        from: "conformities",
                        let: { ticketId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $and: [
                                        {
                                            $expr: {
                                                $eq: ["$mainType", "ticket"],
                                            },
                                        },
                                        {
                                            $expr: {
                                                $eq: [
                                                    "$mainTypeId",
                                                    "$$ticketId",
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
                        _id: 0,
                        company: "$company.primaryName",
                        count: 1,
                    },
                }
            ]

            const tickets = await models.Tickets.aggregate(pipeline)

            const ticketCountByCompany = (tickets || []).reduce((acc, { company, count }) => {
                acc[company] = count

                return acc
            }, {})

            const getTotalTicketss = Object.values(ticketCountByCompany);
            const getTotalIds = Object.keys(ticketCountByCompany);

            const data = getTotalTicketss;
            const labels = getTotalIds;

            const title = 'Ticket Count By Company';

            const datasets = { title, data, labels };

            return datasets;
        },
        filterTypes: [
            {
                fieldName: 'attachment',
                fieldType: 'select',
                fieldOptions: ATTACHMENT_TYPES,
                fieldLabel: 'Select attachment',
            },
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
                fieldName: 'companyIds',
                fieldType: 'select',
                fieldQuery: 'companies',
                multi: true,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'primaryName',
                fieldQueryVariables: `{"conformityMainType": "${PIPELINE_TYPE_TICKET}", "conformityRelType": "company"}`,
                fieldLabel: 'Select companies',
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

        ],
    },
    {
        templateType: 'TicketCountInEachStage',
        name: "Ticket Count In Each Stage",
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
            const { boardId } = filter;

            const matchedFilter = await filterData(filter, subdomain);

            const pipelines = await models.Pipelines.find(
                boardId ? { boardId: { $eq: boardId } } : {}
            )

            const pipelineIds = filter.pipelineIds || (pipelines || []).map(pipeline => pipeline._id)

            const pipeline = [
                {
                    $match: {
                        ...matchedFilter,
                        status: "active",
                    },
                },
                {
                    $group: {
                        _id: "$stageId",
                        count: { $sum: 1 }
                    }
                },
                {
                    $lookup: {
                        from: "stages",
                        let: { stageId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$_id", "$$stageId"] },
                                            { $eq: ['$type', PIPELINE_TYPE_TICKET] },
                                            ...(pipelineIds && pipelineIds.length ? [{ $in: ["$pipelineId", pipelineIds] }] : []),
                                        ]
                                    }
                                }
                            }
                        ],
                        as: "stage"
                    }
                },
                {
                    $unwind: "$stage"
                },
                {
                    $project: {
                        _id: 0,
                        stage: "$stage.name",
                        count: 1
                    }
                }
            ]

            const tickets = await models.Tickets.aggregate(pipeline)

            const ticketCountByStage = (tickets || []).reduce((acc, { stage, count }) => {
                acc[stage] = (acc[stage] || 0) + count;
                return acc
            }, {})

            const getTotalTickets = Object.values(ticketCountByStage);
            const getTotalIds = Object.keys(ticketCountByStage);

            const data = getTotalTickets;
            const labels = getTotalIds;

            const title = 'Ticket Count In Each Stage';

            const datasets = { title, data, labels };

            return datasets;
        },
        filterTypes: [
            {
                fieldName: 'attachment',
                fieldType: 'select',
                fieldOptions: ATTACHMENT_TYPES,
                fieldLabel: 'Select attachment',
            },
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
                multi: false,
                fieldQuery: 'boards',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,
                fieldLabel: 'Select board',
            },
            {
                fieldName: 'pipelineIds',
                fieldType: 'select',
                multi: true,
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
                fieldName: 'stageIds',
                fieldType: 'select',
                fieldQuery: 'stages',
                multi: true,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldParentVariable: 'pipelineId',
                fieldParentQuery: "pipelines",
                logics: [
                    {
                        logicFieldName: 'pipelineIds',
                        logicFieldVariable: 'pipelineIds',
                    },
                ],
                fieldLabel: 'Select stage',
            },
        ]
    },
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
            const matchedFilter = await filterData(filter, subdomain)

            if (boardId || pipelineId || stageId) {
                const stageIds = await getStageIds(filter, PIPELINE_TYPE_TICKET, models)
                matchedFilter['stageId'] = { $in: stageIds }
            }

            const pipeline = [
                {
                    $unwind: "$customFieldsData",
                },
                {
                    $match: {
                        ...matchedFilter
                    },
                },
                {
                    $lookup: {
                        from: "form_fields",
                        localField: "customFieldsData.field",
                        foreignField: "_id",
                        as: "field",
                    },
                },
                {
                    $unwind: "$field",
                },
                {
                    $group: {
                        _id: "$customFieldsData.field",
                        field: { $first: "$field.text" },
                        fieldType: { $first: "$field.type" },
                        fieldOptions: { $first: "$field.options" },
                        selectedOptions: { $push: "$customFieldsData.value" },
                        count: { $sum: 1 },
                    },
                },
            ]

            const tickets = await models.Tickets.aggregate(pipeline)

            const ticketsCountByPropertiesField = (tickets || []).reduce((acc, {
                field,
                fieldType,
                fieldOptions,
                selectedOptions,
                count
            }) => {

                if (!fieldOptions.length) {
                    acc[field] = count
                    return acc
                }

                selectedOptions.map(selectedOption => {
                    if (fieldType === 'multiSelect') {
                        const optionArray = selectedOption.split(',');
                        optionArray.forEach(opt => {
                            if (fieldOptions.includes(opt)) {
                                acc[opt.trim()] = (acc[opt.trim()] || 0) + 1;
                            }
                        });
                    } else if (Array.isArray(selectedOption)) {
                        selectedOption.flatMap(option => {
                            if (fieldOptions.includes(option)) {
                                acc[option] = (acc[option] || 0) + 1
                            }
                        })
                    } else if (fieldOptions.includes(selectedOption)) {
                        acc[selectedOption] = (acc[selectedOption] || 0) + 1
                    }
                })

                return acc
            }, {})

            const data = Object.values(ticketsCountByPropertiesField);
            const labels = Object.keys(ticketsCountByPropertiesField);
            const title = 'Ticket Custom Properties';

            return { title, data, labels };

        },
        filterTypes: [
            {
                fieldName: 'attachment',
                fieldType: 'select',
                fieldOptions: ATTACHMENT_TYPES,
                fieldLabel: 'Select attachment',
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
                fieldName: 'companyIds',
                fieldType: 'select',
                fieldQuery: 'companies',
                multi: true,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'primaryName',
                fieldQueryVariables: `{"conformityMainType": "${PIPELINE_TYPE_TICKET}", "conformityRelType": "company"}`,
                fieldLabel: 'Select companies',
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
                fieldName: 'groupIds',
                fieldType: 'select',
                fieldQuery: 'fieldsGroups',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"contentType": "${CUSTOM_PROPERTIES_TICKET}"}`,
                multi: true,
                fieldLabel: 'Select field group',
            },
            {
                fieldName: 'fieldIds',
                fieldType: 'select',
                fieldQuery: 'fields',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'text',
                fieldParentVariable: 'groupId',
                fieldParentQuery: "fieldsGroups",
                fieldQueryVariables: `{"contentType": "${CUSTOM_PROPERTIES_TICKET}", "isVisible": true}`,
                logics: [
                    {
                        logicFieldName: 'groupIds',
                        logicFieldVariable: 'groupIds',
                        logicFieldExtraVariable: `{"contentType": "${CUSTOM_PROPERTIES_TICKET}"}`,
                    },
                ],
                multi: true,
                fieldLabel: 'Select field',
            },
        ],
    },
]