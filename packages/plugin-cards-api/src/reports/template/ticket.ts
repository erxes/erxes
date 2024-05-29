import { IModels } from "../../connectionResolver";
import { MONTH_NAMES, PROBABILITY_CLOSED, CUSTOM_DATE_FREQUENCY_TYPES, DATERANGE_TYPES, DATERANGE_BY_TYPES, ATTACHMENT_TYPES, PRIORITY, STATUS_TYPES, PROBABILITY_TICKET, USER_TYPES, INTEGRATION_OPTIONS } from "../constants";
import { buildMatchFilter, getDimensionPipeline, getIntegrationsKinds, getStageIds } from "../utils";

const DIMENSION_OPTIONS = [
    { label: 'Total count', value: 'count' },
    { label: 'Team members', value: 'teamMember' },
    { label: 'Departments', value: 'department' },
    { label: 'Branches', value: 'branch' },
    { label: 'Companies', value: 'company' },
    { label: 'Customers', value: 'customer' },
    { label: 'Source', value: 'source' },
    { label: 'Boards', value: 'board' },
    { label: 'Pipelines', value: 'pipeline' },
    { label: 'Stages', value: 'stage' },
    { label: 'Tags', value: 'tag' },
    { label: 'Labels', value: 'label' },
    { label: 'Frequency (day, week, month)', value: 'frequency' },
    { label: 'Status', value: 'status' },
    { label: 'Priority', value: 'priority' },
]

