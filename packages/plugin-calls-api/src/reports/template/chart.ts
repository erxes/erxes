import { IModels } from "../../connectionResolver"
import { CALL_STATUS_LABELS, CALL_STATUS, CALL_TYPES, DATERANGE_TYPES, CALL_ENDED_BY, CUSTOM_DATE_FREQUENCY_TYPES, CALL_DIMENSION, CALL_MEASURE } from "../constants"
import { buildData, buildMatchFilter, buildPipeline, formatFrequency } from "../utils"
const util = require('util')

const chartTemplates = [
    {
        templateType: "callsCount",
        serviceType: "calls",
        name: "Calls Count",
        chartTypes: ["bar", "line", "pie", "doughnut", "radar", "polarArea", "table"],
        getChartResult: async (
            models: IModels,
            filter: any,
            chartType: string,
            subdomain: string,
        ) => {

            const { dimension, measure, frequencyType = '%m' } = filter

            const matchFilter = await buildMatchFilter(filter)

            let calls

            if (chartType === 'number') {
                const callsCount = await models.CallHistory.find(matchFilter).countDocuments()

                calls = { labels: "Total Count", data: callsCount }
            } else {
                const pipeline = buildPipeline(filter, matchFilter)

                calls = await models.CallHistory.aggregate(pipeline)
            }

            const title = 'Calls total count'

            return { title, ...buildData({ chartType, data: calls, measure, dimension, frequencyType }) }

        },
        filterTypes: [
            {
                fieldName: 'dimension',
                fieldType: 'select',
                multi: true,
                fieldOptions: CALL_DIMENSION,
                fieldDefaultValue: ['teamMember'],
                fieldLabel: 'Select dimension',
            },
            {
                fieldName: 'measure',
                fieldType: 'select',
                multi: true,
                fieldOptions: CALL_MEASURE,
                fieldDefaultValue: ['count'],
                fieldLabel: 'Select measure',
            },
            {
                fieldName: "userIds",
                fieldType: 'select',
                multi: true,
                fieldQuery: 'users',
                fieldLabel: 'Select users',
            },
            {
                fieldName: "type",
                fieldType: "select",
                multi: false,
                fieldOptions: CALL_TYPES,
                fieldLabel: 'Select call type',
            },
            {
                fieldName: "status",
                fieldType: "select",
                multi: false,
                fieldOptions: CALL_STATUS,
                fieldLabel: 'Select call status',
            },
            {
                fieldName: "endedBy",
                fieldType: "select",
                multi: false,
                fieldOptions: CALL_ENDED_BY,
                fieldLabel: 'Select ended by',
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
                fieldName: 'frequencyType',
                fieldType: 'select',
                multi: false,
                logics: [
                    {
                        logicFieldName: 'dimension',
                        logicFieldVariable: 'frequency',
                    },
                ],
                fieldOptions: CUSTOM_DATE_FREQUENCY_TYPES,
                fieldLabel: 'Select frequency type',
                fieldDefaultValue: '%m',
            },
        ]
    },
    {
        templateType: "callsCountByRep",
        serviceType: "calls",
        name: "Calls Count by Rep",
        chartTypes: ["bar", "line", "pie", "doughnut", "radar", "polarArea", "table"],
        getChartResult: async (
            models: IModels,
            filter: any,
            chartType: string,
            subdomain: string,
        ) => {
            const matchFilter = await buildMatchFilter(filter)

            const pipeline = [
                {
                    $match: {
                        ...matchFilter
                    }
                },
                {
                    $group: {
                        _id: {
                            operatorId: "$createdBy"
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        let: { fieldId: "$_id.operatorId" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ["$_id", "$$fieldId"]
                                    }
                                }
                            }
                        ],
                        as: "user"
                    }
                },
                {
                    $unwind: "$user"
                },
                {
                    $project: {
                        _id: 0,
                        user: "$user",
                        count: 1
                    }
                }
            ]

            const calls = await models.CallHistory.aggregate(pipeline)

            const callsByRep = (calls || []).reduce((acc, { user, count }) => {
                acc[user?.details?.fullName || user?.details?.firstName || user?.email] = count
                return acc
            }, {})

            const data = Object.values(callsByRep)
            const labels = Object.keys(callsByRep)
            const title = 'Total Calls By Operator'

            return { title, data, labels }

        },
        filterTypes: [
            {
                fieldName: "userIds",
                fieldType: 'select',
                multi: true,
                fieldQuery: 'users',
                fieldLabel: 'Select users',
            },
            {
                fieldName: "type",
                fieldType: "select",
                multi: false,
                fieldOptions: CALL_TYPES,
                fieldLabel: 'Select call type',
            },
            {
                fieldName: "status",
                fieldType: "select",
                multi: false,
                fieldOptions: CALL_STATUS,
                fieldLabel: 'Select call status',
            },
            {
                fieldName: "endedBy",
                fieldType: "select",
                multi: false,
                fieldOptions: CALL_ENDED_BY,
                fieldLabel: 'Select ended by',
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
        ]
    },
    {
        templateType: "callsCountByType",
        serviceType: "calls",
        name: "Calls Count by Type",
        chartTypes: ["bar", "line", "pie", "doughnut", "radar", "polarArea", "table"],
        getChartResult: async (
            models: IModels,
            filter: any,
            chartType: string,
            subdomain: string
        ) => {
            const matchFilter = await buildMatchFilter(filter)

            const pipeline = [
                {
                    $match: {
                        callType: { $ne: null },
                        ...matchFilter
                    }
                },
                {
                    $group: {
                        _id: {
                            type: "$callType"
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        type: "$_id.type",
                        count: 1
                    }
                }
            ]

            const calls = await models.CallHistory.aggregate(pipeline)

            const callsByType = (calls || []).reduce((acc, { type, count }) => {
                acc[CALL_STATUS_LABELS[type]] = count
                return acc
            }, {})

            const data = Object.values(callsByType)
            const labels = Object.keys(callsByType)
            const title = "Calls Count By Type"

            return { title, data, labels };
        },
        filterTypes: [
            {
                fieldName: "userIds",
                fieldType: 'select',
                multi: true,
                fieldQuery: 'users',
                fieldLabel: 'Select users',
            },
            {
                fieldName: "type",
                fieldType: "select",
                multi: false,
                fieldOptions: CALL_TYPES,
                fieldLabel: 'Select call type',
            },
            {
                fieldName: "status",
                fieldType: "select",
                multi: false,
                fieldOptions: CALL_STATUS,
                fieldLabel: 'Select call status',
            },
            {
                fieldName: "endedBy",
                fieldType: "select",
                multi: false,
                fieldOptions: CALL_ENDED_BY,
                fieldLabel: 'Select ended by',
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
        ]
    },
    {
        templateType: "callsCountByQueue",
        serviceName: "calls",
        name: "Calls Count by Queue",
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            chartType: string,
            subdomain: string,
        ) => {
            const matchFilter = await buildMatchFilter(filter)

            const pipeline = [
                {
                    $match: {
                        queueName: { $ne: null },
                        ...matchFilter
                    }
                },
                {
                    $group: {
                        _id: {
                            queue: "$queueName"
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        queue: "$_id.queue",
                        count: 1
                    }
                }
            ]

            const calls = await models.CallHistory.aggregate(pipeline)

            const callsByQueue = (calls || []).reduce((acc, { queue, count }) => {
                acc[queue] = count
                return acc
            }, {})

            const data = Object.values(callsByQueue)
            const labels = Object.keys(callsByQueue)
            const title = "Calls Count By Queue"

            return { title, data, labels };
        },
        filterTypes: [
            {
                fieldName: "userIds",
                fieldType: 'select',
                multi: true,
                fieldQuery: 'users',
                fieldLabel: 'Select users',
            },
            {
                fieldName: "type",
                fieldType: "select",
                multi: false,
                fieldOptions: CALL_TYPES,
                fieldLabel: 'Select call type',
            },
            {
                fieldName: "status",
                fieldType: "select",
                multi: false,
                fieldOptions: CALL_STATUS,
                fieldLabel: 'Select call status',
            },
            {
                fieldName: "endedBy",
                fieldType: "select",
                multi: false,
                fieldOptions: CALL_ENDED_BY,
                fieldLabel: 'Select ended by',
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
        ]
    },
    {
        templateType: "callsCountByEndedBy",
        serviceName: "calls",
        name: "Calls Count Ended By",
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            chartType: string,
            subdomain: string,
        ) => {
            const matchFilter = await buildMatchFilter(filter)

            const pipeline = [
                {
                    $match: {
                        endedBy: { $ne: null },
                        ...matchFilter
                    }
                },
                {
                    $group: {
                        _id: {
                            endedBy: "$endedBy"
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        endedBy: "$_id.endedBy",
                        count: 1
                    }
                }
            ]

            const calls = await models.CallHistory.aggregate(pipeline)

            const callsEndedBy = (calls || []).reduce((acc, { endedBy, count }) => {
                acc[CALL_STATUS_LABELS[endedBy]] = count
                return acc
            }, {})

            const data = Object.values(callsEndedBy)
            const labels = Object.keys(callsEndedBy)
            const title = "Calls Count Ended By"

            return { title, data, labels };
        },
        filterTypes: [
            {
                fieldName: "userIds",
                fieldType: 'select',
                multi: true,
                fieldQuery: 'users',
                fieldLabel: 'Select users',
            },
            {
                fieldName: "type",
                fieldType: "select",
                multi: false,
                fieldOptions: CALL_TYPES,
                fieldLabel: 'Select call type',
            },
            {
                fieldName: "status",
                fieldType: "select",
                multi: false,
                fieldOptions: CALL_STATUS,
                fieldLabel: 'Select call status',
            },
            {
                fieldName: "endedBy",
                fieldType: "select",
                multi: false,
                fieldOptions: CALL_ENDED_BY,
                fieldLabel: 'Select ended by',
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
        ]
    },
    {
        templateType: "callsCountByStatus",
        serviceName: "calls",
        name: "Calls Count By Status",
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            chartType: string,
            subdomain: string,
        ) => {
            const matchFilter = await buildMatchFilter(filter)

            const pipeline = [
                {
                    $match: {
                        callStatus: { $ne: null },
                        ...matchFilter
                    }
                },
                {
                    $group: {
                        _id: {
                            status: "$callStatus"
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        status: "$_id.status",
                        count: 1
                    }
                }
            ]

            const calls = await models.CallHistory.aggregate(pipeline)

            const callsByStatus = (calls || []).reduce((acc, { status, count }) => {
                acc[CALL_STATUS_LABELS[status]] = count
                return acc
            }, {})

            const data = Object.values(callsByStatus)
            const labels = Object.keys(callsByStatus)
            const title = "Calls Count By Status"

            return { title, data, labels };
        },
        filterTypes: [
            {
                fieldName: "userIds",
                fieldType: 'select',
                multi: true,
                fieldQuery: 'users',
                fieldLabel: 'Select users',
            },
            {
                fieldName: "type",
                fieldType: "select",
                multi: false,
                fieldOptions: CALL_TYPES,
                fieldLabel: 'Select call type',
            },
            {
                fieldName: "status",
                fieldType: "select",
                multi: false,
                fieldOptions: CALL_STATUS,
                fieldLabel: 'Select call status',
            },
            {
                fieldName: "endedBy",
                fieldType: "select",
                multi: false,
                fieldOptions: CALL_ENDED_BY,
                fieldLabel: 'Select ended by',
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
        ]
    },
    {
        templateType: "callsCountByFrequency",
        serviceName: "calls",
        name: "Calls Count By Frequency",
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            chartType: string,
            subdomain: string,
        ) => {

            const { frequencyType = '%m' } = filter

            const matchFilter = await buildMatchFilter(filter)

            const pipeline: any = [
                {
                    $match: {
                        createdAt: { $ne: null },
                        ...matchFilter
                    }
                },
                {
                    $group: {
                        _id: {
                            frequency: {
                                $dateToString: {
                                    format: `${frequencyType}`,
                                    date: "$createdAt"
                                }
                            }
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { "_id.frequency": 1 }
                },
                {
                    $project: {
                        _id: 0,
                        frequency: "$_id.frequency",
                        count: 1
                    }
                }
            ]

            const calls = await models.CallHistory.aggregate(pipeline)

            const callsByStatus = (calls || []).reduce((acc, { frequency, count }) => {

                const formattedFrequency = formatFrequency(frequencyType, frequency)
                acc[formattedFrequency] = count

                return acc
            }, {})

            const data = Object.values(callsByStatus)
            const labels = Object.keys(callsByStatus)
            const title = "Calls Count By Frequency"

            return { title, data, labels };
        },
        filterTypes: [
            {
                fieldName: "userIds",
                fieldType: 'select',
                multi: true,
                fieldQuery: 'users',
                fieldLabel: 'Select users',
            },
            {
                fieldName: "type",
                fieldType: "select",
                multi: false,
                fieldOptions: CALL_TYPES,
                fieldLabel: 'Select call type',
            },
            {
                fieldName: "status",
                fieldType: "select",
                multi: false,
                fieldOptions: CALL_STATUS,
                fieldLabel: 'Select call status',
            },
            {
                fieldName: "endedBy",
                fieldType: "select",
                multi: false,
                fieldOptions: CALL_ENDED_BY,
                fieldLabel: 'Select ended by',
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
                fieldName: 'frequencyType',
                fieldType: 'select',
                multi: false,
                fieldOptions: CUSTOM_DATE_FREQUENCY_TYPES,
                fieldLabel: 'Select frequency type',
                fieldDefaultValue: '%m',
            },
        ]
    }
]

export default chartTemplates