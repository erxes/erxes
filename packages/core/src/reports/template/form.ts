import { IModels } from "../../connectionResolver"
import { CUSTOM_DATE_FREQUENCY_TYPES, DATERANGE_TYPES } from "../constants";
import { buildData, buildFormPipeline, buildMatchFilter } from "../utils";
const util = require("util");

const DIMENSION_OPTIONS = [
    { label: "Brand", value: "brand" },
    { label: "Department", value: "department" },
    { label: "Integration", value: "integration" },
    { label: "Integration Type", value: "integrationType" },
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

const SUMBISSION_DIMENSION_OPTIONS = [
    { label: "Form", value: "form" },
    { label: "Field", value: "field" },
    { label: "Type", value: "contentType" },
    { label: "Team Member", value: "teamMember" },
    { label: "Submitted By", value: "submittedBy" },
    { label: "Submitted At", value: "submittedAt" },
]

const MEASURE_OPTIONS = [
    { label: "Total Count", value: "count" },
]

const STATUS_TYPES = [
    { label: "Active", value: "active" },
    { label: "Archived", value: "archived" },
]

const FLOW_TYPES = [
    { label: "ShoutBox", value: "shoutbox" },
    { label: "Popup", value: "popup" },
    { label: "Embedded", value: "embedded" },
    { label: "Dropdown", value: "dropdown" },
    { label: "Slide-in Left", value: "slideInLeft" },
    { label: "Slide-in Right", value: "slideInRight" },
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

            const matchFilter = await buildMatchFilter({ ...filter, dateRangeType: 'createdDate' }, subdomain, 'form');

            const pipeline = await buildFormPipeline(filter, matchFilter, 'form')
            console.log('form', util.inspect(pipeline, false, null, true /* enable colors */))
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
            // FREQUENCY TYPE FILTER BASED DIMENSION FILTER
            {
                fieldName: 'frequencyType',
                fieldType: 'select',
                multi: false,
                fieldDefaultValue: '%Y',
                fieldOptions: CUSTOM_DATE_FREQUENCY_TYPES,
                fieldLabel: 'Select frequency type',
            },
            // STATUS FILTER
            {
                fieldName: 'status',
                fieldType: 'select',
                fieldOptions: STATUS_TYPES,
                fieldLabel: 'Select status',
            },
            // FLOW TYPE FILTER
            {
                fieldName: 'flowType',
                fieldType: 'select',
                fieldOptions: FLOW_TYPES,
                fieldLabel: 'Select flow type',
            },
            // BRAND FILTER
            {
                fieldName: 'brandIds',
                fieldType: 'select',
                fieldQuery: 'allBrands',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                multi: true,
                fieldLabel: 'Select brands',
            },
            // DEPARTMENT FILTER
            {
                fieldName: 'departmentIds',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'departments',
                fieldLabel: 'Select departments',
            },
            // TAG FILTER
            {
                fieldName: 'tagIds',
                fieldType: 'select',
                fieldQuery: 'tags',
                fieldValueVariable: '_id',
                fieldLabelVariable: 'name',
                fieldQueryVariables: `{"type": "inbox:integration"}`,
                multi: true,
                fieldLabel: 'Select tags',
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
                fieldName: 'fieldIds',
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
            // DATE RANGE FILTER
            {
                fieldName: 'dateRange',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'date',
                fieldOptions: DATERANGE_TYPES,
                fieldLabel: 'Select date range',
                fieldDefaultValue: 'all',
            }
        ]
    },
    {
        templateType: "TotalSubmissionCount",
        serviceType: "forms",
        name: "Total Submission Count",
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

            const matchFilter = await buildMatchFilter(filter, subdomain, 'submission');

            const pipeline = await buildFormPipeline(filter, matchFilter, 'submission')
            console.log('submission', util.inspect(pipeline, false, null, true /* enable colors */))
            const submissions = await models.FormSubmissions.aggregate(pipeline)

            const title = "Total Submission Count";

            return { title, ...buildData({ chartType, data: submissions, filter }) };
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
                fieldOptions: SUMBISSION_DIMENSION_OPTIONS,
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
                fieldName: 'fieldIds',
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
            // DATE RANGE FILTER
            {
                fieldName: 'dateRange',
                fieldType: 'select',
                multi: true,
                fieldQuery: 'date',
                fieldLabel: 'Select date range',
                fieldDefaultValue: 'all',
            }
        ]
    },
]


export default formTemplates