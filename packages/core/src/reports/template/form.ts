import { IModels } from "../../connectionResolver"
import { buildData, buildFormPipeline, buildMatchFilter } from "../utils";
const util = require("util");

const DIMENSION_OPTIONS = [
    { label: "Brand", value: "brand" },
    { label: "Department", value: "department" },
    { label: "Integration", value: "integration" },
    { label: "Tags", value: "tag" },
    { label: "Status", value: "status" },
    { label: "Visibility", value: "visibility" },
    { label: "Type", value: "type" },
    { label: "Flow Type", value: "flowType" },
    { label: "Conformation Type", value: "conformationType" },
    { label: "Page Number", value: "numberOfPages" },
    { label: "Created At", value: "createdAt" },
    { label: "Created By", value: "createdBy" },
    { label: "Frequency", value: "frequency" },
    { label: "Fields", value: "field" },
]

const MEASURE_OPTIONS = [
    { label: "Total Count", value: "count" },
]

const formTemplates = [
    {
        templateType: "TotalFormCount",
        serviceType: "forms",
        name: "Total Form Count",
        chartTypes: [
            "bar",
            "line",
            "pie",
            "doughnut",
            "radar",
            "polarArea",
            "table",
            'number',
            'pivotTable'
        ],
        getChartResult: async (
            models: IModels,
            filter: any,
            chartType: any,
            subdomain: string
        ) => {

            const matchFilter = await buildMatchFilter(filter, subdomain);

            const pipeline = await buildFormPipeline(filter, matchFilter)
            console.log('pipeline', util.inspect(pipeline, false, null, true))

            const forms = await models.Forms.aggregate(pipeline)

            const title = "Total Form Count";

            return { title, ...buildData({ chartType, data: forms, filter }) };
        },
        filterTypes: [
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
            // FORMS FILTER 
            {
                fieldName: 'formId',
                fieldType: 'select',
                fieldQuery: 'forms',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "lead"}`,
                multi: false,
                fieldLabel: 'Select field group',
            },
            // CUSTOM PROPERTIES FIELD FILTER 
            {
                fieldName: 'formFieldIds',
                fieldType: 'select',
                fieldQuery: 'fields',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'text',
                fieldRequiredQueryParams: ["contentType"],
                fieldExtraVariables: ['options', 'type'],
                fieldQueryVariables: `{"contentType": "form"}`,
                logics: [
                    {
                        logicFieldName: 'formId',
                        logicFieldVariable: 'contentTypeId',
                        logicFieldExtraVariable: `{"contentType": "form"}`
                    },
                ],
                multi: true,
                fieldLabel: 'Select field',
            },
        ]
    },
]


export default formTemplates