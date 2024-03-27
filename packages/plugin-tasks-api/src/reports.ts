import { IModels, generateModels } from './connectionResolver';
import * as dayjs from 'dayjs';
import {
    sendCoreMessage,
    sendTagsMessage,
    sendFormsMessage,
} from './messageBroker';

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

const PROBABILITY_TASK = [
    { label: '10%', value: '10' },
    { label: '20%', value: '20' },
    { label: '30%', value: '30' },
    { label: '40%', value: '40' },
    { label: '50%', value: '50' },
    { label: '60%', value: '60' },
    { label: '70%', value: '70' },
    { label: '80%', value: '80' },
    { label: '90%', value: '90' },
    { label: 'Done', value: 'Done' },
];
const PRIORITY = [
    { label: 'Critical', value: 'Critical' },
    { label: 'High', value: 'high' },
    { label: 'Medium', value: 'medium' },
    { label: 'Low', value: 'low' },
];
const PIPELINE_TYPE_TASK = 'task';

const reportTemplates = [
    {
        serviceType: 'task',
        title: 'Tasks chart',
        serviceName: 'tasks',
        description: 'Cards conversation charts',
        charts: [
            'TaskAverageTimeToCloseByReps',
            'TaskAverageTimeToCloseByLabel',
            'TaskAverageTimeToCloseByTags',
            'TaskCustomProperties',
            'TaskClosedTotalsByReps',
            'TaskClosedTotalsByLabel',
            'TaskClosedTotalsByTags',
            'TasksIncompleteTotalsByReps',
            'TasksIncompleteTotalsByLabel',
            'TasksIncompleteTotalsByTags',
            'AllTasksIncompleteByDueDate',
            'TasksIncompleteAssignedToTheTeamByDueDate',
            'TasksIncompleteAssignedToMeByDueDate',
        ],
        img: 'https://cdn.mos.cms.futurecdn.net/S5bicwPe8vbP9nt3iwAwwi.jpg',
    },
];

const CUSTOM_PROPERTIES_TASK = 'cards:task';

