import { IModels } from '../../connectionResolver';
import { CUSTOM_DATE_FREQUENCY_TYPES, DATERANGE_BY_TYPES, DATERANGE_TYPES, DIMENSION_OPTIONS, MEASURE_OPTIONS, INBOX_TAG_TYPE, INTEGRATION_TYPES, STATUS_LABELS, STATUS_TYPES, KIND_MAP, USER_TYPES } from '../constants';
import {
    buildData,
    buildMatchFilter,
    getDimensionPipeline,
} from '../utils';
const util = require('util')

const chartTemplates = [
    {
        templateType: 'averageFirstResponseTime',
        serviceType: 'inbox',
        name: 'Average first response time by rep',
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

            const matchfilter = await buildMatchFilter(filter, subdomain, models, 'firstRespondedUserId')

            const pipeline = [
                {
                    $match: {
                        firstRespondedDate: {
                            $exists: true,
                            $ne: null,
                        },
                        firstRespondedUserId: {
                            $exists: true,
                            $ne: null,
                        },
                        ...matchfilter
                    },
                },
                {
                    $lookup: {
                        from: "conversation_messages",
                        let: { conversationId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {
                                                $eq: [
                                                    "$conversationId",
                                                    "$$conversationId",
                                                ],
                                            },
                                            {
                                                $eq: ["$internal", false],
                                            },
                                            {
                                                $eq: [
                                                    { $type: "$userId" },
                                                    "missing",
                                                ],
                                            },
                                        ],
                                    },
                                },
                            },
                            {
                                $group: {
                                    _id: "$conversationId",
                                    message: {
                                        $min: {
                                            createdAt: "$createdAt",
                                            message: "$$ROOT",
                                        },
                                    },
                                },
                            },
                            {
                                $replaceRoot: {
                                    newRoot: "$message.message",
                                },
                            },
                        ],
                        as: "message",
                    },
                },
                {
                    $unwind: "$message",
                },
                {
                    $project: {
                        _id: 0,
                        conversationId: "$_id",
                        firstRespondedUserId:
                            "$firstRespondedUserId",
                        responseTime: {
                            $subtract: [
                                "$firstRespondedDate",
                                "$message.createdAt",
                            ],
                        },
                        message: '$message'
                    },
                },
                {
                    $group: {
                        _id: "$firstRespondedUserId",
                        conversationIds: {
                            $push: "$conversationId",
                        },
                        responseTimes: { $push: "$responseTime" },
                        messages: { $push: "$message" }
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
                                            { $eq: ["$isActive", true] }
                                        ]
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
                        responseTimes: 1,
                        conversationIds: 1,
                        messages: 1,
                        user: "$user",
                        averageResponseTime: {
                            $avg: "$responseTimes",
                        },
                    },
                },
            ]

            const conversations = await models.Conversations.aggregate(pipeline)

            const totalConversationByUsers: { [key: string]: number } = (conversations || []).reduce((acc, { user, averageResponseTime }) => {

                if (user) {
                    acc[user?.details?.fullName || user.email] = averageResponseTime
                }

                return acc
            }, {})

            const data = Object.values(totalConversationByUsers);
            const labels = Object.keys(totalConversationByUsers);
            const title = 'Average first response time';

            const datasets = { title, data, labels };

            return datasets;
        },
        filterTypes: [
            {
                fieldName: 'respondedUserIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'users',
                fieldLabel: 'Select users',
            },
            {
                fieldName: 'departmentIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'departments',
                fieldLabel: 'Select departments',
            },
            {
                fieldName: 'branchIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'branches',
                fieldLabel: 'Select branches',
            },
            {
                fieldName: 'brandIds',
                fieldType: 'select',
                fieldQuery: 'allBrands',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                multi: true,
                fieldLabel: 'Select brands',
            },
            {
                fieldName: 'integrationTypes',
                fieldType: 'select',
                fieldQuery: 'integrations',
                multi: true,
                fieldOptions: INTEGRATION_TYPES,
                fieldLabel: 'Select source',
            },
            {
                fieldName: 'status',
                fieldType: 'select',
                multi: false,
                fieldOptions: STATUS_TYPES,
                fieldDefaultValue: 'all',
                fieldLabel: 'Select conversation status',
            },
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "${INBOX_TAG_TYPE}", "perPage": 1000}`,
                multi: true,
                fieldLabel: 'Select tags',
            },
            {
                fieldName: 'dateRange',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'date',
                fieldOptions: DATERANGE_TYPES,
                fieldLabel: 'Select date range',
                fieldDefaultValue: 'all',
            },
            {
                fieldName: 'dateRangeType',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'date',
                fieldOptions: DATERANGE_BY_TYPES,
                fieldLabel: 'Select date range type',
                fieldDefaultValue: "createdAt"
            }
        ],
    },
    {
        templateType: 'averageCloseTime',
        serviceType: 'inbox',
        name: 'Average time to close conversation',
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

            const matchfilter = await buildMatchFilter(filter, subdomain, models, "closedUserId")

            const pipeline = [
                {
                    $match: {
                        closedAt: {
                            $exists: true,
                            $ne: null,
                        },
                        closedUserId: {
                            $exists: true,
                            $ne: null,
                        },
                        ...matchfilter
                    },
                },
                {
                    $lookup: {
                        from: "conversation_messages",
                        let: { conversationId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {
                                                $eq: [
                                                    "$conversationId",
                                                    "$$conversationId",
                                                ],
                                            },
                                            {
                                                $eq: ["$internal", false],
                                            },
                                            {
                                                $eq: [
                                                    { $type: "$userId" },
                                                    "missing",
                                                ],
                                            },
                                        ],
                                    },
                                },
                            },
                            {
                                $group: {
                                    _id: "$conversationId",
                                    message: {
                                        $min: {
                                            createdAt: "$createdAt",
                                            message: "$$ROOT",
                                        },
                                    },
                                },
                            },
                            {
                                $replaceRoot: {
                                    newRoot: "$message.message",
                                },
                            },
                        ],
                        as: "message",
                    },
                },
                {
                    $unwind: "$message",
                },
                {
                    $project: {
                        _id: 0,
                        conversationId: "$_id",
                        closedUserId:
                            "$closedUserId",
                        closeTime: {
                            $subtract: [
                                "$closedAt",
                                "$message.createdAt",
                            ],
                        },
                        message: '$message'
                    },
                },
                {
                    $group: {
                        _id: "$closedUserId",
                        conversationIds: {
                            $push: "$conversationId",
                        },
                        closeTimes: { $push: "$closeTime" },
                        messages: { $push: "$message" }
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
                                            { $eq: ["$isActive", true] }
                                        ]
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
                        closeTimes: 1,
                        conversationIds: 1,
                        messages: 1,
                        user: "$user",
                        averageCloseTime: {
                            $avg: "$closeTimes",
                        },
                    },
                },
            ]

            const conversations = await models.Conversations.aggregate(pipeline)

            const totalConversationByUsers: { [key: string]: number } = (conversations || []).reduce((acc, { user, averageCloseTime }) => {

                if (user) {
                    acc[user?.details?.fullName || user.email] = averageCloseTime
                }

                return acc
            }, {})

            const data = Object.values(totalConversationByUsers);
            const labels = Object.keys(totalConversationByUsers);
            const title = 'Average time to close conversation';

            const datasets = { title, data, labels };

            return datasets;
        },

        filterTypes: [
            {
                fieldName: 'closedUserIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'users',
                fieldLabel: 'Select users',
            },
            {
                fieldName: 'departmentIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'departments',
                fieldLabel: 'Select departments',
            },
            {
                fieldName: 'branchIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'branches',
                fieldLabel: 'Select branches',
            },
            {
                fieldName: 'brandIds',
                fieldType: 'select',
                fieldQuery: 'allBrands',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                multi: true,
                fieldLabel: 'Select brands',
            },
            {
                fieldName: 'integrationTypes',
                fieldType: 'select',
                fieldQuery: 'integrations',
                multi: true,
                fieldOptions: INTEGRATION_TYPES,
                fieldLabel: 'Select source',
            },
            {
                fieldName: 'status',
                fieldType: 'select',
                multi: false,
                fieldOptions: STATUS_TYPES,
                fieldDefaultValue: 'all',
                fieldLabel: 'Select conversation status',
            },
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "${INBOX_TAG_TYPE}", "perPage": 1000}`,
                multi: true,
                fieldLabel: 'Select tags',
            },
            {
                fieldName: 'closedDateRange',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'date',
                fieldOptions: DATERANGE_TYPES,
                fieldLabel: 'Select date range',
                fieldDefaultValue: 'all',
            },
            {
                fieldName: 'dateRangeType',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'date',
                fieldOptions: DATERANGE_BY_TYPES,
                fieldLabel: 'Select date range type',
                fieldDefaultValue: "closedAt"
            }
        ],
    },
    {
        templateType: 'closedConversationsCountByRep',
        serviceType: 'inbox',
        name: 'Total closed conversations count by rep',
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

            const { dateRangeType = 'closedAt' } = filter
            const matchfilter = await buildMatchFilter(filter, subdomain, models, "closedUserId")

            const pipeline = [
                {
                    $match: {
                        status: "closed",
                        [dateRangeType]: { $exists: true },
                        closedUserId: { $exists: true, $ne: null },
                        ...matchfilter
                    },
                },
                {
                    $group: {
                        _id: "$closedUserId",
                        count: { $sum: 1 }
                    }
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
                                            { $eq: ["$isActive", true] }
                                        ]
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

            const conversations = await models.Conversations.aggregate(pipeline)

            const totalConversationByUsers = (conversations || []).reduce((acc, { user, count }) => {
                acc[user.details.fullName || user.email] = count

                return acc
            }, {})

            const data = Object.values(totalConversationByUsers);
            const labels = Object.keys(totalConversationByUsers);
            const title = 'Total closed conversations count by rep';

            const datasets = { title, data, labels };

            return datasets;
        },

        filterTypes: [
            {
                fieldName: 'closedUserIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'users',
                fieldLabel: 'Select users',
            },
            {
                fieldName: 'departmentIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'departments',
                fieldLabel: 'Select departments',
            },
            {
                fieldName: 'branchIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'branches',
                fieldLabel: 'Select branches',
            },
            {
                fieldName: 'brandIds',
                fieldType: 'select',
                fieldQuery: 'allBrands',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                multi: true,
                fieldLabel: 'Select brands',
            },
            {
                fieldName: 'integrationTypes',
                fieldType: 'select',
                fieldQuery: 'integrations',
                multi: true,
                fieldOptions: INTEGRATION_TYPES,
                fieldLabel: 'Select source',
            },
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "${INBOX_TAG_TYPE}", "perPage": 1000}`,
                multi: true,
                fieldLabel: 'Select tags',
            },
            {
                fieldName: 'status',
                fieldType: 'select',
                multi: false,
                fieldOptions: STATUS_TYPES,
                fieldDefaultValue: 'all',
                fieldLabel: 'Select conversation status',
            },
            {
                fieldName: 'closedDateRange',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'date',
                fieldOptions: DATERANGE_TYPES,
                fieldLabel: 'Select date range',
                fieldDefaultValue: 'all',
            },
            {
                fieldName: 'dateRangeType',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'date',
                fieldOptions: DATERANGE_BY_TYPES,
                fieldLabel: 'Select date range type',
                fieldDefaultValue: "closedAt"
            }
        ],
    },
    {
        templateType: 'conversationsCountByTag',
        serviceType: 'inbox',
        name: 'Total conversations count by tag',
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
            const { tagIds } = filter

            const matchfilter = await buildMatchFilter(filter, subdomain, models)

            const pipeline = [
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
                                        $and: [
                                            { $eq: ["$_id", "$$tagId"] },
                                            { $eq: ["$type", "inbox:conversation"] },
                                        ]
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
                        _id: 1,
                        tag: "$tag.name",
                        count: 1,
                    },
                },
            ]

            const conversations = await models.Conversations.aggregate(pipeline)

            const totalConversationByTags = (conversations || []).reduce((acc, { _id, tag, count }) => {
                acc[tag] = count
                return acc
            }, {})

            const data = Object.values(totalConversationByTags);
            const labels = Object.keys(totalConversationByTags);
            const title = 'Total conversations count by tag';

            const datasets = { title, data, labels };

            return datasets;
        },

        filterTypes: [
            {
                fieldName: 'assignedUserIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'users',
                fieldLabel: 'Select users',
            },
            {
                fieldName: 'departmentIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'departments',
                fieldLabel: 'Select departments',
            },
            {
                fieldName: 'branchIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'branches',
                fieldLabel: 'Select branches',
            },
            {
                fieldName: 'brandIds',
                fieldType: 'select',
                fieldQuery: 'allBrands',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                multi: true,
                fieldLabel: 'Select brands',
            },
            {
                fieldName: 'integrationTypes',
                fieldType: 'select',
                fieldQuery: 'integrations',
                multi: true,
                fieldOptions: INTEGRATION_TYPES,
                fieldLabel: 'Select source',
            },
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "${INBOX_TAG_TYPE}", "perPage": 1000}`,
                multi: true,
                fieldLabel: 'Select tags',
            },
            {
                fieldName: 'status',
                fieldType: 'select',
                multi: false,
                fieldOptions: STATUS_TYPES,
                fieldDefaultValue: 'all',
                fieldLabel: 'Select conversation status',
            },
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
                fieldName: 'dateRangeType',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'date',
                fieldOptions: DATERANGE_BY_TYPES,
                fieldLabel: 'Select date range type',
                fieldDefaultValue: "createdAt"
            }
        ],
    },
    {
        templateType: 'conversationsCountBySource',
        serviceType: 'inbox',
        name: 'Total conversations count by source',
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
            const matchfilter = await buildMatchFilter(filter, subdomain, models)

            const pipeline = [
                {
                    $match: {
                        integrationId: { $exists: true },
                        ...matchfilter
                    },
                },
                {
                    $group: {
                        _id: "$integrationId",
                        count: { $sum: 1 },
                    },
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
                        _id: 0,
                        integration: "$_id",
                        count: 1,
                    },
                },
            ]

            const conversations = await models.Conversations.aggregate(pipeline)

            const totalConversationByIntegrations = (conversations || []).reduce((acc, { integration, count }) => {
                acc[KIND_MAP[integration] || integration] = count
                return acc
            }, {})

            const data = Object.values(totalConversationByIntegrations);
            const labels = Object.keys(totalConversationByIntegrations);
            const title = 'Total conversations count by source';

            const datasets = { title, data, labels };

            return datasets;
        },

        filterTypes: [
            {
                fieldName: 'assignedUserIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'users',
                fieldLabel: 'Select users',
            },
            {
                fieldName: 'departmentIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'departments',
                fieldLabel: 'Select departments',
            },
            {
                fieldName: 'branchIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'branches',
                fieldLabel: 'Select branches',
            },
            {
                fieldName: 'brandIds',
                fieldType: 'select',
                fieldQuery: 'allBrands',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                multi: true,
                fieldLabel: 'Select brands',
            },
            {
                fieldName: 'integrationTypes',
                fieldType: 'select',
                fieldQuery: 'integrations',
                multi: true,
                fieldOptions: INTEGRATION_TYPES,
                fieldLabel: 'Select source',
            },
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "${INBOX_TAG_TYPE}", "perPage": 1000}`,
                multi: true,
                fieldLabel: 'Select tags',
            },
            {
                fieldName: 'status',
                fieldType: 'select',
                multi: false,
                fieldOptions: STATUS_TYPES,
                fieldDefaultValue: 'all',
                fieldLabel: 'Select conversation status',
            },
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
                fieldName: 'dateRangeType',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'date',
                fieldOptions: DATERANGE_BY_TYPES,
                fieldLabel: 'Select date range type',
                fieldDefaultValue: "createdAt"
            }
        ],
    },
    {
        templateType: 'conversationsCountByRep',
        serviceType: 'inbox',
        name: 'Total conversations count by rep',
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
            const matchfilter = await buildMatchFilter(filter, subdomain, models)

            const pipeline = [
                {
                    $match: {
                        assignedUserId: { $exists: true },
                        ...matchfilter
                    }
                },
                {
                    $group: {
                        _id: "$assignedUserId",
                        count: { $sum: 1 }
                    }
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
                                            { $eq: ["$isActive", true] }
                                        ]
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

            const conversations = await models.Conversations.aggregate(pipeline)

            const totalConversationByUsers = (conversations || []).reduce((acc, { user, count }) => {
                acc[user.details.fullName || user.email] = count
                return acc
            }, {})

            const data = Object.values(totalConversationByUsers);
            const labels = Object.keys(totalConversationByUsers);
            const title = 'Total conversations count by rep';

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
                fieldName: 'departmentIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'departments',
                fieldLabel: 'Select departments',
            },
            {
                fieldName: 'branchIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'branches',
                fieldLabel: 'Select branches',
            },
            {
                fieldName: 'brandIds',
                fieldType: 'select',
                fieldQuery: 'allBrands',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                multi: true,
                fieldLabel: 'Select brands',
            },
            {
                fieldName: 'integrationTypes',
                fieldType: 'select',
                fieldQuery: 'integrations',
                multi: true,
                fieldOptions: INTEGRATION_TYPES,
                fieldLabel: 'Select source',
            },
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "${INBOX_TAG_TYPE}", "perPage": 1000}`,
                multi: true,
                fieldLabel: 'Select tags',
            },
            {
                fieldName: 'status',
                fieldType: 'select',
                multi: false,
                fieldOptions: STATUS_TYPES,
                fieldDefaultValue: 'all',
                fieldLabel: 'Select conversation status',
            },
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
                fieldName: 'dateRangeType',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'date',
                fieldOptions: DATERANGE_BY_TYPES,
                fieldLabel: 'Select date range type',
                fieldDefaultValue: "createdAt"
            }
        ],
    },
    {
        templateType: 'conversationsCountByStatus',
        serviceType: 'inbox',
        name: 'Total conversations count by status',
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
            const matchfilter = await buildMatchFilter(filter, subdomain, models)

            const pipeline = [
                {
                    $match: {
                        status: { $exists: true },
                        ...matchfilter
                    }
                },
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        status: "$_id",
                        count: 1
                    },
                },
            ]

            const conversations = await models.Conversations.aggregate(pipeline)

            const totalConversationByStatus = (conversations || []).reduce((acc, { status, count }) => {
                acc[STATUS_LABELS[status]] = count
                return acc
            }, {})

            const data = Object.values(totalConversationByStatus);
            const labels = Object.keys(totalConversationByStatus);
            const title = 'Total conversations count by status';

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
                fieldName: 'departmentIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'departments',
                fieldLabel: 'Select departments',
            },
            {
                fieldName: 'branchIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'branches',
                fieldLabel: 'Select branches',
            },
            {
                fieldName: 'brandIds',
                fieldType: 'select',
                fieldQuery: 'allBrands',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                multi: true,
                fieldLabel: 'Select brands',
            },
            {
                fieldName: 'integrationTypes',
                fieldType: 'select',
                fieldQuery: 'integrations',
                multi: true,
                fieldOptions: INTEGRATION_TYPES,
                fieldLabel: 'Select source',
            },
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "${INBOX_TAG_TYPE}", "perPage": 1000}`,
                multi: true,
                fieldLabel: 'Select tags',
            },
            {
                fieldName: 'status',
                fieldType: 'select',
                multi: false,
                fieldOptions: STATUS_TYPES,
                fieldDefaultValue: 'all',
                fieldLabel: 'Select conversation status',
            },
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
                fieldName: 'dateRangeType',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'date',
                fieldOptions: DATERANGE_BY_TYPES,
                fieldLabel: 'Select date range type',
                fieldDefaultValue: "createdAt"
            }
        ],
    },
    {
        templateType: 'conversationsCount',
        serviceType: 'inbox',
        name: 'Total conversations count',
        chartTypes: [
            'bar',
            'line',
            'pie',
            'doughnut',
            'radar',
            'polarArea',
            'table',
            'number',
            'pivotTable'
        ],
        getChartResult: async (
            models: IModels,
            filter: any,
            chartType: any,
            subdomain: string,
        ) => {
            const pipeline = await getDimensionPipeline(filter, subdomain, models)
            const conversations = await models.Conversations.aggregate(pipeline, { allowDiskUse: true })

            const title = 'Total conversations count';

            return { title, ...buildData({ chartType, data: conversations, filter }) };
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
                fieldDefaultValue: ['teamMember'],
                fieldLabel: 'Select dimension',
            },
            {
                fieldName: 'measure',
                fieldType: 'select',
                multi: true,
                fieldOptions: MEASURE_OPTIONS,
                fieldDefaultValue: ['count'],
                fieldLabel: 'Select measure',
            },
            {
                fieldName: 'frequencyType',
                fieldType: 'select',
                logics: [
                    {
                        logicFieldName: 'dimension',
                        logicFieldValue: 'frequency',
                    },
                ],
                multi: true,
                fieldQuery: 'date',
                fieldOptions: CUSTOM_DATE_FREQUENCY_TYPES,
                fieldLabel: 'Select frequency type',
            },
            {
                fieldName: 'userType',
                fieldType: 'select',
                multi: false,
                fieldDefaultValue: 'assignedUserId',
                fieldOptions: USER_TYPES,
                fieldLabel: 'Select user type',
            },
            {
                fieldName: 'departmentIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'departments',
                fieldLabel: 'Select departments',
            },
            {
                fieldName: 'branchIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'branches',
                fieldLabel: 'Select branches',
            },
            {
                fieldName: 'brandIds',
                fieldType: 'select',
                fieldQuery: 'allBrands',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                multi: true,
                fieldLabel: 'Select brands',
            },
            {
                fieldName: 'integrationTypes',
                fieldType: 'select',
                fieldQuery: 'integrations',
                multi: true,
                fieldOptions: INTEGRATION_TYPES,
                fieldLabel: 'Select source',
            },
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "${INBOX_TAG_TYPE}", "perPage": 1000}`,
                multi: true,
                fieldLabel: 'Select tags',
            },
            {
                fieldName: 'status',
                fieldType: 'select',
                multi: false,
                fieldOptions: STATUS_TYPES,
                fieldDefaultValue: 'all',
                fieldLabel: 'Select conversation status',
            },
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
                fieldName: 'dateRangeType',
                fieldType: 'select',
                multi: false,
                fieldQuery: 'date',
                fieldOptions: DATERANGE_BY_TYPES,
                fieldLabel: 'Select date range type',
                fieldDefaultValue: "createdAt"
            }
        ],
    },
]

export default chartTemplates;