export const ticketCharts = [
    // TicketCustomProperties
    {
        templateType: "TicketCustomProperties",
        serviceType: 'cards',
        name: 'Total Ticket Count By Custom Properties',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string,
        ) => {
            const matchFilter = await buildMatchFilter(filter, 'ticket', subdomain, models)

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

            const tickets = await models.Tickets.aggregate(pipeline)

            const totalCountByCustomProperties = (tickets || []).reduce((acc, { field,
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
            const title = 'Total Ticket Count Custom Properties';

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
                fieldQueryVariables: `{"conformityMainType": "ticket", "conformityRelType": "company"}`,
                fieldLabel: 'Select companies',
            },
            // CUSTOMER FILTER
            {
                fieldName: 'customerIds',
                fieldType: 'select',
                fieldQuery: 'customers',
                multi: true,
                fieldQueryVariables: `{"conformityMainType": "ticket", "conformityRelType": "customer"}`,
                fieldLabel: 'Select customers',
            },
            // TAG FILTER
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "cards:ticket", "perPage": 1000}`,
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
                fieldQueryVariables: `{"type": "ticket"}`,
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
                fieldQueryVariables: `{"type": "ticket"}`,
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
                fieldOptions: PROBABILITY_TICKET,
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
                fieldQueryVariables: `{"contentType": "cards:ticket"}`,
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
                fieldQueryVariables: `{"contentType": "cards:ticket", "isVisible": true}`,
                logics: [
                    {
                        logicFieldName: 'groupIds',
                        logicFieldVariable: 'groupIds',
                        logicFieldExtraVariable: `{"contentType": "cards:ticket"}`,
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
    // TicketTotalsByFrequency
    {
        templateType: "TicketTotalsByFrequency",
        serviceType: 'cards',
        name: 'Total Ticket Count By Frequency',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string,
        ) => {

            const { frequencyType, dateRangeType = "createdAt" } = filter
            const matchFilter = await buildMatchFilter(filter, 'ticket', subdomain, models)

            const dateFormat = frequencyType || "%m"

            let projectStage: any = [
                {
                    $project: {
                        _id: 1,
                        count: 1,
                        amount: 1
                    }
                }
            ]

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

            const pipeline = [
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
            ]

            const tickets = await models.Tickets.aggregate(pipeline)

            const totalCountAndAmountByFrequency = (tickets || []).reduce((acc, { count, _id }) => {
                acc[_id] = count;
                return acc;
            }, {});

            const data = Object.values(totalCountAndAmountByFrequency);
            const labels = Object.keys(totalCountAndAmountByFrequency);
            const title = 'Total Ticket Count By Frequency';

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
                fieldQueryVariables: `{"conformityMainType": "ticket", "conformityRelType": "company"}`,
                fieldLabel: 'Select companies',
            },
            // CUSTOMER FILTER
            {
                fieldName: 'customerIds',
                fieldType: 'select',
                fieldQuery: 'customers',
                multi: true,
                fieldQueryVariables: `{"conformityMainType": "ticket", "conformityRelType": "customer"}`,
                fieldLabel: 'Select customers',
            },
            // TAG FILTER
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "cards:ticket", "perPage": 1000}`,
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
                fieldQueryVariables: `{"type": "ticket"}`,
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
                fieldQueryVariables: `{"type": "ticket"}`,
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
                fieldOptions: PROBABILITY_TICKET,
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
                fieldQueryVariables: `{"type": "ticket"}`,
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
                fieldQueryVariables: `{"contentType": "cards:ticket"}`,
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
                fieldQueryVariables: `{"contentType": "cards:ticket", "isVisible": true}`,
                logics: [
                    {
                        logicFieldName: 'groupIds',
                        logicFieldVariable: 'groupIds',
                        logicFieldExtraVariable: `{"contentType": "cards:ticket"}`,
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
            // FREQUENCY TYPE FILTER
            {
                fieldName: 'frequencyType',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'date',
                fieldOptions: CUSTOM_DATE_FREQUENCY_TYPES,
                fieldLabel: 'Select frequency type',
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
    // TicketClosedTotalsByTags
    {
        templateType: "TicketClosedTotalsByTags",
        serviceType: 'cards',
        name: 'Total Ticket Count By Tag',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string,
        ) => {

            const matchFilter = await buildMatchFilter(filter, 'ticket', subdomain, models)

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

            const tickets = await models.Tickets.aggregate(pipeline)

            const totalCountByTag = (tickets || []).reduce((acc, { measure, tag }) => {
                acc[tag] = measure;
                return acc;
            }, {});

            const data = Object.values(totalCountByTag);
            const labels = Object.keys(totalCountByTag);
            const title = 'Total Ticket Count By Tag';

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
                fieldQueryVariables: `{"conformityMainType": "ticket", "conformityRelType": "company"}`,
                fieldLabel: 'Select companies',
            },
            // CUSTOMER FILTER
            {
                fieldName: 'customerIds',
                fieldType: 'select',
                fieldQuery: 'customers',
                multi: true,
                fieldQueryVariables: `{"conformityMainType": "ticket", "conformityRelType": "customer"}`,
                fieldLabel: 'Select customers',
            },
            // TAG FILTER
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "cards:ticket", "perPage": 1000}`,
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
                fieldQueryVariables: `{"type": "ticket"}`,
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
                fieldQueryVariables: `{"type": "ticket"}`,
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
                fieldOptions: PROBABILITY_TICKET,
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
                fieldQueryVariables: `{"contentType": "cards:ticket"}`,
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
                fieldQueryVariables: `{"contentType": "cards:ticket", "isVisible": true}`,
                logics: [
                    {
                        logicFieldName: 'groupIds',
                        logicFieldVariable: 'groupIds',
                        logicFieldExtraVariable: `{"contentType": "cards:ticket"}`,
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
    // TicketClosedTotalsByLabel
    {
        templateType: "TicketClosedTotalsByLabel",
        serviceType: 'cards',
        name: 'Total Ticket Count By Label',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string,
        ) => {

            const matchFilter = await buildMatchFilter(filter, 'ticket', subdomain, models)

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

            const tickets = await models.Tickets.aggregate(pipeline)

            const totalCountByLabel = (tickets || []).reduce((acc, { count, label }) => {
                acc[label] = count;
                return acc;
            }, {});

            const data = Object.values(totalCountByLabel);
            const labels = Object.keys(totalCountByLabel);
            const title = 'Total Ticket Count By Label';

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
                fieldQueryVariables: `{"conformityMainType": "ticket", "conformityRelType": "company"}`,
                fieldLabel: 'Select companies',
            },
            // CUSTOMER FILTER
            {
                fieldName: 'customerIds',
                fieldType: 'select',
                fieldQuery: 'customers',
                multi: true,
                fieldQueryVariables: `{"conformityMainType": "ticket", "conformityRelType": "customer"}`,
                fieldLabel: 'Select customers',
            },
            // TAG FILTER
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "cards:ticket", "perPage": 1000}`,
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
                fieldQueryVariables: `{"type": "ticket"}`,
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
                fieldQueryVariables: `{"type": "ticket"}`,
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
                fieldOptions: PROBABILITY_TICKET,
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
                fieldQueryVariables: `{"contentType": "cards:ticket"}`,
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
                fieldQueryVariables: `{"contentType": "cards:ticket", "isVisible": true}`,
                logics: [
                    {
                        logicFieldName: 'groupIds',
                        logicFieldVariable: 'groupIds',
                        logicFieldExtraVariable: `{"contentType": "cards:ticket"}`,
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
    // TicketClosedTotalsByRep
    {
        templateType: "TicketClosedTotalsByRep",
        serviceType: 'cards',
        name: 'Total Ticket Count By Rep',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string,
        ) => {
            const { userType = "userId" } = filter

            const matchFilter = await buildMatchFilter(filter, 'ticket', subdomain, models)

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

            const tickets = await models.Tickets.aggregate(pipeline)

            const totalCountByRep = (tickets || []).reduce((acc, { count, user }) => {
                if (user) {
                    acc[user.details.fullName || user.email] = count;
                }
                return acc;
            }, {});

            const data = Object.values(totalCountByRep);
            const labels = Object.keys(totalCountByRep);
            const title = 'Total Ticket Count By Rep';

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
                fieldQueryVariables: `{"conformityMainType": "ticket", "conformityRelType": "company"}`,
                fieldLabel: 'Select companies',
            },
            // CUSTOMER FILTER
            {
                fieldName: 'customerIds',
                fieldType: 'select',
                fieldQuery: 'customers',
                multi: true,
                fieldQueryVariables: `{"conformityMainType": "ticket", "conformityRelType": "customer"}`,
                fieldLabel: 'Select customers',
            },
            // TAG FILTER
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "cards:ticket", "perPage": 1000}`,
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
                fieldQueryVariables: `{"type": "ticket"}`,
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
                fieldQueryVariables: `{"type": "ticket"}`,
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
                fieldOptions: PROBABILITY_TICKET,
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
                fieldQueryVariables: `{"contentType": "cards:ticket"}`,
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
                fieldQueryVariables: `{"contentType": "cards:ticket", "isVisible": true}`,
                logics: [
                    {
                        logicFieldName: 'groupIds',
                        logicFieldVariable: 'groupIds',
                        logicFieldExtraVariable: `{"contentType": "cards:ticket"}`,
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
    // TicketClosedTotalsBySource
    {
        templateType: "TicketTotalsBySource",
        serviceType: 'cards',
        name: 'Total Ticket Count By Source',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string,
        ) => {
            const matchFilter = await buildMatchFilter(filter, 'ticket', subdomain, models)

            const pipeline = [
                {
                    $unwind: "$sourceConversationIds"
                },
                {
                    $lookup: {
                        from: "conversations",
                        let: { conversationId: "$sourceConversationIds" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ["$_id", "$$conversationId"]
                                    }
                                }
                            }
                        ],
                        as: 'conversation'
                    }
                },
                {
                    $unwind: "$conversation"
                },
                {
                    $lookup: {
                        from: "integrations",
                        let: { integrationId: "$conversation.integrationId" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ["$_id", "$$integrationId"]
                                    }
                                }
                            }
                        ],
                        as: 'integration'
                    }
                },
                {
                    $unwind: "$integration"
                },
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
                        _id: 0,
                        integration: "$_id",
                        count: 1
                    }
                }
            ]

            const tickets = await models.Tickets.aggregate(pipeline)

            const kindMap = await getIntegrationsKinds();

            const totalCountBySource = (tickets || []).reduce((acc, { count, integration }) => {
                acc[kindMap[integration] || integration] = count
                return acc;

            }, {});

            const data = Object.values(totalCountBySource);
            const labels = Object.keys(totalCountBySource);
            const title = 'Total Ticket Count By Source';

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
                fieldQueryVariables: `{"conformityMainType": "ticket", "conformityRelType": "company"}`,
                fieldLabel: 'Select companies',
            },
            // CUSTOMER FILTER
            {
                fieldName: 'customerIds',
                fieldType: 'select',
                fieldQuery: 'customers',
                multi: true,
                fieldQueryVariables: `{"conformityMainType": "ticket", "conformityRelType": "customer"}`,
                fieldLabel: 'Select customers',
            },
            // SOURCE FILTER
            {
                fieldName: 'integrationTypes',
                fieldType: 'select',
                fieldQuery: 'integrations',
                multi: true,
                fieldOptions: INTEGRATION_OPTIONS,
                fieldLabel: 'Select source',
            },
            // TAG FILTER
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "cards:ticket", "perPage": 1000}`,
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
                fieldQueryVariables: `{"type": "ticket"}`,
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
                fieldQueryVariables: `{"type": "ticket"}`,
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
                fieldOptions: PROBABILITY_TICKET,
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
                fieldQueryVariables: `{"contentType": "cards:ticket"}`,
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
                fieldQueryVariables: `{"contentType": "cards:ticket", "isVisible": true}`,
                logics: [
                    {
                        logicFieldName: 'groupIds',
                        logicFieldVariable: 'groupIds',
                        logicFieldExtraVariable: `{"contentType": "cards:ticket"}`,
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
    // TicketAverageTimeToCloseByRep
    {
        templateType: "TicketAverageTimeToCloseByRep",
        serviceType: 'cards',
        name: 'Ticket Average Time To Close By Rep',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string,
        ) => {
            const { userType = "userId" } = filter
            const matchFilter = await buildMatchFilter(filter, 'ticket', subdomain, models)

            const stageIds = await getStageIds({ ...filter, stageProbability: PROBABILITY_CLOSED['ticket'] }, 'ticket', models)

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

            const tickets = await models.Tickets.aggregate(pipeline)

            const totalCountByRep = (tickets || []).reduce((acc, { measure, user }) => {
                if (user) {
                    acc[user.details.fullName || user.email] = measure;
                }
                return acc;
            }, {});

            const data = Object.values(totalCountByRep);
            const labels = Object.keys(totalCountByRep);
            const title = 'Tciket Average Time To Close By Rep';

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
                fieldQueryVariables: `{"conformityMainType": "ticket", "conformityRelType": "company"}`,
                fieldLabel: 'Select companies',
            },
            // CUSTOMER FILTER
            {
                fieldName: 'customerIds',
                fieldType: 'select',
                fieldQuery: 'customers',
                multi: true,
                fieldQueryVariables: `{"conformityMainType": "ticket", "conformityRelType": "customer"}`,
                fieldLabel: 'Select customers',
            },
            // TAG FILTER
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "cards:ticket", "perPage": 1000}`,
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
                fieldQueryVariables: `{"type": "ticket"}`,
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
                fieldQueryVariables: `{"type": "ticket"}`,
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
                fieldOptions: PROBABILITY_TICKET,
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
                fieldQueryVariables: `{"contentType": "cards:ticket"}`,
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
                fieldQueryVariables: `{"contentType": "cards:ticket", "isVisible": true}`,
                logics: [
                    {
                        logicFieldName: 'groupIds',
                        logicFieldVariable: 'groupIds',
                        logicFieldExtraVariable: `{"contentType": "cards:ticket"}`,
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
    // TicketsStageDateRange
    {
        templateType: "TicketsStageDateRange",
        serviceType: 'cards',
        name: 'Ticket Average Time Spent In Each Stage',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string,
        ) => {

            const matchFilter = await buildMatchFilter(filter, 'ticket', subdomain, models)

            const pipeline = [
                {
                    $match: {
                        stageChangedDate: { $exists: true },
                        ...matchFilter
                    }
                },
                {
                    $group: {
                        _id: "$stageId",
                        times: {
                            $push: {
                                $subtract: [
                                    new Date(),
                                    "$stageChangedDate",
                                ],
                            },
                        },
                    },
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
                                            { $eq: ["$status", "active"] },
                                        ],
                                    },
                                },
                            },
                        ],
                        as: "stage",
                    },
                },
                {
                    $unwind: "$stage",
                },
                {
                    $project: {
                        _id: 0,
                        stage: "$stage.name",
                        averageTime: {
                            $avg: "$times"
                        }
                    }
                }
            ]

            const tickets = await models.Tickets.aggregate(pipeline)

            const totalCountByStage = (tickets || []).reduce((acc, { averageTime, stage }) => {
                acc[stage] = averageTime;
                return acc;
            }, {});

            const data = Object.values(totalCountByStage);
            const labels = Object.keys(totalCountByStage);
            const title = 'Ticket Average Time Spent In Each Stage';

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
                fieldQueryVariables: `{"conformityMainType": "ticket", "conformityRelType": "company"}`,
                fieldLabel: 'Select companies',
            },
            // CUSTOMER FILTER
            {
                fieldName: 'customerIds',
                fieldType: 'select',
                fieldQuery: 'customers',
                multi: true,
                fieldQueryVariables: `{"conformityMainType": "ticket", "conformityRelType": "customer"}`,
                fieldLabel: 'Select customers',
            },
            // TAG FILTER
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "cards:ticket", "perPage": 1000}`,
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
                fieldQueryVariables: `{"type": "ticket"}`,
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
                fieldQueryVariables: `{"type": "ticket"}`,
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
                fieldOptions: PROBABILITY_TICKET,
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
                fieldQueryVariables: `{"type": "ticket"}`,
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
                fieldQueryVariables: `{"contentType": "cards:ticket"}`,
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
                fieldQueryVariables: `{"contentType": "cards:ticket", "isVisible": true}`,
                logics: [
                    {
                        logicFieldName: 'groupIds',
                        logicFieldVariable: 'groupIds',
                        logicFieldExtraVariable: `{"contentType": "cards:ticket"}`,
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
        ]
    },
    // TicketsTotalCount
    {
        templateType: "TicketsTotalCount",
        serviceType: 'cards',
        name: 'Total Tickets Count',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table', 'number'],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string,
        ) => {

            const matchFilter = await buildMatchFilter(filter, 'ticket', subdomain, models)

            const pipeline = await getDimensionPipeline(filter, 'ticket', subdomain, models)

            let tickets

            if (pipeline.length === 0) {
                const ticketsCount = await models.Tickets.find(matchFilter).countDocuments()

                tickets = [
                    {
                        key: "Total Count",
                        count: ticketsCount
                    }
                ]
            } else {
                tickets = await models.Tickets.aggregate(pipeline)
            }

            const totalCountByLabel = (tickets || []).reduce((acc, { count, key }) => {
                acc[key] = count;
                return acc;
            }, {});

            const data = Object.values(totalCountByLabel);
            const labels = Object.keys(totalCountByLabel);
            const title = 'Total Tickets Count';

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
                fieldQueryVariables: `{"conformityMainType": "ticket", "conformityRelType": "company"}`,
                fieldLabel: 'Select companies',
            },
            // CUSTOMER FILTER
            {
                fieldName: 'customerIds',
                fieldType: 'select',
                fieldQuery: 'customers',
                multi: true,
                fieldQueryVariables: `{"conformityMainType": "ticket", "conformityRelType": "customer"}`,
                fieldLabel: 'Select customers',
            },
            // SOURCE FILTER
            {
                fieldName: 'integrationTypes',
                fieldType: 'select',
                fieldQuery: 'integrations',
                multi: true,
                fieldOptions: INTEGRATION_OPTIONS,
                fieldLabel: 'Select source',
            },
            // TAG FILTER
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "cards:ticket", "perPage": 1000}`,
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
                fieldQueryVariables: `{"type": "ticket"}`,
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
                fieldQueryVariables: `{"type": "ticket"}`,
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
                fieldOptions: PROBABILITY_TICKET,
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
                fieldQueryVariables: `{"type": "ticket"}`,
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
                fieldQueryVariables: `{"contentType": "cards:ticket"}`,
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
                fieldQueryVariables: `{"contentType": "cards:ticket", "isVisible": true}`,
                logics: [
                    {
                        logicFieldName: 'groupIds',
                        logicFieldVariable: 'groupIds',
                        logicFieldExtraVariable: `{"contentType": "cards:ticket"}`,
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
]