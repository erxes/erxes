import { IModels } from '../../connectionResolver';
import { sendClientPortalMessage } from '../../messageBroker';
import { BUSINESSPORTAL_STATE_TYPES, CONTACT_STATES, CONTACT_STATE_TYPES, DATERANGE_TYPES, INTEGRATION_TYPES } from '../constants';
import { buildMatchFilter, getBusinessPortalCount, getBusinnesPortalPipeline, getIntegrationsKinds } from '../utils';

const chartTemplates = [
    // CONTACT START

    {
        templateType: 'TotalContactCount',
        serviceType: 'contacts',
        name: 'Total Contact Count',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string,
        ) => {
            const { stateType } = filter;
            const matchFilter = await buildMatchFilter(filter, subdomain)

            let totalCounts = {};

            if (stateType === "customer" || stateType === "lead" || stateType === "visitor") {
                totalCounts = {
                    'Total Customer Count': await models.Customers.find({ ...matchFilter, state: { $eq: stateType }, status: "Active" }).countDocuments(),
                };
            } else if (stateType === "company") {
                totalCounts = {
                    'Total Company Count': await models.Companies.find(matchFilter).countDocuments(),
                };
            } else if (stateType === "client-portal" || stateType === "vendor-portal") {
                const kind = stateType === "client-portal" ? "client" : "vendor";

                const pipeline = getBusinnesPortalPipeline(matchFilter, 'all', kind);

                totalCounts = {
                    [`Total ${stateType.charAt(0).toUpperCase() + stateType.slice(1)} Count`]: await getBusinessPortalCount(pipeline, 0, subdomain)
                };

            } else {

                const pipeline = getBusinnesPortalPipeline(matchFilter, 'all');

                const [companiesCount, customersCount, businessPortalsCount] = await Promise.all([
                    models.Companies.find(matchFilter).countDocuments(),
                    models.Customers.find(matchFilter).countDocuments(),
                    getBusinessPortalCount(pipeline, 0, subdomain)
                ]);

                totalCounts = {
                    'Total Contact Count': customersCount + companiesCount + businessPortalsCount,
                };
            }

            const data = Object.values(totalCounts)
            const labels = Object.keys(totalCounts);
            const title = 'Total Contact Count';

            return { title, data, labels };
        },
        filterTypes: [
            // STATE FILTER
            {
                fieldName: 'stateType',
                fieldType: 'select',
                fieldOptions: CONTACT_STATE_TYPES,
                multi: false,
                fieldLabel: 'Select state',
            },
            // PROPERTIES FILTER 
            {
                fieldName: 'groupIds',
                fieldType: 'select',
                fieldQuery: 'fieldsGroups',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldParentVariable: 'contentType',
                fieldQueryVariables: `{"contentType": "contacts:all"}`,
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
                fieldQueryVariables: `{"contentType": "contacts:all"}`,
                logics: [
                    {
                        logicFieldName: 'groupIds',
                        logicFieldVariable: 'groupIds',
                        logicFieldExtraVariable: `{"contentType": "contacts:all"}`,
                    },
                ],
                multi: true,
                fieldLabel: 'Select field',
            },
            // DATE FILTER
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
    {
        templateType: 'TotalContactCountByYear',
        serviceType: 'contacts',
        name: 'Total Contact Count By Year',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string,
        ) => {
            const { stateType } = filter;
            const matchFilter = await buildMatchFilter(filter, subdomain)

            const pipeline = [
                {
                    $match: { ...matchFilter, createdAt: { $ne: null } }
                },
                {
                    $group: {
                        _id: { $year: { $toDate: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        year: "$_id",
                        count: 1
                    }
                }
            ]

            let totalCounts

            if (stateType === "customer" || stateType === "lead" || stateType === "visitor") {
                pipeline[0].$match = Object.assign({}, pipeline[0].$match, { state: { $eq: stateType } });
                const customerCount = await models.Customers.aggregate(pipeline)

                totalCounts = [...customerCount]
            } else if (stateType === "company") {
                const companyCount = await models.Companies.aggregate(pipeline)

                totalCounts = [...companyCount]
            } else if (stateType === "client-portal" || stateType === "vendor-portal") {

                const kind = stateType === "client-portal" ? "client" : "vendor";

                const pipeline = getBusinnesPortalPipeline(matchFilter, 'year', kind);

                const businessPortalCount = await getBusinessPortalCount(pipeline, 'all', subdomain)

                totalCounts = [...businessPortalCount]

            } else {
                const [companiesCount, customersCount, businessPortalsCount] = await Promise.all([
                    models.Companies.aggregate(pipeline),
                    models.Customers.aggregate(pipeline),
                    getBusinessPortalCount(getBusinnesPortalPipeline(matchFilter, 'year'), 'all', subdomain)
                ])

                totalCounts = [...customersCount, ...companiesCount, ...businessPortalsCount]
            }

            const totalCountByYear = (totalCounts || []).reduce((acc, { count, year }) => {
                acc[year] = (acc[year] || 0) + count;
                return acc;
            }, {});

            const data = Object.values(totalCountByYear);
            const labels = Object.keys(totalCountByYear);
            const title = 'Total Contact Count By Year';

            return { title, data, labels };
        },
        filterTypes: [
            // STATE FILTER
            {
                fieldName: 'stateType',
                fieldType: 'select',
                fieldOptions: CONTACT_STATE_TYPES,
                multi: false,
                fieldLabel: 'Select state',
            },
            // PROPERTIES FILTER 
            {
                fieldName: 'groupIds',
                fieldType: 'select',
                fieldQuery: 'fieldsGroups',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldParentVariable: 'contentType',
                fieldQueryVariables: `{"contentType": "contacts:all"}`,
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
                fieldQueryVariables: `{"contentType": "contacts:all"}`,
                logics: [
                    {
                        logicFieldName: 'groupIds',
                        logicFieldVariable: 'groupIds',
                        logicFieldExtraVariable: `{"contentType": "contacts:all"}`,
                    },
                ],
                multi: true,
                fieldLabel: 'Select field',
            },
            // DATE FILTER
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
    {
        templateType: 'TotalContactByState',
        serviceType: 'contacts',
        name: 'Total Contact Count By State',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string,
        ) => {
            const { stateType } = filter;
            const matchFilter = await buildMatchFilter(filter, subdomain)

            const pipeline = [
                {
                    $match: matchFilter
                },
                {
                    $group: {
                        _id: "$state",
                        count: { $sum: 1 }
                    }
                }
            ]

            const companiesProject = [{
                $project: {
                    _id: 0,
                    all: "company",
                    count: 1
                }
            }]

            const customersProject = [{
                $project: {
                    _id: 0,
                    all: "$_id",
                    count: 1
                }
            }, {
                $match: { all: { $ne: null } }
            }]

            let totalCounts

            if (stateType === "customer" || stateType === "lead" || stateType === "visitor") {
                pipeline[0].$match = Object.assign({}, pipeline[0].$match, { state: { $eq: stateType } });
                const customerCount = await models.Customers.aggregate([...pipeline, ...customersProject])

                totalCounts = [...customerCount]
            } else if (stateType === "company") {
                const companyCount = await models.Companies.aggregate([...pipeline, ...companiesProject])
                totalCounts = [...companyCount]
            } else if (stateType === "client-portal" || stateType === "vendor-portal") {

                const kind = stateType === "client-portal" ? "client" : "vendor";

                const pipeline = getBusinnesPortalPipeline(matchFilter, 'all', kind);

                const businessPortalCount = await getBusinessPortalCount(pipeline, 'all', subdomain)

                totalCounts = [...businessPortalCount]

            } else {
                const [companiesCount, customersCount, clientPortalCount, vendorPortalCount] = await Promise.all([
                    models.Companies.aggregate([...pipeline, ...companiesProject]),
                    models.Customers.aggregate([...pipeline, ...customersProject]),
                    getBusinessPortalCount(getBusinnesPortalPipeline(matchFilter, 'all', 'client'), 'all', subdomain),
                    getBusinessPortalCount(getBusinnesPortalPipeline(matchFilter, 'all', 'vendor'), 'all', subdomain)
                ])

                totalCounts = [...companiesCount, ...customersCount, ...clientPortalCount, ...vendorPortalCount]
            }

            const totalCountByState = (totalCounts || []).reduce((acc, { count, all }) => {
                acc[CONTACT_STATES[all]] = count;
                return acc;
            }, {});

            const data = Object.values(totalCountByState);
            const labels = Object.keys(totalCountByState);
            const title = 'Total Contact Count By State';

            return { title, data, labels };
        },
        filterTypes: [
            // STATE FILTER
            {
                fieldName: 'stateType',
                fieldType: 'select',
                fieldOptions: CONTACT_STATE_TYPES,
                multi: false,
                fieldLabel: 'Select state',
            },
            // PROPERTIES FILTER 
            {
                fieldName: 'groupIds',
                fieldType: 'select',
                fieldQuery: 'fieldsGroups',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldParentVariable: 'contentType',
                fieldQueryVariables: `{"contentType": "contacts:all"}`,
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
                fieldQueryVariables: `{"contentType": "contacts:all"}`,
                logics: [
                    {
                        logicFieldName: 'groupIds',
                        logicFieldVariable: 'groupIds',
                        logicFieldExtraVariable: `{"contentType": "contacts:all"}`,
                    },
                ],
                multi: true,
                fieldLabel: 'Select field',
            },
            // DATE FILTER
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
    {
        templateType: 'TotalContactBySource',
        serviceType: 'contacts',
        name: 'Total Contact Count By Source',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string,
        ) => {
            const { stateType } = filter;
            const matchFilter = await buildMatchFilter(filter, subdomain)

            const pipeline = [
                {
                    $match: {
                        ...matchFilter,
                        integrationId: { $exists: true },
                    },
                },
                {
                    $group: {
                        _id: "$integrationId",
                        count: { $sum: 1 }
                    },
                },
                {
                    $lookup: {
                        from: "integrations",
                        let: { integrationId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ["$_id", "$$integrationId"] }
                                }
                            }
                        ],
                        as: "integration"
                    }
                },
                {
                    $unwind: "$integration"
                },
                {
                    $group: {
                        _id: "$integration.kind",
                        count: { $sum: "$count" }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        all: "$_id",
                        count: 1
                    }
                }
            ]

            let totalCounts

            if (stateType === "customer" || stateType === "lead" || stateType === "visitor") {
                pipeline[0].$match = Object.assign({}, pipeline[0].$match, { state: { $eq: stateType } });
                const customerCount = await models.Customers.aggregate(pipeline)

                totalCounts = [...customerCount]
            } else if (stateType === "company") {
                const companyCount = await models.Companies.aggregate(pipeline)

                totalCounts = [...companyCount]
            } else if (stateType === "client-portal" || stateType === "vendor-portal") {
                const businessPortalCount = await getBusinessPortalCount(pipeline, 'all', subdomain)

                totalCounts = [...businessPortalCount]
            } else {
                const [companiesCount, customersCount, businessPortalsCount] = await Promise.all([
                    models.Companies.aggregate(pipeline),
                    models.Customers.aggregate(pipeline),
                    getBusinessPortalCount(getBusinnesPortalPipeline(matchFilter, 'all'), 'all', subdomain)
                ]);

                totalCounts = [...companiesCount, ...customersCount, ...businessPortalsCount]
            }

            const kindMap = await getIntegrationsKinds();

            const totalCountBySource = (totalCounts || []).reduce((acc, { count, all }) => {
                acc[kindMap[all] || all] = count;
                return acc;
            }, {});

            const data = Object.values(totalCountBySource);
            const labels = Object.keys(totalCountBySource);
            const title = 'Total Contact Count By Source';

            return { title, data, labels };
        },
        filterTypes: [
            // STATE FILTER
            {
                fieldName: 'stateType',
                fieldType: 'select',
                fieldOptions: CONTACT_STATE_TYPES,
                multi: false,
                fieldLabel: 'Select state',
            },
            // PROPERTIES FILTER 
            {
                fieldName: 'groupIds',
                fieldType: 'select',
                fieldQuery: 'fieldsGroups',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldParentVariable: 'contentType',
                fieldQueryVariables: `{"contentType": "contacts:all"}`,
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
                fieldQueryVariables: `{"contentType": "contacts:all"}`,
                logics: [
                    {
                        logicFieldName: 'groupIds',
                        logicFieldVariable: 'groupIds',
                        logicFieldExtraVariable: `{"contentType": "contacts:all"}`,
                    },
                ],
                multi: true,
                fieldLabel: 'Select field',
            },
            // DATE FILTER
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

    // CONTACT END

    // CUSTOMER START

    {
        templateType: 'TotalCustomerCount',
        serviceType: 'contacts',
        name: 'Total Customer Count',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string,
        ) => {

            const matchFilter = await buildMatchFilter(filter, subdomain)

            const customersCount = await models.Customers.find({ ...matchFilter, state: "customer", status: "Active" }).countDocuments()

            const totalCount = {
                'Total Count': customersCount
            };

            const data = Object.values(totalCount)
            const labels = Object.keys(totalCount);
            const title = 'Total Customer Count';

            return { title, data, labels };
        },
        filterTypes: [
            // SOURCE FILTER
            {
                fieldName: 'integrationTypes',
                fieldType: 'select',
                fieldQuery: 'integrations',
                multi: true,
                fieldOptions: INTEGRATION_TYPES,
                fieldLabel: 'Select source',
            },
            // CHANNEL FILTER
            {
                fieldName: 'channelIds',
                fieldType: 'select',
                fieldQuery: 'channels',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                multi: true,
                fieldLabel: 'Select channel',
            },
            // BRAND FILTER
            {
                fieldName: 'brandIds',
                fieldType: 'select',
                fieldQuery: 'brands',
                multi: true,
                fieldLabel: 'Select brands',
            },
            // TAG FILTER
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "contacts:customer", "perPage": 1000}`,
                multi: true,
                fieldLabel: 'Select tags',
            },
            // FORM FILTER
            {
                fieldName: 'formIds',
                fieldType: 'select',
                fieldQuery: 'forms',
                fieldQueryVariables: `{"kind": "lead"}`,
                multi: true,
                fieldLabel: 'Select forms',
                // FIX FORM SELECT FIELD
            },
            // PROPERTIES FILTER 
            {
                fieldName: 'groupIds',
                fieldType: 'select',
                fieldQuery: 'fieldsGroups',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"contentType": "contacts:customer"}`,
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
                fieldQueryVariables: `{"contentType": "contacts:customer"}`,
                logics: [
                    {
                        logicFieldName: 'groupIds',
                        logicFieldVariable: 'groupIds',
                        logicFieldExtraVariable: `{"contentType": "contacts:customer"}`,
                    },
                ],
                multi: true,
                fieldLabel: 'Select field',
            },
            // DATE FILTER
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
    {
        templateType: 'TotalCustomerByYear',
        serviceType: 'contacts',
        name: 'Total Customer Count By Year',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string,
        ) => {

            const matchFilter = await buildMatchFilter(filter, subdomain)

            const pipeline = [
                {
                    $match: { ...matchFilter, state: "customer", createdAt: { $ne: null } }
                },
                {
                    $group: {
                        _id: { $year: { $toDate: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        year: "$_id",
                        count: 1
                    }
                }
            ]

            const customersCount = await models.Customers.aggregate(pipeline)

            const totalCountByYear = (customersCount || []).reduce((acc, { count, year }) => {
                acc[year] = (acc[year] || 0) + count;
                return acc;
            }, {});

            const data = Object.values(totalCountByYear);
            const labels = Object.keys(totalCountByYear);
            const title = 'Total Customer Count By Year';

            return { title, data, labels };
        },
        filterTypes: [
            // SOURCE FILTER
            {
                fieldName: 'integrationTypes',
                fieldType: 'select',
                fieldQuery: 'integrations',
                multi: true,
                fieldOptions: INTEGRATION_TYPES,
                fieldLabel: 'Select source',
            },
            // CHANNEL FILTER
            {
                fieldName: 'channelIds',
                fieldType: 'select',
                fieldQuery: 'channels',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                multi: true,
                fieldLabel: 'Select channel',
            },
            // BRAND FILTER
            {
                fieldName: 'brandIds',
                fieldType: 'select',
                fieldQuery: 'brands',
                multi: true,
                fieldLabel: 'Select brands',
            },
            // TAG FILTER
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "contacts:customer", "perPage": 1000}`,
                multi: true,
                fieldLabel: 'Select tags',
            },
            // FORM FILTER
            {
                fieldName: 'formIds',
                fieldType: 'select',
                fieldQuery: 'forms',
                fieldQueryVariables: `{"kind": "lead"}`,
                multi: true,
                fieldLabel: 'Select forms',
                // FIX FORM SELECT FIELD
            },
            // PROPERTIES FILTER 
            {
                fieldName: 'groupIds',
                fieldType: 'select',
                fieldQuery: 'fieldsGroups',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"contentType": "contacts:customer"}`,
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
                fieldQueryVariables: `{"contentType": "contacts:customer"}`,
                logics: [
                    {
                        logicFieldName: 'groupIds',
                        logicFieldVariable: 'groupIds',
                        logicFieldExtraVariable: `{"contentType": "contacts:customer"}`,
                    },
                ],
                multi: true,
                fieldLabel: 'Select field',
            },
            // DATE FILTER
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
    {
        templateType: 'TotalCustomerBySource',
        serviceType: 'contacts',
        name: 'Total Customer Count By Source',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string,
        ) => {

            const matchFilter = await buildMatchFilter(filter, subdomain)

            const pipeline = [
                {
                    $match: {
                        ...matchFilter,
                        state: "customer",
                        integrationId: { $exists: true },
                    },
                },
                {
                    $group: {
                        _id: "$integrationId",
                        count: { $sum: 1 }
                    },
                },
                {
                    $lookup: {
                        from: "integrations",
                        let: { integrationId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ["$_id", "$$integrationId"] }
                                }
                            }
                        ],
                        as: "integration"
                    }
                },
                {
                    $unwind: "$integration"
                },
                {
                    $group: {
                        _id: "$integration.kind",
                        count: { $sum: "$count" }
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

            const customersCount = await models.Customers.aggregate(pipeline)

            const kindMap = await getIntegrationsKinds();


            const totalCountBySource = (customersCount || []).reduce((acc, { count, integration }) => {
                acc[kindMap[integration] || integration] = count;
                return acc;
            }, {});

            const data = Object.values(totalCountBySource);
            const labels = Object.keys(totalCountBySource);
            const title = 'Total Customer Count By Source';

            return { title, data, labels };
        },
        filterTypes: [
            // SOURCE FILTER
            {
                fieldName: 'integrationTypes',
                fieldType: 'select',
                fieldQuery: 'integrations',
                multi: true,
                fieldOptions: INTEGRATION_TYPES,
                fieldLabel: 'Select source',
            },
            // CHANNEL FILTER
            {
                fieldName: 'channelIds',
                fieldType: 'select',
                fieldQuery: 'channels',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                multi: true,
                fieldLabel: 'Select channel',
            },
            // BRAND FILTER
            {
                fieldName: 'brandIds',
                fieldType: 'select',
                fieldQuery: 'brands',
                multi: true,
                fieldLabel: 'Select brands',
            },
            // TAG FILTER
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "contacts:customer", "perPage": 1000}`,
                multi: true,
                fieldLabel: 'Select tags',
            },
            // FORM FILTER
            {
                fieldName: 'formIds',
                fieldType: 'select',
                fieldQuery: 'forms',
                fieldQueryVariables: `{"kind": "lead"}`,
                multi: true,
                fieldLabel: 'Select forms',
                // FIX FORM SELECT FIELD
            },
            // PROPERTIES FILTER 
            {
                fieldName: 'groupIds',
                fieldType: 'select',
                fieldQuery: 'fieldsGroups',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"contentType": "contacts:customer"}`,
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
                fieldQueryVariables: `{"contentType": "contacts:customer"}`,
                logics: [
                    {
                        logicFieldName: 'groupIds',
                        logicFieldVariable: 'groupIds',
                        logicFieldExtraVariable: `{"contentType": "contacts:customer"}`,
                    },
                ],
                multi: true,
                fieldLabel: 'Select field',
            },
            // DATE FILTER
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
    {
        templateType: 'TotalCustomerByTag',
        serviceType: 'contacts',
        name: 'Total Customer Count By Tag',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string,
        ) => {

            const matchFilter = await buildMatchFilter(filter, subdomain)

            const pipeline = [
                {
                    $match: {
                        ...matchFilter, state: "customer", tagIds: { $exists: true }
                    }
                },
                {
                    $unwind: "$tagIds"
                },
                {
                    $lookup: {
                        from: "tags",
                        let: { tagId: "$tagIds" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ["$_id", "$$tagId"] }
                                }
                            }
                        ],
                        as: "tag"
                    }
                },
                {
                    $unwind: "$tag"
                },
                {
                    $group: {
                        _id: "$tag.name",
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        tag: "$_id",
                        count: 1
                    }
                }
            ]

            const customersCount = await models.Customers.aggregate(pipeline)

            const totalCountByTag = customersCount.reduce((acc, { count, tag }) => {
                acc[tag] = count;
                return acc;
            }, {});

            const data = Object.values(totalCountByTag);
            const labels = Object.keys(totalCountByTag);
            const title = 'Total Customer Count By Tag';

            return { title, data, labels };
        },
        filterTypes: [
            // SOURCE FILTER
            {
                fieldName: 'integrationTypes',
                fieldType: 'select',
                fieldQuery: 'integrations',
                multi: true,
                fieldOptions: INTEGRATION_TYPES,
                fieldLabel: 'Select source',
            },
            // CHANNEL FILTER
            {
                fieldName: 'channelIds',
                fieldType: 'select',
                fieldQuery: 'channels',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                multi: true,
                fieldLabel: 'Select channel',
            },
            // BRAND FILTER
            {
                fieldName: 'brandIds',
                fieldType: 'select',
                fieldQuery: 'brands',
                multi: true,
                fieldLabel: 'Select brands',
            },
            // TAG FILTER
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "contacts:customer", "perPage": 1000}`,
                multi: true,
                fieldLabel: 'Select tags',
            },
            // FORM FILTER
            {
                fieldName: 'formIds',
                fieldType: 'select',
                fieldQuery: 'forms',
                fieldQueryVariables: `{"kind": "lead"}`,
                multi: true,
                fieldLabel: 'Select forms',
                // FIX FORM SELECT FIELD
            },
            // PROPERTIES FILTER 
            {
                fieldName: 'groupIds',
                fieldType: 'select',
                fieldQuery: 'fieldsGroups',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"contentType": "contacts:customer"}`,
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
                fieldQueryVariables: `{"contentType": "contacts:customer"}`,
                logics: [
                    {
                        logicFieldName: 'groupIds',
                        logicFieldVariable: 'groupIds',
                        logicFieldExtraVariable: `{"contentType": "contacts:customer"}`,
                    },
                ],
                multi: true,
                fieldLabel: 'Select field',
            },
            // DATE FILTER
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
    {
        templateType: 'TotalCustomerByPropertiesField',
        serviceType: 'contacts',
        name: 'Total Customer Count By Properties Field',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string,
        ) => {

            const matchFilter = await buildMatchFilter(filter, subdomain)

            const pipeline =
                [
                    { $unwind: "$customFieldsData" },
                    {
                        $match: {
                            state: "customer",
                            "customFieldsData.value": { $ne: "" },
                            ...matchFilter,
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
                            selectedOptions: {
                                $push: "$customFieldsData.value",
                            },
                            count: { $sum: 1 },
                        },
                    },
                ]

            const customersCount = await models.Customers.aggregate(pipeline)

            const totalCountByPropertiesField = (customersCount || []).reduce((acc, { field,
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

            const data = Object.values(totalCountByPropertiesField);
            const labels = Object.keys(totalCountByPropertiesField);
            const title = 'Total Customer Count By Properties Field';

            return { title, data, labels };
        },
        filterTypes: [
            // SOURCE FILTER
            {
                fieldName: 'integrationTypes',
                fieldType: 'select',
                fieldQuery: 'integrations',
                multi: true,
                fieldOptions: INTEGRATION_TYPES,
                fieldLabel: 'Select source',
            },
            // CHANNEL FILTER
            {
                fieldName: 'channelIds',
                fieldType: 'select',
                fieldQuery: 'channels',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                multi: true,
                fieldLabel: 'Select channel',
            },
            // BRAND FILTER
            {
                fieldName: 'brandIds',
                fieldType: 'select',
                fieldQuery: 'brands',
                multi: true,
                fieldLabel: 'Select brands',
            },
            // TAG FILTER
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "contacts:customer", "perPage": 1000}`,
                multi: true,
                fieldLabel: 'Select tags',
            },
            // FORM FILTER
            {
                fieldName: 'formIds',
                fieldType: 'select',
                fieldQuery: 'forms',
                fieldQueryVariables: `{"kind": "lead"}`,
                multi: true,
                fieldLabel: 'Select forms',
                // FIX FORM SELECT FIELD
            },
            // PROPERTIES FILTER 
            {
                fieldName: 'groupIds',
                fieldType: 'select',
                fieldQuery: 'fieldsGroups',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"contentType": "contacts:customer"}`,
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
                fieldQueryVariables: `{"contentType": "contacts:customer"}`,
                logics: [
                    {
                        logicFieldName: 'groupIds',
                        logicFieldVariable: 'groupIds',
                        logicFieldExtraVariable: `{"contentType": "contacts:customer"}`,
                    },
                ],
                multi: true,
                fieldLabel: 'Select field',
            },
            // DATE FILTER
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

    // CUSTOMER END

    // LEAD START

    {
        templateType: 'TotalLeadCount',
        serviceType: 'contacts',
        name: 'Total Lead Count',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string,
        ) => {

            const matchFilter = await buildMatchFilter(filter, subdomain)

            const customersCount = await models.Customers.find({ ...matchFilter, state: "lead" }).countDocuments()

            const totalCount = {
                'Total Count': customersCount
            };

            const data = Object.values(totalCount)
            const labels = Object.keys(totalCount);
            const title = 'Total Lead Count';

            return { title, data, labels };
        },
        filterTypes: [
            // SOURCE FILTER
            {
                fieldName: 'integrationTypes',
                fieldType: 'select',
                fieldQuery: 'integrations',
                multi: true,
                fieldOptions: INTEGRATION_TYPES,
                fieldLabel: 'Select source',
            },
            // CHANNEL FILTER
            {
                fieldName: 'channelIds',
                fieldType: 'select',
                fieldQuery: 'channels',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                multi: true,
                fieldLabel: 'Select channel',
            },
            // BRAND FILTER
            {
                fieldName: 'brandIds',
                fieldType: 'select',
                fieldQuery: 'brands',
                multi: true,
                fieldLabel: 'Select brands',
            },
            // TAG FILTER
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "contacts:customer", "perPage": 1000}`,
                multi: true,
                fieldLabel: 'Select tags',
            },
            // FORM FILTER
            {
                fieldName: 'formIds',
                fieldType: 'select',
                fieldQuery: 'forms',
                fieldQueryVariables: `{"kind": "lead"}`,
                multi: true,
                fieldLabel: 'Select forms',
                // FIX FORM SELECT FIELD
            },
            // PROPERTIES FILTER 
            {
                fieldName: 'groupIds',
                fieldType: 'select',
                fieldQuery: 'fieldsGroups',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"contentType": "contacts:customer"}`,
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
                fieldQueryVariables: `{"contentType": "contacts:customer"}`,
                logics: [
                    {
                        logicFieldName: 'groupIds',
                        logicFieldVariable: 'groupIds',
                        logicFieldExtraVariable: `{"contentType": "contacts:customer"}`,
                    },
                ],
                multi: true,
                fieldLabel: 'Select field',
            },
            // DATE FILTER
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
    {
        templateType: 'TotalLeadByYear',
        serviceType: 'contacts',
        name: 'Total Lead Count By Year',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string,
        ) => {

            const matchFilter = await buildMatchFilter(filter, subdomain)

            const pipeline = [
                {
                    $match: { ...matchFilter, state: "lead", createdAt: { $ne: null } }
                },
                {
                    $group: {
                        _id: { $year: { $toDate: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        year: "$_id",
                        count: 1
                    }
                }
            ]

            const customersCount = await models.Customers.aggregate(pipeline)

            const totalCountByYear = (customersCount || []).reduce((acc, { count, year }) => {
                acc[year] = (acc[year] || 0) + count;
                return acc;
            }, {});

            const data = Object.values(totalCountByYear);
            const labels = Object.keys(totalCountByYear);
            const title = 'Total Lead Count By Year';

            return { title, data, labels };
        },
        filterTypes: [
            // SOURCE FILTER
            {
                fieldName: 'integrationTypes',
                fieldType: 'select',
                fieldQuery: 'integrations',
                multi: true,
                fieldOptions: INTEGRATION_TYPES,
                fieldLabel: 'Select source',
            },
            // CHANNEL FILTER
            {
                fieldName: 'channelIds',
                fieldType: 'select',
                fieldQuery: 'channels',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                multi: true,
                fieldLabel: 'Select channel',
            },
            // BRAND FILTER
            {
                fieldName: 'brandIds',
                fieldType: 'select',
                fieldQuery: 'brands',
                multi: true,
                fieldLabel: 'Select brands',
            },
            // TAG FILTER
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "contacts:customer", "perPage": 1000}`,
                multi: true,
                fieldLabel: 'Select tags',
            },
            // FORM FILTER
            {
                fieldName: 'formIds',
                fieldType: 'select',
                fieldQuery: 'forms',
                fieldQueryVariables: `{"kind": "lead"}`,
                multi: true,
                fieldLabel: 'Select forms',
                // FIX FORM SELECT FIELD
            },
            // PROPERTIES FILTER 
            {
                fieldName: 'groupIds',
                fieldType: 'select',
                fieldQuery: 'fieldsGroups',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"contentType": "contacts:customer"}`,
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
                fieldQueryVariables: `{"contentType": "contacts:customer"}`,
                logics: [
                    {
                        logicFieldName: 'groupIds',
                        logicFieldVariable: 'groupIds',
                        logicFieldExtraVariable: `{"contentType": "contacts:customer"}`,
                    },
                ],
                multi: true,
                fieldLabel: 'Select field',
            },
            // DATE FILTER
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
    {
        templateType: 'TotalLeadBySource',
        serviceType: 'contacts',
        name: 'Total Lead Count By Source',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string,
        ) => {

            const matchFilter = await buildMatchFilter(filter, subdomain)

            const pipeline = [
                {
                    $match: {
                        ...matchFilter,
                        state: "lead",
                        integrationId: { $exists: true },
                    },
                },
                {
                    $group: {
                        _id: "$integrationId",
                        count: { $sum: 1 }
                    },
                },
                {
                    $lookup: {
                        from: "integrations",
                        let: { integrationId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ["$_id", "$$integrationId"] }
                                }
                            }
                        ],
                        as: "integration"
                    }
                },
                {
                    $unwind: "$integration"
                },
                {
                    $group: {
                        _id: "$integration.kind",
                        count: { $sum: "$count" }
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

            const customersCount = await models.Customers.aggregate(pipeline)
            const kindMap = await getIntegrationsKinds();

            const totalCountBySource = (customersCount || []).reduce((acc, { count, integration }) => {
                acc[kindMap[integration] || integration] = count;
                return acc;
            }, {});

            const data = Object.values(totalCountBySource);
            const labels = Object.keys(totalCountBySource);
            const title = 'Total Lead Count By Source';

            return { title, data, labels };
        },
        filterTypes: [
            // SOURCE FILTER
            {
                fieldName: 'integrationTypes',
                fieldType: 'select',
                fieldQuery: 'integrations',
                multi: true,
                fieldOptions: INTEGRATION_TYPES,
                fieldLabel: 'Select source',
            },
            // CHANNEL FILTER
            {
                fieldName: 'channelIds',
                fieldType: 'select',
                fieldQuery: 'channels',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                multi: true,
                fieldLabel: 'Select channel',
            },
            // BRAND FILTER
            {
                fieldName: 'brandIds',
                fieldType: 'select',
                fieldQuery: 'brands',
                multi: true,
                fieldLabel: 'Select brands',
            },
            // TAG FILTER
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "contacts:customer", "perPage": 1000}`,
                multi: true,
                fieldLabel: 'Select tags',
            },
            // FORM FILTER
            {
                fieldName: 'formIds',
                fieldType: 'select',
                fieldQuery: 'forms',
                fieldQueryVariables: `{"kind": "lead"}`,
                multi: true,
                fieldLabel: 'Select forms',
                // FIX FORM SELECT FIELD
            },
            // PROPERTIES FILTER 
            {
                fieldName: 'groupIds',
                fieldType: 'select',
                fieldQuery: 'fieldsGroups',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"contentType": "contacts:customer"}`,
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
                fieldQueryVariables: `{"contentType": "contacts:customer"}`,
                logics: [
                    {
                        logicFieldName: 'groupIds',
                        logicFieldVariable: 'groupIds',
                        logicFieldExtraVariable: `{"contentType": "contacts:customer"}`,
                    },
                ],
                multi: true,
                fieldLabel: 'Select field',
            },
            // DATE FILTER
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
    {
        templateType: 'TotalLeadByTag',
        serviceType: 'contacts',
        name: 'Total Lead Count By Tag',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string,
        ) => {

            const matchFilter = await buildMatchFilter(filter, subdomain)

            const pipeline = [
                {
                    $match: {
                        ...matchFilter, state: "lead", tagIds: { $exists: true }
                    }
                },
                {
                    $unwind: "$tagIds"
                },
                {
                    $lookup: {
                        from: "tags",
                        let: { tagId: "$tagIds" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ["$_id", "$$tagId"] }
                                }
                            }
                        ],
                        as: "tag"
                    }
                },
                {
                    $unwind: "$tag"
                },
                {
                    $group: {
                        _id: "$tag.name",
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        tag: "$_id",
                        count: 1
                    }
                }
            ]

            const customersCount = await models.Customers.aggregate(pipeline)

            const totalCountByTag = customersCount.reduce((acc, { count, tag }) => {
                acc[tag] = count;
                return acc;
            }, {});

            const data = Object.values(totalCountByTag);
            const labels = Object.keys(totalCountByTag);
            const title = 'Total Lead Count By Tag';

            return { title, data, labels };
        },
        filterTypes: [
            // SOURCE FILTER
            {
                fieldName: 'integrationTypes',
                fieldType: 'select',
                fieldQuery: 'integrations',
                multi: true,
                fieldOptions: INTEGRATION_TYPES,
                fieldLabel: 'Select source',
            },
            // CHANNEL FILTER
            {
                fieldName: 'channelIds',
                fieldType: 'select',
                fieldQuery: 'channels',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                multi: true,
                fieldLabel: 'Select channel',
            },
            // BRAND FILTER
            {
                fieldName: 'brandIds',
                fieldType: 'select',
                fieldQuery: 'brands',
                multi: true,
                fieldLabel: 'Select brands',
            },
            // TAG FILTER
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "contacts:customer", "perPage": 1000}`,
                multi: true,
                fieldLabel: 'Select tags',
            },
            // FORM FILTER
            {
                fieldName: 'formIds',
                fieldType: 'select',
                fieldQuery: 'forms',
                fieldQueryVariables: `{"kind": "lead"}`,
                multi: true,
                fieldLabel: 'Select forms',
                // FIX FORM SELECT FIELD
            },
            // PROPERTIES FILTER 
            {
                fieldName: 'groupIds',
                fieldType: 'select',
                fieldQuery: 'fieldsGroups',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"contentType": "contacts:customer"}`,
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
                fieldQueryVariables: `{"contentType": "contacts:customer"}`,
                logics: [
                    {
                        logicFieldName: 'groupIds',
                        logicFieldVariable: 'groupIds',
                        logicFieldExtraVariable: `{"contentType": "contacts:customer"}`,
                    },
                ],
                multi: true,
                fieldLabel: 'Select field',
            },
            // DATE FILTER
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
    {
        templateType: 'TotalLeadsByPropertiesField',
        serviceType: 'contacts',
        name: 'Total Lead Count By Properties Field',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string,
        ) => {

            const matchFilter = await buildMatchFilter(filter, subdomain)

            const pipeline =
                [
                    { $unwind: "$customFieldsData" },
                    {
                        $match: {
                            state: "lead",
                            "customFieldsData.value": { $ne: "" },
                            ...matchFilter,
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
                            selectedOptions: {
                                $push: "$customFieldsData.value",
                            },
                            count: { $sum: 1 },
                        },
                    },
                ]

            const customersCount = await models.Customers.aggregate(pipeline)

            const totalCountByPropertiesField = (customersCount || []).reduce((acc, { field,
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

            const data = Object.values(totalCountByPropertiesField);
            const labels = Object.keys(totalCountByPropertiesField);
            const title = 'Total Lead Count By Properties Field';

            return { title, data, labels };
        },
        filterTypes: [
            // SOURCE FILTER
            {
                fieldName: 'integrationTypes',
                fieldType: 'select',
                fieldQuery: 'integrations',
                multi: true,
                fieldOptions: INTEGRATION_TYPES,
                fieldLabel: 'Select source',
            },
            // CHANNEL FILTER
            {
                fieldName: 'channelIds',
                fieldType: 'select',
                fieldQuery: 'channels',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                multi: true,
                fieldLabel: 'Select channel',
            },
            // BRAND FILTER
            {
                fieldName: 'brandIds',
                fieldType: 'select',
                fieldQuery: 'brands',
                multi: true,
                fieldLabel: 'Select brands',
            },
            // TAG FILTER
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "contacts:customer", "perPage": 1000}`,
                multi: true,
                fieldLabel: 'Select tags',
            },
            // FORM FILTER
            {
                fieldName: 'formIds',
                fieldType: 'select',
                fieldQuery: 'forms',
                fieldQueryVariables: `{"kind": "lead"}`,
                multi: true,
                fieldLabel: 'Select forms',
                // FIX FORM SELECT FIELD
            },
            // PROPERTIES FILTER 
            {
                fieldName: 'groupIds',
                fieldType: 'select',
                fieldQuery: 'fieldsGroups',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"contentType": "contacts:customer"}`,
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
                fieldQueryVariables: `{"contentType": "contacts:customer"}`,
                logics: [
                    {
                        logicFieldName: 'groupIds',
                        logicFieldVariable: 'groupIds',
                        logicFieldExtraVariable: `{"contentType": "contacts:customer"}`,
                    },
                ],
                multi: true,
                fieldLabel: 'Select field',
            },
            // DATE FILTER
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

    // LEAD END

    // COMPANY START

    {
        templateType: 'TotalCompanyCount',
        serviceType: 'contacts',
        name: 'Total Company Count',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string,
        ) => {

            const matchFilter = await buildMatchFilter(filter, subdomain)

            const customersCount = await models.Companies.find(matchFilter).countDocuments()

            const totalCount = {
                'Total Count': customersCount
            };

            const data = Object.values(totalCount)
            const labels = Object.keys(totalCount);
            const title = 'Total Company Count';

            return { title, data, labels };
        },
        filterTypes: [
            // TAG FILTER
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "contacts:company", "perPage": 1000}`,
                multi: true,
                fieldLabel: 'Select tags',
            },
            // PROPERTIES FILTER 
            {
                fieldName: 'groupIds',
                fieldType: 'select',
                fieldQuery: 'fieldsGroups',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"contentType": "contacts:company"}`,
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
                fieldQueryVariables: `{"contentType": "contacts:company"}`,
                logics: [
                    {
                        logicFieldName: 'groupIds',
                        logicFieldVariable: 'groupIds',
                        logicFieldExtraVariable: `{"contentType": "contacts:company"}`,
                    },
                ],
                multi: true,
                fieldLabel: 'Select field',
            },
            // DATE FILTER
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
    {
        templateType: 'TotalCompanyByYear',
        serviceType: 'contacts',
        name: 'Total Company Count By Year',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string,
        ) => {

            const matchFilter = await buildMatchFilter(filter, subdomain)

            const pipeline = [
                {
                    $match: { ...matchFilter, createdAt: { $ne: null } }
                },
                {
                    $group: {
                        _id: { $year: { $toDate: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        year: "$_id",
                        count: 1
                    }
                }
            ]

            const customersCount = await models.Companies.aggregate(pipeline)

            const totalCountByYear = (customersCount || []).reduce((acc, { count, year }) => {
                acc[year] = (acc[year] || 0) + count;
                return acc;
            }, {});

            const data = Object.values(totalCountByYear);
            const labels = Object.keys(totalCountByYear);
            const title = 'Total Company Count By Year';

            return { title, data, labels };
        },
        filterTypes: [
            // TAG FILTER
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "contacts:company", "perPage": 1000}`,
                multi: true,
                fieldLabel: 'Select tags',
            },
            // PROPERTIES FILTER 
            {
                fieldName: 'groupIds',
                fieldType: 'select',
                fieldQuery: 'fieldsGroups',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"contentType": "contacts:company"}`,
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
                fieldQueryVariables: `{"contentType": "contacts:company"}`,
                logics: [
                    {
                        logicFieldName: 'groupIds',
                        logicFieldVariable: 'groupIds',
                        logicFieldExtraVariable: `{"contentType": "contacts:company"}`,
                    },
                ],
                multi: true,
                fieldLabel: 'Select field',
            },
            // DATE FILTER
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
    {
        templateType: 'TotalCompanyCountByTag',
        serviceType: 'contacts',
        name: 'Total Company Count By Tag',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string,
        ) => {

            const matchFilter = await buildMatchFilter(filter, subdomain)

            const pipeline = [
                {
                    $match: { ...matchFilter, tagIds: { $exists: true } }
                },
                {
                    $unwind: "$tagIds"
                },
                {
                    $lookup: {
                        from: "tags",
                        let: { tagId: "$tagIds" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ["$_id", "$$tagId"] }
                                }
                            }
                        ],
                        as: "tag"
                    }
                },
                {
                    $unwind: "$tag"
                },
                {
                    $group: {
                        _id: "$tag.name",
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        tag: "$_id",
                        count: 1
                    }
                }
            ]

            const customersCount = await models.Companies.aggregate(pipeline)

            const totalCountByTag = customersCount.reduce((acc, { count, tag }) => {
                acc[tag] = count;
                return acc;
            }, {});

            const data = Object.values(totalCountByTag);
            const labels = Object.keys(totalCountByTag);
            const title = 'Total Company Count By Tag';

            return { title, data, labels };
        },
        filterTypes: [
            // TAG FILTER
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "contacts:company", "perPage": 1000}`,
                multi: true,
                fieldLabel: 'Select tags',
            },
            // PROPERTIES FILTER 
            {
                fieldName: 'groupIds',
                fieldType: 'select',
                fieldQuery: 'fieldsGroups',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"contentType": "contacts:company"}`,
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
                fieldQueryVariables: `{"contentType": "contacts:company"}`,
                logics: [
                    {
                        logicFieldName: 'groupIds',
                        logicFieldVariable: 'groupIds',
                        logicFieldExtraVariable: `{"contentType": "contacts:company"}`,
                    },
                ],
                multi: true,
                fieldLabel: 'Select field',
            },
            // DATE FILTER
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
    {
        templateType: 'TotalCompanyCountByPropertiesField',
        serviceType: 'contacts',
        name: 'Total Company Count By Properties Field',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string,
        ) => {

            const matchFilter = await buildMatchFilter(filter, subdomain)

            const pipeline =
                [
                    { $unwind: "$customFieldsData" },
                    {
                        $match: {
                            "customFieldsData.value": { $ne: "" },
                            ...matchFilter,
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
                            selectedOptions: {
                                $push: "$customFieldsData.value",
                            },
                            count: { $sum: 1 },
                        },
                    },
                ]

            const customersCount = await models.Companies.aggregate(pipeline)

            const totalCountByPropertiesField = (customersCount || []).reduce((acc, { field,
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

            const data = Object.values(totalCountByPropertiesField);
            const labels = Object.keys(totalCountByPropertiesField);
            const title = 'Total Company Count By Properties Field';

            return { title, data, labels };
        },
        filterTypes: [
            // TAG FILTER
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "contacts:company", "perPage": 1000}`,
                multi: true,
                fieldLabel: 'Select tags',
            },
            // PROPERTIES FILTER 
            {
                fieldName: 'groupIds',
                fieldType: 'select',
                fieldQuery: 'fieldsGroups',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"contentType": "contacts:company"}`,
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
                fieldQueryVariables: `{"contentType": "contacts:company"}`,
                logics: [
                    {
                        logicFieldName: 'groupIds',
                        logicFieldVariable: 'groupIds',
                        logicFieldExtraVariable: `{"contentType": "contacts:company"}`,
                    },
                ],
                multi: true,
                fieldLabel: 'Select field',
            },
            // DATE FILTER
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

    // COMPANY END

    // CLIENT PORTAL START

    {
        templateType: 'TotalClientPortalUsersCount',
        serviceType: 'contacts',
        name: 'Total Client Portal Count',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string,
        ) => {

            const { stateType } = filter

            const matchFilter = await buildMatchFilter(filter, subdomain)

            if (stateType && stateType.length) {
                matchFilter['type'] = { $eq: stateType }
            }

            const pipeline = getBusinnesPortalPipeline(matchFilter, 'all', 'client');
            const clientPortal = await getBusinessPortalCount(pipeline, 0, subdomain)

            const totalCount = {
                'Total Count': clientPortal
            };

            const data = Object.values(totalCount)
            const labels = Object.keys(totalCount);
            const title = 'Total Client Portal Count';

            return { title, data, labels };
        },
        filterTypes: [
            // PORTAL FILTER
            {
                fieldName: 'portalIds',
                fieldType: 'select',
                fieldQuery: 'clientPortalGetConfigs',
                fieldQueryVariables: `{"kind": "client"}`,
                multi: true,
                fieldLabel: 'Select client portal',
            },
            // STATE FILTER
            {
                fieldName: 'stateType',
                fieldType: 'select',
                fieldOptions: BUSINESSPORTAL_STATE_TYPES,
                multi: false,
                fieldLabel: 'Select state',
            },
            // DATE FILTER
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
    {
        templateType: 'TotalClientPortalUsersByYear',
        serviceType: 'contacts',
        name: 'Total Client Portal Count By Year',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string,
        ) => {

            const { stateType } = filter

            const matchFilter = await buildMatchFilter(filter, subdomain)

            if (stateType && stateType.length) {
                matchFilter['type'] = { $eq: stateType }
            }

            const pipeline = getBusinnesPortalPipeline(matchFilter, 'year', 'client');

            const clientPortal = await getBusinessPortalCount(pipeline, 'all', subdomain)

            const totalCountByYear = clientPortal.reduce((acc, { count, year }) => {
                acc[year] = (acc[year] || 0) + count;
                return acc;
            }, {});

            const data = Object.values(totalCountByYear);
            const labels = Object.keys(totalCountByYear);
            const title = 'Total Client Portal Count By Year';

            return { title, data, labels };
        },
        filterTypes: [
            // PORTAL FILTER
            {
                fieldName: 'portalIds',
                fieldType: 'select',
                fieldQuery: 'clientPortalGetConfigs',
                fieldQueryVariables: `{"kind": "client"}`,
                multi: true,
                fieldLabel: 'Select client portal',
            },
            // STATE FILTER
            {
                fieldName: 'stateType',
                fieldType: 'select',
                fieldOptions: BUSINESSPORTAL_STATE_TYPES,
                multi: false,
                fieldLabel: 'Select state',
            },
            // DATE FILTER
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

    // CLIENT PORTAL END

    // VENDOR PORTAL START

    {
        templateType: 'TotalVendorPortalUsersCount',
        serviceType: 'contacts',
        name: 'Total Vendor Portal Count',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string,
        ) => {

            const { stateType } = filter

            const matchFilter = await buildMatchFilter(filter, subdomain)

            if (stateType && stateType.length) {
                matchFilter['type'] = { $eq: stateType }
            }

            const pipeline = getBusinnesPortalPipeline(matchFilter, 'all', 'vendor');
            const vendorPortal = await getBusinessPortalCount(pipeline, 0, subdomain)

            const totalCount = {
                'Total Count': vendorPortal
            };

            const data = Object.values(totalCount)
            const labels = Object.keys(totalCount);
            const title = 'Total Vendor Portal Count';

            return { title, data, labels };
        },
        filterTypes: [
            // PORTAL FILTER
            {
                fieldName: 'portalIds',
                fieldType: 'select',
                fieldQuery: 'clientPortalGetConfigs',
                fieldQueryVariables: `{"kind": "vendor"}`,
                multi: true,
                fieldLabel: 'Select vendor portal',
            },
            // STATE FILTER
            {
                fieldName: 'stateType',
                fieldType: 'select',
                fieldOptions: BUSINESSPORTAL_STATE_TYPES,
                multi: false,
                fieldLabel: 'Select state',
            },
            // DATE FILTER
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
    {
        templateType: 'TotalVendorPortalUsersByYear',
        serviceType: 'contacts',
        name: 'Total Vendor Portal Count By Year',
        chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string,
        ) => {

            const { stateType } = filter

            const matchFilter = await buildMatchFilter(filter, subdomain)

            if (stateType && stateType.length) {
                matchFilter['type'] = { $eq: stateType }
            }

            const pipeline = getBusinnesPortalPipeline(matchFilter, 'year', 'vendor');
            const vendorPortal = await getBusinessPortalCount(pipeline, 'all', subdomain)

            const totalCountByYear = vendorPortal.reduce((acc, { count, year }) => {
                acc[year] = (acc[year] || 0) + count;
                return acc;
            }, {});

            const data = Object.values(totalCountByYear);
            const labels = Object.keys(totalCountByYear);
            const title = 'Total Vendor Portal Count By Year';

            return { title, data, labels };
        },
        filterTypes: [
            // PORTAL FILTER
            {
                fieldName: 'portalIds',
                fieldType: 'select',
                fieldQuery: 'clientPortalGetConfigs',
                fieldQueryVariables: `{"kind": "vendor"}`,
                multi: true,
                fieldLabel: 'Select vendor portal',
            },
            // STATE FILTER
            {
                fieldName: 'stateType',
                fieldType: 'select',
                fieldOptions: BUSINESSPORTAL_STATE_TYPES,
                multi: false,
                fieldLabel: 'Select state',
            },
            // DATE FILTER
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

    // VENDOR PORTAL END
]

export default chartTemplates;