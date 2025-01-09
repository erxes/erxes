import { IModels } from '../../connectionResolver';
import { AMOUNT_RANGE_ATTRIBUTES, ATTACHMENT_TYPES, CUSTOM_DATE_FREQUENCY_TYPES, DATERANGE_BY_TYPES, DATERANGE_TYPES, DUE_DATERANGE_TYPES, DUE_TYPES, MONTH_NAMES, PRIORITY, PROBABILITY_DEAL, STATUS_TYPES, USER_TYPES } from '../constants';
import { buildMatchFilter, buildPipeline, buildData, buildOptions } from '../utils';
const util = require("util");

const MEASURE_OPTIONS = [
    { label: 'Total Count', value: 'count' },
    { label: 'Total Amount', value: 'totalAmount' },
    { label: 'Average Amount', value: 'averageAmount' },
    { label: 'Unused Amount', value: 'unusedAmount' },
    { label: 'Forecast', value: 'forecastAmount' },
];

const DIMENSION_OPTIONS = [
    { label: 'Departments', value: 'department' },
    { label: 'Branches', value: 'branch' },
    { label: 'Companies', value: 'company' },
    { label: 'Customers', value: 'customer' },
    { label: 'Products', value: 'product' },
    { label: 'Boards', value: 'board' },
    { label: 'Pipelines', value: 'pipeline' },
    { label: 'Stages', value: 'stage' },
    { label: 'Probability', value: 'probability' },
    { label: 'Card', value: 'card' },
    { label: 'Tags', value: 'tag' },
    { label: 'Labels', value: 'label' },
    { label: 'Frequency (day, week, month)', value: 'frequency' },
    { label: 'Status', value: 'status' },
    { label: 'Priority', value: 'priority' },
    { label: 'Description', value: 'description' },
    { label: 'Is Complete', value: 'isComplete' },
    { label: 'Created by', value: 'createdBy' },
    { label: 'Modified by', value: 'modifiedBy' },
    { label: 'Assigned to', value: 'assignedTo' },
    { label: 'Created at', value: 'createdAt' },
    { label: 'Modified at', value: 'modifiedAt' },
    { label: 'Stage changed at', value: 'stageChangedDate' },
    { label: 'Start Date', value: 'startDate' },
    { label: 'Close Date', value: 'closeDate' },
    { label: 'Custom Propertry', value: 'field' },
];

