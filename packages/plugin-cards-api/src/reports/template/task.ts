import { IModels } from "../../connectionResolver";
import { ATTACHMENT_TYPES, CUSTOM_DATE_FREQUENCY_TYPES, DATERANGE_BY_TYPES, DATERANGE_TYPES, DUE_DATERANGE_TYPES, DUE_TYPES, MONTH_NAMES, PRIORITY, PROBABILITY_CLOSED, PROBABILITY_TASK, STATUS_TYPES, USER_TYPES } from "../constants";
import { buildMatchFilter, getDimensionPipeline, getStageIds } from "../utils";

const DIMENSION_OPTIONS = [
    { label: 'Total count', value: 'count' },
    { label: 'Team members', value: 'teamMember' },
    { label: 'Departments', value: 'department' },
    { label: 'Branches', value: 'branch' },
    { label: 'Companies', value: 'company' },
    { label: 'Customers', value: 'customer' },
    { label: 'Boards', value: 'board' },
    { label: 'Pipelines', value: 'pipeline' },
    { label: 'Stages', value: 'stage' },
    { label: 'Tags', value: 'tag' },
    { label: 'Labels', value: 'label' },
    { label: 'Frequency (day, week, month)', value: 'frequency' },
    { label: 'Status', value: 'status' },
    { label: 'Priority', value: 'priority' },
]

