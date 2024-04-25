import { IModels } from "../../connectionResolver";
import { sendCoreMessage, sendFormsMessage, sendTagsMessage } from "../../messageBroker";
import { ATTACHMENT_TYPES, CUSTOM_PROPERTIES_TASK, DATE_RANGE_TYPES, PIPELINE_TYPE_DEAL, PIPELINE_TYPE_TASK, PRIORITY, PROBABILITY_TASK } from "../constants";
import { PipelineAndBoardFilter, QueryFilter, calculateAverageTimeToCloseUser, calculateTicketCounts, departmentCount, filterData, getStageIds, taskAverageTimeToCloseByLabel, taskClosedByRep, taskClosedByTagsRep } from "../utils";


export const taskCharts = [
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
            const matchedFilter = await filterData(filter, subdomain);
            const filterPipelineId = await PipelineAndBoardFilter(
                pipelineId,
                boardId,
                stageId,
                stageType,
                PIPELINE_TYPE_DEAL,
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

            const tasks = await models?.Tasks.find({
                ...query,
            }).lean();
            const taskData = await taskAverageTimeToCloseByLabel(tasks);
            const tagsCount = taskData.flatMap((result) => result.tagIds);
            let tagId = tagIds || tagsCount;
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
            const matchedFilter = await filterData(filter, subdomain);
            const filterPipelineId = await PipelineAndBoardFilter(
                pipelineId,
                boardId,
                stageId,
                stageType,
                PIPELINE_TYPE_DEAL,
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
                const { ownerId } = item;
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
                const { ownerId } = item;
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
                const { ownerId } = item;
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
            const matchedFilter = await filterData(filter, subdomain);
            const filterPipelineId = await PipelineAndBoardFilter(
                pipelineId,
                boardId,
                stageType,
                stageId,
                PIPELINE_TYPE_DEAL,
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
                const { ownerId } = item;

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
    {
        templateType: 'TaskCountInEachPipeline',
        name: 'Task Count In Each Pipeline',
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
                                    type: PIPELINE_TYPE_TASK,
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
                                                type: PIPELINE_TYPE_TASK,
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

            const tasks = await models.Tasks.aggregate(pipeline)

            const taskCountByPipeline = (tasks || []).reduce((acc, { pipeline, count }) => {
                acc[pipeline] = count

                return acc
            }, {})

            const getTotalTasks = Object.values(taskCountByPipeline);
            const getTotalIds = Object.keys(taskCountByPipeline);

            const data = getTotalTasks;
            const labels = getTotalIds;

            const title = 'Task Count In Each Pipeline';

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
        ],
    },
    {
        templateType: 'TaskCountByCompanies',
        name: 'Task Count By Companies',
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
            const { pipelineId, boardId, stageId, stageType, companyIds } = filter;

            const matchedFilter = await filterData(filter, subdomain);

            if (boardId || pipelineId || stageId) {
                const stageIds = await getStageIds(filter, PIPELINE_TYPE_TASK, models)
                matchedFilter['stageId'] = { $in: stageIds }
            }

            const pipeline = [
                {
                    $match: { ...matchedFilter, status: "active" }
                },
                {
                    $lookup: {
                        from: "conformities",
                        let: { taskId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $and: [
                                        {
                                            $expr: {
                                                $eq: ["$mainType", "task"],
                                            },
                                        },
                                        {
                                            $expr: {
                                                $eq: [
                                                    "$mainTypeId",
                                                    "$$taskId",
                                                ],
                                            },
                                        },
                                        {
                                            $expr: {
                                                $eq: ["$relType", "company"],
                                            },
                                        },
                                        (companyIds && companyIds.length ? {
                                            $expr: {
                                                $in: [
                                                    "$relTypeId",
                                                    companyIds,
                                                ],
                                            },
                                        } : {})
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

            const tasks = await models.Tasks.aggregate(pipeline)

            const taskCountByCompany = (tasks || []).reduce((acc, { company, count }) => {
                acc[company] = count

                return acc
            }, {})

            const getTotalTasks = Object.values(taskCountByCompany);
            const getTotalIds = Object.keys(taskCountByCompany);

            const data = getTotalTasks;
            const labels = getTotalIds;

            const title = 'Task Count By Company';

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
                fieldQueryVariables: `{"conformityMainType": "${PIPELINE_TYPE_TASK}", "conformityRelType": "company"}`,
                fieldLabel: 'Select companies',
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

        ],
    },
    {
        templateType: 'TaskCountInEachStage',
        name: "Task Count In Each Stage",
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
                                            { $eq: ['$type', PIPELINE_TYPE_TASK] },
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

            const tasks = await models.Tasks.aggregate(pipeline)

            const taskCountByStage = (tasks || []).reduce((acc, { stage, count }) => {
                acc[stage] = (acc[stage] || 0) + count;
                return acc
            }, {})

            const getTotalTasks = Object.values(taskCountByStage);
            const getTotalIds = Object.keys(taskCountByStage);

            const data = getTotalTasks;
            const labels = getTotalIds;

            const title = 'Task Count In Each Stage';

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
                fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
                fieldLabel: 'Select board',
            },
            {
                fieldName: 'pipelineIds',
                fieldType: 'select',
                multi: true,
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
]