const chartTemplates = [
    {
        templateType: 'TaskCustomProperties',
        name: 'Task Custom Properties',
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

            const title: string = 'Task Custom Properties';
            let query = await QueryFilter(filterPipelineId, matchedFilter);

            const task = await models?.Tasks.find({
                ...query,
            }).lean();

            if (task) {
                const idCounts = {};
                task.forEach((ticketItem) => {
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
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
                fieldLabel: 'Select a board',
            },
            {
                fieldName: 'pipelineId',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'pipelines',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
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
                fieldOptions: PROBABILITY_TASK,
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
        templateType: 'TaskCustomProperties',
        name: 'Task Custom Properties',
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

            const title: string = 'Task Custom Properties';
            let query = await QueryFilter(filterPipelineId, matchedFilter);

            const task = await models?.Tasks.find({
                ...query,
            }).lean();

            if (task) {
                const idCounts = {};
                task.forEach((ticketItem) => {
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
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
                fieldLabel: 'Select a board',
            },
            {
                fieldName: 'pipelineId',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'pipelines',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
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
                fieldOptions: PROBABILITY_TASK,
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
        templateType: 'TaskAverageTimeToCloseByReps',
        name: 'Task average time to close by reps',
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

            const tasks = await models?.Tasks.find({ ...query });

            const ticketData = await calculateAverageTimeToCloseUser(
                tasks,
                selectedUserIds,
            );

            const getTotalAssignedUsers = await Promise.all(
                ticketData?.map(async (result) => {
                    return await sendCoreMessage({
                        subdomain,
                        action: 'users.find',
                        data: {
                            query: {
                                _id: {
                                    $in: result.assignedUserIds,
                                },
                            },
                        },
                        isRPC: true,
                        defaultValue: [],
                    });
                }) ?? [],
            );

            const result: any[] = [];

            for (const assignedUser of getTotalAssignedUsers) {
                assignedUser.map((itemsAdd) => {
                    const ticket = ticketData?.find((item) =>
                        item.assignedUserIds.includes(itemsAdd._id),
                    );

                    if (ticket) {
                        result.push({
                            timeDifference: ticket.timeDifference,
                            assignedUserIds: ticket.assignedUserIds,
                            FullName: itemsAdd.details?.fullName || '',
                        });
                    }
                });
            }
            // Convert timeDifference strings to numbers
            result.forEach((item) => {
                item.timeDifference = parseFloat(item.timeDifference);
            });

            // Sort the result array by the timeDifference property
            result.sort((a, b) => a.timeDifference - b.timeDifference);

            // Extract sorted data and labels
            const data = result.map((t: any) => t.timeDifference);
            const labels = result.map((t: any) => t.FullName);

            const title = 'Task average time to close by reps';

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
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
                fieldLabel: 'Select a board',
            },
            {
                fieldName: 'pipelineId',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'pipelines',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
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
                fieldOptions: PROBABILITY_TASK,
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
        templateType: 'TaskAverageTimeToCloseByLabel',
        name: 'Task average time to close by label',
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
                //PIPELINE_TYPE_DEAL,
                'deal',
                models,
            );

            let query = await QueryFilter(filterPipelineId, matchedFilter);

            const tasks = await models?.Tasks.find({ ...query });

            const ticketData = await taskAverageTimeToCloseByLabel(tasks);
            // const labelIds = ticketData.map((result) => result.labelIds);
            const labelIdsCount = ticketData.flatMap((result) => result.labelIds);

            const labels = await models?.PipelineLabels.find({
                _id: {
                    $in: labelIdsCount,
                },
            }).lean();

            if (!labels || labels.length === 0) {
                // Handle the case where no labels are found
                return {
                    title: '',
                    data: [],
                    labels: [],
                };
            }
            const enrichedTicketData = ticketData.map((task) => {
                // Ensure labelIds is an array (default to empty array if undefined)
                const labelIds = Array.isArray(task.labelIds) ? task.labelIds : [];

                // Check if labelIds is not empty before mapping
                if (labelIds.length > 0) {
                    const labelNames = labelIds.map((labelId) => {
                        const matchingLabel = labels.find(
                            (label) => label && label._id === labelId,
                        ); // Check for undefined label
                        return matchingLabel ? matchingLabel.name : '';
                    });

                    // Filter out undefined and empty string labels
                    const filteredLabels = labelNames.filter((label) => label !== '');

                    return {
                        ...task,
                        labels: filteredLabels,
                    };
                } else {
                    // If labelIds is empty, return the task as is
                    return task;
                }
            });

            enrichedTicketData.forEach((t) => {
                t.timeDifference = parseFloat(t.timeDifference);
            });

            // Sort the enrichedTicketData array by the timeDifference property
            enrichedTicketData.sort((a, b) => a.timeDifference - b.timeDifference);

            let setData: string[] = [];
            let stablesNames: string[] = [];

            enrichedTicketData
                .filter((t) => t.timeDifference && t.labels && t.labels.length > 0)
                .slice(0, 100) // Limit to the first 100 elements
                .forEach((t) => {
                    setData.push(t.timeDifference.toString());

                    // Flatten and join the labels array into a single string
                    const flattenedLabels = t.labels.join(' ');
                    stablesNames.push(flattenedLabels);
                });

            const title = 'Task average time to close by label';

            const datasets = {
                title,
                data: setData,
                labels: stablesNames,
            };

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
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
                fieldLabel: 'Select a board',
            },
            {
                fieldName: 'pipelineId',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'pipelines',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
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
                fieldOptions: PROBABILITY_TASK,
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
                fieldName: 'pipelineLabels',
                fieldType: 'select',
                fieldQuery: 'pipelineLabels',
                multi: false,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                logics: [
                    {
                        logicFieldName: 'pipelineId',
                        logicFieldVariable: 'pipelineId',
                    },
                ],
                fieldLabel: 'select label',
            },
        ],
    },
    {
        templateType: 'TaskAverageTimeToCloseByTags',
        name: 'Task average time to close by tags',
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
            const { pipelineId, boardId, stageId, stageType, tagIds } = filter;
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

            const tasks = await models?.Tasks.find({
                ...query,
            }).lean();
            const taskData = await taskAverageTimeToCloseByLabel(tasks);
            const tagsCount = taskData.flatMap((result) => result.tagIds);
            let tagId = tagIds ? tagIds : tagsCount;
            const tagInfo = await sendTagsMessage({
                subdomain,
                action: 'find',
                data: {
                    _id: { $in: tagId || [] },
                },
                isRPC: true,
                defaultValue: [],
            });

            const tagData = {};

            // Iterate over each task and accumulate timeDifference based on tagId
            taskData.forEach((task) => {
                tagId.forEach((tagId) => {
                    if (!tagData[tagId]) {
                        tagData[tagId] = {
                            _id: tagId,
                            timeDifference: 0,
                            name: '',
                            type: '',
                        };
                    }
                    tagData[tagId].timeDifference += parseFloat(task.timeDifference);
                });
            });

            // Update tagData with the name and type from tagInfo
            tagInfo.forEach((tag) => {
                const tagId = tag._id;
                if (tagData[tagId]) {
                    tagData[tagId].name = tag.name;
                    tagData[tagId].type = tag.type;
                }
            });

            const groupedTagData: { timeDifference: number; name: string }[] =
                Object.values(tagData);

            groupedTagData.sort((a, b) => b.timeDifference - a.timeDifference);

            const data: number[] = groupedTagData.map((t) => t.timeDifference);
            const labels: string[] = groupedTagData.map((t) => t.name);

            const title: string = 'Task average time to close by tags';

            const datasets = {
                title,
                data,
                labels,
            };
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
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
                fieldLabel: 'Select boards',
            },
            {
                fieldName: 'pipelineId',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'pipelines',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
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
                fieldOptions: PROBABILITY_TASK,
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
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "${CUSTOM_PROPERTIES_TASK}", "perPage": 1000}`,
                multi: true,
                fieldLabel: 'Select tags',
            },
        ],
    },
    {
        templateType: 'TaskClosedTotalsByReps',
        name: 'Task closed totals by reps',
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
                //PIPELINE_TYPE_DEAL,
                'deal',
                models,
            );
            const selectedUserIds = filter.assignedUserIds || [];

            let query = await QueryFilter(filterPipelineId, matchedFilter);

            const tasks = await models?.Tasks.find({ ...query });

            // Calculate task counts
            const taskCounts = calculateTicketCounts(tasks, selectedUserIds);

            // Convert the counts object to an array of objects with ownerId and count
            const countsArray = Object.entries(taskCounts).map(
                // tslint:disable-next-line:no-shadowed-variable
                ([ownerId, count]) => ({
                    ownerId,
                    count,
                }),
            );

            // Sort the array based on task counts
            countsArray.sort((a, b) => b.count - a.count);

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

            const title = 'View the total number of closed tasks by reps';

            const sort = ownerIds.map((ownerId) => {
                const user = assignedUsersMap[ownerId];
                const count = taskCounts[ownerId];
                return {
                    name: user.fullName,
                    count: count || 0, // Set count to 0 if not found in ticketCounts
                };
            });

            sort.sort((a, b) => a.count - b.count);
            const data = Object.values(sort).map((t: any) => t.count);
            const labels = Object.values(sort).map((t: any) => t.name);

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
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
                fieldLabel: 'Select boards',
            },
            {
                fieldName: 'pipelineId',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'pipelines',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
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
                fieldOptions: PROBABILITY_TASK,
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
        templateType: 'TaskClosedTotalsByLabel',
        name: 'Task closed totals by label',
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
                //PIPELINE_TYPE_DEAL,
                'deal',
                models,
            );

            let query = await QueryFilter(filterPipelineId, matchedFilter);

            const tasks = await models?.Tasks.find({
                ...query,
            }).lean();

            const taskCounts = taskClosedByRep(tasks);

            // Convert the counts object to an array of objects with ownerId and count
            const countsArray = Object.entries(taskCounts).map(
                ([ownerId, count]) => ({
                    ownerId,
                    count,
                }),
            );
            countsArray.sort((a, b) => b.count - a.count);

            // Extract unique ownerIds for user lookup
            const ownerIds = countsArray.map((item) => item.ownerId);

            const labels = await models?.PipelineLabels.find({
                _id: {
                    $in: ownerIds,
                },
            }).lean();

            if (!labels || labels.length === 0) {
                // Handle the case where no labels are found
                return {
                    title: '',
                    data: [],
                    labels: [],
                    count: [],
                };
            }
            const enrichedTicketData = countsArray.map((item) => {
                const ownerId = item.ownerId;
                const matchingLabel = labels.find(
                    (label) => label && label._id === ownerId,
                );

                // Use the spread operator (...) to include all properties of the item object
                return {
                    ...item,
                    labels: matchingLabel ? [matchingLabel.name] : [],
                };
            });
            enrichedTicketData.sort((a, b) => a.count - b.count);
            const data = enrichedTicketData.map((t) => t.count);

            // Flatten the label array and remove any empty arrays
            const label = enrichedTicketData
                .map((t) => t.labels)
                .flat()
                .filter((item) => item.length > 0);
            const title = 'Task closed totals by label';

            const datasets = { title, data, labels: label };

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
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
                fieldLabel: 'Select boards',
            },
            {
                fieldName: 'pipelineId',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'pipelines',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
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
                fieldOptions: PROBABILITY_TASK,
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
                fieldName: 'pipelineLabels',
                fieldType: 'select',
                fieldQuery: 'pipelineLabels',
                multi: false,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                logics: [
                    {
                        logicFieldName: 'pipelineId',
                        logicFieldVariable: 'pipelineId',
                    },
                ],
                fieldLabel: 'select label',
            },
        ],
    },
    {
        templateType: 'TaskClosedTotalsByTags',
        name: 'Task closed totals by tags',
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
                //PIPELINE_TYPE_DEAL,
                'deal',
                models,
            );

            let query = await QueryFilter(filterPipelineId, matchedFilter);

            const tasks = await models?.Tasks.find({
                ...query,
            }).lean();

            const taskCount = calculateTicketCounts(
                tasks,
                filter.assignedUserIds || [],
            );
            const countsArray = Object.entries(taskCount).map(
                // tslint:disable-next-line:no-shadowed-variable
                ([ownerId, count]) => ({
                    ownerId,
                    count,
                }),
            );
            countsArray.sort((a, b) => b.count - a.count);

            // Extract unique ownerIds for user lookup
            const ownerIds = countsArray.map((item) => item.ownerId);

            const getTotalAssignedUsers = await sendCoreMessage({
                subdomain,
                action: 'users.find',
                data: {
                    query: { _id: { $in: ownerIds } },
                },
                isRPC: true,
                defaultValue: [],
            });
            const assignedUsersMap = getTotalAssignedUsers.reduce((acc, user) => {
                acc[user._id] = user.details; // Assuming details contains user information
                return acc;
            }, {});

            const sort = ownerIds.map((ownerId) => {
                const user = assignedUsersMap[ownerId];
                const count = taskCount[ownerId];

                return {
                    name: user.fullName,
                    count: count || 0, // Set count to 0 if not found in ticketCounts
                };
            });
            const title = 'Task closed totals by tags';
            sort.sort((a, b) => a.count - b.count);
            const data = Object.values(sort).map((t: any) => t.count);
            const labels = Object.values(sort).map((t: any) => t.name);
            const datasets = {
                title,
                data,
                labels,
            };
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
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
                fieldLabel: 'Select boards',
            },
            {
                fieldName: 'pipelineId',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'pipelines',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
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
                fieldOptions: PROBABILITY_TASK,
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
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "${CUSTOM_PROPERTIES_TASK}", "perPage": 1000}`,
                multi: true,
                fieldLabel: 'Select tags',
            },
        ],
    },
    {
        templateType: 'TasksIncompleteTotalsByReps',
        name: 'Tasks incomplete totals by reps',
        chartTypes: ['bar'],
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
                //PIPELINE_TYPE_DEAL,
                'deal',
                models,
            );
            let query = await QueryFilter(filterPipelineId, matchedFilter);
            const selectedUserIds = filter.assignedUserIds || [];
            let tasks;

            if (selectedUserIds.length === 0) {
                // No selected users, so get all tasks
                tasks = await models?.Tasks.find({
                    ...query,
                }).lean();
            } else {
                // Filter tasks based on selectedUserIds
                const taskCount = await models?.Tasks.find({
                    ...query,
                    assignedUserIds: { $in: selectedUserIds },
                }).lean();
                if (taskCount) {
                    tasks = taskCount.filter((task) => {
                        return task.assignedUserIds.some((userId) =>
                            selectedUserIds.includes(userId),
                        );
                    });
                } else {
                    // Handle the case where datats is undefined
                    throw new Error('No tasks found based on the selected user IDs.');
                }
            }

            // Check if the returned value is not an array
            if (!Array.isArray(tasks)) {
                throw new Error('Invalid data: tasks is not an array.');
            }

            const taskCounts = calculateTicketCounts(tasks, selectedUserIds);

            const countsArray = Object.entries(taskCounts).map(
                ([ownerId, count]) => ({
                    ownerId,
                    count,
                }),
            );
            countsArray.sort((a, b) => b.count - a.count);

            const ownerIds = countsArray.map((item) => item.ownerId);

            const getTotalAssignedUsers = await sendCoreMessage({
                subdomain,
                action: 'users.find',
                data: {
                    query: { _id: { $in: ownerIds } },
                },
                isRPC: true,
                defaultValue: [],
            });
            const assignedUsersMap = getTotalAssignedUsers.reduce((acc, user) => {
                acc[user._id] = user.details;
                return acc;
            }, {});

            const title = 'Tasks incomplete totals by reps';
            const sort = ownerIds.map((ownerId) => {
                const user = assignedUsersMap[ownerId];
                const count = taskCounts[ownerId];

                if (user) {
                    return {
                        name: user.fullName,
                        count: count || 0,
                    };
                }
            });

            const filteredSort = sort.filter((entry) => entry !== undefined);

            filteredSort.sort((a, b) => {
                if (a && b) {
                    return a.count - b.count;
                }
                return 0;
            });

            const data = Object.values(filteredSort).map((t: any) => t.count);
            const labels = Object.values(filteredSort).map((t: any) => t.name);

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
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
                fieldLabel: 'Select boards',
            },
            {
                fieldName: 'pipelineId',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'pipelines',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
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
                fieldOptions: PROBABILITY_TASK,
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
        templateType: 'TasksIncompleteTotalsByLabel',
        name: 'Tasks incomplete totals by label',
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
                //PIPELINE_TYPE_DEAL,
                'deal',
                models,
            );
            let query = await QueryFilter(filterPipelineId, matchedFilter);
            const selectedLabelIds = filter.labelIds || [];
            let tasks;

            if (selectedLabelIds.length === 0) {
                // No selected users, so get all tasks
                tasks = await models?.Tasks.find({
                    ...query,
                }).lean();
            } else {
                // Filter tasks based on selectedLabelIds
                tasks = await models?.Tasks.find({
                    ...query,
                    labelIds: { $in: selectedLabelIds },
                }).lean();
            }

            // Check if the returned value is not an array
            if (!Array.isArray(tasks)) {
                throw new Error('Invalid data: tasks is not an array.');
            }

            const taskCounts = taskClosedByRep(tasks);

            // Convert the counts object to an array of objects with ownerId and count
            const countsArray = Object.entries(taskCounts).map(
                ([ownerId, count]) => ({
                    ownerId,
                    count,
                }),
            );
            countsArray.sort((a, b) => b.count - a.count);

            // Extract unique ownerIds for user lookup
            const ownerIds = countsArray.map((item) => item.ownerId);

            const labels = await models?.PipelineLabels.find({
                _id: {
                    $in: ownerIds,
                },
            }).lean();

            if (!labels || labels.length === 0) {
                // Handle the case where no labels are found
                return {
                    title: '',
                    data: [],
                    labels: [],
                    count: [],
                };
            }
            const enrichedTicketData = countsArray.map((item) => {
                const ownerId = item.ownerId;
                const matchingLabel = labels.find(
                    (label) => label && label._id === ownerId,
                );

                // Use the spread operator (...) to include all properties of the item object
                return {
                    ...item,
                    labels: matchingLabel ? [matchingLabel.name] : [],
                };
            });
            enrichedTicketData.sort((a, b) => a.count - b.count);
            const data = enrichedTicketData.map((t) => t.count);

            // Flatten the label array and remove any empty arrays
            const label = enrichedTicketData
                .map((t) => t.labels)
                .flat()
                .filter((item) => item.length > 0);
            const title = 'Tasks incomplete totals by label';

            const datasets = { title, data, labels: label };

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
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
                fieldLabel: 'Select boards',
            },
            {
                fieldName: 'pipelineId',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'pipelines',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
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
                fieldOptions: PROBABILITY_TASK,
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
                fieldName: 'pipelineLabels',
                fieldType: 'select',
                fieldQuery: 'pipelineLabels',
                multi: false,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                logics: [
                    {
                        logicFieldName: 'pipelineId',
                        logicFieldVariable: 'pipelineId',
                    },
                ],
                fieldLabel: 'select label',
            },
        ],
    },
    {
        templateType: 'TasksIncompleteTotalsByTags',
        name: 'Tasks incomplete totals by tags',
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
                //PIPELINE_TYPE_DEAL,
                'deal',
                models,
            );
            let query = await QueryFilter(filterPipelineId, matchedFilter);
            const selectedTagIds = filter.tagIds || [];
            let tasksCount;

            if (selectedTagIds.length === 0) {
                // No selected users, so get all tasks
                tasksCount = await models?.Tasks.find({
                    ...query,
                }).lean();
            } else {
                // Filter tasks based on selectedLabelIds
                tasksCount = await models?.Tasks.find({
                    ...query,
                    tagIds: { $in: selectedTagIds },
                }).lean();
            }

            // Check if the returned value is not an array
            if (!Array.isArray(tasksCount)) {
                throw new Error('Invalid data: tasks is not an array.');
            }

            const taskCounts = taskClosedByTagsRep(tasksCount);

            // Convert the counts object to an array of objects with ownerId and count
            const countsArray = Object.entries(taskCounts).map(
                ([ownerId, count]) => ({
                    ownerId,
                    count,
                }),
            );
            countsArray.sort((a, b) => b.count - a.count);

            // Extract unique ownerIds for user lookup
            const ownerIds = countsArray.map((item) => item.ownerId);

            const tagInfo = await sendTagsMessage({
                subdomain,
                action: 'find',
                data: {
                    _id: { $in: ownerIds || [] },
                },
                isRPC: true,
                defaultValue: [],
            });

            if (!tagInfo || tagInfo.length === 0) {
                // Handle the case where no labels are found
                return {
                    title: '',
                    data: [],
                    tagIds: [],
                    count: [],
                };
            }
            const enrichedTicketData = countsArray.map((item) => {
                const ownerId = item.ownerId;
                const matchingLabel = tagInfo.find(
                    (label) => label && label._id === ownerId,
                );

                // Use the spread operator (...) to include all properties of the item object
                return {
                    ...item,
                    labels: matchingLabel ? [matchingLabel.name] : [],
                };
            });
            enrichedTicketData.sort((a, b) => a.count - b.count);
            const data = enrichedTicketData.map((t) => t.count);

            // Flatten the label array and remove any empty arrays
            const label = enrichedTicketData
                .map((t) => t.labels)
                .flat()
                .filter((item) => item.length > 0);
            const title = 'Tasks incomplete totals by tags';

            const datasets = { title, data, labels: label };

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
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
                fieldLabel: 'Select boards',
            },
            {
                fieldName: 'pipelineId',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'pipelines',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
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
                fieldOptions: PROBABILITY_TASK,
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
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "${CUSTOM_PROPERTIES_TASK}", "perPage": 1000}`,
                multi: true,
                fieldLabel: 'Select tags',
            },
        ],
    },
    {
        templateType: 'AllTasksIncompleteByDueDate',
        name: 'All tasks incomplete by due date',
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
                //PIPELINE_TYPE_DEAL,
                'deal',
                models,
            );
            let query = await QueryFilter(filterPipelineId, matchedFilter);
            const selectedUserIds = filter.assignedUserIds || [];
            let tasks;

            if (selectedUserIds.length === 0) {
                // No selected users, so get all tasks
                tasks = await models?.Tasks.find({
                    ...query,
                }).lean();
            } else {
                // Filter tasks based on selectedUserIds
                const taskCount = await models?.Tasks.find({
                    ...query,
                    assignedUserIds: { $in: selectedUserIds },
                }).lean();
                if (taskCount) {
                    tasks = taskCount.filter((task) => {
                        return task.assignedUserIds.some((userId) =>
                            selectedUserIds.includes(userId),
                        );
                    });
                } else {
                    throw new Error('No tasks found based on the selected user IDs.');
                }
            }

            if (!Array.isArray(tasks)) {
                throw new Error('Invalid data: tasks is not an array.');
            }

            const taskCounts = calculateTicketCounts(tasks, selectedUserIds);

            const countsArray = Object.entries(taskCounts).map(
                ([ownerId, count]) => ({
                    ownerId,
                    count,
                }),
            );

            countsArray.sort((a, b) => b.count - a.count);

            const ownerIds = countsArray.map((item) => item.ownerId);

            const getTotalAssignedUsers = await sendCoreMessage({
                subdomain,
                action: 'users.find',
                data: {
                    query: { _id: { $in: ownerIds } },
                },
                isRPC: true,
                defaultValue: [],
            });

            const assignedUsersMap = getTotalAssignedUsers.reduce((acc, user) => {
                acc[user._id] = user.details;
                return acc;
            }, {});

            const sort = ownerIds.map((ownerId) => {
                const user = assignedUsersMap[ownerId];
                const count = taskCounts[ownerId];

                if (user) {
                    return {
                        name: user.fullName,
                        count: count || 0,
                    };
                }
                return null;
            });

            const filteredSort = sort.filter((entry) => entry !== null);

            filteredSort.sort((a, b) => {
                if (a && b) {
                    return a.count - b.count;
                }
                return 0;
            });

            const data = filteredSort.map((t: any) => t.count);
            const labels = filteredSort.map((t: any) => t.name);

            const title = 'All tasks incomplete by due date';

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
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
                fieldLabel: 'Select boards',
            },
            {
                fieldName: 'pipelineId',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'pipelines',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
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
                fieldOptions: PROBABILITY_TASK,
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
        templateType: 'TasksIncompleteAssignedToTheTeamByDueDate',
        name: 'Tasks incomplete assigned to the team by due date',
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
                stageType,
                stageId,
                //PIPELINE_TYPE_DEAL,
                'deal',
                models,
            );
            let query = await QueryFilter(filterPipelineId, matchedFilter);
            const tasksCount = await models?.Tasks.find({
                ...query,
            }).lean();

            const taskCounts = departmentCount(tasksCount);

            // Convert the counts object to an array of objects with ownerId and count
            const countsArray = Object.entries(taskCounts).map(
                ([ownerId, count]) => ({
                    ownerId,
                    count,
                }),
            );
            countsArray.sort((a, b) => b.count - a.count);

            // Extract unique ownerIds for user lookup
            const ownerIds = countsArray.map((item) => item.ownerId);

            const departmentInfo = await sendCoreMessage({
                subdomain,
                action: `departments.find`,
                data: {
                    _id: { $in: ownerIds || [] },
                },
                isRPC: true,
                defaultValue: [],
            });

            if (!departmentInfo || departmentInfo.length === 0) {
                // Handle the case where no labels are found
                return {
                    title: '',
                    data: [],
                    departmentsIds: [],
                    count: [],
                };
            }
            const enrichedTicketData = countsArray.map((item) => {
                const ownerId = item.ownerId;

                const matchingLabel = departmentInfo.find(
                    (label) => label && label._id === ownerId,
                );
                // Use the spread operator (...) to include all properties of the item object
                return {
                    ...item,
                    labels: matchingLabel ? [matchingLabel.title] : [],
                };
            });
            enrichedTicketData.sort((a, b) => a.count - b.count);
            const data = enrichedTicketData.map((t) => t.count);

            // Flatten the label array and remove any empty arrays
            const label = enrichedTicketData
                .map((t) => t.labels)
                .flat()
                .filter((item) => item.length > 0);
            const title = 'Tasks incomplete assigned to the team by due date';

            const datasets = { title, data, labels: label };

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
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
                fieldLabel: 'Select a board',
            },
            {
                fieldName: 'pipelineId',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'pipelines',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
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
                fieldOptions: PROBABILITY_TASK,
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
        templateType: 'TasksIncompleteAssignedToMeByDueDate',
        name: 'Tasks incomplete assigned to me by due date',
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
                //PIPELINE_TYPE_DEAL,
                'deal',
                models,
            );
            let query = await QueryFilter(filterPipelineId, matchedFilter);
            const selectedUserIds = filter.assignedUserIds || [];
            let tickets;

            tickets = await models?.Tasks.find({
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
                    query: {
                        _id: {
                            $in: ownerIds,
                        },
                    },
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

                if (user) {
                    return {
                        name: user.fullName,
                        count: count || 0,
                    };
                }

                return null;
            });

            // Filter out null entries
            const filteredSort = sort.filter((entry) => entry !== null);

            // Sort by count in ascending order
            filteredSort.sort((a, b) => {
                return (a?.count || 0) - (b?.count || 0);
            });

            // Extract data and labels
            const title = 'Tasks incomplete assigned to me by due date';
            const data = filteredSort.map((t) => t?.count || 0);
            const labels = filteredSort.map((t) => t?.name || '');

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
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
                fieldLabel: 'Select boards',
            },
            {
                fieldName: 'pipelineId',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'pipelines',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
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
                fieldOptions: PROBABILITY_TASK,
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

const checkFilterParam = (param: any) => {
    return param && param.length;
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

function taskClosedByTagsRep(tasks: any) {
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

function departmentCount(tasks: any) {
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


const taskAverageTimeToCloseByLabel = async (tasks) => {
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

function taskClosedByRep(tickets: any) {
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