export const taskCharts = [
    // TaskCustomProperties
    {
        templateType: "TaskCustomProperties",
        serviceType: 'cards',
        name: 'Total Task Count By Custom Properties',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string,
        ) => {

            const matchFilter = await buildMatchFilter(filter, 'task', subdomain, models)

            const pipeline = [
                {
                    $unwind: "$customFieldsData",
                },
                {
                    $match: {
                        ...matchFilter
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

            const tasks = await models.Tasks.aggregate(pipeline)

            const totalCountByCustomProperties = (tasks || []).reduce((acc, { field,
                fieldType,
                fieldOptions,
                selectedOptions,
                count }) => {

                if (!fieldOptions.length) {
                    acc[field] = count
                    return acc
                }

                (selectedOptions || []).map(selectedOption => {
                    if (fieldType === 'multiSelect') {
                        const optionArray = (selectedOption || '').split(',');
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

                return acc;
            }, {});

            const data = Object.values(totalCountByCustomProperties);
            const labels = Object.keys(totalCountByCustomProperties);
            const title = 'Total Task Count Custom Properties';

            return { title, data, labels };
        },
        filterTypes: [
            // USER TYPE FILTER
            {
                fieldName: 'userType',
                fieldType: 'select',
                multi: false,
                fieldDefaultValue: 'userId',
                fieldOptions: USER_TYPES,
                fieldLabel: 'Select user type',
            },
            // USER FILTER
            {
                fieldName: 'userIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'users',
                fieldLabel: 'Select users',
            },
            // BRANCH FILTER
            {
                fieldName: 'branchIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'branches',
                fieldLabel: 'Select branches',
            },
            // DEPARTMENT FILTER
            {
                fieldName: 'departmentIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'departments',
                fieldLabel: 'Select departments',
            },
            // COMPANY FILTER
            {
                fieldName: 'companyIds',
                fieldType: 'select',
                fieldQuery: 'companies',
                multi: true,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'primaryName',
                fieldQueryVariables: `{"conformityMainType": "task", "conformityRelType": "company"}`,
                fieldLabel: 'Select companies',
            },
            // CUSTOMER FILTER
            {
                fieldName: 'customerIds',
                fieldType: 'select',
                fieldQuery: 'customers',
                multi: true,
                fieldQueryVariables: `{"conformityMainType": "task", "conformityRelType": "customer"}`,
                fieldLabel: 'Select customers',
            },
            // TAG FILTER
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "cards:task", "perPage": 1000}`,
                multi: true,
                fieldLabel: 'Select tags',
            },
            // BOARD FILTER
            {
                fieldName: 'boardId',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'boards',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "task"}`,
                fieldLabel: 'Select board',
            },
            // PIPELINE FILTER
            {
                fieldName: 'pipelineIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'pipelines',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "task"}`,
                logics: [
                    {
                        logicFieldName: 'boardId',
                        logicFieldVariable: 'boardId',
                    },
                ],
                fieldLabel: 'Select pipelines',
            },
            // STAGE PROBABILITY FILTER
            {
                fieldName: 'stageProbability',
                fieldType: 'select',
                fieldOptions: PROBABILITY_TASK,
                logics: [
                    {
                        logicFieldName: 'pipelineIds',
                        logicFieldVariable: 'pipelineIds',
                    },
                ],
                fieldLabel: 'Select Probability',
            },
            // STAGE FILTER
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
                fieldLabel: 'Select stages',
            },
            // LABEL FILTER
            {
                fieldName: 'labelIds',
                fieldType: 'select',
                fieldQuery: 'pipelineLabels',
                multi: true,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                logics: [
                    {
                        logicFieldName: 'pipelineIds',
                        logicFieldVariable: 'pipelineIds',
                    },
                ],
                fieldLabel: 'Select labels',
            },
            // PRIORITY FILTER 
            {
                fieldName: 'status',
                fieldType: 'select',
                fieldOptions: STATUS_TYPES,
                fieldLabel: 'Select status',
            },
            // PRIORITY FILTER 
            {
                fieldName: 'priority',
                fieldType: 'select',
                fieldOptions: PRIORITY,
                fieldLabel: 'Select priority',
            },
            // ATTACHMENT FILTER
            {
                fieldName: 'attachment',
                fieldType: 'select',
                fieldOptions: ATTACHMENT_TYPES,
                fieldLabel: 'Select attachment',
            },
            // CUSTOM PROPERTIES FILTER 
            {
                fieldName: 'groupIds',
                fieldType: 'select',
                fieldQuery: 'fieldsGroups',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"contentType": "cards:task"}`,
                multi: true,
                fieldLabel: 'Select field group',
            },
            // CUSTOM PROPERTIES FIELD FILTER 
            {
                fieldName: 'fieldIds',
                fieldType: 'select',
                fieldQuery: 'fields',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'text',
                fieldParentVariable: 'groupId',
                fieldParentQuery: "fieldsGroups",
                fieldQueryVariables: `{"contentType": "cards:task", "isVisible": true}`,
                logics: [
                    {
                        logicFieldName: 'groupIds',
                        logicFieldVariable: 'groupIds',
                        logicFieldExtraVariable: `{"contentType": "cards:task"}`,
                    },
                ],
                multi: true,
                fieldLabel: 'Select field',
            },
            // DATERANGE FILTER
            {
                fieldName: 'dateRange',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'date',
                fieldOptions: DATERANGE_TYPES,
                fieldLabel: 'Select date range',
                fieldDefaultValue: 'all',
            },
            // DATERANGE TYPE FILTER
            {
                fieldName: 'dateRangeType',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'date',
                fieldOptions: DATERANGE_BY_TYPES,
                fieldLabel: 'Select date range type',
                fieldDefaultValue: "createdAt"
            }
        ]
    },
    // TasksTotalCount
    {
        templateType: "TasksTotalCount",
        serviceType: 'cards',
        name: 'Total Tasks Count',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table', 'number'],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string,
        ) => {

            const matchFilter = await buildMatchFilter(filter, 'task', subdomain, models)

            const pipeline = await getDimensionPipeline(filter, 'task', subdomain, models)

            let tasks

            if (pipeline.length === 0) {
                const tasksCount = await models.Tasks.find(matchFilter).countDocuments()

                tasks = [
                    {
                        key: "Total Count",
                        count: tasksCount
                    }
                ]
            } else {
                tasks = await models.Tasks.aggregate(pipeline)
            }

            const totalCountByLabel = (tasks || []).reduce((acc, { count, key }) => {
                acc[key] = count;
                return acc;
            }, {});

            const data = Object.values(totalCountByLabel);
            const labels = Object.keys(totalCountByLabel);
            const title = 'Total Tasks Count';

            return { title, data, labels };
        },
        filterTypes: [
            // DIMENSION FILTER
            {
                fieldName: 'dimension',
                fieldType: 'select',
                multi: false,
                fieldOptions: DIMENSION_OPTIONS,
                fieldDefaultValue: 'count',
                fieldLabel: 'Select dimension',
            },
            // FREQUENCY TYPE FILTER BASED DIMENSION FILTER
            {
                fieldName: 'frequencyType',
                fieldType: 'select',
                logics: [
                    {
                        logicFieldName: 'dimension',
                        logicFieldValue: 'frequency',
                    },
                ],
                multi: false,
                fieldDefaultValue: '%Y',
                fieldOptions: CUSTOM_DATE_FREQUENCY_TYPES,
                fieldLabel: 'Select frequency type',
            },
            // USER TYPE FILTER
            {
                fieldName: 'userType',
                fieldType: 'select',
                logics: [
                    {
                        logicFieldName: 'dimension',
                        logicFieldValue: 'teamMember',
                    },
                ],
                multi: false,
                fieldDefaultValue: 'userId',
                fieldOptions: USER_TYPES,
                fieldLabel: 'Select user type',
            },
            // USER FILTER
            {
                fieldName: 'userIds',
                fieldType: 'select',
                logics: [
                    {
                        logicFieldName: 'dimension',
                        logicFieldValue: 'teamMember',
                    },
                ],
                multi: true,
                fieldQuery: 'users',
                fieldLabel: 'Select users',
            },
            // BRANCH FILTER
            {
                fieldName: 'branchIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'branches',
                fieldLabel: 'Select branches',
            },
            // DEPARTMENT FILTER
            {
                fieldName: 'departmentIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'departments',
                fieldLabel: 'Select departments',
            },
            // COMPANY FILTER
            {
                fieldName: 'companyIds',
                fieldType: 'select',
                fieldQuery: 'companies',
                multi: true,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'primaryName',
                fieldQueryVariables: `{"conformityMainType": "task", "conformityRelType": "company"}`,
                fieldLabel: 'Select companies',
            },
            // CUSTOMER FILTER
            {
                fieldName: 'customerIds',
                fieldType: 'select',
                fieldQuery: 'customers',
                multi: true,
                fieldQueryVariables: `{"conformityMainType": "task", "conformityRelType": "customer"}`,
                fieldLabel: 'Select customers',
            },
            // TAG FILTER
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "cards:task", "perPage": 1000}`,
                multi: true,
                fieldLabel: 'Select tags',
            },
            // BOARD FILTER
            {
                fieldName: 'boardId',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'boards',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "task"}`,
                fieldLabel: 'Select board',
            },
            // PIPELINE FILTER
            {
                fieldName: 'pipelineIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'pipelines',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "task"}`,
                logics: [
                    {
                        logicFieldName: 'boardId',
                        logicFieldVariable: 'boardId',
                    },
                ],
                fieldLabel: 'Select pipelines',
            },
            // STAGE PROBABILITY FILTER
            {
                fieldName: 'stageProbability',
                fieldType: 'select',
                fieldOptions: PROBABILITY_TASK,
                logics: [
                    {
                        logicFieldName: 'pipelineIds',
                        logicFieldVariable: 'pipelineIds',
                    },
                ],
                fieldLabel: 'Select Probability',
            },
            // STAGE FILTER
            {
                fieldName: 'stageIds',
                fieldType: 'select',
                fieldQuery: 'stages',
                multi: true,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldParentVariable: 'pipelineId',
                fieldQueryVariables: `{"type": "task"}`,
                fieldParentQuery: "pipelines",
                logics: [
                    {
                        logicFieldName: 'pipelineIds',
                        logicFieldVariable: 'pipelineIds',
                    },
                ],
                fieldLabel: 'Select stages',
            },
            // LABEL FILTER
            {
                fieldName: 'labelIds',
                fieldType: 'select',
                fieldQuery: 'pipelineLabels',
                multi: true,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                logics: [
                    {
                        logicFieldName: 'pipelineIds',
                        logicFieldVariable: 'pipelineIds',
                    },
                ],
                fieldLabel: 'Select labels',
            },
            // PRIORITY FILTER 
            {
                fieldName: 'status',
                fieldType: 'select',
                fieldOptions: STATUS_TYPES,
                fieldLabel: 'Select status',
            },
            // PRIORITY FILTER 
            {
                fieldName: 'priority',
                fieldType: 'select',
                fieldOptions: PRIORITY,
                fieldLabel: 'Select priority',
            },
            // ATTACHMENT FILTER
            {
                fieldName: 'attachment',
                fieldType: 'select',
                fieldOptions: ATTACHMENT_TYPES,
                fieldLabel: 'Select attachment',
            },
            // CUSTOM PROPERTIES FILTER 
            {
                fieldName: 'groupIds',
                fieldType: 'select',
                fieldQuery: 'fieldsGroups',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"contentType": "cards:task"}`,
                multi: true,
                fieldLabel: 'Select field group',
            },
            // CUSTOM PROPERTIES FIELD FILTER 
            {
                fieldName: 'fieldIds',
                fieldType: 'select',
                fieldQuery: 'fields',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'text',
                fieldParentVariable: 'groupId',
                fieldParentQuery: "fieldsGroups",
                fieldQueryVariables: `{"contentType": "cards:task", "isVisible": true}`,
                logics: [
                    {
                        logicFieldName: 'groupIds',
                        logicFieldVariable: 'groupIds',
                        logicFieldExtraVariable: `{"contentType": "cards:task"}`,
                    },
                ],
                multi: true,
                fieldLabel: 'Select field',
            },
            // DATE RANGE FILTER
            {
                fieldName: 'dateRange',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'date',
                fieldOptions: DATERANGE_TYPES,
                fieldLabel: 'Select date range',
                fieldDefaultValue: 'all',
            },
            // DATE RANGE TYPE FILTER
            {
                fieldName: 'dateRangeType',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'date',
                fieldOptions: DATERANGE_BY_TYPES,
                fieldLabel: 'Select date range type',
                fieldDefaultValue: "createdAt"
            }
        ]
    },

    // TaskClosedTotalsByTags
    {
        templateType: "TaskClosedTotalsByTags",
        serviceType: 'cards',
        name: 'Total Task Count By Tag',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string,
        ) => {

            const matchFilter = await buildMatchFilter(filter, 'task', subdomain, models)

            const pipeline = [
                {
                    $unwind: "$tagIds"
                },
                {
                    $match: {
                        ...matchFilter
                    }
                },
                {
                    $group: {
                        _id: "$tagIds",
                        measure: { $sum: 1 }
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
                        _id: 0,
                        tag: "$tag.name",
                        measure: 1
                    }
                }
            ]

            const tasks = await models.Tasks.aggregate(pipeline)

            const totalCountByTag = (tasks || []).reduce((acc, { measure, tag }) => {
                acc[tag] = measure;
                return acc;
            }, {});

            const data = Object.values(totalCountByTag);
            const labels = Object.keys(totalCountByTag);
            const title = 'Total Task Count By Tag';

            return { title, data, labels };
        },
        filterTypes: [
            // USER TYPE FILTER
            {
                fieldName: 'userType',
                fieldType: 'select',
                multi: false,
                fieldDefaultValue: 'userId',
                fieldOptions: USER_TYPES,
                fieldLabel: 'Select user type',
            },
            // USER FILTER
            {
                fieldName: 'userIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'users',
                fieldLabel: 'Select users',
            },
            // BRANCH FILTER
            {
                fieldName: 'branchIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'branches',
                fieldLabel: 'Select branches',
            },
            // DEPARTMENT FILTER
            {
                fieldName: 'departmentIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'departments',
                fieldLabel: 'Select departments',
            },
            // COMPANY FILTER
            {
                fieldName: 'companyIds',
                fieldType: 'select',
                fieldQuery: 'companies',
                multi: true,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'primaryName',
                fieldQueryVariables: `{"conformityMainType": "task", "conformityRelType": "company"}`,
                fieldLabel: 'Select companies',
            },
            // CUSTOMER FILTER
            {
                fieldName: 'customerIds',
                fieldType: 'select',
                fieldQuery: 'customers',
                multi: true,
                fieldQueryVariables: `{"conformityMainType": "task", "conformityRelType": "customer"}`,
                fieldLabel: 'Select customers',
            },
            // TAG FILTER
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "cards:task", "perPage": 1000}`,
                multi: true,
                fieldLabel: 'Select tags',
            },
            // BOARD FILTER
            {
                fieldName: 'boardId',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'boards',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "task"}`,
                fieldLabel: 'Select board',
            },
            // PIPELINE FILTER
            {
                fieldName: 'pipelineIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'pipelines',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "task"}`,
                logics: [
                    {
                        logicFieldName: 'boardId',
                        logicFieldVariable: 'boardId',
                    },
                ],
                fieldLabel: 'Select pipelines',
            },
            // STAGE PROBABILITY FILTER
            {
                fieldName: 'stageProbability',
                fieldType: 'select',
                fieldOptions: PROBABILITY_TASK,
                logics: [
                    {
                        logicFieldName: 'pipelineIds',
                        logicFieldVariable: 'pipelineIds',
                    },
                ],
                fieldLabel: 'Select Probability',
            },
            // STAGE FILTER
            {
                fieldName: 'stageIds',
                fieldType: 'select',
                fieldQuery: 'stages',
                multi: true,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldParentVariable: 'pipelineId',
                fieldQueryVariables: `{"type": "task"}`,
                fieldParentQuery: "pipelines",
                logics: [
                    {
                        logicFieldName: 'pipelineIds',
                        logicFieldVariable: 'pipelineIds',
                    },
                ],
                fieldLabel: 'Select stages',
            },
            // LABEL FILTER
            {
                fieldName: 'labelIds',
                fieldType: 'select',
                fieldQuery: 'pipelineLabels',
                multi: true,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                logics: [
                    {
                        logicFieldName: 'pipelineIds',
                        logicFieldVariable: 'pipelineIds',
                    },
                ],
                fieldLabel: 'Select labels',
            },
            // PRIORITY FILTER 
            {
                fieldName: 'status',
                fieldType: 'select',
                fieldOptions: STATUS_TYPES,
                fieldLabel: 'Select status',
            },
            // PRIORITY FILTER 
            {
                fieldName: 'priority',
                fieldType: 'select',
                fieldOptions: PRIORITY,
                fieldLabel: 'Select priority',
            },
            // ATTACHMENT FILTER
            {
                fieldName: 'attachment',
                fieldType: 'select',
                fieldOptions: ATTACHMENT_TYPES,
                fieldLabel: 'Select attachment',
            },
            // CUSTOM PROPERTIES FILTER 
            {
                fieldName: 'groupIds',
                fieldType: 'select',
                fieldQuery: 'fieldsGroups',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"contentType": "cards:task"}`,
                multi: true,
                fieldLabel: 'Select field group',
            },
            // CUSTOM PROPERTIES FIELD FILTER 
            {
                fieldName: 'fieldIds',
                fieldType: 'select',
                fieldQuery: 'fields',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'text',
                fieldParentVariable: 'groupId',
                fieldParentQuery: "fieldsGroups",
                fieldQueryVariables: `{"contentType": "cards:task", "isVisible": true}`,
                logics: [
                    {
                        logicFieldName: 'groupIds',
                        logicFieldVariable: 'groupIds',
                        logicFieldExtraVariable: `{"contentType": "cards:task"}`,
                    },
                ],
                multi: true,
                fieldLabel: 'Select field',
            },
            // DATERANGE FILTER
            {
                fieldName: 'dateRange',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'date',
                fieldOptions: DATERANGE_TYPES,
                fieldLabel: 'Select date range',
                fieldDefaultValue: 'all',
            },
            // DATERANGE TYPE FILTER
            {
                fieldName: 'dateRangeType',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'date',
                fieldOptions: DATERANGE_BY_TYPES,
                fieldLabel: 'Select date range type',
                fieldDefaultValue: "createdAt"
            }
        ]
    },
    // TaskClosedTotalsByLabel
    {
        templateType: "TaskClosedTotalsByLabel",
        serviceType: 'cards',
        name: 'Total Task Count By Label',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string,
        ) => {

            const matchFilter = await buildMatchFilter(filter, 'task', subdomain, models)

            const pipeline = [
                {
                    $unwind: "$labelIds",
                },
                {
                    $match: {
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
                        _id: 0,
                        label: "$label.name",
                        count: 1,
                    },
                },
            ]

            const tasks = await models.Tasks.aggregate(pipeline)

            const totalCountByLabel = (tasks || []).reduce((acc, { count, label }) => {
                acc[label] = count;
                return acc;
            }, {});

            const data = Object.values(totalCountByLabel);
            const labels = Object.keys(totalCountByLabel);
            const title = 'Total Task Count By Label';

            return { title, data, labels };
        },
        filterTypes: [
            // USER TYPE FILTER
            {
                fieldName: 'userType',
                fieldType: 'select',
                multi: false,
                fieldDefaultValue: 'userId',
                fieldOptions: USER_TYPES,
                fieldLabel: 'Select user type',
            },
            // USER FILTER
            {
                fieldName: 'userIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'users',
                fieldLabel: 'Select users',
            },
            // BRANCH FILTER
            {
                fieldName: 'branchIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'branches',
                fieldLabel: 'Select branches',
            },
            // DEPARTMENT FILTER
            {
                fieldName: 'departmentIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'departments',
                fieldLabel: 'Select departments',
            },
            // COMPANY FILTER
            {
                fieldName: 'companyIds',
                fieldType: 'select',
                fieldQuery: 'companies',
                multi: true,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'primaryName',
                fieldQueryVariables: `{"conformityMainType": "task", "conformityRelType": "company"}`,
                fieldLabel: 'Select companies',
            },
            // CUSTOMER FILTER
            {
                fieldName: 'customerIds',
                fieldType: 'select',
                fieldQuery: 'customers',
                multi: true,
                fieldQueryVariables: `{"conformityMainType": "task", "conformityRelType": "customer"}`,
                fieldLabel: 'Select customers',
            },
            // TAG FILTER
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "cards:task", "perPage": 1000}`,
                multi: true,
                fieldLabel: 'Select tags',
            },
            // BOARD FILTER
            {
                fieldName: 'boardId',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'boards',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "task"}`,
                fieldLabel: 'Select board',
            },
            // PIPELINE FILTER
            {
                fieldName: 'pipelineIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'pipelines',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "task"}`,
                logics: [
                    {
                        logicFieldName: 'boardId',
                        logicFieldVariable: 'boardId',
                    },
                ],
                fieldLabel: 'Select pipeline',
            },
            // STAGE PROBABILITY FILTER
            {
                fieldName: 'stageProbability',
                fieldType: 'select',
                fieldOptions: PROBABILITY_TASK,
                logics: [
                    {
                        logicFieldName: 'pipelineIds',
                        logicFieldVariable: 'pipelineIds',
                    },
                ],
                fieldLabel: 'Select Probability',
            },
            // STAGE FILTER
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
                fieldLabel: 'Select stages',
            },
            // LABEL FILTER
            {
                fieldName: 'labelIds',
                fieldType: 'select',
                fieldQuery: 'pipelineLabels',
                multi: true,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldParentVariable: "pipelineId",
                fieldParentQuery: "pipelines",
                logics: [
                    {
                        logicFieldName: 'pipelineIds',
                        logicFieldVariable: 'pipelineIds',
                    },
                ],
                fieldLabel: 'Select label',
            },
            // PRIORITY FILTER 
            {
                fieldName: 'status',
                fieldType: 'select',
                fieldOptions: STATUS_TYPES,
                fieldLabel: 'Select status',
            },
            // PRIORITY FILTER 
            {
                fieldName: 'priority',
                fieldType: 'select',
                fieldOptions: PRIORITY,
                fieldLabel: 'Select priority',
            },
            // ATTACHMENT FILTER
            {
                fieldName: 'attachment',
                fieldType: 'select',
                fieldOptions: ATTACHMENT_TYPES,
                fieldLabel: 'Select attachment',
            },
            // CUSTOM PROPERTIES FILTER 
            {
                fieldName: 'groupIds',
                fieldType: 'select',
                fieldQuery: 'fieldsGroups',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"contentType": "cards:task"}`,
                multi: true,
                fieldLabel: 'Select field group',
            },
            // CUSTOM PROPERTIES FIELD FILTER 
            {
                fieldName: 'fieldIds',
                fieldType: 'select',
                fieldQuery: 'fields',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'text',
                fieldParentVariable: 'groupId',
                fieldParentQuery: "fieldsGroups",
                fieldQueryVariables: `{"contentType": "cards:task", "isVisible": true}`,
                logics: [
                    {
                        logicFieldName: 'groupIds',
                        logicFieldVariable: 'groupIds',
                        logicFieldExtraVariable: `{"contentType": "cards:task"}`,
                    },
                ],
                multi: true,
                fieldLabel: 'Select field',
            },
            // DATERANGE FILTER
            {
                fieldName: 'dateRange',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'date',
                fieldOptions: DATERANGE_TYPES,
                fieldLabel: 'Select date range',
                fieldDefaultValue: 'all',
            },
            // DATERANGE TYPE FILTER
            {
                fieldName: 'dateRangeType',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'date',
                fieldOptions: DATERANGE_BY_TYPES,
                fieldLabel: 'Select date range type',
                fieldDefaultValue: "createdAt"
            }
        ]
    },
    // TaskClosedTotalsByReps
    {
        templateType: "TaskClosedTotalsByReps",
        serviceType: 'cards',
        name: 'Total Task Count By Rep',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string,
        ) => {
            const { userType = "userId" } = filter

            const matchFilter = await buildMatchFilter(filter, 'task', subdomain, models)

            const pipeline = [
                {
                    $match: {
                        [userType]: { $exists: true },
                        ...matchFilter
                    },
                },
                ...(userType === 'assignedUserIds' ? [{ $unwind: "$assignedUserIds" }] : []),
                {
                    $group: {
                        _id: `$${userType}`,
                        count: { $sum: 1 },
                    },
                },
                {
                    $lookup: {
                        from: "users",
                        let: {
                            userId: "$_id",
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$_id", "$$userId"] },
                                            { $eq: ["$isActive", true] },
                                        ],
                                    },
                                },
                            },
                        ],
                        as: "user",
                    },
                },
                {
                    $unwind: "$user",
                },
                {
                    $project: {
                        _id: 0,
                        user: "$user",
                        count: 1
                    },
                },
            ]

            const tasks = await models.Tasks.aggregate(pipeline)

            const totalCountByRep = (tasks || []).reduce((acc, { count, user }) => {
                if (user) {
                    acc[user.details.fullName || user.email] = count;
                }
                return acc;
            }, {});

            const data = Object.values(totalCountByRep);
            const labels = Object.keys(totalCountByRep);
            const title = 'Total Task Count By Rep';

            return { title, data, labels };
        },
        filterTypes: [
            // USER TYPE FILTER
            {
                fieldName: 'userType',
                fieldType: 'select',
                multi: false,
                fieldDefaultValue: 'userId',
                fieldOptions: USER_TYPES,
                fieldLabel: 'Select user type',
            },
            // USER FILTER
            {
                fieldName: 'userIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'users',
                fieldLabel: 'Select users',
            },
            // BRANCH FILTER
            {
                fieldName: 'branchIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'branches',
                fieldLabel: 'Select branches',
            },
            // DEPARTMENT FILTER
            {
                fieldName: 'departmentIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'departments',
                fieldLabel: 'Select departments',
            },
            // COMPANY FILTER
            {
                fieldName: 'companyIds',
                fieldType: 'select',
                fieldQuery: 'companies',
                multi: true,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'primaryName',
                fieldQueryVariables: `{"conformityMainType": "task", "conformityRelType": "company"}`,
                fieldLabel: 'Select companies',
            },
            // CUSTOMER FILTER
            {
                fieldName: 'customerIds',
                fieldType: 'select',
                fieldQuery: 'customers',
                multi: true,
                fieldQueryVariables: `{"conformityMainType": "task", "conformityRelType": "customer"}`,
                fieldLabel: 'Select customers',
            },
            // TAG FILTER
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "cards:task", "perPage": 1000}`,
                multi: true,
                fieldLabel: 'Select tags',
            },
            // BOARD FILTER
            {
                fieldName: 'boardId',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'boards',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "task"}`,
                fieldLabel: 'Select board',
            },
            // PIPELINE FILTER
            {
                fieldName: 'pipelineIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'pipelines',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "task"}`,
                logics: [
                    {
                        logicFieldName: 'boardId',
                        logicFieldVariable: 'boardId',
                    },
                ],
                fieldLabel: 'Select pipelines',
            },
            // STAGE PROBABILITY FILTER
            {
                fieldName: 'stageProbability',
                fieldType: 'select',
                fieldOptions: PROBABILITY_TASK,
                logics: [
                    {
                        logicFieldName: 'pipelineIds',
                        logicFieldVariable: 'pipelineIds',
                    },
                ],
                fieldLabel: 'Select Probability',
            },
            // STAGE FILTER
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
                fieldLabel: 'Select stages',
            },
            // LABEL FILTER
            {
                fieldName: 'labelIds',
                fieldType: 'select',
                fieldQuery: 'pipelineLabels',
                multi: true,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                logics: [
                    {
                        logicFieldName: 'pipelineIds',
                        logicFieldVariable: 'pipelineIds',
                    },
                ],
                fieldLabel: 'Select labels',
            },
            // PRIORITY FILTER 
            {
                fieldName: 'status',
                fieldType: 'select',
                fieldOptions: STATUS_TYPES,
                fieldLabel: 'Select status',
            },
            // PRIORITY FILTER 
            {
                fieldName: 'priority',
                fieldType: 'select',
                fieldOptions: PRIORITY,
                fieldLabel: 'Select priority',
            },
            // ATTACHMENT FILTER
            {
                fieldName: 'attachment',
                fieldType: 'select',
                fieldOptions: ATTACHMENT_TYPES,
                fieldLabel: 'Select attachment',
            },
            // CUSTOM PROPERTIES FILTER 
            {
                fieldName: 'groupIds',
                fieldType: 'select',
                fieldQuery: 'fieldsGroups',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"contentType": "cards:task"}`,
                multi: true,
                fieldLabel: 'Select field group',
            },
            // CUSTOM PROPERTIES FIELD FILTER 
            {
                fieldName: 'fieldIds',
                fieldType: 'select',
                fieldQuery: 'fields',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'text',
                fieldParentVariable: 'groupId',
                fieldParentQuery: "fieldsGroups",
                fieldQueryVariables: `{"contentType": "cards:task", "isVisible": true}`,
                logics: [
                    {
                        logicFieldName: 'groupIds',
                        logicFieldVariable: 'groupIds',
                        logicFieldExtraVariable: `{"contentType": "cards:task"}`,
                    },
                ],
                multi: true,
                fieldLabel: 'Select field',
            },
            // DATERANGE FILTER
            {
                fieldName: 'dateRange',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'date',
                fieldOptions: DATERANGE_TYPES,
                fieldLabel: 'Select date range',
                fieldDefaultValue: 'all',
            },
            // DATERANGE TYPE FILTER
            {
                fieldName: 'dateRangeType',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'date',
                fieldOptions: DATERANGE_BY_TYPES,
                fieldLabel: 'Select date range type',
                fieldDefaultValue: "createdAt"
            }
        ]
    },

    // TaskAverageTimeToCloseByTags
    {
        templateType: "TaskAverageTimeToCloseByTags",
        serviceType: 'cards',
        name: 'Task Average Time To Close By Tag',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string,
        ) => {

            const matchFilter = await buildMatchFilter(filter, 'task', subdomain, models)

            const stageIds = await getStageIds({ ...filter, stageProbability: PROBABILITY_CLOSED['task'] }, 'task', models)

            const pipeline = [
                {
                    $unwind: "$tagIds",
                },
                {
                    $match: {
                        stageId: { $in: stageIds },
                        ...matchFilter
                    }
                },
                {
                    $group: {
                        _id: "$tagIds",
                        measure: {
                            $push: {
                                $subtract: ["$stageChangedDate", "$createdAt"]
                            }
                        },
                    },
                },
                {
                    $lookup: {
                        from: "tags",
                        localField: "_id",
                        foreignField: "_id",
                        as: "tag",
                    },
                },
                {
                    $unwind: "$tag",
                },
                {
                    $project: {
                        _id: 0,
                        tag: "$tag.name",
                        measure: {
                            $avg: "$measure"
                        }
                    },
                },
            ]

            const tasks = await models.Tasks.aggregate(pipeline)

            const totalCountByTag = (tasks || []).reduce((acc, { measure, tag }) => {
                acc[tag] = measure;
                return acc;
            }, {});

            const data = Object.values(totalCountByTag);
            const labels = Object.keys(totalCountByTag);
            const title = 'Task Average Time To Close By Tag';

            return { title, data, labels };
        },
        filterTypes: [
            // USER TYPE FILTER
            {
                fieldName: 'userType',
                fieldType: 'select',
                multi: false,
                fieldDefaultValue: 'userId',
                fieldOptions: USER_TYPES,
                fieldLabel: 'Select user type',
            },
            // USER FILTER
            {
                fieldName: 'userIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'users',
                fieldLabel: 'Select users',
            },
            // BRANCH FILTER
            {
                fieldName: 'branchIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'branches',
                fieldLabel: 'Select branches',
            },
            // DEPARTMENT FILTER
            {
                fieldName: 'departmentIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'departments',
                fieldLabel: 'Select departments',
            },
            // COMPANY FILTER
            {
                fieldName: 'companyIds',
                fieldType: 'select',
                fieldQuery: 'companies',
                multi: true,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'primaryName',
                fieldQueryVariables: `{"conformityMainType": "task", "conformityRelType": "company"}`,
                fieldLabel: 'Select companies',
            },
            // CUSTOMER FILTER
            {
                fieldName: 'customerIds',
                fieldType: 'select',
                fieldQuery: 'customers',
                multi: true,
                fieldQueryVariables: `{"conformityMainType": "task", "conformityRelType": "customer"}`,
                fieldLabel: 'Select customers',
            },
            // TAG FILTER
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "cards:task", "perPage": 1000}`,
                multi: true,
                fieldLabel: 'Select tags',
            },
            // BOARD FILTER
            {
                fieldName: 'boardId',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'boards',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "task"}`,
                fieldLabel: 'Select board',
            },
            // PIPELINE FILTER
            {
                fieldName: 'pipelineIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'pipelines',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "task"}`,
                logics: [
                    {
                        logicFieldName: 'boardId',
                        logicFieldVariable: 'boardId',
                    },
                ],
                fieldLabel: 'Select pipelines',
            },
            // STAGE PROBABILITY FILTER
            {
                fieldName: 'stageProbability',
                fieldType: 'select',
                fieldOptions: PROBABILITY_TASK,
                logics: [
                    {
                        logicFieldName: 'pipelineIds',
                        logicFieldVariable: 'pipelineIds',
                    },
                ],
                fieldLabel: 'Select Probability',
            },
            // STAGE FILTER
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
                fieldLabel: 'Select stages',
            },
            // LABEL FILTER
            {
                fieldName: 'labelIds',
                fieldType: 'select',
                fieldQuery: 'pipelineLabels',
                multi: true,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                logics: [
                    {
                        logicFieldName: 'pipelineIds',
                        logicFieldVariable: 'pipelineIds',
                    },
                ],
                fieldLabel: 'Select labels',
            },
            // PRIORITY FILTER 
            {
                fieldName: 'status',
                fieldType: 'select',
                fieldOptions: STATUS_TYPES,
                fieldLabel: 'Select status',
            },
            // PRIORITY FILTER 
            {
                fieldName: 'priority',
                fieldType: 'select',
                fieldOptions: PRIORITY,
                fieldLabel: 'Select priority',
            },
            // ATTACHMENT FILTER
            {
                fieldName: 'attachment',
                fieldType: 'select',
                fieldOptions: ATTACHMENT_TYPES,
                fieldLabel: 'Select attachment',
            },
            // CUSTOM PROPERTIES FILTER 
            {
                fieldName: 'groupIds',
                fieldType: 'select',
                fieldQuery: 'fieldsGroups',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"contentType": "cards:task"}`,
                multi: true,
                fieldLabel: 'Select field group',
            },
            // CUSTOM PROPERTIES FIELD FILTER 
            {
                fieldName: 'fieldIds',
                fieldType: 'select',
                fieldQuery: 'fields',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'text',
                fieldParentVariable: 'groupId',
                fieldParentQuery: "fieldsGroups",
                fieldQueryVariables: `{"contentType": "cards:task", "isVisible": true}`,
                logics: [
                    {
                        logicFieldName: 'groupIds',
                        logicFieldVariable: 'groupIds',
                        logicFieldExtraVariable: `{"contentType": "cards:task"}`,
                    },
                ],
                multi: true,
                fieldLabel: 'Select field',
            },
            // DATERANGE FILTER
            {
                fieldName: 'dateRange',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'date',
                fieldOptions: DATERANGE_TYPES,
                fieldLabel: 'Select date range',
                fieldDefaultValue: 'all',
            },
            // DATERANGE TYPE FILTER
            {
                fieldName: 'dateRangeType',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'date',
                fieldOptions: DATERANGE_BY_TYPES,
                fieldLabel: 'Select date range type',
                fieldDefaultValue: "createdAt"
            }
        ]
    },
    // TaskAverageTimeToCloseByLabel
    {
        templateType: "TaskAverageTimeToCloseByLabel",
        serviceType: 'cards',
        name: 'Task Average Time To Close By Label',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string,
        ) => {

            const matchFilter = await buildMatchFilter(filter, 'task', subdomain, models)

            const stageIds = await getStageIds({ ...filter, stageProbability: PROBABILITY_CLOSED['task'] }, 'task', models)

            const pipeline = [
                {
                    $unwind: "$labelIds",
                },
                {
                    $match: {
                        stageId: { $in: stageIds },
                        ...matchFilter
                    }
                },
                {
                    $group: {
                        _id: "$labelIds",
                        measure: {
                            $push: {
                                $subtract: ["$stageChangedDate", "$createdAt"]
                            }
                        },
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
                        _id: 0,
                        label: "$label.name",
                        measure: {
                            $avg: "$measure"
                        }
                    },
                },
            ]

            const tasks = await models.Tasks.aggregate(pipeline)

            const totalCountByLabel = (tasks || []).reduce((acc, { measure, label }) => {
                acc[label] = measure;
                return acc;
            }, {});

            const data = Object.values(totalCountByLabel);
            const labels = Object.keys(totalCountByLabel);
            const title = 'Task Average Time To Close By Label';

            return { title, data, labels };
        },
        filterTypes: [
            // USER TYPE FILTER
            {
                fieldName: 'userType',
                fieldType: 'select',
                multi: false,
                fieldDefaultValue: 'userId',
                fieldOptions: USER_TYPES,
                fieldLabel: 'Select user type',
            },
            // USER FILTER
            {
                fieldName: 'userIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'users',
                fieldLabel: 'Select users',
            },
            // BRANCH FILTER
            {
                fieldName: 'branchIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'branches',
                fieldLabel: 'Select branches',
            },
            // DEPARTMENT FILTER
            {
                fieldName: 'departmentIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'departments',
                fieldLabel: 'Select departments',
            },
            // COMPANY FILTER
            {
                fieldName: 'companyIds',
                fieldType: 'select',
                fieldQuery: 'companies',
                multi: true,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'primaryName',
                fieldQueryVariables: `{"conformityMainType": "task", "conformityRelType": "company"}`,
                fieldLabel: 'Select companies',
            },
            // CUSTOMER FILTER
            {
                fieldName: 'customerIds',
                fieldType: 'select',
                fieldQuery: 'customers',
                multi: true,
                fieldQueryVariables: `{"conformityMainType": "task", "conformityRelType": "customer"}`,
                fieldLabel: 'Select customers',
            },
            // TAG FILTER
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "cards:task", "perPage": 1000}`,
                multi: true,
                fieldLabel: 'Select tags',
            },
            // BOARD FILTER
            {
                fieldName: 'boardId',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'boards',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "task"}`,
                fieldLabel: 'Select board',
            },
            // PIPELINE FILTER
            {
                fieldName: 'pipelineIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'pipelines',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "task"}`,
                logics: [
                    {
                        logicFieldName: 'boardId',
                        logicFieldVariable: 'boardId',
                    },
                ],
                fieldLabel: 'Select pipelines',
            },
            // STAGE PROBABILITY FILTER
            {
                fieldName: 'stageProbability',
                fieldType: 'select',
                fieldOptions: PROBABILITY_TASK,
                logics: [
                    {
                        logicFieldName: 'pipelineIds',
                        logicFieldVariable: 'pipelineIds',
                    },
                ],
                fieldLabel: 'Select Probability',
            },
            // STAGE FILTER
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
                fieldLabel: 'Select stages',
            },
            // LABEL FILTER
            {
                fieldName: 'labelIds',
                fieldType: 'select',
                fieldQuery: 'pipelineLabels',
                multi: true,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                logics: [
                    {
                        logicFieldName: 'pipelineIds',
                        logicFieldVariable: 'pipelineIds',
                    },
                ],
                fieldLabel: 'Select labels',
            },
            // PRIORITY FILTER 
            {
                fieldName: 'status',
                fieldType: 'select',
                fieldOptions: STATUS_TYPES,
                fieldLabel: 'Select status',
            },
            // PRIORITY FILTER 
            {
                fieldName: 'priority',
                fieldType: 'select',
                fieldOptions: PRIORITY,
                fieldLabel: 'Select priority',
            },
            // ATTACHMENT FILTER
            {
                fieldName: 'attachment',
                fieldType: 'select',
                fieldOptions: ATTACHMENT_TYPES,
                fieldLabel: 'Select attachment',
            },
            // CUSTOM PROPERTIES FILTER 
            {
                fieldName: 'groupIds',
                fieldType: 'select',
                fieldQuery: 'fieldsGroups',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"contentType": "cards:task"}`,
                multi: true,
                fieldLabel: 'Select field group',
            },
            // CUSTOM PROPERTIES FIELD FILTER 
            {
                fieldName: 'fieldIds',
                fieldType: 'select',
                fieldQuery: 'fields',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'text',
                fieldParentVariable: 'groupId',
                fieldParentQuery: "fieldsGroups",
                fieldQueryVariables: `{"contentType": "cards:task", "isVisible": true}`,
                logics: [
                    {
                        logicFieldName: 'groupIds',
                        logicFieldVariable: 'groupIds',
                        logicFieldExtraVariable: `{"contentType": "cards:task"}`,
                    },
                ],
                multi: true,
                fieldLabel: 'Select field',
            },
            // DATERANGE FILTER
            {
                fieldName: 'dateRange',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'date',
                fieldOptions: DATERANGE_TYPES,
                fieldLabel: 'Select date range',
                fieldDefaultValue: 'all',
            },
            // DATERANGE TYPE FILTER
            {
                fieldName: 'dateRangeType',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'date',
                fieldOptions: DATERANGE_BY_TYPES,
                fieldLabel: 'Select date range type',
                fieldDefaultValue: "createdAt"
            }
        ]
    },
    // TaskAverageTimeToCloseByReps
    {
        templateType: "TaskAverageTimeToCloseByReps",
        serviceType: 'cards',
        name: 'Task Average Time To Close By Rep',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string,
        ) => {
            const { userType = "userId" } = filter
            const matchFilter = await buildMatchFilter(filter, 'task', subdomain, models)

            const stageIds = await getStageIds({ ...filter, stageProbability: PROBABILITY_CLOSED['task'] }, 'task', models)

            const pipeline = [
                {
                    $match: {
                        stageId: { $in: stageIds },
                        [userType]: { $exists: true },
                        ...matchFilter
                    },
                },
                ...(userType === 'assignedUserIds' ? [{ $unwind: "$assignedUserIds" }] : []),
                {
                    $group: {
                        _id: `$${userType}`,
                        measure: {
                            $push: {
                                $subtract: ["$stageChangedDate", "$createdAt"]
                            }
                        },
                    },
                },
                {
                    $lookup: {
                        from: "users",
                        let: {
                            userId: "$_id",
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$_id", "$$userId"] },
                                            { $eq: ["$isActive", true] },
                                        ],
                                    },
                                },
                            },
                        ],
                        as: "user",
                    },
                },
                {
                    $unwind: "$user",
                },
                {
                    $project: {
                        _id: 0,
                        user: "$user",
                        measure: {
                            $avg: "$measure"
                        }
                    },
                },
            ]

            const tasks = await models.Tasks.aggregate(pipeline)

            const totalCountByRep = (tasks || []).reduce((acc, { measure, user }) => {
                if (user) {
                    acc[user.details.fullName || user.email] = measure;
                }
                return acc;
            }, {});

            const data = Object.values(totalCountByRep);
            const labels = Object.keys(totalCountByRep);
            const title = 'Task Average Time To Close By Rep';

            return { title, data, labels };
        },
        filterTypes: [
            // USER TYPE FILTER
            {
                fieldName: 'userType',
                fieldType: 'select',
                multi: false,
                fieldDefaultValue: 'userId',
                fieldOptions: USER_TYPES,
                fieldLabel: 'Select user type',
            },
            // USER FILTER
            {
                fieldName: 'userIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'users',
                fieldLabel: 'Select users',
            },
            // BRANCH FILTER
            {
                fieldName: 'branchIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'branches',
                fieldLabel: 'Select branches',
            },
            // DEPARTMENT FILTER
            {
                fieldName: 'departmentIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'departments',
                fieldLabel: 'Select departments',
            },
            // COMPANY FILTER
            {
                fieldName: 'companyIds',
                fieldType: 'select',
                fieldQuery: 'companies',
                multi: true,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'primaryName',
                fieldQueryVariables: `{"conformityMainType": "task", "conformityRelType": "company"}`,
                fieldLabel: 'Select companies',
            },
            // CUSTOMER FILTER
            {
                fieldName: 'customerIds',
                fieldType: 'select',
                fieldQuery: 'customers',
                multi: true,
                fieldQueryVariables: `{"conformityMainType": "task", "conformityRelType": "customer"}`,
                fieldLabel: 'Select customers',
            },
            // TAG FILTER
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "cards:task", "perPage": 1000}`,
                multi: true,
                fieldLabel: 'Select tags',
            },
            // BOARD FILTER
            {
                fieldName: 'boardId',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'boards',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "task"}`,
                fieldLabel: 'Select board',
            },
            // PIPELINE FILTER
            {
                fieldName: 'pipelineIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'pipelines',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "task"}`,
                logics: [
                    {
                        logicFieldName: 'boardId',
                        logicFieldVariable: 'boardId',
                    },
                ],
                fieldLabel: 'Select pipelines',
            },
            // STAGE PROBABILITY FILTER
            {
                fieldName: 'stageProbability',
                fieldType: 'select',
                fieldOptions: PROBABILITY_TASK,
                logics: [
                    {
                        logicFieldName: 'pipelineIds',
                        logicFieldVariable: 'pipelineIds',
                    },
                ],
                fieldLabel: 'Select Probability',
            },
            // STAGE FILTER
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
                fieldLabel: 'Select stages',
            },
            // LABEL FILTER
            {
                fieldName: 'labelIds',
                fieldType: 'select',
                fieldQuery: 'pipelineLabels',
                multi: true,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                logics: [
                    {
                        logicFieldName: 'pipelineIds',
                        logicFieldVariable: 'pipelineIds',
                    },
                ],
                fieldLabel: 'Select labels',
            },
            // PRIORITY FILTER 
            {
                fieldName: 'status',
                fieldType: 'select',
                fieldOptions: STATUS_TYPES,
                fieldLabel: 'Select status',
            },
            // PRIORITY FILTER 
            {
                fieldName: 'priority',
                fieldType: 'select',
                fieldOptions: PRIORITY,
                fieldLabel: 'Select priority',
            },
            // ATTACHMENT FILTER
            {
                fieldName: 'attachment',
                fieldType: 'select',
                fieldOptions: ATTACHMENT_TYPES,
                fieldLabel: 'Select attachment',
            },
            // CUSTOM PROPERTIES FILTER 
            {
                fieldName: 'groupIds',
                fieldType: 'select',
                fieldQuery: 'fieldsGroups',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"contentType": "cards:task"}`,
                multi: true,
                fieldLabel: 'Select field group',
            },
            // CUSTOM PROPERTIES FIELD FILTER 
            {
                fieldName: 'fieldIds',
                fieldType: 'select',
                fieldQuery: 'fields',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'text',
                fieldParentVariable: 'groupId',
                fieldParentQuery: "fieldsGroups",
                fieldQueryVariables: `{"contentType": "cards:task", "isVisible": true}`,
                logics: [
                    {
                        logicFieldName: 'groupIds',
                        logicFieldVariable: 'groupIds',
                        logicFieldExtraVariable: `{"contentType": "cards:task"}`,
                    },
                ],
                multi: true,
                fieldLabel: 'Select field',
            },
            // DATERANGE FILTER
            {
                fieldName: 'dateRange',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'date',
                fieldOptions: DATERANGE_TYPES,
                fieldLabel: 'Select date range',
                fieldDefaultValue: 'all',
            },
            // DATERANGE TYPE FILTER
            {
                fieldName: 'dateRangeType',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'date',
                fieldOptions: DATERANGE_BY_TYPES,
                fieldLabel: 'Select date range type',
                fieldDefaultValue: "createdAt"
            }
        ]
    },

    // AllTasksIncompleteByDueDate
    {
        templateType: "AllTasksIncompleteByDueDate",
        serviceType: 'cards',
        name: 'Total Task Count By Due Date',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string,
        ) => {

            const { dateRangeType = 'closeDate', frequencyType = '%Y-%m-%d' } = filter

            const matchFilter = await buildMatchFilter(filter, 'task', subdomain, models)

            let projectStage: any = [
                {
                    $project: {
                        _id: 1,
                        count: 1,
                    },
                }
            ]

            if (frequencyType === '%m') {
                projectStage = [
                    {
                        $project: {
                            _id: {
                                $arrayElemAt: [MONTH_NAMES, { $subtract: [{ $toInt: "$_id" }, 1] }],
                            },
                            count: 1,
                        },
                    }
                ]
            }

            if (frequencyType === '%V') {
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
                        },
                    }
                ]
            }

            const pipeline = [
                {
                    $match: {
                        [dateRangeType]: { $ne: null, $gt: new Date("2017-01-01") },
                        ...matchFilter
                    },
                },
                {
                    $group: {
                        _id: { $dateToString: { format: frequencyType, date: `$${dateRangeType}` } },
                        count: { $sum: 1 },
                        createdAt: { $first: `$${dateRangeType}` },
                    },
                },
                { $sort: { _id: 1 } },
                ...projectStage
            ]

            const tasks = await models.Tasks.aggregate(pipeline)

            const totalCountByDueDate = (tasks || []).reduce((acc, { count, _id }) => {
                acc[_id] = count;
                return acc;
            }, {});

            const data = Object.values(totalCountByDueDate);
            const labels = Object.keys(totalCountByDueDate);
            const title = 'Total Task Count By Due Date';

            return { title, data, labels };
        },
        filterTypes: [
            // USER TYPE FILTER
            {
                fieldName: 'userType',
                fieldType: 'select',
                multi: false,
                fieldDefaultValue: 'userId',
                fieldOptions: USER_TYPES,
                fieldLabel: 'Select user type',
            },
            // USER FILTER
            {
                fieldName: 'userIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'users',
                fieldLabel: 'Select users',
            },
            // BRANCH FILTER
            {
                fieldName: 'branchIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'branches',
                fieldLabel: 'Select branches',
            },
            // DEPARTMENT FILTER
            {
                fieldName: 'departmentIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'departments',
                fieldLabel: 'Select departments',
            },
            // COMPANY FILTER
            {
                fieldName: 'companyIds',
                fieldType: 'select',
                fieldQuery: 'companies',
                multi: true,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'primaryName',
                fieldQueryVariables: `{"conformityMainType": "task", "conformityRelType": "company"}`,
                fieldLabel: 'Select companies',
            },
            // CUSTOMER FILTER
            {
                fieldName: 'customerIds',
                fieldType: 'select',
                fieldQuery: 'customers',
                multi: true,
                fieldQueryVariables: `{"conformityMainType": "task", "conformityRelType": "customer"}`,
                fieldLabel: 'Select customers',
            },
            // TAG FILTER
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "cards:task", "perPage": 1000}`,
                multi: true,
                fieldLabel: 'Select tags',
            },
            // BOARD FILTER
            {
                fieldName: 'boardId',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'boards',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "task"}`,
                fieldLabel: 'Select board',
            },
            // PIPELINE FILTER
            {
                fieldName: 'pipelineIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'pipelines',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "task"}`,
                logics: [
                    {
                        logicFieldName: 'boardId',
                        logicFieldVariable: 'boardId',
                    },
                ],
                fieldLabel: 'Select pipelines',
            },
            // STAGE PROBABILITY FILTER
            {
                fieldName: 'stageProbability',
                fieldType: 'select',
                fieldOptions: PROBABILITY_TASK,
                logics: [
                    {
                        logicFieldName: 'pipelineIds',
                        logicFieldVariable: 'pipelineIds',
                    },
                ],
                fieldLabel: 'Select Probability',
            },
            // STAGE FILTER
            {
                fieldName: 'stageIds',
                fieldType: 'select',
                fieldQuery: 'stages',
                multi: true,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldParentVariable: 'pipelineId',
                fieldQueryVariables: `{"type": "task"}`,
                fieldParentQuery: "pipelines",
                logics: [
                    {
                        logicFieldName: 'pipelineIds',
                        logicFieldVariable: 'pipelineIds',
                    },
                ],
                fieldLabel: 'Select stages',
            },
            // LABEL FILTER
            {
                fieldName: 'labelIds',
                fieldType: 'select',
                fieldQuery: 'pipelineLabels',
                multi: true,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                logics: [
                    {
                        logicFieldName: 'pipelineIds',
                        logicFieldVariable: 'pipelineIds',
                    },
                ],
                fieldLabel: 'Select labels',
            },
            // PRIORITY FILTER 
            {
                fieldName: 'status',
                fieldType: 'select',
                fieldOptions: STATUS_TYPES,
                fieldLabel: 'Select status',
            },
            // PRIORITY FILTER 
            {
                fieldName: 'priority',
                fieldType: 'select',
                fieldOptions: PRIORITY,
                fieldLabel: 'Select priority',
            },
            // ATTACHMENT FILTER
            {
                fieldName: 'attachment',
                fieldType: 'select',
                fieldOptions: ATTACHMENT_TYPES,
                fieldLabel: 'Select attachment',
            },
            // CUSTOM PROPERTIES FILTER 
            {
                fieldName: 'groupIds',
                fieldType: 'select',
                fieldQuery: 'fieldsGroups',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"contentType": "cards:task"}`,
                multi: true,
                fieldLabel: 'Select field group',
            },
            // CUSTOM PROPERTIES FIELD FILTER 
            {
                fieldName: 'fieldIds',
                fieldType: 'select',
                fieldQuery: 'fields',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'text',
                fieldParentVariable: 'groupId',
                fieldParentQuery: "fieldsGroups",
                fieldQueryVariables: `{"contentType": "cards:task", "isVisible": true}`,
                logics: [
                    {
                        logicFieldName: 'groupIds',
                        logicFieldVariable: 'groupIds',
                        logicFieldExtraVariable: `{"contentType": "cards:task"}`,
                    },
                ],
                multi: true,
                fieldLabel: 'Select field',
            },
            // DUE FILTER
            {
                fieldName: 'dueType',
                fieldType: 'select',
                fieldOptions: DUE_TYPES,
                fieldLabel: 'Select due type',
                fieldDefaultValue: 'due',
            },
            // DATE RANGE FILTER
            {
                fieldName: 'dueDateRange',
                fieldType: 'select',
                fieldOptions: DUE_DATERANGE_TYPES,
                fieldQuery: 'date',
                fieldLabel: 'Select due date range',
                fieldDefaultValue: 'thisWeek',
            },
            // FREQUENCY TYPE FILTER
            {
                fieldName: 'frequencyType',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'date',
                fieldOptions: CUSTOM_DATE_FREQUENCY_TYPES,
                fieldLabel: 'Select frequency type',
                fieldDefaultValue: "%Y-%m-%d"
            },
            // DATE RANGE TYPE FILTER
            {
                fieldName: 'dateRangeType',
                fieldType: 'select',
                multi: false,
                fieldOptions: DATERANGE_BY_TYPES,
                fieldLabel: 'Select date range type',
                fieldDefaultValue: "closeDate"
            }
        ]
    },
]