export const dealCharts = [
    {
        templateType: "DealCountByTag",
        name: 'Total Deal Count By Tag',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            chartType: string,
            subdomain: string,
        ) => {

            const matchFilter = await buildMatchFilter(filter, 'deal', subdomain, models)

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
                        _id: 0,
                        tag: "$tag.name",
                        count: 1
                    }
                }
            ]

            const deals = await models.Deals.aggregate(pipeline)

            const totalCountByTag = (deals || []).reduce((acc, { count, tag }) => {
                acc[tag] = count;
                return acc;
            }, {});

            const data = Object.values(totalCountByTag);
            const labels = Object.keys(totalCountByTag);
            const title = 'Total Deal Count By Tag';

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
                fieldQueryVariables: `{"conformityMainType": "deal", "conformityRelType": "company"}`,
                fieldLabel: 'Select companies',
            },
            // CUSTOMER FILTER
            {
                fieldName: 'customerIds',
                fieldType: 'select',
                fieldQuery: 'customers',
                multi: true,
                fieldQueryVariables: `{"conformityMainType": "deal", "conformityRelType": "customer"}`,
                fieldLabel: 'Select customers',
            },
            // TAG FILTER
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "sales:deal", "perPage": 1000}`,
                multi: true,
                fieldLabel: 'Select tags',
            },
            // PRODUCT FILTER
            {
                fieldName: 'productIds',
                fieldType: 'select',
                fieldQuery: 'products',
                multi: true,
                fieldLabel: 'Select products',
            },
            // BOARD FILTER
            {
                fieldName: 'boardId',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'salesBoards',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldRequiredQueryParams: ['type'],
                fieldQueryVariables: `{"type": "deal"}`,
                fieldLabel: 'Select board',
            },
            // PIPELINE FILTER
            {
                fieldName: 'pipelineIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'salesPipelines',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "deal"}`,
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
                fieldOptions: PROBABILITY_DEAL,
                fieldLabel: 'Select Probability',
            },
            // STAGE FILTER
            {
                fieldName: 'stageIds',
                fieldType: 'select',
                fieldQuery: 'salesStages',
                multi: true,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldParentVariable: 'pipelineId',
                fieldParentQuery: "salesPipelines",
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
                fieldQuery: 'salesPipelineLabels',
                multi: true,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldParentVariable: 'pipelineId',
                fieldParentQuery: "salesPipelines",
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
                fieldQueryVariables: `{"contentType": "sales:deal"}`,
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
                fieldRequiredQueryParams: ["contentType"],
                fieldQueryVariables: `{"contentType": "sales:deal"}`,
                logics: [
                    {
                        logicFieldName: 'groupIds',
                        logicFieldVariable: 'groupIds',
                        logicFieldExtraVariable: `{"contentType": "sales:deal"}`,
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
    {
        templateType: "DealCountByLabel",
        serviceType: 'sales',
        name: 'Total Deal Count By Label',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            chartType: string,
            subdomain: string,
        ) => {

            const matchFilter = await buildMatchFilter(filter, 'deal', subdomain, models)

            const pipeline = [
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
                        from: "sales_pipeline_labels",
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

            const deals = await models.Deals.aggregate(pipeline)

            const totalCountByLabel = (deals || []).reduce((acc, { count, label }) => {
                acc[label] = count;
                return acc;
            }, {});

            const data = Object.values(totalCountByLabel);
            const labels = Object.keys(totalCountByLabel);
            const title = 'Total Deal Count By Label';

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
                fieldQueryVariables: `{"conformityMainType": "deal", "conformityRelType": "company"}`,
                fieldLabel: 'Select companies',
            },
            // CUSTOMER FILTER
            {
                fieldName: 'customerIds',
                fieldType: 'select',
                fieldQuery: 'customers',
                multi: true,
                fieldQueryVariables: `{"conformityMainType": "deal", "conformityRelType": "customer"}`,
                fieldLabel: 'Select customers',
            },
            // TAG FILTER
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "sales:deal", "perPage": 1000}`,
                multi: true,
                fieldLabel: 'Select tags',
            },
            // PRODUCT FILTER
            {
                fieldName: 'productIds',
                fieldType: 'select',
                fieldQuery: 'products',
                multi: true,
                fieldLabel: 'Select products',
            },
            // BOARD FILTER
            {
                fieldName: 'boardId',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'salesBoards',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldRequiredQueryParams: ['type'],
                fieldQueryVariables: `{"type": "deal"}`,
                fieldLabel: 'Select board',
            },
            // PIPELINE FILTER
            {
                fieldName: 'pipelineIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'salesPipelines',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "deal"}`,
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
                fieldOptions: PROBABILITY_DEAL,
                fieldLabel: 'Select Probability',
            },
            // STAGE FILTER
            {
                fieldName: 'stageIds',
                fieldType: 'select',
                fieldQuery: 'salesStages',
                multi: true,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldParentVariable: 'pipelineId',
                fieldParentQuery: "salesPipelines",
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
                fieldQuery: 'salesPipelineLabels',
                multi: true,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldParentVariable: "pipelineId",
                fieldParentQuery: "salesPipelines",
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
                fieldQueryVariables: `{"contentType": "sales:deal"}`,
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
                fieldRequiredQueryParams: ["contentType"],
                fieldQueryVariables: `{"contentType": "sales:deal"}`,
                logics: [
                    {
                        logicFieldName: 'groupIds',
                        logicFieldVariable: 'groupIds',
                        logicFieldExtraVariable: `{"contentType": "sales:deal"}`,
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
    {
        templateType: "DealCountByCustomProperties",
        serviceType: 'sales',
        name: 'Total Deal Count By Custom Properties',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            chartType: string,
            subdomain: string,
        ) => {

            const matchFilter = await buildMatchFilter(filter, 'deal', subdomain, models)

            const pipeline = [
                {
                    $unwind: "$customFieldsData",
                },
                {
                    $unwind: "$customFieldsData.value",
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
                    $match: {
                        ...matchFilter
                    },
                },
                {
                    $group: {
                        _id: "$customFieldsData.value",
                        count: { $sum: 1 },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        field: "$_id",
                        count: 1,
                    },
                },
            ]

            const deals = await models.Deals.aggregate(pipeline)

            const totalCountByCustomProperties = (deals || []).reduce((acc, { count, field }) => {
                acc[field] = count;
                return acc;
            }, {});

            const data = Object.values(totalCountByCustomProperties);
            const labels = Object.keys(totalCountByCustomProperties);
            const title = 'Total Deal Count Custom Properties';

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
                fieldQueryVariables: `{"conformityMainType": "deal", "conformityRelType": "company"}`,
                fieldLabel: 'Select companies',
            },
            // CUSTOMER FILTER
            {
                fieldName: 'customerIds',
                fieldType: 'select',
                fieldQuery: 'customers',
                multi: true,
                fieldQueryVariables: `{"conformityMainType": "deal", "conformityRelType": "customer"}`,
                fieldLabel: 'Select customers',
            },
            // TAG FILTER
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "sales:deal", "perPage": 1000}`,
                multi: true,
                fieldLabel: 'Select tags',
            },
            // PRODUCT FILTER
            {
                fieldName: 'productIds',
                fieldType: 'select',
                fieldQuery: 'products',
                multi: true,
                fieldLabel: 'Select products',
            },
            // BOARD FILTER
            {
                fieldName: 'boardId',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'salesBoards',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldRequiredQueryParams: ['type'],
                fieldQueryVariables: `{"type": "deal"}`,
                fieldLabel: 'Select board',
            },
            // PIPELINE FILTER
            {
                fieldName: 'pipelineIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'salesPipelines',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "deal"}`,
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
                fieldOptions: PROBABILITY_DEAL,
                fieldLabel: 'Select Probability',
            },
            // STAGE FILTER
            {
                fieldName: 'stageIds',
                fieldType: 'select',
                fieldQuery: 'salesStages',
                multi: true,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldParentVariable: 'pipelineId',
                fieldParentQuery: "salesPipelines",
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
                fieldQuery: 'salesPipelineLabels',
                multi: true,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldParentVariable: 'pipelineId',
                fieldParentQuery: "salesPipelines",
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
                fieldQueryVariables: `{"contentType": "sales:deal"}`,
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
                fieldRequiredQueryParams: ["contentType"],
                fieldQueryVariables: `{"contentType": "sales:deal"}`,
                logics: [
                    {
                        logicFieldName: 'groupIds',
                        logicFieldVariable: 'groupIds',
                        logicFieldExtraVariable: `{"contentType": "sales:deal"}`,
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
    {
        templateType: "DealAverageAmountByRep",
        serviceType: 'sales',
        name: 'Deal Average Amount By Rep',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            chartType: string,
            subdomain: string,
        ) => {
            const { userType = "userId" } = filter
            const matchFilter = await buildMatchFilter(filter, 'deal', subdomain, models)

            const pipeline = [
                {
                    $unwind: "$productsData",
                },
                {
                    $match: {
                        [userType]: { $exists: true },
                        "productsData.currency": { $eq: "MNT" },
                        'productsData.tickUsed': { $eq: true },
                        ...matchFilter
                    },
                },
                ...(userType === 'assignedUserIds' ? [{ $unwind: "$assignedUserIds" }] : []),
                {
                    $group: {
                        _id: `$${userType}`,
                        amounts: {
                            $push: "$productsData.amount",
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
                        averageAmount: {
                            $avg: "$amounts",
                        },
                    },
                },
            ]

            const deals = await models.Deals.aggregate(pipeline)

            const averageAmountByRep = (deals || []).reduce((acc, { user, averageAmount }) => {
                if (user) {
                    acc[user?.details?.fullName || user.email] = averageAmount
                }
                return acc
            }, {})

            const data = Object.values(averageAmountByRep);
            const labels = Object.keys(averageAmountByRep);
            const title = 'Average deal amount by rep';

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
                fieldQueryVariables: `{"conformityMainType": "deal", "conformityRelType": "company"}`,
                fieldLabel: 'Select companies',
            },
            // CUSTOMER FILTER
            {
                fieldName: 'customerIds',
                fieldType: 'select',
                fieldQuery: 'customers',
                multi: true,
                fieldQueryVariables: `{"conformityMainType": "deal", "conformityRelType": "customer"}`,
                fieldLabel: 'Select customers',
            },
            // TAG FILTER
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "sales:deal", "perPage": 1000}`,
                multi: true,
                fieldLabel: 'Select tags',
            },
            // PRODUCT FILTER
            {
                fieldName: 'productIds',
                fieldType: 'select',
                fieldQuery: 'products',
                multi: true,
                fieldLabel: 'Select products',
            },
            // BOARD FILTER
            {
                fieldName: 'boardId',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'salesBoards',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldRequiredQueryParams: ['type'],
                fieldQueryVariables: `{"type": "deal"}`,
                fieldLabel: 'Select board',
            },
            // PIPELINE FILTER
            {
                fieldName: 'pipelineIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'salesPipelines',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "deal"}`,
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
                fieldOptions: PROBABILITY_DEAL,
                fieldLabel: 'Select Probability',
            },
            // STAGE FILTER
            {
                fieldName: 'stageIds',
                fieldType: 'select',
                fieldQuery: 'salesStages',
                multi: true,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldParentVariable: 'pipelineId',
                fieldParentQuery: "salesPipelines",
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
                fieldQuery: 'salesPipelineLabels',
                multi: true,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldParentVariable: 'pipelineId',
                fieldParentQuery: "salesPipelines",
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
                fieldQueryVariables: `{"contentType": "sales:deal"}`,
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
                fieldRequiredQueryParams: ["contentType"],
                fieldQueryVariables: `{"contentType": "sales:deal"}`,
                logics: [
                    {
                        logicFieldName: 'groupIds',
                        logicFieldVariable: 'groupIds',
                        logicFieldExtraVariable: `{"contentType": "sales:deal"}`,
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
    {
        templateType: "DealRevenueByStage",
        serviceType: 'sales',
        name: 'Total Deal Amount By Stage',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            chartType: string,
            subdomain: string,
        ) => {
            const matchFilter = await buildMatchFilter(filter, 'deal', subdomain, models)

            // TOTAL AMOUNT

            const pipeline = [
                {
                    $unwind: "$productsData",
                },
                {
                    $match: {
                        "productsData.currency": { $eq: "MNT" },
                        'productsData.tickUsed': { $eq: true },
                        // status: "active",
                        ...matchFilter
                    },
                },
                {
                    $group: {
                        _id: "$stageId",
                        totalAmount: {
                            $sum: "$productsData.amount",
                        },
                    },
                },
                {
                    $lookup: {
                        from: "sales_stages",
                        let: { stageId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$_id', '$$stageId'] },
                                            { $eq: ['$status', 'active'] }
                                        ],
                                    },
                                },
                            },
                        ],
                        as: "stage",
                    },
                },
                {
                    $unwind: "$stage"
                },
                {
                    $project: {
                        _id: 0,
                        stage: "$stage.name",
                        totalAmount: 1,
                    }
                }
            ]

            const deals = await models.Deals.aggregate(pipeline)

            const dealsRevenueByStage = (deals || []).reduce((acc, { stage, totalAmount }) => {
                acc[stage] = totalAmount
                return acc
            }, {})

            const data = Object.values(dealsRevenueByStage);
            const labels = Object.keys(dealsRevenueByStage);
            const title = 'Total Deal Amount By Stage';

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
                fieldQueryVariables: `{"conformityMainType": "deal", "conformityRelType": "company"}`,
                fieldLabel: 'Select companies',
            },
            // CUSTOMER FILTER
            {
                fieldName: 'customerIds',
                fieldType: 'select',
                fieldQuery: 'customers',
                multi: true,
                fieldQueryVariables: `{"conformityMainType": "deal", "conformityRelType": "customer"}`,
                fieldLabel: 'Select customers',
            },
            // TAG FILTER
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "sales:deal", "perPage": 1000}`,
                multi: true,
                fieldLabel: 'Select tags',
            },
            // PRODUCT FILTER
            {
                fieldName: 'productIds',
                fieldType: 'select',
                fieldQuery: 'products',
                multi: true,
                fieldLabel: 'Select products',
            },
            // BOARD FILTER
            {
                fieldName: 'boardId',
                fieldType: 'select',
                fieldQuery: 'salesBoards',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldRequiredQueryParams: ['type'],
                fieldQueryVariables: `{"type": "deal"}`,
                multi: false,
                fieldLabel: 'Select boards',
            },
            // PIPELINE FILTER
            {
                fieldName: 'pipelineIds',
                fieldType: 'select',
                fieldQuery: 'salesPipelines',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "deal"}`,
                multi: true,
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
                fieldOptions: PROBABILITY_DEAL,
                fieldLabel: 'Select Probability',
            },
            // STAGE FILTER
            {
                fieldName: 'stageIds',
                fieldType: 'select',
                fieldQuery: 'salesStages',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldParentVariable: "pipelineId",
                fieldParentQuery: "salesPipelines",
                multi: true,
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
                fieldQuery: 'salesPipelineLabels',
                multi: true,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldParentVariable: 'pipelineId',
                fieldParentQuery: "salesPipelines",
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
                fieldQueryVariables: `{"contentType": "sales:deal"}`,
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
                fieldRequiredQueryParams: ["contentType"],
                fieldQueryVariables: `{"contentType": "sales:deal"}`,
                logics: [
                    {
                        logicFieldName: 'groupIds',
                        logicFieldVariable: 'groupIds',
                        logicFieldExtraVariable: `{"contentType": "sales:deal"}`,
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
    {
        templateType: "ClosedRevenueByMonthWithDealTotalAndClosedRevenueBreakdown",
        serviceType: 'sales',
        name: 'Total Deal Count And Amount By Frequency',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            chartType: string,
            subdomain: string,
        ) => {

            const { frequencyType, dateRangeType = "createdAt" } = filter
            const matchFilter = await buildMatchFilter(filter, 'deal', subdomain, models)

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
                    $unwind: "$productsData"
                },
                {
                    $match: {
                        // HEZEE HAAGDSAN GEDGIIN MEDEH ARGA MEDHGU BGA TODRUULAH SHAARDLAGATAI 
                        // CREATEDAT BH NI ZUV ESEH 
                        // CLOSED GEDGIIG NI STATUS NI MEDEH ZUV ESEH 
                        'productsData.currency': { $eq: "MNT" },
                        'productsData.tickUsed': { $eq: true },
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
            ]

            const deals = await models.Deals.aggregate(pipeline)

            const totalCountAndAmountByFrequency = (deals || []).reduce((acc, { count, _id }) => {
                acc[_id] = count;
                return acc;
            }, {});

            const data = Object.values(totalCountAndAmountByFrequency);
            const labels = Object.keys(totalCountAndAmountByFrequency);
            const title = 'Total Deal Count And Amount By   Frequency';

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
                fieldQueryVariables: `{"conformityMainType": "deal", "conformityRelType": "company"}`,
                fieldLabel: 'Select companies',
            },
            // CUSTOMER FILTER
            {
                fieldName: 'customerIds',
                fieldType: 'select',
                fieldQuery: 'customers',
                multi: true,
                fieldQueryVariables: `{"conformityMainType": "deal", "conformityRelType": "customer"}`,
                fieldLabel: 'Select customers',
            },
            // TAG FILTER
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "sales:deal", "perPage": 1000}`,
                multi: true,
                fieldLabel: 'Select tags',
            },
            // PRODUCT FILTER
            {
                fieldName: 'productIds',
                fieldType: 'select',
                fieldQuery: 'products',
                multi: true,
                fieldLabel: 'Select products',
            },
            // BOARD FILTER
            {
                fieldName: 'boardId',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'salesBoards',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldRequiredQueryParams: ['type'],
                fieldQueryVariables: `{"type": "deal"}`,
                fieldLabel: 'Select board',
            },
            // PIPELINE FILTER
            {
                fieldName: 'pipelineIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'salesPipelines',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "deal"}`,
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
                fieldOptions: PROBABILITY_DEAL,
                fieldLabel: 'Select Probability',
            },
            // STAGE FILTER
            {
                fieldName: 'stageIds',
                fieldType: 'select',
                fieldQuery: 'salesStages',
                multi: true,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldParentVariable: 'pipelineId',
                fieldParentQuery: "salesPipelines",
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
                fieldQuery: 'salesPipelineLabels',
                multi: true,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldParentVariable: 'pipelineId',
                fieldParentQuery: "salesPipelines",
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
                fieldQueryVariables: `{"contentType": "sales:deal"}`,
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
                fieldRequiredQueryParams: ["contentType"],
                fieldQueryVariables: `{"contentType": "sales:deal"}`,
                logics: [
                    {
                        logicFieldName: 'groupIds',
                        logicFieldVariable: 'groupIds',
                        logicFieldExtraVariable: `{"contentType": "sales:deal"}`,
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
    {
        templateType: "DealsClosedLostByRep",
        serviceType: 'sales',
        name: 'Total Lost Deal Count By Rep',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            chartType: string,
            subdomain: string,
        ) => {

            const matchFilter = await buildMatchFilter(filter, 'deal', subdomain, models)

            const pipeline = [
                {
                    $match: {
                        stageId: { $exists: true },
                        // status: {$eq: "archived"}, CLOSED GEDGIIN AVAH ESEH ???
                        ...matchFilter
                    },
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
                    $match: {
                        "stage.probability": "Lost",
                    },
                },
                {
                    $group: {
                        _id: "$userId",
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

            const deals = await models.Deals.aggregate(pipeline)

            const totalCountByRep = (deals || []).reduce((acc, { count, user }) => {
                if (user) {
                    acc[user.details.fullName || user.email] = count;
                }
                return acc;
            }, {});

            const data = Object.values(totalCountByRep);
            const labels = Object.keys(totalCountByRep);
            const title = 'Total Lost Deal Count By Rep';

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
                fieldQueryVariables: `{"conformityMainType": "deal", "conformityRelType": "company"}`,
                fieldLabel: 'Select companies',
            },
            // CUSTOMER FILTER
            {
                fieldName: 'customerIds',
                fieldType: 'select',
                fieldQuery: 'customers',
                multi: true,
                fieldQueryVariables: `{"conformityMainType": "deal", "conformityRelType": "customer"}`,
                fieldLabel: 'Select customers',
            },
            // TAG FILTER
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "sales:deal", "perPage": 1000}`,
                multi: true,
                fieldLabel: 'Select tags',
            },
            // PRODUCT FILTER
            {
                fieldName: 'productIds',
                fieldType: 'select',
                fieldQuery: 'products',
                multi: true,
                fieldLabel: 'Select products',
            },
            // BOARD FILTER
            {
                fieldName: 'boardId',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'salesBoards',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldRequiredQueryParams: ['type'],
                fieldQueryVariables: `{"type": "deal"}`,
                fieldLabel: 'Select board',
            },
            // PIPELINE FILTER
            {
                fieldName: 'pipelineIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'salesPipelines',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "deal"}`,
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
                fieldOptions: PROBABILITY_DEAL,
                fieldLabel: 'Select Probability',
            },
            // STAGE FILTER
            {
                fieldName: 'stageIds',
                fieldType: 'select',
                fieldQuery: 'salesStages',
                multi: true,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldParentVariable: 'pipelineId',
                fieldParentQuery: "salesPipelines",
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
                fieldQuery: 'salesPipelineLabels',
                multi: true,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldParentVariable: 'pipelineId',
                fieldParentQuery: "salesPipelines",
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
                fieldQueryVariables: `{"contentType": "sales:deal"}`,
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
                fieldRequiredQueryParams: ["contentType"],
                fieldQueryVariables: `{"contentType": "sales:deal"}`,
                logics: [
                    {
                        logicFieldName: 'groupIds',
                        logicFieldVariable: 'groupIds',
                        logicFieldExtraVariable: `{"contentType": "sales:deal"}`,
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
    {
        templateType: "DealsClosedWonByRep",
        serviceType: 'sales',
        name: 'Total Won Deal Count By Rep',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            chartType: string,
            subdomain: string,
        ) => {

            const matchFilter = await buildMatchFilter(filter, 'deal', subdomain, models)

            const pipeline = [
                {
                    $match: {
                        stageId: { $exists: true },
                        // status: {$eq: "archived"}, CLOSED GEDGIIN AVAH ESEH ???
                        ...matchFilter
                    },
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
                    $match: {
                        "stage.probability": "Won",
                    },
                },
                {
                    $group: {
                        _id: "$userId",
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

            const deals = await models.Deals.aggregate(pipeline)

            const totalCountByRep = (deals || []).reduce((acc, { count, user }) => {
                if (user) {
                    acc[user.details.fullName || user.email] = count;
                }
                return acc;
            }, {});

            const data = Object.values(totalCountByRep);
            const labels = Object.keys(totalCountByRep);
            const title = 'Total Won Deal Count By Rep';

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
                fieldQueryVariables: `{"conformityMainType": "deal", "conformityRelType": "company"}`,
                fieldLabel: 'Select companies',
            },
            // CUSTOMER FILTER
            {
                fieldName: 'customerIds',
                fieldType: 'select',
                fieldQuery: 'customers',
                multi: true,
                fieldQueryVariables: `{"conformityMainType": "deal", "conformityRelType": "customer"}`,
                fieldLabel: 'Select customers',
            },
            // TAG FILTER
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "sales:deal", "perPage": 1000}`,
                multi: true,
                fieldLabel: 'Select tags',
            },
            // PRODUCT FILTER
            {
                fieldName: 'productIds',
                fieldType: 'select',
                fieldQuery: 'products',
                multi: true,
                fieldLabel: 'Select products',
            },
            // BOARD FILTER
            {
                fieldName: 'boardId',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'salesBoards',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldRequiredQueryParams: ['type'],
                fieldQueryVariables: `{"type": "deal"}`,
                fieldLabel: 'Select board',
            },
            // PIPELINE FILTER
            {
                fieldName: 'pipelineIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'salesPipelines',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "deal"}`,
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
                fieldOptions: PROBABILITY_DEAL,
                fieldLabel: 'Select Probability',
            },
            // STAGE FILTER
            {
                fieldName: 'stageIds',
                fieldType: 'select',
                fieldQuery: 'salesStages',
                multi: true,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldParentVariable: 'pipelineId',
                fieldParentQuery: "salesPipelines",
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
                fieldQuery: 'salesPipelineLabels',
                multi: true,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldParentVariable: 'pipelineId',
                fieldParentQuery: "salesPipelines",
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
                fieldQueryVariables: `{"contentType": "sales:deal"}`,
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
                fieldRequiredQueryParams: ["contentType"],
                fieldQueryVariables: `{"contentType": "sales:deal"}`,
                logics: [
                    {
                        logicFieldName: 'groupIds',
                        logicFieldVariable: 'groupIds',
                        logicFieldExtraVariable: `{"contentType": "sales:deal"}`,
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
    {
        templateType: "DealLeaderBoardAmountClosedByRep",
        serviceType: 'sales',
        name: 'Total Closed Deal Amount By Rep',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            chartType: string,
            subdomain: string,
        ) => {
            const { userType = 'userId' } = filter

            const matchFilter = await buildMatchFilter(filter, 'deal', subdomain, models)

            const pipeline = [
                {
                    $unwind: "$productsData"
                },
                {
                    $match: {
                        stageId: { $exists: true },
                        "productsData.currency": { $eq: "MNT" },
                        'productsData.tickUsed': { $eq: true },
                        // status: {$eq: "archived"} CLOSED GEDGIIN AVAH ESEH ???
                        ...matchFilter
                    },
                },
                ...(userType === 'assignedUserIds' ? [{ $unwind: "$assignedUserIds" }] : []),
                {
                    $group: {
                        _id: `$${userType}`,
                        amount: { $sum: "$productsData.amount" },
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
                        amount: 1,
                    },
                },
            ]

            const deals = await models.Deals.aggregate(pipeline)

            const totalCountByRep = (deals || []).reduce((acc, { amount, user }) => {
                if (user) {
                    acc[user.details.fullName || user.email] = amount;
                }
                return acc;
            }, {});

            const data = Object.values(totalCountByRep);
            const labels = Object.keys(totalCountByRep);
            const title = 'Total Closed Deal Amount By Rep';

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
                fieldQueryVariables: `{"conformityMainType": "deal", "conformityRelType": "company"}`,
                fieldLabel: 'Select companies',
            },
            // CUSTOMER FILTER
            {
                fieldName: 'customerIds',
                fieldType: 'select',
                fieldQuery: 'customers',
                multi: true,
                fieldQueryVariables: `{"conformityMainType": "deal", "conformityRelType": "customer"}`,
                fieldLabel: 'Select customers',
            },
            // TAG FILTER
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "sales:deal", "perPage": 1000}`,
                multi: true,
                fieldLabel: 'Select tags',
            },
            // PRODUCT FILTER
            {
                fieldName: 'productIds',
                fieldType: 'select',
                fieldQuery: 'products',
                multi: true,
                fieldLabel: 'Select products',
            },
            // BOARD FILTER
            {
                fieldName: 'boardId',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'salesBoards',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldRequiredQueryParams: ['type'],
                fieldQueryVariables: `{"type": "deal"}`,
                fieldLabel: 'Select board',
            },
            // PIPELINE FILTER
            {
                fieldName: 'pipelineIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'salesPipelines',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "deal"}`,
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
                fieldOptions: PROBABILITY_DEAL,
                fieldLabel: 'Select Probability',
            },
            // STAGE FILTER
            {
                fieldName: 'stageIds',
                fieldType: 'select',
                fieldQuery: 'salesStages',
                multi: true,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldParentVariable: 'pipelineId',
                fieldParentQuery: "salesPipelines",
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
                fieldQuery: 'salesPipelineLabels',
                multi: true,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldParentVariable: 'pipelineId',
                fieldParentQuery: "salesPipelines",
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
                fieldQueryVariables: `{"contentType": "sales:deal"}`,
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
                fieldRequiredQueryParams: ["contentType"],
                fieldQueryVariables: `{"contentType": "sales:deal"}`,
                logics: [
                    {
                        logicFieldName: 'groupIds',
                        logicFieldVariable: 'groupIds',
                        logicFieldExtraVariable: `{"contentType": "sales:deal"}`,
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
    {
        templateType: "DealsTotalCount",
        serviceType: 'sales',
        name: 'Total Deals Count',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table', 'number', 'pivotTable'],
        getChartResult: async (
            models: IModels,
            filter: any,
            chartType: string,
            subdomain: string,
        ) => {
            const matchFilter = await buildMatchFilter(filter, 'deal', subdomain, models)

            const pipeline = buildPipeline(filter, "deal", matchFilter)

            const deals = await models.Deals.aggregate(pipeline)

            const title = 'Total Deals Count';

            return { title, ...buildData({ chartType, data: deals, filter, type: "deal" }), ...buildOptions(filter) };
        },
        filterTypes: [
            // DIMENSION FILTER
            {
                fieldName: 'rowDimension',
                fieldType: 'select',
                multi: true,
                logics: [
                    {
                        logicFieldName: 'chartType',
                        logicFieldValue: 'pivotTable',
                    },
                ],
                fieldValueOptions: [
                    {
                        fieldName: 'showTotal',
                        fieldType: 'checkbox',
                        fieldLabel: 'Show total',
                        fieldDefaultValue: false
                    }
                ],
                fieldOptions: DIMENSION_OPTIONS,
                fieldLabel: 'Select row',
            },
            {
                fieldName: 'colDimension',
                fieldType: 'select',
                multi: true,
                logics: [
                    {
                        logicFieldName: 'chartType',
                        logicFieldValue: 'pivotTable',
                    },
                ],
                fieldValueOptions: [
                    {
                        fieldName: 'showTotal',
                        fieldType: 'checkbox',
                        fieldLabel: 'Show total',
                        fieldDefaultValue: false
                    }
                ],
                fieldOptions: DIMENSION_OPTIONS,
                fieldLabel: 'Select column',
            },
            {
                fieldName: 'dimension',
                fieldType: 'select',
                multi: true,
                logics: [
                    {
                        logicFieldName: 'chartType',
                        logicFieldValue: 'pivotTable',
                        logicFieldOperator: "ne",
                    },
                ],
                fieldOptions: DIMENSION_OPTIONS,
                fieldLabel: 'Select dimension',
            },
            // MEASURE FILTER
            {
                fieldName: 'measure',
                fieldType: 'select',
                multi: true,
                fieldOptions: MEASURE_OPTIONS,
                fieldDefaultValue: ['count'],
                fieldLabel: 'Select measure',
            },
            // FREQUENCY TYPE FILTER BASED DIMENSION FILTER
            {
                fieldName: 'frequencyType',
                fieldType: 'select',
                multi: false,
                fieldDefaultValue: '%Y',
                fieldOptions: CUSTOM_DATE_FREQUENCY_TYPES,
                fieldLabel: 'Select frequency type',
            },
            // USER TYPE FILTER
            {
                fieldName: 'userType',
                fieldType: 'select',
                multi: false,
                fieldDefaultValue: 'userId',
                fieldOptions: USER_TYPES,
                fieldLabel: 'Select user type',
            },
            // GOAL FILTER
            {
                fieldName: 'goalType',
                fieldType: 'select',
                fieldQuery: 'goalTypesMain',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldInitialVariable: 'list',
                fieldLabel: 'Select goal',
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
                fieldQueryVariables: `{"conformityMainType": "deal", "conformityRelType": "company"}`,
                fieldLabel: 'Select companies',
            },
            // CUSTOMER FILTER
            {
                fieldName: 'customerIds',
                fieldType: 'select',
                fieldQuery: 'customers',
                multi: true,
                fieldQueryVariables: `{"conformityMainType": "deal", "conformityRelType": "customer"}`,
                fieldLabel: 'Select customers',
            },
            // TAG FILTER
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "sales:deal", "perPage": 1000}`,
                multi: true,
                fieldLabel: 'Select tags',
            },
            // PRODUCT FILTER
            {
                fieldName: 'productIds',
                fieldType: 'select',
                fieldQuery: 'products',
                multi: true,
                fieldLabel: 'Select products',
            },
            // BOARD FILTER
            {
                fieldName: 'boardId',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'salesBoards',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldRequiredQueryParams: ['type'],
                fieldQueryVariables: `{"type": "deal"}`,
                fieldLabel: 'Select board',
            },
            // PIPELINE FILTER
            {
                fieldName: 'pipelineIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'salesPipelines',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "deal"}`,
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
                multi: true,
                fieldOptions: PROBABILITY_DEAL,
                fieldLabel: 'Select Probability',
            },
            // STAGE FILTER
            {
                fieldName: 'stageIds',
                fieldType: 'select',
                fieldQuery: 'salesStages',
                multi: true,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldParentVariable: 'pipelineId',
                fieldParentQuery: "salesPipelines",
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
                fieldQuery: 'salesPipelineLabels',
                multi: true,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldParentVariable: 'pipelineId',
                fieldParentQuery: "salesPipelines",
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
                fieldQueryVariables: `{"contentType": "sales:deal"}`,
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
                fieldRequiredQueryParams: ["contentType"],
                fieldExtraVariables: ['options', 'type'],
                fieldQueryVariables: `{"contentType": "sales:deal"}`,
                logics: [
                    {
                        logicFieldName: 'groupIds',
                        logicFieldVariable: 'groupIds',
                        logicFieldExtraVariable: `{"contentType": "sales:deal"}`,
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
            {
                fieldName: 'amountRange',
                fieldType: 'input',
                fieldAttributes: AMOUNT_RANGE_ATTRIBUTES,
                fieldLabel: 'Amount range',
            },
            {
                fieldName: 'target',
                fieldType: 'input',
                fieldAttributes: [{ name: 'target', type: 'number', min: 0, placeholder: 'Target' }],
                fieldLabel: 'Target',
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
    {
        templateType: "DealsTotalCountByDueDate",
        serviceType: 'sales',
        name: 'Total Deal Count By Due Date',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            chartType: string,
            subdomain: string,
        ) => {
            const { dateRangeType = 'closeDate', frequencyType = '%Y-%m-%d' } = filter
            const matchFilter = await buildMatchFilter(filter, 'deal', subdomain, models)

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

            const deals = await models.Deals.aggregate(pipeline)

            const dealsRevenueByStage = (deals || []).reduce((acc, { _id, count }) => {
                acc[_id] = count
                return acc
            }, {})

            const data = Object.values(dealsRevenueByStage);
            const labels = Object.keys(dealsRevenueByStage);
            const title = 'Total Deal Count By Due Date';

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
                fieldQueryVariables: `{"conformityMainType": "deal", "conformityRelType": "company"}`,
                fieldLabel: 'Select companies',
            },
            // CUSTOMER FILTER
            {
                fieldName: 'customerIds',
                fieldType: 'select',
                fieldQuery: 'customers',
                multi: true,
                fieldQueryVariables: `{"conformityMainType": "deal", "conformityRelType": "customer"}`,
                fieldLabel: 'Select customers',
            },
            // TAG FILTER
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "sales:deal", "perPage": 1000}`,
                multi: true,
                fieldLabel: 'Select tags',
            },
            // PRODUCT FILTER
            {
                fieldName: 'productIds',
                fieldType: 'select',
                fieldQuery: 'products',
                multi: true,
                fieldLabel: 'Select products',
            },
            // BOARD FILTER
            {
                fieldName: 'boardId',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'salesBoards',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldRequiredQueryParams: ['type'],
                fieldQueryVariables: `{"type": "deal"}`,
                fieldLabel: 'Select board',
            },
            // PIPELINE FILTER
            {
                fieldName: 'pipelineIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'salesPipelines',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "deal"}`,
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
                fieldOptions: PROBABILITY_DEAL,
                fieldLabel: 'Select Probability',
            },
            // STAGE FILTER
            {
                fieldName: 'stageIds',
                fieldType: 'select',
                fieldQuery: 'salesStages',
                multi: true,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldParentVariable: 'pipelineId',
                fieldParentQuery: "salesPipelines",
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
                fieldQuery: 'salesPipelineLabels',
                multi: true,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldParentVariable: 'pipelineId',
                fieldParentQuery: "salesPipelines",
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
                fieldQueryVariables: `{"contentType": "sales:deal"}`,
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
                fieldRequiredQueryParams: ["contentType"],
                fieldQueryVariables: `{"contentType": "sales:deal"}`,
                logics: [
                    {
                        logicFieldName: 'groupIds',
                        logicFieldVariable: 'groupIds',
                        logicFieldExtraVariable: `{"contentType": "sales:deal"}`,
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
    {
        templateType: "DealAverageTimeSpentInEachStage",
        serviceType: 'sales',
        name: 'Deal Average Time Spent In Each Stage',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            chartType: string,
            subdomain: string,
        ) => {

            const matchFilter = await buildMatchFilter(filter, 'deal', subdomain, models)

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

            const deals = await models.Deals.aggregate(pipeline)

            const totalCountByStage = (deals || []).reduce((acc, { averageTime, stage }) => {
                acc[stage] = averageTime;
                return acc;
            }, {});

            const data = Object.values(totalCountByStage);
            const labels = Object.keys(totalCountByStage);
            const title = 'Deal Average Time Spent In Each Stage';

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
                fieldQueryVariables: `{"conformityMainType": "deal", "conformityRelType": "company"}`,
                fieldLabel: 'Select companies',
            },
            // CUSTOMER FILTER
            {
                fieldName: 'customerIds',
                fieldType: 'select',
                fieldQuery: 'customers',
                multi: true,
                fieldQueryVariables: `{"conformityMainType": "deal", "conformityRelType": "customer"}`,
                fieldLabel: 'Select customers',
            },
            // TAG FILTER
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "sales:deal", "perPage": 1000}`,
                multi: true,
                fieldLabel: 'Select tags',
            },
            // PRODUCT FILTER
            {
                fieldName: 'productIds',
                fieldType: 'select',
                fieldQuery: 'products',
                multi: true,
                fieldLabel: 'Select products',
            },
            // BOARD FILTER
            {
                fieldName: 'boardId',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'salesBoards',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldRequiredQueryParams: ['type'],
                fieldQueryVariables: `{"type": "deal"}`,
                fieldLabel: 'Select board',
            },
            // PIPELINE FILTER
            {
                fieldName: 'pipelineIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'salesPipelines',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "deal"}`,
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
                fieldOptions: PROBABILITY_DEAL,
                fieldLabel: 'Select Probability',
            },
            // STAGE FILTER
            {
                fieldName: 'stageIds',
                fieldType: 'select',
                fieldQuery: 'salesStages',
                multi: true,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldParentVariable: 'pipelineId',
                fieldParentQuery: "salesPipelines",
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
                fieldQuery: 'salesPipelineLabels',
                multi: true,
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldParentVariable: 'pipelineId',
                fieldParentQuery: "salesPipelines",
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
                fieldQueryVariables: `{"contentType": "sales:deal"}`,
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
                fieldRequiredQueryParams: ["contentType"],
                fieldQueryVariables: `{"contentType": "sales:deal"}`,
                logics: [
                    {
                        logicFieldName: 'groupIds',
                        logicFieldVariable: 'groupIds',
                        logicFieldExtraVariable: `{"contentType": "sales:deal"}`,
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
]