import { IModels } from "../../connectionResolver";
import {
    BUSINESSPORTAL_STATE_TYPES,
    COMPANIES_OPTIONS,
    CONTACT_STATES,
    CONTACT_STATE_TYPES,
    CUSTOMERS_OPTIONS,
    CUSTOM_DATE_FREQUENCY_TYPES,
    DATERANGE_BY_TYPES,
    DATERANGE_BY_TYPES_COMPANIES,
    DATERANGE_TYPES,
    DIMENSION_OPTIONS,
    INTEGRATION_TYPES,
    KIND_MAP,
    MEASURE_OPTIONS
} from "../constants";
import {
    buildData,
    buildMatchFilter,
    buildPipeline,
    getBusinessPortalCount,
    getBusinnesPortalPipeline,
} from "../utils";

const contactTemplates = [
    // CONTACT START

    {
        templateType: "TotalContactCount",
        serviceType: "contacts",
        name: "Total Contact Count",
        chartTypes: [
            "bar",
            "line",
            "pie",
            "doughnut",
            "radar",
            "polarArea",
            "table",
            "number",
            "pivotTable"
        ],
        getChartResult: async (
            models: IModels,
            filter: any,
            chartType: any,
            subdomain: string
        ) => {
            const { stateType } = filter;
            const matchFilter = await buildMatchFilter(filter, subdomain);

            const pipeline = await buildPipeline(filter, matchFilter, stateType === 'company' ? '' : stateType)

            let contacts: any[] = []

            if (stateType === 'company') {
                contacts = await models.Companies.aggregate(pipeline)

            } else {
                const [customers, companies] = await Promise.all([
                    models.Customers.aggregate(pipeline),
                    models.Companies.aggregate(pipeline)
                ]);

                [...customers, ...companies].forEach((contact) => {
                    const { count, ...rest } = contact;

                    const existing = contacts.find(entry => {
                        return Object.keys(rest).every(key => {
                            if (typeof rest[key] === 'object' && rest[key] !== null) {
                                return entry[key]._id === rest[key]._id;
                            }

                            return entry[key] === rest[key];
                        });
                    });

                    if (existing) {
                        existing.count += count;
                    } else {
                        contacts.push({ count, ...rest });
                    }
                });
            }

            const title = "Total Company Count";

            return { title, ...buildData({ chartType, data: contacts, filter }) };
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
            // STATE FILTER
            {
                fieldName: "stateType",
                fieldType: "select",
                fieldOptions: CONTACT_STATE_TYPES,
                multi: false,
                fieldLabel: "Select state"
            },
            // PROPERTIES FILTER
            {
                fieldName: "groupIds",
                fieldType: "select",
                fieldQuery: "fieldsGroups",
                fieldValueVariable: "_id",
                fieldLabelVariable: "name",
                fieldParentVariable: "contentType",
                fieldQueryVariables: `{"contentType": "core:all"}`,
                multi: true,
                fieldLabel: "Select field group"
            },
            {
                fieldName: "fieldIds",
                fieldType: "select",
                fieldQuery: "fields",
                fieldValueVariable: "_id",
                fieldLabelVariable: "text",
                fieldParentVariable: "groupId",
                fieldParentQuery: "fieldsGroups",
                fieldRequiredQueryParams: ["contentType"],
                fieldQueryVariables: `{"contentType": "core:all"}`,
                logics: [
                    {
                        logicFieldName: "groupIds",
                        logicFieldVariable: "groupIds",
                        logicFieldExtraVariable: `{"contentType": "core:all"}`
                    }
                ],
                multi: true,
                fieldLabel: "Select field"
            },
            // DATE FILTER
            {
                fieldName: "dateRange",
                fieldType: "select",
                multi: true,
                fieldQuery: "date",
                fieldOptions: DATERANGE_TYPES,
                fieldLabel: "Select date range",
                fieldDefaultValue: "all"
            },
            {
                fieldName: "dateRangeType",
                fieldType: "select",
                multi: false,
                fieldQuery: "date",
                fieldOptions: DATERANGE_BY_TYPES,
                fieldLabel: "Select date range type",
                fieldDefaultValue: "createdAt"
            }
        ]
    },
    {
        templateType: "TotalContactCountByYear",
        serviceType: "contacts",
        name: "Total Contact Count By Year",
        chartTypes: [
            "bar",
            "line",
            "pie",
            "doughnut",
            "radar",
            "polarArea",
            "table"
        ],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string
        ) => {
            const { stateType, dateRangeType = "createdAt" } = filter;
            const matchFilter = await buildMatchFilter(filter, subdomain);

            const pipeline = [
                {
                    $match: { ...matchFilter, [dateRangeType]: { $ne: null } }
                },
                {
                    $group: {
                        _id: { $year: { $toDate: `$${dateRangeType}` } },
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
            ];

            let totalCounts;

            if (
                stateType === "customer" ||
                stateType === "lead" ||
                stateType === "visitor"
            ) {
                pipeline[0].$match = Object.assign({}, pipeline[0].$match, {
                    state: { $eq: stateType }
                });
                const customerCount = await models.Customers.aggregate(pipeline);

                totalCounts = [...customerCount];
            } else if (stateType === "company") {
                const companyCount = await models.Companies.aggregate(pipeline);

                totalCounts = [...companyCount];
            } else if (
                stateType === "client-portal" ||
                stateType === "vendor-portal"
            ) {
                const kind = stateType === "client-portal" ? "client" : "vendor";

                const pipeline = getBusinnesPortalPipeline(matchFilter, "year", kind);

                const businessPortalCount = await getBusinessPortalCount(
                    pipeline,
                    "all",
                    subdomain
                );

                totalCounts = [...businessPortalCount];
            } else {
                const [companiesCount, customersCount, businessPortalsCount] =
                    await Promise.all([
                        models.Companies.aggregate(pipeline),
                        models.Customers.aggregate(pipeline),
                        getBusinessPortalCount(
                            getBusinnesPortalPipeline(matchFilter, "year"),
                            "all",
                            subdomain
                        )
                    ]);

                totalCounts = [
                    ...customersCount,
                    ...companiesCount,
                    ...businessPortalsCount
                ];
            }

            const totalCountByYear = (totalCounts || []).reduce(
                (acc, { count, year }) => {
                    acc[year] = (acc[year] || 0) + count;
                    return acc;
                },
                {}
            );

            const data = Object.values(totalCountByYear);
            const labels = Object.keys(totalCountByYear);
            const title = "Total Contact Count By Year";

            return { title, data, labels };
        },
        filterTypes: [
            // STATE FILTER
            {
                fieldName: "stateType",
                fieldType: "select",
                fieldOptions: CONTACT_STATE_TYPES,
                multi: false,
                fieldLabel: "Select state"
            },
            // PROPERTIES FILTER
            {
                fieldName: "groupIds",
                fieldType: "select",
                fieldQuery: "fieldsGroups",
                fieldValueVariable: "_id",
                fieldLabelVariable: "name",
                fieldParentVariable: "contentType",
                fieldQueryVariables: `{"contentType": "core:all"}`,
                multi: true,
                fieldLabel: "Select field group"
            },
            {
                fieldName: "fieldIds",
                fieldType: "select",
                fieldQuery: "fields",
                fieldValueVariable: "_id",
                fieldLabelVariable: "text",
                fieldParentVariable: "groupId",
                fieldParentQuery: "fieldsGroups",
                fieldRequiredQueryParams: ["contentType"],
                fieldQueryVariables: `{"contentType": "core:all"}`,
                logics: [
                    {
                        logicFieldName: "groupIds",
                        logicFieldVariable: "groupIds",
                        logicFieldExtraVariable: `{"contentType": "core:all"}`
                    }
                ],
                multi: true,
                fieldLabel: "Select field"
            },
            // DATE FILTER
            {
                fieldName: "dateRange",
                fieldType: "select",
                multi: true,
                fieldQuery: "date",
                fieldOptions: DATERANGE_TYPES,
                fieldLabel: "Select date range",
                fieldDefaultValue: "all"
            },
            {
                fieldName: "dateRangeType",
                fieldType: "select",
                multi: false,
                fieldQuery: "date",
                fieldOptions: DATERANGE_BY_TYPES,
                fieldLabel: "Select date range type",
                fieldDefaultValue: "createdAt"
            }
        ]
    },
    {
        templateType: "TotalContactByState",
        serviceType: "contacts",
        name: "Total Contact Count By State",
        chartTypes: [
            "bar",
            "line",
            "pie",
            "doughnut",
            "radar",
            "polarArea",
            "table"
        ],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string
        ) => {
            const { stateType } = filter;
            const matchFilter = await buildMatchFilter(filter, subdomain);

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
            ];

            const companiesProject = [
                {
                    $project: {
                        _id: 0,
                        all: "company",
                        count: 1
                    }
                }
            ];

            const customersProject = [
                {
                    $project: {
                        _id: 0,
                        all: "$_id",
                        count: 1
                    }
                },
                {
                    $match: { all: { $ne: null } }
                }
            ];

            let totalCounts;

            if (
                stateType === "customer" ||
                stateType === "lead" ||
                stateType === "visitor"
            ) {
                pipeline[0].$match = Object.assign({}, pipeline[0].$match, {
                    state: { $eq: stateType }
                });
                const customerCount = await models.Customers.aggregate([
                    ...pipeline,
                    ...customersProject
                ]);

                totalCounts = [...customerCount];
            } else if (stateType === "company") {
                const companyCount = await models.Companies.aggregate([
                    ...pipeline,
                    ...companiesProject
                ]);
                totalCounts = [...companyCount];
            } else if (
                stateType === "client-portal" ||
                stateType === "vendor-portal"
            ) {
                const kind = stateType === "client-portal" ? "client" : "vendor";

                const pipeline = getBusinnesPortalPipeline(matchFilter, "all", kind);

                const businessPortalCount = await getBusinessPortalCount(
                    pipeline,
                    "all",
                    subdomain
                );

                totalCounts = [...businessPortalCount];
            } else {
                const [
                    companiesCount,
                    customersCount,
                    clientPortalCount,
                    vendorPortalCount
                ] = await Promise.all([
                    models.Companies.aggregate([...pipeline, ...companiesProject]),
                    models.Customers.aggregate([...pipeline, ...customersProject]),
                    getBusinessPortalCount(
                        getBusinnesPortalPipeline(matchFilter, "all", "client"),
                        "all",
                        subdomain
                    ),
                    getBusinessPortalCount(
                        getBusinnesPortalPipeline(matchFilter, "all", "vendor"),
                        "all",
                        subdomain
                    )
                ]);

                totalCounts = [
                    ...companiesCount,
                    ...customersCount,
                    ...clientPortalCount,
                    ...vendorPortalCount
                ];
            }

            const totalCountByState = (totalCounts || []).reduce(
                (acc, { count, all }) => {
                    acc[CONTACT_STATES[all]] = count;
                    return acc;
                },
                {}
            );

            const data = Object.values(totalCountByState);
            const labels = Object.keys(totalCountByState);
            const title = "Total Contact Count By State";

            return { title, data, labels };
        },
        filterTypes: [
            // STATE FILTER
            {
                fieldName: "stateType",
                fieldType: "select",
                fieldOptions: CONTACT_STATE_TYPES,
                multi: false,
                fieldLabel: "Select state"
            },
            // PROPERTIES FILTER
            {
                fieldName: "groupIds",
                fieldType: "select",
                fieldQuery: "fieldsGroups",
                fieldValueVariable: "_id",
                fieldLabelVariable: "name",
                fieldParentVariable: "contentType",
                fieldQueryVariables: `{"contentType": "core:all"}`,
                multi: true,
                fieldLabel: "Select field group"
            },
            {
                fieldName: "fieldIds",
                fieldType: "select",
                fieldQuery: "fields",
                fieldValueVariable: "_id",
                fieldLabelVariable: "text",
                fieldParentVariable: "groupId",
                fieldParentQuery: "fieldsGroups",
                fieldRequiredQueryParams: ["contentType"],
                fieldQueryVariables: `{"contentType": "core:all"}`,
                logics: [
                    {
                        logicFieldName: "groupIds",
                        logicFieldVariable: "groupIds",
                        logicFieldExtraVariable: `{"contentType": "core:all"}`
                    }
                ],
                multi: true,
                fieldLabel: "Select field"
            },
            // DATE FILTER
            {
                fieldName: "dateRange",
                fieldType: "select",
                multi: true,
                fieldQuery: "date",
                fieldOptions: DATERANGE_TYPES,
                fieldLabel: "Select date range",
                fieldDefaultValue: "all"
            },
            {
                fieldName: "dateRangeType",
                fieldType: "select",
                multi: false,
                fieldQuery: "date",
                fieldOptions: DATERANGE_BY_TYPES,
                fieldLabel: "Select date range type",
                fieldDefaultValue: "createdAt"
            }
        ]
    },
    {
        templateType: "TotalContactBySource",
        serviceType: "contacts",
        name: "Total Contact Count By Source",
        chartTypes: [
            "bar",
            "line",
            "pie",
            "doughnut",
            "radar",
            "polarArea",
            "table"
        ],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string
        ) => {
            const { stateType } = filter;
            const matchFilter = await buildMatchFilter(filter, subdomain);

            const pipeline = [
                {
                    $match: {
                        ...matchFilter,
                        integrationId: { $exists: true }
                    }
                },
                {
                    $group: {
                        _id: "$integrationId",
                        count: { $sum: 1 }
                    }
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
            ];

            let totalCounts;

            if (
                stateType === "customer" ||
                stateType === "lead" ||
                stateType === "visitor"
            ) {
                pipeline[0].$match = Object.assign({}, pipeline[0].$match, {
                    state: { $eq: stateType }
                });
                const customerCount = await models.Customers.aggregate(pipeline);

                totalCounts = [...customerCount];
            } else if (stateType === "company") {
                const companyCount = await models.Companies.aggregate(pipeline);

                totalCounts = [...companyCount];
            } else if (
                stateType === "client-portal" ||
                stateType === "vendor-portal"
            ) {
                const businessPortalCount = await getBusinessPortalCount(
                    pipeline,
                    "all",
                    subdomain
                );

                totalCounts = [...businessPortalCount];
            } else {
                const [companiesCount, customersCount, businessPortalsCount] =
                    await Promise.all([
                        models.Companies.aggregate(pipeline),
                        models.Customers.aggregate(pipeline),
                        getBusinessPortalCount(
                            getBusinnesPortalPipeline(matchFilter, "all"),
                            "all",
                            subdomain
                        )
                    ]);

                totalCounts = [
                    ...companiesCount,
                    ...customersCount,
                    ...businessPortalsCount
                ];
            }

            const totalCountBySource = (totalCounts || []).reduce(
                (acc, { count, all }) => {
                    acc[KIND_MAP[all] || all] = count;
                    return acc;
                },
                {}
            );

            const data = Object.values(totalCountBySource);
            const labels = Object.keys(totalCountBySource);
            const title = "Total Contact Count By Source";

            return { title, data, labels };
        },
        filterTypes: [
            // STATE FILTER
            {
                fieldName: "stateType",
                fieldType: "select",
                fieldOptions: CONTACT_STATE_TYPES,
                multi: false,
                fieldLabel: "Select state"
            },
            // PROPERTIES FILTER
            {
                fieldName: "groupIds",
                fieldType: "select",
                fieldQuery: "fieldsGroups",
                fieldValueVariable: "_id",
                fieldLabelVariable: "name",
                fieldParentVariable: "contentType",
                fieldQueryVariables: `{"contentType": "core:all"}`,
                multi: true,
                fieldLabel: "Select field group"
            },
            {
                fieldName: "fieldIds",
                fieldType: "select",
                fieldQuery: "fields",
                fieldValueVariable: "_id",
                fieldLabelVariable: "text",
                fieldParentVariable: "groupId",
                fieldParentQuery: "fieldsGroups",
                fieldRequiredQueryParams: ["contentType"],
                fieldQueryVariables: `{"contentType": "core:all"}`,
                logics: [
                    {
                        logicFieldName: "groupIds",
                        logicFieldVariable: "groupIds",
                        logicFieldExtraVariable: `{"contentType": "core:all"}`
                    }
                ],
                multi: true,
                fieldLabel: "Select field"
            },
            // DATE FILTER
            {
                fieldName: "dateRange",
                fieldType: "select",
                multi: true,
                fieldQuery: "date",
                fieldOptions: DATERANGE_TYPES,
                fieldLabel: "Select date range",
                fieldDefaultValue: "all"
            },
            {
                fieldName: "dateRangeType",
                fieldType: "select",
                multi: false,
                fieldQuery: "date",
                fieldOptions: DATERANGE_BY_TYPES,
                fieldLabel: "Select date range type",
                fieldDefaultValue: "createdAt"
            }
        ]
    },

    // CONTACT END

    // CUSTOMER START

    {
        templateType: "TotalCustomerCount",
        serviceType: "contacts",
        name: "Total Customer Count",
        chartTypes: [
            "bar",
            "line",
            "pie",
            "doughnut",
            "radar",
            "polarArea",
            "table",
            "number",
            "pivotTable"
        ],
        getChartResult: async (
            models: IModels,
            filter: any,
            chartType: any,
            subdomain: string
        ) => {
            const matchFilter = await buildMatchFilter(filter, subdomain);

            const pipeline = await buildPipeline(filter, matchFilter, 'customer')

            const customers = await models.Customers.aggregate(pipeline)
            const title = "Total Customer Count";

            return { title, ...buildData({ chartType, data: customers, filter }) };
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
                fieldOptions: [...DIMENSION_OPTIONS, ...CUSTOMERS_OPTIONS],
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
                fieldOptions: [...DIMENSION_OPTIONS, ...CUSTOMERS_OPTIONS],
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
                fieldOptions: [...DIMENSION_OPTIONS, ...CUSTOMERS_OPTIONS],
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
            // SOURCE FILTER
            {
                fieldName: "integrationTypes",
                fieldType: "select",
                fieldQuery: "integrations",
                multi: true,
                fieldOptions: INTEGRATION_TYPES,
                fieldLabel: "Select source"
            },
            // CHANNEL FILTER
            {
                fieldName: "channelIds",
                fieldType: "select",
                fieldQuery: "channels",
                fieldValueVariable: "_id",
                fieldLabelVariable: "name",
                multi: true,
                fieldLabel: "Select channel"
            },
            // BRAND FILTER
            {
                fieldName: "brandIds",
                fieldType: "select",
                fieldQuery: "brands",
                multi: true,
                fieldLabel: "Select brands"
            },
            // TAG FILTER
            {
                fieldName: "tagIds",
                fieldType: "select",
                fieldQuery: "tags",
                fieldValueVariable: "_id",
                fieldLabelVariable: "name",
                fieldQueryVariables: `{"type": "core:customer", "perPage": 1000}`,
                multi: true,
                fieldLabel: "Select tags"
            },
            // FORM FILTER
            {
                fieldName: "formIds",
                fieldType: "select",
                fieldQuery: "forms",
                fieldQueryVariables: `{"kind": "lead"}`,
                multi: true,
                fieldLabel: "Select forms"
                // FIX FORM SELECT FIELD
            },
            // PROPERTIES FILTER
            {
                fieldName: "groupIds",
                fieldType: "select",
                fieldQuery: "fieldsGroups",
                fieldValueVariable: "_id",
                fieldLabelVariable: "name",
                fieldQueryVariables: `{"contentType": "core:customer"}`,
                multi: true,
                fieldLabel: "Select field group"
            },
            {
                fieldName: "fieldIds",
                fieldType: "select",
                fieldQuery: "fields",
                fieldValueVariable: "_id",
                fieldLabelVariable: "text",
                fieldParentVariable: "groupId",
                fieldParentQuery: "fieldsGroups",
                fieldRequiredQueryParams: ["contentType"],
                fieldQueryVariables: `{"contentType": "core:customer"}`,
                logics: [
                    {
                        logicFieldName: "groupIds",
                        logicFieldVariable: "groupIds",
                        logicFieldExtraVariable: `{"contentType": "core:customer"}`
                    }
                ],
                multi: true,
                fieldLabel: "Select field"
            },
            // DATE FILTER
            {
                fieldName: "dateRange",
                fieldType: "select",
                multi: true,
                fieldQuery: "date",
                fieldOptions: DATERANGE_TYPES,
                fieldLabel: "Select date range",
                fieldDefaultValue: "all"
            },
            {
                fieldName: "dateRangeType",
                fieldType: "select",
                multi: false,
                fieldQuery: "date",
                fieldOptions: DATERANGE_BY_TYPES,
                fieldLabel: "Select date range type",
                fieldDefaultValue: "createdAt"
            }
        ]
    },
    {
        templateType: "TotalCustomerByYear",
        serviceType: "contacts",
        name: "Total Customer Count By Year",
        chartTypes: [
            "bar",
            "line",
            "pie",
            "doughnut",
            "radar",
            "polarArea",
            "table"
        ],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string
        ) => {
            const { dateRangeType = "createdAt" } = filter;
            const matchFilter = await buildMatchFilter(filter, subdomain);

            const pipeline = [
                {
                    $match: {
                        ...matchFilter,
                        state: "customer",
                        [dateRangeType]: { $ne: null }
                    }
                },
                {
                    $group: {
                        _id: { $year: { $toDate: `$${dateRangeType}` } },
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
            ];

            const customersCount = await models.Customers.aggregate(pipeline);

            const totalCountByYear = (customersCount || []).reduce(
                (acc, { count, year }) => {
                    acc[year] = (acc[year] || 0) + count;
                    return acc;
                },
                {}
            );

            const data = Object.values(totalCountByYear);
            const labels = Object.keys(totalCountByYear);
            const title = "Total Customer Count By Year";

            return { title, data, labels };
        },
        filterTypes: [
            // SOURCE FILTER
            {
                fieldName: "integrationTypes",
                fieldType: "select",
                fieldQuery: "integrations",
                multi: true,
                fieldOptions: INTEGRATION_TYPES,
                fieldLabel: "Select source"
            },
            // CHANNEL FILTER
            {
                fieldName: "channelIds",
                fieldType: "select",
                fieldQuery: "channels",
                fieldValueVariable: "_id",
                fieldLabelVariable: "name",
                multi: true,
                fieldLabel: "Select channel"
            },
            // BRAND FILTER
            {
                fieldName: "brandIds",
                fieldType: "select",
                fieldQuery: "brands",
                multi: true,
                fieldLabel: "Select brands"
            },
            // TAG FILTER
            {
                fieldName: "tagIds",
                fieldType: "select",
                fieldQuery: "tags",
                fieldValueVariable: "_id",
                fieldLabelVariable: "name",
                fieldQueryVariables: `{"type": "core:customer", "perPage": 1000}`,
                multi: true,
                fieldLabel: "Select tags"
            },
            // FORM FILTER
            {
                fieldName: "formIds",
                fieldType: "select",
                fieldQuery: "forms",
                fieldQueryVariables: `{"kind": "lead"}`,
                multi: true,
                fieldLabel: "Select forms"
                // FIX FORM SELECT FIELD
            },
            // PROPERTIES FILTER
            {
                fieldName: "groupIds",
                fieldType: "select",
                fieldQuery: "fieldsGroups",
                fieldValueVariable: "_id",
                fieldLabelVariable: "name",
                fieldQueryVariables: `{"contentType": "core:customer"}`,
                multi: true,
                fieldLabel: "Select field group"
            },
            {
                fieldName: "fieldIds",
                fieldType: "select",
                fieldQuery: "fields",
                fieldValueVariable: "_id",
                fieldLabelVariable: "text",
                fieldParentVariable: "groupId",
                fieldParentQuery: "fieldsGroups",
                fieldRequiredQueryParams: ["contentType"],
                fieldQueryVariables: `{"contentType": "core:customer"}`,
                logics: [
                    {
                        logicFieldName: "groupIds",
                        logicFieldVariable: "groupIds",
                        logicFieldExtraVariable: `{"contentType": "core:customer"}`
                    }
                ],
                multi: true,
                fieldLabel: "Select field"
            },
            // DATE FILTER
            {
                fieldName: "dateRange",
                fieldType: "select",
                multi: true,
                fieldQuery: "date",
                fieldOptions: DATERANGE_TYPES,
                fieldLabel: "Select date range",
                fieldDefaultValue: "all"
            },
            {
                fieldName: "dateRangeType",
                fieldType: "select",
                multi: false,
                fieldQuery: "date",
                fieldOptions: DATERANGE_BY_TYPES,
                fieldLabel: "Select date range type",
                fieldDefaultValue: "createdAt"
            }
        ]
    },
    {
        templateType: "TotalCustomerBySource",
        serviceType: "contacts",
        name: "Total Customer Count By Source",
        chartTypes: [
            "bar",
            "line",
            "pie",
            "doughnut",
            "radar",
            "polarArea",
            "table"
        ],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string
        ) => {
            const matchFilter = await buildMatchFilter(filter, subdomain);

            const pipeline = [
                {
                    $match: {
                        ...matchFilter,
                        state: "customer",
                        integrationId: { $exists: true }
                    }
                },
                {
                    $group: {
                        _id: "$integrationId",
                        count: { $sum: 1 }
                    }
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
            ];

            const customersCount = await models.Customers.aggregate(pipeline);

            const totalCountBySource = (customersCount || []).reduce(
                (acc, { count, integration }) => {
                    acc[KIND_MAP[integration] || integration] = count;
                    return acc;
                },
                {}
            );

            const data = Object.values(totalCountBySource);
            const labels = Object.keys(totalCountBySource);
            const title = "Total Customer Count By Source";

            return { title, data, labels };
        },
        filterTypes: [
            // SOURCE FILTER
            {
                fieldName: "integrationTypes",
                fieldType: "select",
                fieldQuery: "integrations",
                multi: true,
                fieldOptions: INTEGRATION_TYPES,
                fieldLabel: "Select source"
            },
            // CHANNEL FILTER
            {
                fieldName: "channelIds",
                fieldType: "select",
                fieldQuery: "channels",
                fieldValueVariable: "_id",
                fieldLabelVariable: "name",
                multi: true,
                fieldLabel: "Select channel"
            },
            // BRAND FILTER
            {
                fieldName: "brandIds",
                fieldType: "select",
                fieldQuery: "brands",
                multi: true,
                fieldLabel: "Select brands"
            },
            // TAG FILTER
            {
                fieldName: "tagIds",
                fieldType: "select",
                fieldQuery: "tags",
                fieldValueVariable: "_id",
                fieldLabelVariable: "name",
                fieldQueryVariables: `{"type": "core:customer", "perPage": 1000}`,
                multi: true,
                fieldLabel: "Select tags"
            },
            // FORM FILTER
            {
                fieldName: "formIds",
                fieldType: "select",
                fieldQuery: "forms",
                fieldQueryVariables: `{"kind": "lead"}`,
                multi: true,
                fieldLabel: "Select forms"
                // FIX FORM SELECT FIELD
            },
            // PROPERTIES FILTER
            {
                fieldName: "groupIds",
                fieldType: "select",
                fieldQuery: "fieldsGroups",
                fieldValueVariable: "_id",
                fieldLabelVariable: "name",
                fieldQueryVariables: `{"contentType": "core:customer"}`,
                multi: true,
                fieldLabel: "Select field group"
            },
            {
                fieldName: "fieldIds",
                fieldType: "select",
                fieldQuery: "fields",
                fieldValueVariable: "_id",
                fieldLabelVariable: "text",
                fieldParentVariable: "groupId",
                fieldParentQuery: "fieldsGroups",
                fieldRequiredQueryParams: ["contentType"],
                fieldQueryVariables: `{"contentType": "core:customer"}`,
                logics: [
                    {
                        logicFieldName: "groupIds",
                        logicFieldVariable: "groupIds",
                        logicFieldExtraVariable: `{"contentType": "core:customer"}`
                    }
                ],
                multi: true,
                fieldLabel: "Select field"
            },
            // DATE FILTER
            {
                fieldName: "dateRange",
                fieldType: "select",
                multi: true,
                fieldQuery: "date",
                fieldOptions: DATERANGE_TYPES,
                fieldLabel: "Select date range",
                fieldDefaultValue: "all"
            },
            {
                fieldName: "dateRangeType",
                fieldType: "select",
                multi: false,
                fieldQuery: "date",
                fieldOptions: DATERANGE_BY_TYPES,
                fieldLabel: "Select date range type",
                fieldDefaultValue: "createdAt"
            }
        ]
    },
    {
        templateType: "TotalCustomerByTag",
        serviceType: "contacts",
        name: "Total Customer Count By Tag",
        chartTypes: [
            "bar",
            "line",
            "pie",
            "doughnut",
            "radar",
            "polarArea",
            "table"
        ],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string
        ) => {
            const matchFilter = await buildMatchFilter(filter, subdomain);

            const pipeline = [
                {
                    $match: {
                        ...matchFilter,
                        state: "customer",
                        tagIds: { $exists: true }
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
            ];

            const customersCount = await models.Customers.aggregate(pipeline);

            const totalCountByTag = customersCount.reduce((acc, { count, tag }) => {
                acc[tag] = count;
                return acc;
            }, {});

            const data = Object.values(totalCountByTag);
            const labels = Object.keys(totalCountByTag);
            const title = "Total Customer Count By Tag";

            return { title, data, labels };
        },
        filterTypes: [
            // SOURCE FILTER
            {
                fieldName: "integrationTypes",
                fieldType: "select",
                fieldQuery: "integrations",
                multi: true,
                fieldOptions: INTEGRATION_TYPES,
                fieldLabel: "Select source"
            },
            // CHANNEL FILTER
            {
                fieldName: "channelIds",
                fieldType: "select",
                fieldQuery: "channels",
                fieldValueVariable: "_id",
                fieldLabelVariable: "name",
                multi: true,
                fieldLabel: "Select channel"
            },
            // BRAND FILTER
            {
                fieldName: "brandIds",
                fieldType: "select",
                fieldQuery: "brands",
                multi: true,
                fieldLabel: "Select brands"
            },
            // TAG FILTER
            {
                fieldName: "tagIds",
                fieldType: "select",
                fieldQuery: "tags",
                fieldValueVariable: "_id",
                fieldLabelVariable: "name",
                fieldQueryVariables: `{"type": "core:customer", "perPage": 1000}`,
                multi: true,
                fieldLabel: "Select tags"
            },
            // FORM FILTER
            {
                fieldName: "formIds",
                fieldType: "select",
                fieldQuery: "forms",
                fieldQueryVariables: `{"kind": "lead"}`,
                multi: true,
                fieldLabel: "Select forms"
                // FIX FORM SELECT FIELD
            },
            // PROPERTIES FILTER
            {
                fieldName: "groupIds",
                fieldType: "select",
                fieldQuery: "fieldsGroups",
                fieldValueVariable: "_id",
                fieldLabelVariable: "name",
                fieldQueryVariables: `{"contentType": "core:customer"}`,
                multi: true,
                fieldLabel: "Select field group"
            },
            {
                fieldName: "fieldIds",
                fieldType: "select",
                fieldQuery: "fields",
                fieldValueVariable: "_id",
                fieldLabelVariable: "text",
                fieldParentVariable: "groupId",
                fieldParentQuery: "fieldsGroups",
                fieldRequiredQueryParams: ["contentType"],
                fieldQueryVariables: `{"contentType": "core:customer"}`,
                logics: [
                    {
                        logicFieldName: "groupIds",
                        logicFieldVariable: "groupIds",
                        logicFieldExtraVariable: `{"contentType": "core:customer"}`
                    }
                ],
                multi: true,
                fieldLabel: "Select field"
            },
            // DATE FILTER
            {
                fieldName: "dateRange",
                fieldType: "select",
                multi: true,
                fieldQuery: "date",
                fieldOptions: DATERANGE_TYPES,
                fieldLabel: "Select date range",
                fieldDefaultValue: "all"
            },
            {
                fieldName: "dateRangeType",
                fieldType: "select",
                multi: false,
                fieldQuery: "date",
                fieldOptions: DATERANGE_BY_TYPES,
                fieldLabel: "Select date range type",
                fieldDefaultValue: "createdAt"
            }
        ]
    },
    {
        templateType: "TotalCustomerByPropertiesField",
        serviceType: "contacts",
        name: "Total Customer Count By Properties Field",
        chartTypes: [
            "bar",
            "line",
            "pie",
            "doughnut",
            "radar",
            "polarArea",
            "table"
        ],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string
        ) => {
            const matchFilter = await buildMatchFilter(filter, subdomain);

            const pipeline = [
                { $unwind: "$customFieldsData" },
                {
                    $match: {
                        state: "customer",
                        "customFieldsData.value": { $ne: "" },
                        ...matchFilter
                    }
                },
                {
                    $lookup: {
                        from: "form_fields",
                        localField: "customFieldsData.field",
                        foreignField: "_id",
                        as: "field"
                    }
                },
                {
                    $unwind: "$field"
                },
                {
                    $group: {
                        _id: "$customFieldsData.field",
                        field: { $first: "$field.text" },
                        fieldType: { $first: "$field.type" },
                        fieldOptions: { $first: "$field.options" },
                        selectedOptions: {
                            $push: "$customFieldsData.value"
                        },
                        count: { $sum: 1 }
                    }
                }
            ];

            const customersCount = await models.Customers.aggregate(pipeline);

            const totalCountByPropertiesField = (customersCount || []).reduce(
                (acc, { field, fieldType, fieldOptions, selectedOptions, count }) => {
                    if (!fieldOptions.length) {
                        acc[field] = count;
                        return acc;
                    }

                    (selectedOptions || []).map(selectedOption => {
                        if (fieldType === "multiSelect") {
                            const optionArray = (selectedOption || "").split(",");
                            optionArray.forEach(opt => {
                                if (fieldOptions.includes(opt)) {
                                    acc[opt.trim()] = (acc[opt.trim()] || 0) + 1;
                                }
                            });
                        } else if (Array.isArray(selectedOption)) {
                            selectedOption.flatMap(option => {
                                if (fieldOptions.includes(option)) {
                                    acc[option] = (acc[option] || 0) + 1;
                                }
                            });
                        } else if (fieldOptions.includes(selectedOption)) {
                            acc[selectedOption] = (acc[selectedOption] || 0) + 1;
                        }
                    });

                    return acc;
                },
                {}
            );

            const data = Object.values(totalCountByPropertiesField);
            const labels = Object.keys(totalCountByPropertiesField);
            const title = "Total Customer Count By Properties Field";

            return { title, data, labels };
        },
        filterTypes: [
            // SOURCE FILTER
            {
                fieldName: "integrationTypes",
                fieldType: "select",
                fieldQuery: "integrations",
                multi: true,
                fieldOptions: INTEGRATION_TYPES,
                fieldLabel: "Select source"
            },
            // CHANNEL FILTER
            {
                fieldName: "channelIds",
                fieldType: "select",
                fieldQuery: "channels",
                fieldValueVariable: "_id",
                fieldLabelVariable: "name",
                multi: true,
                fieldLabel: "Select channel"
            },
            // BRAND FILTER
            {
                fieldName: "brandIds",
                fieldType: "select",
                fieldQuery: "brands",
                multi: true,
                fieldLabel: "Select brands"
            },
            // TAG FILTER
            {
                fieldName: "tagIds",
                fieldType: "select",
                fieldQuery: "tags",
                fieldValueVariable: "_id",
                fieldLabelVariable: "name",
                fieldQueryVariables: `{"type": "core:customer", "perPage": 1000}`,
                multi: true,
                fieldLabel: "Select tags"
            },
            // FORM FILTER
            {
                fieldName: "formIds",
                fieldType: "select",
                fieldQuery: "forms",
                fieldQueryVariables: `{"kind": "lead"}`,
                multi: true,
                fieldLabel: "Select forms"
                // FIX FORM SELECT FIELD
            },
            // PROPERTIES FILTER
            {
                fieldName: "groupIds",
                fieldType: "select",
                fieldQuery: "fieldsGroups",
                fieldValueVariable: "_id",
                fieldLabelVariable: "name",
                fieldQueryVariables: `{"contentType": "core:customer"}`,
                multi: true,
                fieldLabel: "Select field group"
            },
            {
                fieldName: "fieldIds",
                fieldType: "select",
                fieldQuery: "fields",
                fieldValueVariable: "_id",
                fieldLabelVariable: "text",
                fieldParentVariable: "groupId",
                fieldParentQuery: "fieldsGroups",
                fieldRequiredQueryParams: ["contentType"],
                fieldQueryVariables: `{"contentType": "core:customer"}`,
                logics: [
                    {
                        logicFieldName: "groupIds",
                        logicFieldVariable: "groupIds",
                        logicFieldExtraVariable: `{"contentType": "core:customer"}`
                    }
                ],
                multi: true,
                fieldLabel: "Select field"
            },
            // DATE FILTER
            {
                fieldName: "dateRange",
                fieldType: "select",
                multi: true,
                fieldQuery: "date",
                fieldOptions: DATERANGE_TYPES,
                fieldLabel: "Select date range",
                fieldDefaultValue: "all"
            },
            {
                fieldName: "dateRangeType",
                fieldType: "select",
                multi: false,
                fieldQuery: "date",
                fieldOptions: DATERANGE_BY_TYPES,
                fieldLabel: "Select date range type",
                fieldDefaultValue: "createdAt"
            }
        ]
    },

    // CUSTOMER END

    // LEAD START

    {
        templateType: "TotalLeadCount",
        serviceType: "contacts",
        name: "Total Lead Count",
        chartTypes: [
            "bar",
            "line",
            "pie",
            "doughnut",
            "radar",
            "polarArea",
            "table",
            "number",
            "pivotTable"
        ],
        getChartResult: async (
            models: IModels,
            filter: any,
            chartType: any,
            subdomain: string
        ) => {
            const matchFilter = await buildMatchFilter(filter, subdomain);

            const pipeline = await buildPipeline(filter, matchFilter, 'lead')

            const leads = await models.Customers.aggregate(pipeline)

            const title = "Total Lead Count";

            return { title, ...buildData({ chartType, data: leads, filter }) };
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
                fieldOptions: [...DIMENSION_OPTIONS, ...CUSTOMERS_OPTIONS],
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
                fieldOptions: [...DIMENSION_OPTIONS, ...CUSTOMERS_OPTIONS],
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
                fieldOptions: [...DIMENSION_OPTIONS, ...CUSTOMERS_OPTIONS],
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
            // SOURCE FILTER
            {
                fieldName: "integrationTypes",
                fieldType: "select",
                fieldQuery: "integrations",
                multi: true,
                fieldOptions: INTEGRATION_TYPES,
                fieldLabel: "Select source"
            },
            // CHANNEL FILTER
            {
                fieldName: "channelIds",
                fieldType: "select",
                fieldQuery: "channels",
                fieldValueVariable: "_id",
                fieldLabelVariable: "name",
                multi: true,
                fieldLabel: "Select channel"
            },
            // BRAND FILTER
            {
                fieldName: "brandIds",
                fieldType: "select",
                fieldQuery: "brands",
                multi: true,
                fieldLabel: "Select brands"
            },
            // TAG FILTER
            {
                fieldName: "tagIds",
                fieldType: "select",
                fieldQuery: "tags",
                fieldValueVariable: "_id",
                fieldLabelVariable: "name",
                fieldQueryVariables: `{"type": "core:customer", "perPage": 1000}`,
                multi: true,
                fieldLabel: "Select tags"
            },
            // FORM FILTER
            {
                fieldName: "formIds",
                fieldType: "select",
                fieldQuery: "forms",
                fieldQueryVariables: `{"kind": "lead"}`,
                multi: true,
                fieldLabel: "Select forms"
                // FIX FORM SELECT FIELD
            },
            // PROPERTIES FILTER
            {
                fieldName: "groupIds",
                fieldType: "select",
                fieldQuery: "fieldsGroups",
                fieldValueVariable: "_id",
                fieldLabelVariable: "name",
                fieldQueryVariables: `{"contentType": "core:customer"}`,
                multi: true,
                fieldLabel: "Select field group"
            },
            {
                fieldName: "fieldIds",
                fieldType: "select",
                fieldQuery: "fields",
                fieldValueVariable: "_id",
                fieldLabelVariable: "text",
                fieldParentVariable: "groupId",
                fieldParentQuery: "fieldsGroups",
                fieldRequiredQueryParams: ["contentType"],
                fieldQueryVariables: `{"contentType": "core:customer"}`,
                logics: [
                    {
                        logicFieldName: "groupIds",
                        logicFieldVariable: "groupIds",
                        logicFieldExtraVariable: `{"contentType": "core:customer"}`
                    }
                ],
                multi: true,
                fieldLabel: "Select field"
            },
            // DATE FILTER
            {
                fieldName: "dateRange",
                fieldType: "select",
                multi: true,
                fieldQuery: "date",
                fieldOptions: DATERANGE_TYPES,
                fieldLabel: "Select date range",
                fieldDefaultValue: "all"
            },
            {
                fieldName: "dateRangeType",
                fieldType: "select",
                multi: false,
                fieldQuery: "date",
                fieldOptions: DATERANGE_BY_TYPES,
                fieldLabel: "Select date range type",
                fieldDefaultValue: "createdAt"
            }
        ]
    },
    {
        templateType: "TotalLeadByYear",
        serviceType: "contacts",
        name: "Total Lead Count By Year",
        chartTypes: [
            "bar",
            "line",
            "pie",
            "doughnut",
            "radar",
            "polarArea",
            "table"
        ],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string
        ) => {
            const { dateRangeType = "$createdAt" } = filter;
            const matchFilter = await buildMatchFilter(filter, subdomain);

            const pipeline = [
                {
                    $match: {
                        ...matchFilter,
                        state: "lead",
                        [dateRangeType]: { $ne: null }
                    }
                },
                {
                    $group: {
                        _id: { $year: { $toDate: `$${dateRangeType}` } },
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
            ];

            const customersCount = await models.Customers.aggregate(pipeline);

            const totalCountByYear = (customersCount || []).reduce(
                (acc, { count, year }) => {
                    acc[year] = (acc[year] || 0) + count;
                    return acc;
                },
                {}
            );

            const data = Object.values(totalCountByYear);
            const labels = Object.keys(totalCountByYear);
            const title = "Total Lead Count By Year";

            return { title, data, labels };
        },
        filterTypes: [
            // SOURCE FILTER
            {
                fieldName: "integrationTypes",
                fieldType: "select",
                fieldQuery: "integrations",
                multi: true,
                fieldOptions: INTEGRATION_TYPES,
                fieldLabel: "Select source"
            },
            // CHANNEL FILTER
            {
                fieldName: "channelIds",
                fieldType: "select",
                fieldQuery: "channels",
                fieldValueVariable: "_id",
                fieldLabelVariable: "name",
                multi: true,
                fieldLabel: "Select channel"
            },
            // BRAND FILTER
            {
                fieldName: "brandIds",
                fieldType: "select",
                fieldQuery: "brands",
                multi: true,
                fieldLabel: "Select brands"
            },
            // TAG FILTER
            {
                fieldName: "tagIds",
                fieldType: "select",
                fieldQuery: "tags",
                fieldValueVariable: "_id",
                fieldLabelVariable: "name",
                fieldQueryVariables: `{"type": "core:customer", "perPage": 1000}`,
                multi: true,
                fieldLabel: "Select tags"
            },
            // FORM FILTER
            {
                fieldName: "formIds",
                fieldType: "select",
                fieldQuery: "forms",
                fieldQueryVariables: `{"kind": "lead"}`,
                multi: true,
                fieldLabel: "Select forms"
                // FIX FORM SELECT FIELD
            },
            // PROPERTIES FILTER
            {
                fieldName: "groupIds",
                fieldType: "select",
                fieldQuery: "fieldsGroups",
                fieldValueVariable: "_id",
                fieldLabelVariable: "name",
                fieldQueryVariables: `{"contentType": "core:customer"}`,
                multi: true,
                fieldLabel: "Select field group"
            },
            {
                fieldName: "fieldIds",
                fieldType: "select",
                fieldQuery: "fields",
                fieldValueVariable: "_id",
                fieldLabelVariable: "text",
                fieldParentVariable: "groupId",
                fieldParentQuery: "fieldsGroups",
                fieldRequiredQueryParams: ["contentType"],
                fieldQueryVariables: `{"contentType": "core:customer"}`,
                logics: [
                    {
                        logicFieldName: "groupIds",
                        logicFieldVariable: "groupIds",
                        logicFieldExtraVariable: `{"contentType": "core:customer"}`
                    }
                ],
                multi: true,
                fieldLabel: "Select field"
            },
            // DATE FILTER
            {
                fieldName: "dateRange",
                fieldType: "select",
                multi: true,
                fieldQuery: "date",
                fieldOptions: DATERANGE_TYPES,
                fieldLabel: "Select date range",
                fieldDefaultValue: "all"
            },
            {
                fieldName: "dateRangeType",
                fieldType: "select",
                multi: false,
                fieldQuery: "date",
                fieldOptions: DATERANGE_BY_TYPES,
                fieldLabel: "Select date range type",
                fieldDefaultValue: "createdAt"
            }
        ]
    },
    {
        templateType: "TotalLeadBySource",
        serviceType: "contacts",
        name: "Total Lead Count By Source",
        chartTypes: [
            "bar",
            "line",
            "pie",
            "doughnut",
            "radar",
            "polarArea",
            "table"
        ],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string
        ) => {
            const matchFilter = await buildMatchFilter(filter, subdomain);

            const pipeline = [
                {
                    $match: {
                        ...matchFilter,
                        state: "lead",
                        integrationId: { $exists: true }
                    }
                },
                {
                    $group: {
                        _id: "$integrationId",
                        count: { $sum: 1 }
                    }
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
            ];

            const customersCount = await models.Customers.aggregate(pipeline);

            const totalCountBySource = (customersCount || []).reduce(
                (acc, { count, integration }) => {
                    acc[KIND_MAP[integration] || integration] = count;
                    return acc;
                },
                {}
            );

            const data = Object.values(totalCountBySource);
            const labels = Object.keys(totalCountBySource);
            const title = "Total Lead Count By Source";

            return { title, data, labels };
        },
        filterTypes: [
            // SOURCE FILTER
            {
                fieldName: "integrationTypes",
                fieldType: "select",
                fieldQuery: "integrations",
                multi: true,
                fieldOptions: INTEGRATION_TYPES,
                fieldLabel: "Select source"
            },
            // CHANNEL FILTER
            {
                fieldName: "channelIds",
                fieldType: "select",
                fieldQuery: "channels",
                fieldValueVariable: "_id",
                fieldLabelVariable: "name",
                multi: true,
                fieldLabel: "Select channel"
            },
            // BRAND FILTER
            {
                fieldName: "brandIds",
                fieldType: "select",
                fieldQuery: "brands",
                multi: true,
                fieldLabel: "Select brands"
            },
            // TAG FILTER
            {
                fieldName: "tagIds",
                fieldType: "select",
                fieldQuery: "tags",
                fieldValueVariable: "_id",
                fieldLabelVariable: "name",
                fieldQueryVariables: `{"type": "core:customer", "perPage": 1000}`,
                multi: true,
                fieldLabel: "Select tags"
            },
            // FORM FILTER
            {
                fieldName: "formIds",
                fieldType: "select",
                fieldQuery: "forms",
                fieldQueryVariables: `{"kind": "lead"}`,
                multi: true,
                fieldLabel: "Select forms"
                // FIX FORM SELECT FIELD
            },
            // PROPERTIES FILTER
            {
                fieldName: "groupIds",
                fieldType: "select",
                fieldQuery: "fieldsGroups",
                fieldValueVariable: "_id",
                fieldLabelVariable: "name",
                fieldQueryVariables: `{"contentType": "core:customer"}`,
                multi: true,
                fieldLabel: "Select field group"
            },
            {
                fieldName: "fieldIds",
                fieldType: "select",
                fieldQuery: "fields",
                fieldValueVariable: "_id",
                fieldLabelVariable: "text",
                fieldParentVariable: "groupId",
                fieldParentQuery: "fieldsGroups",
                fieldRequiredQueryParams: ["contentType"],
                fieldQueryVariables: `{"contentType": "core:customer"}`,
                logics: [
                    {
                        logicFieldName: "groupIds",
                        logicFieldVariable: "groupIds",
                        logicFieldExtraVariable: `{"contentType": "core:customer"}`
                    }
                ],
                multi: true,
                fieldLabel: "Select field"
            },
            // DATE FILTER
            {
                fieldName: "dateRange",
                fieldType: "select",
                multi: true,
                fieldQuery: "date",
                fieldOptions: DATERANGE_TYPES,
                fieldLabel: "Select date range",
                fieldDefaultValue: "all"
            },
            {
                fieldName: "dateRangeType",
                fieldType: "select",
                multi: false,
                fieldQuery: "date",
                fieldOptions: DATERANGE_BY_TYPES,
                fieldLabel: "Select date range type",
                fieldDefaultValue: "createdAt"
            }
        ]
    },
    {
        templateType: "TotalLeadByTag",
        serviceType: "contacts",
        name: "Total Lead Count By Tag",
        chartTypes: [
            "bar",
            "line",
            "pie",
            "doughnut",
            "radar",
            "polarArea",
            "table"
        ],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string
        ) => {
            const matchFilter = await buildMatchFilter(filter, subdomain);

            const pipeline = [
                {
                    $match: {
                        ...matchFilter,
                        state: "lead",
                        tagIds: { $exists: true }
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
            ];

            const customersCount = await models.Customers.aggregate(pipeline);

            const totalCountByTag = customersCount.reduce((acc, { count, tag }) => {
                acc[tag] = count;
                return acc;
            }, {});

            const data = Object.values(totalCountByTag);
            const labels = Object.keys(totalCountByTag);
            const title = "Total Lead Count By Tag";

            return { title, data, labels };
        },
        filterTypes: [
            // SOURCE FILTER
            {
                fieldName: "integrationTypes",
                fieldType: "select",
                fieldQuery: "integrations",
                multi: true,
                fieldOptions: INTEGRATION_TYPES,
                fieldLabel: "Select source"
            },
            // CHANNEL FILTER
            {
                fieldName: "channelIds",
                fieldType: "select",
                fieldQuery: "channels",
                fieldValueVariable: "_id",
                fieldLabelVariable: "name",
                multi: true,
                fieldLabel: "Select channel"
            },
            // BRAND FILTER
            {
                fieldName: "brandIds",
                fieldType: "select",
                fieldQuery: "brands",
                multi: true,
                fieldLabel: "Select brands"
            },
            // TAG FILTER
            {
                fieldName: "tagIds",
                fieldType: "select",
                fieldQuery: "tags",
                fieldValueVariable: "_id",
                fieldLabelVariable: "name",
                fieldQueryVariables: `{"type": "core:customer", "perPage": 1000}`,
                multi: true,
                fieldLabel: "Select tags"
            },
            // FORM FILTER
            {
                fieldName: "formIds",
                fieldType: "select",
                fieldQuery: "forms",
                fieldQueryVariables: `{"kind": "lead"}`,
                multi: true,
                fieldLabel: "Select forms"
                // FIX FORM SELECT FIELD
            },
            // PROPERTIES FILTER
            {
                fieldName: "groupIds",
                fieldType: "select",
                fieldQuery: "fieldsGroups",
                fieldValueVariable: "_id",
                fieldLabelVariable: "name",
                fieldQueryVariables: `{"contentType": "core:customer"}`,
                multi: true,
                fieldLabel: "Select field group"
            },
            {
                fieldName: "fieldIds",
                fieldType: "select",
                fieldQuery: "fields",
                fieldValueVariable: "_id",
                fieldLabelVariable: "text",
                fieldParentVariable: "groupId",
                fieldParentQuery: "fieldsGroups",
                fieldRequiredQueryParams: ["contentType"],
                fieldQueryVariables: `{"contentType": "core:customer"}`,
                logics: [
                    {
                        logicFieldName: "groupIds",
                        logicFieldVariable: "groupIds",
                        logicFieldExtraVariable: `{"contentType": "core:customer"}`
                    }
                ],
                multi: true,
                fieldLabel: "Select field"
            },
            // DATE FILTER
            {
                fieldName: "dateRange",
                fieldType: "select",
                multi: true,
                fieldQuery: "date",
                fieldOptions: DATERANGE_TYPES,
                fieldLabel: "Select date range",
                fieldDefaultValue: "all"
            },
            {
                fieldName: "dateRangeType",
                fieldType: "select",
                multi: false,
                fieldQuery: "date",
                fieldOptions: DATERANGE_BY_TYPES,
                fieldLabel: "Select date range type",
                fieldDefaultValue: "createdAt"
            }
        ]
    },
    {
        templateType: "TotalLeadsByPropertiesField",
        serviceType: "contacts",
        name: "Total Lead Count By Properties Field",
        chartTypes: [
            "bar",
            "line",
            "pie",
            "doughnut",
            "radar",
            "polarArea",
            "table"
        ],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string
        ) => {
            const matchFilter = await buildMatchFilter(filter, subdomain);

            const pipeline = [
                { $unwind: "$customFieldsData" },
                {
                    $match: {
                        state: "lead",
                        "customFieldsData.value": { $ne: "" },
                        ...matchFilter
                    }
                },
                {
                    $lookup: {
                        from: "form_fields",
                        localField: "customFieldsData.field",
                        foreignField: "_id",
                        as: "field"
                    }
                },
                {
                    $unwind: "$field"
                },
                {
                    $group: {
                        _id: "$customFieldsData.field",
                        field: { $first: "$field.text" },
                        fieldType: { $first: "$field.type" },
                        fieldOptions: { $first: "$field.options" },
                        selectedOptions: {
                            $push: "$customFieldsData.value"
                        },
                        count: { $sum: 1 }
                    }
                }
            ];

            const customersCount = await models.Customers.aggregate(pipeline);

            const totalCountByPropertiesField = (customersCount || []).reduce(
                (acc, { field, fieldType, fieldOptions, selectedOptions, count }) => {
                    if (!fieldOptions.length) {
                        acc[field] = count;
                        return acc;
                    }

                    (selectedOptions || []).map(selectedOption => {
                        if (fieldType === "multiSelect") {
                            const optionArray = (selectedOption || "").split(",");
                            optionArray.forEach(opt => {
                                if (fieldOptions.includes(opt)) {
                                    acc[opt.trim()] = (acc[opt.trim()] || 0) + 1;
                                }
                            });
                        } else if (Array.isArray(selectedOption)) {
                            selectedOption.flatMap(option => {
                                if (fieldOptions.includes(option)) {
                                    acc[option] = (acc[option] || 0) + 1;
                                }
                            });
                        } else if (fieldOptions.includes(selectedOption)) {
                            acc[selectedOption] = (acc[selectedOption] || 0) + 1;
                        }
                    });

                    return acc;
                },
                {}
            );

            const data = Object.values(totalCountByPropertiesField);
            const labels = Object.keys(totalCountByPropertiesField);
            const title = "Total Lead Count By Properties Field";

            return { title, data, labels };
        },
        filterTypes: [
            // SOURCE FILTER
            {
                fieldName: "integrationTypes",
                fieldType: "select",
                fieldQuery: "integrations",
                multi: true,
                fieldOptions: INTEGRATION_TYPES,
                fieldLabel: "Select source"
            },
            // CHANNEL FILTER
            {
                fieldName: "channelIds",
                fieldType: "select",
                fieldQuery: "channels",
                fieldValueVariable: "_id",
                fieldLabelVariable: "name",
                multi: true,
                fieldLabel: "Select channel"
            },
            // BRAND FILTER
            {
                fieldName: "brandIds",
                fieldType: "select",
                fieldQuery: "brands",
                multi: true,
                fieldLabel: "Select brands"
            },
            // TAG FILTER
            {
                fieldName: "tagIds",
                fieldType: "select",
                fieldQuery: "tags",
                fieldValueVariable: "_id",
                fieldLabelVariable: "name",
                fieldQueryVariables: `{"type": "core:customer", "perPage": 1000}`,
                multi: true,
                fieldLabel: "Select tags"
            },
            // FORM FILTER
            {
                fieldName: "formIds",
                fieldType: "select",
                fieldQuery: "forms",
                fieldQueryVariables: `{"kind": "lead"}`,
                multi: true,
                fieldLabel: "Select forms"
                // FIX FORM SELECT FIELD
            },
            // PROPERTIES FILTER
            {
                fieldName: "groupIds",
                fieldType: "select",
                fieldQuery: "fieldsGroups",
                fieldValueVariable: "_id",
                fieldLabelVariable: "name",
                fieldQueryVariables: `{"contentType": "core:customer"}`,
                multi: true,
                fieldLabel: "Select field group"
            },
            {
                fieldName: "fieldIds",
                fieldType: "select",
                fieldQuery: "fields",
                fieldValueVariable: "_id",
                fieldLabelVariable: "text",
                fieldParentVariable: "groupId",
                fieldParentQuery: "fieldsGroups",
                fieldRequiredQueryParams: ["contentType"],
                fieldQueryVariables: `{"contentType": "core:customer"}`,
                logics: [
                    {
                        logicFieldName: "groupIds",
                        logicFieldVariable: "groupIds",
                        logicFieldExtraVariable: `{"contentType": "core:customer"}`
                    }
                ],
                multi: true,
                fieldLabel: "Select field"
            },
            // DATE FILTER
            {
                fieldName: "dateRange",
                fieldType: "select",
                multi: true,
                fieldQuery: "date",
                fieldOptions: DATERANGE_TYPES,
                fieldLabel: "Select date range",
                fieldDefaultValue: "all"
            },
            {
                fieldName: "dateRangeType",
                fieldType: "select",
                multi: false,
                fieldQuery: "date",
                fieldOptions: DATERANGE_BY_TYPES,
                fieldLabel: "Select date range type",
                fieldDefaultValue: "createdAt"
            }
        ]
    },

    // LEAD END

    // COMPANY START

    {
        templateType: "TotalCompanyCount",
        serviceType: "contacts",
        name: "Total Company Count",
        chartTypes: [
            "bar",
            "line",
            "pie",
            "doughnut",
            "radar",
            "polarArea",
            "table"
        ],
        getChartResult: async (
            models: IModels,
            filter: any,
            chartType: any,
            subdomain: string
        ) => {
            const matchFilter = await buildMatchFilter(filter, subdomain);

            const pipeline = await buildPipeline(filter, matchFilter)

            const companies = await models.Companies.aggregate(pipeline)
            const title = "Total Company Count";

            return { title, ...buildData({ chartType, data: companies, filter }) };
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
                fieldOptions: [...DIMENSION_OPTIONS, ...COMPANIES_OPTIONS],
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
                fieldOptions: [...DIMENSION_OPTIONS, ...COMPANIES_OPTIONS],
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
                fieldOptions: [...DIMENSION_OPTIONS, ...COMPANIES_OPTIONS],
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
            // TAG FILTER
            {
                fieldName: "tagIds",
                fieldType: "select",
                fieldQuery: "tags",
                fieldValueVariable: "_id",
                fieldLabelVariable: "name",
                fieldQueryVariables: `{"type": "core:company", "perPage": 1000}`,
                multi: true,
                fieldLabel: "Select tags"
            },
            // PROPERTIES FILTER
            {
                fieldName: "groupIds",
                fieldType: "select",
                fieldQuery: "fieldsGroups",
                fieldValueVariable: "_id",
                fieldLabelVariable: "name",
                fieldQueryVariables: `{"contentType": "core:company"}`,
                multi: true,
                fieldLabel: "Select field group"
            },
            {
                fieldName: "fieldIds",
                fieldType: "select",
                fieldQuery: "fields",
                fieldValueVariable: "_id",
                fieldLabelVariable: "text",
                fieldParentVariable: "groupId",
                fieldParentQuery: "fieldsGroups",
                fieldRequiredQueryParams: ["contentType"],
                fieldQueryVariables: `{"contentType": "core:company"}`,
                logics: [
                    {
                        logicFieldName: "groupIds",
                        logicFieldVariable: "groupIds",
                        logicFieldExtraVariable: `{"contentType": "core:company"}`
                    }
                ],
                multi: true,
                fieldLabel: "Select field"
            },
            // DATE FILTER
            {
                fieldName: "dateRange",
                fieldType: "select",
                multi: true,
                fieldQuery: "date",
                fieldOptions: DATERANGE_TYPES,
                fieldLabel: "Select date range",
                fieldDefaultValue: "all"
            },
            {
                fieldName: "dateRangeType",
                fieldType: "select",
                multi: false,
                fieldQuery: "date",
                fieldOptions: DATERANGE_BY_TYPES_COMPANIES,
                fieldLabel: "Select date range type",
                fieldDefaultValue: "createdAt"
            }
        ]
    },
    {
        templateType: "TotalCompanyByYear",
        serviceType: "contacts",
        name: "Total Company Count By Year",
        chartTypes: [
            "bar",
            "line",
            "pie",
            "doughnut",
            "radar",
            "polarArea",
            "table"
        ],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string
        ) => {
            const { dateRangeType = "createdAt" } = filter;
            const matchFilter = await buildMatchFilter(filter, subdomain);

            const pipeline = [
                {
                    $match: { ...matchFilter, [dateRangeType]: { $ne: null } }
                },
                {
                    $group: {
                        _id: { $year: { $toDate: `$${dateRangeType}` } },
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
            ];

            const customersCount = await models.Companies.aggregate(pipeline);

            const totalCountByYear = (customersCount || []).reduce(
                (acc, { count, year }) => {
                    acc[year] = (acc[year] || 0) + count;
                    return acc;
                },
                {}
            );

            const data = Object.values(totalCountByYear);
            const labels = Object.keys(totalCountByYear);
            const title = "Total Company Count By Year";

            return { title, data, labels };
        },
        filterTypes: [
            // TAG FILTER
            {
                fieldName: "tagIds",
                fieldType: "select",
                fieldQuery: "tags",
                fieldValueVariable: "_id",
                fieldLabelVariable: "name",
                fieldQueryVariables: `{"type": "core:company", "perPage": 1000}`,
                multi: true,
                fieldLabel: "Select tags"
            },
            // PROPERTIES FILTER
            {
                fieldName: "groupIds",
                fieldType: "select",
                fieldQuery: "fieldsGroups",
                fieldValueVariable: "_id",
                fieldLabelVariable: "name",
                fieldQueryVariables: `{"contentType": "core:company"}`,
                multi: true,
                fieldLabel: "Select field group"
            },
            {
                fieldName: "fieldIds",
                fieldType: "select",
                fieldQuery: "fields",
                fieldValueVariable: "_id",
                fieldLabelVariable: "text",
                fieldParentVariable: "groupId",
                fieldParentQuery: "fieldsGroups",
                fieldRequiredQueryParams: ["contentType"],
                fieldQueryVariables: `{"contentType": "core:company"}`,
                logics: [
                    {
                        logicFieldName: "groupIds",
                        logicFieldVariable: "groupIds",
                        logicFieldExtraVariable: `{"contentType": "core:company"}`
                    }
                ],
                multi: true,
                fieldLabel: "Select field"
            },
            // DATE FILTER
            {
                fieldName: "dateRange",
                fieldType: "select",
                multi: true,
                fieldQuery: "date",
                fieldOptions: DATERANGE_TYPES,
                fieldLabel: "Select date range",
                fieldDefaultValue: "all"
            },
            {
                fieldName: "dateRangeType",
                fieldType: "select",
                multi: false,
                fieldQuery: "date",
                fieldOptions: DATERANGE_BY_TYPES_COMPANIES,
                fieldLabel: "Select date range type",
                fieldDefaultValue: "createdAt"
            }
        ]
    },
    {
        templateType: "TotalCompanyCountByTag",
        serviceType: "contacts",
        name: "Total Company Count By Tag",
        chartTypes: [
            "bar",
            "line",
            "pie",
            "doughnut",
            "radar",
            "polarArea",
            "table"
        ],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string
        ) => {
            const matchFilter = await buildMatchFilter(filter, subdomain);

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
            ];

            const customersCount = await models.Companies.aggregate(pipeline);

            const totalCountByTag = customersCount.reduce((acc, { count, tag }) => {
                acc[tag] = count;
                return acc;
            }, {});

            const data = Object.values(totalCountByTag);
            const labels = Object.keys(totalCountByTag);
            const title = "Total Company Count By Tag";

            return { title, data, labels };
        },
        filterTypes: [
            // TAG FILTER
            {
                fieldName: "tagIds",
                fieldType: "select",
                fieldQuery: "tags",
                fieldValueVariable: "_id",
                fieldLabelVariable: "name",
                fieldQueryVariables: `{"type": "core:company", "perPage": 1000}`,
                multi: true,
                fieldLabel: "Select tags"
            },
            // PROPERTIES FILTER
            {
                fieldName: "groupIds",
                fieldType: "select",
                fieldQuery: "fieldsGroups",
                fieldValueVariable: "_id",
                fieldLabelVariable: "name",
                fieldQueryVariables: `{"contentType": "core:company"}`,
                multi: true,
                fieldLabel: "Select field group"
            },
            {
                fieldName: "fieldIds",
                fieldType: "select",
                fieldQuery: "fields",
                fieldValueVariable: "_id",
                fieldLabelVariable: "text",
                fieldParentVariable: "groupId",
                fieldParentQuery: "fieldsGroups",
                fieldRequiredQueryParams: ["contentType"],
                fieldQueryVariables: `{"contentType": "core:company"}`,
                logics: [
                    {
                        logicFieldName: "groupIds",
                        logicFieldVariable: "groupIds",
                        logicFieldExtraVariable: `{"contentType": "core:company"}`
                    }
                ],
                multi: true,
                fieldLabel: "Select field"
            },
            // DATE FILTER
            {
                fieldName: "dateRange",
                fieldType: "select",
                multi: true,
                fieldQuery: "date",
                fieldOptions: DATERANGE_TYPES,
                fieldLabel: "Select date range",
                fieldDefaultValue: "all"
            },
            {
                fieldName: "dateRangeType",
                fieldType: "select",
                multi: false,
                fieldQuery: "date",
                fieldOptions: DATERANGE_BY_TYPES_COMPANIES,
                fieldLabel: "Select date range type",
                fieldDefaultValue: "createdAt"
            }
        ]
    },
    {
        templateType: "TotalCompanyCountByPropertiesField",
        serviceType: "contacts",
        name: "Total Company Count By Properties Field",
        chartTypes: [
            "bar",
            "line",
            "pie",
            "doughnut",
            "radar",
            "polarArea",
            "table"
        ],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string
        ) => {
            const matchFilter = await buildMatchFilter(filter, subdomain);

            const pipeline = [
                { $unwind: "$customFieldsData" },
                {
                    $match: {
                        "customFieldsData.value": { $ne: "" },
                        ...matchFilter
                    }
                },
                {
                    $lookup: {
                        from: "form_fields",
                        localField: "customFieldsData.field",
                        foreignField: "_id",
                        as: "field"
                    }
                },
                {
                    $unwind: "$field"
                },
                {
                    $group: {
                        _id: "$customFieldsData.field",
                        field: { $first: "$field.text" },
                        fieldType: { $first: "$field.type" },
                        fieldOptions: { $first: "$field.options" },
                        selectedOptions: {
                            $push: "$customFieldsData.value"
                        },
                        count: { $sum: 1 }
                    }
                }
            ];

            const customersCount = await models.Companies.aggregate(pipeline);

            const totalCountByPropertiesField = (customersCount || []).reduce(
                (acc, { field, fieldType, fieldOptions, selectedOptions, count }) => {
                    if (!fieldOptions.length) {
                        acc[field] = count;
                        return acc;
                    }

                    (selectedOptions || []).map(selectedOption => {
                        if (fieldType === "multiSelect") {
                            const optionArray = (selectedOption || "").split(",");
                            optionArray.forEach(opt => {
                                if (fieldOptions.includes(opt)) {
                                    acc[opt.trim()] = (acc[opt.trim()] || 0) + 1;
                                }
                            });
                        } else if (Array.isArray(selectedOption)) {
                            selectedOption.flatMap(option => {
                                if (fieldOptions.includes(option)) {
                                    acc[option] = (acc[option] || 0) + 1;
                                }
                            });
                        } else if (fieldOptions.includes(selectedOption)) {
                            acc[selectedOption] = (acc[selectedOption] || 0) + 1;
                        }
                    });

                    return acc;
                },
                {}
            );

            const data = Object.values(totalCountByPropertiesField);
            const labels = Object.keys(totalCountByPropertiesField);
            const title = "Total Company Count By Properties Field";

            return { title, data, labels };
        },
        filterTypes: [
            // TAG FILTER
            {
                fieldName: "tagIds",
                fieldType: "select",
                fieldQuery: "tags",
                fieldValueVariable: "_id",
                fieldLabelVariable: "name",
                fieldQueryVariables: `{"type": "core:company", "perPage": 1000}`,
                multi: true,
                fieldLabel: "Select tags"
            },
            // PROPERTIES FILTER
            {
                fieldName: "groupIds",
                fieldType: "select",
                fieldQuery: "fieldsGroups",
                fieldValueVariable: "_id",
                fieldLabelVariable: "name",
                fieldQueryVariables: `{"contentType": "core:company"}`,
                multi: true,
                fieldLabel: "Select field group"
            },
            {
                fieldName: "fieldIds",
                fieldType: "select",
                fieldQuery: "fields",
                fieldValueVariable: "_id",
                fieldLabelVariable: "text",
                fieldParentVariable: "groupId",
                fieldParentQuery: "fieldsGroups",
                fieldRequiredQueryParams: ["contentType"],
                fieldQueryVariables: `{"contentType": "core:company"}`,
                logics: [
                    {
                        logicFieldName: "groupIds",
                        logicFieldVariable: "groupIds",
                        logicFieldExtraVariable: `{"contentType": "core:company"}`
                    }
                ],
                multi: true,
                fieldLabel: "Select field"
            },
            // DATE FILTER
            {
                fieldName: "dateRange",
                fieldType: "select",
                multi: true,
                fieldQuery: "date",
                fieldOptions: DATERANGE_TYPES,
                fieldLabel: "Select date range",
                fieldDefaultValue: "all"
            },
            {
                fieldName: "dateRangeType",
                fieldType: "select",
                multi: false,
                fieldQuery: "date",
                fieldOptions: DATERANGE_BY_TYPES_COMPANIES,
                fieldLabel: "Select date range type",
                fieldDefaultValue: "createdAt"
            }
        ]
    },

    // COMPANY END

    // CLIENT PORTAL START

    {
        templateType: "TotalClientPortalUsersCount",
        serviceType: "contacts",
        name: "Total Client Portal Count",
        chartTypes: [
            "bar",
            "line",
            "pie",
            "doughnut",
            "radar",
            "polarArea",
            "table"
        ],
        getChartResult: async (
            models: IModels,
            filter: any,
            chartType: any,
            subdomain: string
        ) => {
            const matchFilter = await buildMatchFilter(filter, subdomain);

            const pipeline = await buildPipeline(filter, matchFilter, 'client')

            const clientPortalUsers = await models.Customers.aggregate(pipeline)
            const title = "Total Client Portal Count";

            return { title, ...buildData({ chartType, data: clientPortalUsers, filter }) };
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
                fieldOptions: [...DIMENSION_OPTIONS, ...CUSTOMERS_OPTIONS],
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
                fieldOptions: [...DIMENSION_OPTIONS, ...CUSTOMERS_OPTIONS],
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
                fieldOptions: [...DIMENSION_OPTIONS, ...CUSTOMERS_OPTIONS],
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
            // PORTAL FILTER
            {
                fieldName: "portalIds",
                fieldType: "select",
                fieldQuery: "clientPortalGetConfigs",
                fieldQueryVariables: `{"kind": "client"}`,
                multi: true,
                fieldLabel: "Select client portal"
            },
            // DATE FILTER
            {
                fieldName: "dateRange",
                fieldType: "select",
                multi: true,
                fieldQuery: "date",
                fieldOptions: DATERANGE_TYPES,
                fieldLabel: "Select date range",
                fieldDefaultValue: "all"
            },
            {
                fieldName: "dateRangeType",
                fieldType: "select",
                multi: false,
                fieldQuery: "date",
                fieldOptions: DATERANGE_BY_TYPES,
                fieldLabel: "Select date range type",
                fieldDefaultValue: "createdAt"
            }
        ]
    },
    {
        templateType: "TotalClientPortalUsersByYear",
        serviceType: "contacts",
        name: "Total Client Portal Count By Year",
        chartTypes: [
            "bar",
            "line",
            "pie",
            "doughnut",
            "radar",
            "polarArea",
            "table"
        ],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string
        ) => {
            const { stateType } = filter;

            const matchFilter = await buildMatchFilter(filter, subdomain);

            if (stateType && stateType.length) {
                matchFilter["type"] = { $eq: stateType };
            }

            const pipeline = getBusinnesPortalPipeline(matchFilter, "year", "client");

            const clientPortal = await getBusinessPortalCount(
                pipeline,
                "all",
                subdomain
            );

            const totalCountByYear = clientPortal.reduce((acc, { count, year }) => {
                acc[year] = (acc[year] || 0) + count;
                return acc;
            }, {});

            const data = Object.values(totalCountByYear);
            const labels = Object.keys(totalCountByYear);
            const title = "Total Client Portal Count By Year";

            return { title, data, labels };
        },
        filterTypes: [
            // PORTAL FILTER
            {
                fieldName: "portalIds",
                fieldType: "select",
                fieldQuery: "clientPortalGetConfigs",
                fieldQueryVariables: `{"kind": "client"}`,
                multi: true,
                fieldLabel: "Select client portal"
            },
            // STATE FILTER
            {
                fieldName: "stateType",
                fieldType: "select",
                fieldOptions: BUSINESSPORTAL_STATE_TYPES,
                multi: false,
                fieldLabel: "Select state"
            },
            // DATE FILTER
            {
                fieldName: "dateRange",
                fieldType: "select",
                multi: true,
                fieldQuery: "date",
                fieldOptions: DATERANGE_TYPES,
                fieldLabel: "Select date range",
                fieldDefaultValue: "all"
            },
            {
                fieldName: "dateRangeType",
                fieldType: "select",
                multi: false,
                fieldQuery: "date",
                fieldOptions: DATERANGE_BY_TYPES_COMPANIES,
                fieldLabel: "Select date range type",
                fieldDefaultValue: "createdAt"
            }
        ]
    },

    // CLIENT PORTAL END

    // VENDOR PORTAL START

    {
        templateType: "TotalVendorPortalUsersCount",
        serviceType: "contacts",
        name: "Total Vendor Portal Count",
        chartTypes: [
            "bar",
            "line",
            "pie",
            "doughnut",
            "radar",
            "polarArea",
            "table"
        ],
        getChartResult: async (
            models: IModels,
            filter: any,
            chartType: any,
            subdomain: string
        ) => {
            const matchFilter = await buildMatchFilter(filter, subdomain);

            const pipeline = await buildPipeline(filter, matchFilter, 'vendor')

            const clientPortalUsers = await models.Customers.aggregate(pipeline)
            const title = "Total Client Portal Count";

            return { title, ...buildData({ chartType, data: clientPortalUsers, filter }) };
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
                fieldOptions: [...DIMENSION_OPTIONS, ...CUSTOMERS_OPTIONS],
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
                fieldOptions: [...DIMENSION_OPTIONS, ...CUSTOMERS_OPTIONS],
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
                fieldOptions: [...DIMENSION_OPTIONS, ...CUSTOMERS_OPTIONS],
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
            // PORTAL FILTER
            {
                fieldName: "portalIds",
                fieldType: "select",
                fieldQuery: "clientPortalGetConfigs",
                fieldQueryVariables: `{"kind": "vendor"}`,
                multi: true,
                fieldLabel: "Select vendor portal"
            },
            // DATE FILTER
            {
                fieldName: "dateRange",
                fieldType: "select",
                multi: true,
                fieldQuery: "date",
                fieldOptions: DATERANGE_TYPES,
                fieldLabel: "Select date range",
                fieldDefaultValue: "all"
            },
            {
                fieldName: "dateRangeType",
                fieldType: "select",
                multi: false,
                fieldQuery: "date",
                fieldOptions: DATERANGE_BY_TYPES_COMPANIES,
                fieldLabel: "Select date range type",
                fieldDefaultValue: "createdAt"
            }
        ]
    },
    {
        templateType: "TotalVendorPortalUsersByYear",
        serviceType: "contacts",
        name: "Total Vendor Portal Count By Year",
        chartTypes: [
            "bar",
            "line",
            "pie",
            "doughnut",
            "radar",
            "polarArea",
            "table"
        ],
        getChartResult: async (
            models: IModels,
            filter: any,
            dimension: any,
            subdomain: string
        ) => {
            const { stateType } = filter;

            const matchFilter = await buildMatchFilter(filter, subdomain);

            if (stateType && stateType.length) {
                matchFilter["type"] = { $eq: stateType };
            }

            const pipeline = getBusinnesPortalPipeline(matchFilter, "year", "vendor");
            const vendorPortal = await getBusinessPortalCount(
                pipeline,
                "all",
                subdomain
            );

            const totalCountByYear = vendorPortal.reduce((acc, { count, year }) => {
                acc[year] = (acc[year] || 0) + count;
                return acc;
            }, {});

            const data = Object.values(totalCountByYear);
            const labels = Object.keys(totalCountByYear);
            const title = "Total Vendor Portal Count By Year";

            return { title, data, labels };
        },
        filterTypes: [
            // PORTAL FILTER
            {
                fieldName: "portalIds",
                fieldType: "select",
                fieldQuery: "clientPortalGetConfigs",
                fieldQueryVariables: `{"kind": "vendor"}`,
                multi: true,
                fieldLabel: "Select vendor portal"
            },
            // STATE FILTER
            {
                fieldName: "stateType",
                fieldType: "select",
                fieldOptions: BUSINESSPORTAL_STATE_TYPES,
                multi: false,
                fieldLabel: "Select state"
            },
            // DATE FILTER
            {
                fieldName: "dateRange",
                fieldType: "select",
                multi: true,
                fieldQuery: "date",
                fieldOptions: DATERANGE_TYPES,
                fieldLabel: "Select date range",
                fieldDefaultValue: "all"
            },
            {
                fieldName: "dateRangeType",
                fieldType: "select",
                multi: false,
                fieldQuery: "date",
                fieldOptions: DATERANGE_BY_TYPES_COMPANIES,
                fieldLabel: "Select date range type",
                fieldDefaultValue: "createdAt"
            }
        ]
    }

    // VENDOR PORTAL END
];

export default contactTemplates;
