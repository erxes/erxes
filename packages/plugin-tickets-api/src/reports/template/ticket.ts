import { IModels } from "../../connectionResolver";
import { MONTH_NAMES, PROBABILITY_CLOSED, CUSTOM_DATE_FREQUENCY_TYPES, DATERANGE_TYPES, DATERANGE_BY_TYPES, ATTACHMENT_TYPES, PRIORITY, STATUS_TYPES, PROBABILITY_TICKET, USER_TYPES, INTEGRATION_OPTIONS } from "../constants";
import { buildData, buildMatchFilter, buildPipeline, getIntegrationsKinds, getStageIds } from "../utils";

const DIMENSION_OPTIONS = [
  { label: 'Team members', value: 'teamMember' },
  { label: 'Departments', value: 'department' },
  { label: 'Branches', value: 'branch' },
  { label: 'Companies', value: 'company' },
  { label: 'Customers', value: 'customer' },
  { label: 'Source', value: 'source' },
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
]

const MEASURE_OPTIONS = [
  { label: 'Total Count', value: 'count' },
];

export const ticketCharts = [
  // TicketCustomProperties
  {
    templateType: "TicketCustomProperties",
    serviceType: 'tickets',
    name: 'Total Ticket Count By Custom Properties',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
    getChartResult: async (
      models: IModels,
      filter: any,
      chartType: string,
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
        fieldQueryVariables: `{"type": "tickets:ticket", "perPage": 1000}`,
            multi: true,
        fieldLabel: 'Select tags',
      },
      // BOARD FILTER
      {
            fieldName: 'boardId',
            fieldType: 'select',
            multi: false,
        fieldQuery: 'ticketsBoards',
            fieldValueVariable: '_id',
            fieldLabelVariable: 'name',
        fieldRequiredQueryParams: ['type'],
            fieldQueryVariables: `{"type": "ticket"}`,
        fieldLabel: 'Select board',
      },
      // PIPELINE FILTER
      {
            fieldName: 'pipelineIds',
            fieldType: 'select',
            multi: true,
        fieldQuery: 'ticketsPipelines',
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
        fieldLabel: 'Select Probability',
      },
      // STAGE FILTER
      {
        fieldName: 'stageIds',
        fieldType: 'select',
        fieldQuery: 'ticketsStages',
        multi: true,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldParentVariable: 'pipelineId',
        fieldParentQuery: "ticketsPipelines",
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
        fieldQueryVariables: `{"contentType": "tickets:ticket"}`,
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
        fieldQueryVariables: `{"contentType": "tickets:ticket"}`,
            logics: [
              {
                logicFieldName: 'groupIds',
                logicFieldVariable: 'groupIds',
                logicFieldExtraVariable: `{"contentType": "tickets:ticket"}`,
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
    serviceType: 'tickets',
    name: 'Total Ticket Count By Frequency',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
    getChartResult: async (
      models: IModels,
      filter: any,
      chartType: string,
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
          fieldQueryVariables: `{"type": "tickets:ticket", "perPage": 1000}`,
            multi: true,
          fieldLabel: 'Select tags',
        },

        // BOARD FILTER
        {
            fieldName: 'boardId',
            fieldType: 'select',
            multi: false,
          fieldQuery: 'ticketsBoards',
            fieldValueVariable: '_id',
            fieldLabelVariable: 'name',
          fieldRequiredQueryParams: ['type'],
            fieldQueryVariables: `{"type": "ticket"}`,
          fieldLabel: 'Select board',
        },
        // PIPELINE FILTER
        {
            fieldName: 'pipelineIds',
            fieldType: 'select',
            multi: true,
          fieldQuery: 'ticketsPipelines',
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
          fieldLabel: 'Select Probability',
        },
        // STAGE FILTER
        {
            fieldName: 'stageIds',
            fieldType: 'select',
          fieldQuery: 'ticketsStages',
            multi: true,
            fieldValueVariable: '_id',
            fieldLabelVariable: 'name',
          fieldParentVariable: 'pipelineId',
          fieldParentQuery: "ticketsPipelines",
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
          fieldQueryVariables: `{"contentType": "tickets:ticket"}`,
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
          fieldQueryVariables: `{"contentType": "tickets:ticket"}`,
          logics: [
            {
              logicFieldName: 'groupIds',
              logicFieldVariable: 'groupIds',
              logicFieldExtraVariable: `{"contentType": "tickets:ticket"}`,
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
    serviceType: 'tickets',
    name: 'Total Ticket Count By Tag',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
    getChartResult: async (
      models: IModels,
      filter: any,
      chartType: string,
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
          fieldQueryVariables: `{"type": "tickets:ticket", "perPage": 1000}`,
            multi: true,
          fieldLabel: 'Select tags',
        },
        // BOARD FILTER
        {
            fieldName: 'boardId',
            fieldType: 'select',
            multi: false,
          fieldQuery: 'ticketsBoards',
            fieldValueVariable: '_id',
            fieldLabelVariable: 'name',
          fieldRequiredQueryParams: ['type'],
            fieldQueryVariables: `{"type": "ticket"}`,
          fieldLabel: 'Select board',
        },
        // PIPELINE FILTER
        {
            fieldName: 'pipelineIds',
            fieldType: 'select',
            multi: true,
          fieldQuery: 'ticketsPipelines',
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
          fieldLabel: 'Select Probability',
        },
        // STAGE FILTER
        {
            fieldName: 'stageIds',
            fieldType: 'select',
          fieldQuery: 'ticketsStages',
            multi: true,
            fieldValueVariable: '_id',
            fieldLabelVariable: 'name',
            fieldParentVariable: 'pipelineId',
          fieldParentQuery: "ticketsPipelines",
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
          fieldQueryVariables: `{"contentType": "tickets:ticket"}`,
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
          fieldQueryVariables: `{"contentType": "tickets:ticket"}`,
            logics: [
              {
                logicFieldName: 'groupIds',
                logicFieldVariable: 'groupIds',
                logicFieldExtraVariable: `{"contentType": "tickets:ticket"}`,
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
    serviceType: 'tickets',
    name: 'Total Ticket Count By Label',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
    getChartResult: async (
      models: IModels,
      filter: any,
      chartType: string,
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
                from: "tickets_pipeline_labels",
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
          fieldQueryVariables: `{"type": "tickets:ticket", "perPage": 1000}`,
            multi: true,
          fieldLabel: 'Select tags',
        },
        // BOARD FILTER
        {
            fieldName: 'boardId',
            fieldType: 'select',
            multi: false,
          fieldQuery: 'ticketsBoards',
            fieldValueVariable: '_id',
            fieldLabelVariable: 'name',
          fieldRequiredQueryParams: ['type'],
            fieldQueryVariables: `{"type": "ticket"}`,
          fieldLabel: 'Select board',
        },
        // PIPELINE FILTER
        {
            fieldName: 'pipelineIds',
            fieldType: 'select',
            multi: true,
          fieldQuery: 'ticketsPipelines',
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
          fieldLabel: 'Select Probability',
        },
        // STAGE FILTER
        {
            fieldName: 'stageIds',
            fieldType: 'select',
          fieldQuery: 'ticketsStages',
            multi: true,
            fieldValueVariable: '_id',
            fieldLabelVariable: 'name',
            fieldParentVariable: 'pipelineId',
          fieldParentQuery: "ticketsPipelines",
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
          fieldQueryVariables: `{"contentType": "tickets:ticket"}`,
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
          fieldQueryVariables: `{"contentType": "tickets:ticket"}`,
            logics: [
              {
                logicFieldName: 'groupIds',
                logicFieldVariable: 'groupIds',
                logicFieldExtraVariable: `{"contentType": "tickets:ticket"}`,
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
    serviceType: 'tickets',
    name: 'Total Ticket Count By Rep',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
    getChartResult: async (
      models: IModels,
      filter: any,
      chartType: string,
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
          fieldQueryVariables: `{"type": "tickets:ticket", "perPage": 1000}`,
            multi: true,
          fieldLabel: 'Select tags',
        },
        // BOARD FILTER
        {
            fieldName: 'boardId',
            fieldType: 'select',
            multi: false,
          fieldQuery: 'ticketsBoards',
            fieldValueVariable: '_id',
            fieldLabelVariable: 'name',
          fieldRequiredQueryParams: ['type'],
            fieldQueryVariables: `{"type": "ticket"}`,
          fieldLabel: 'Select board',
        },
        // PIPELINE FILTER
        {
            fieldName: 'pipelineIds',
            fieldType: 'select',
            multi: true,
          fieldQuery: 'ticketsPipelines',
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
          fieldLabel: 'Select Probability',
        },
        // STAGE FILTER
        {
            fieldName: 'stageIds',
            fieldType: 'select',
          fieldQuery: 'ticketsStages',
            multi: true,
            fieldValueVariable: '_id',
            fieldLabelVariable: 'name',
            fieldParentVariable: 'pipelineId',
          fieldParentQuery: "ticketsPipelines",
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
          fieldQueryVariables: `{"contentType": "tickets:ticket"}`,
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
          fieldQueryVariables: `{"contentType": "tickets:ticket"}`,
            logics: [
              {
                logicFieldName: 'groupIds',
                logicFieldVariable: 'groupIds',
                logicFieldExtraVariable: `{"contentType": "tickets:ticket"}`,
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
    serviceType: 'tickets',
    name: 'Total Ticket Count By Source',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
    getChartResult: async (
      models: IModels,
      filter: any,
      chartType: string,
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
          fieldQueryVariables: `{"type": "tickets:ticket", "perPage": 1000}`,
            multi: true,
          fieldLabel: 'Select tags',
        },
        // BOARD FILTER
        {
            fieldName: 'boardId',
            fieldType: 'select',
            multi: false,
          fieldQuery: 'ticketsBoards',
            fieldValueVariable: '_id',
            fieldLabelVariable: 'name',
          fieldRequiredQueryParams: ['type'],
            fieldQueryVariables: `{"type": "ticket"}`,
          fieldLabel: 'Select board',
        },
        // PIPELINE FILTER
        {
            fieldName: 'pipelineIds',
            fieldType: 'select',
            multi: true,
          fieldQuery: 'ticketsPipelines',
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
          fieldLabel: 'Select Probability',
        },
        // STAGE FILTER
        {
            fieldName: 'stageIds',
            fieldType: 'select',
          fieldQuery: 'ticketsStages',
            multi: true,
            fieldValueVariable: '_id',
            fieldLabelVariable: 'name',
            fieldParentVariable: 'pipelineId',
          fieldParentQuery: "ticketsPipelines",
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
          fieldQueryVariables: `{"contentType": "tickets:ticket"}`,
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
          fieldQueryVariables: `{"contentType": "tickets:ticket"}`,
            logics: [
              {
                logicFieldName: 'groupIds',
                logicFieldVariable: 'groupIds',
                logicFieldExtraVariable: `{"contentType": "tickets:ticket"}`,
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
    serviceType: 'tickets',
    name: 'Ticket Average Time To Close By Rep',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
    getChartResult: async (
      models: IModels,
      filter: any,
      chartType: string,
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
          fieldQueryVariables: `{"type": "tickets:ticket", "perPage": 1000}`,
            multi: true,
          fieldLabel: 'Select tags',
        },
        // BOARD FILTER
        {
            fieldName: 'boardId',
            fieldType: 'select',
            multi: false,
          fieldQuery: 'ticketsBoards',
            fieldValueVariable: '_id',
            fieldLabelVariable: 'name',
          fieldRequiredQueryParams: ['type'],
            fieldQueryVariables: `{"type": "ticket"}`,
          fieldLabel: 'Select board',
        },
        // PIPELINE FILTER
        {
            fieldName: 'pipelineIds',
            fieldType: 'select',
            multi: true,
          fieldQuery: 'ticketsPipelines',
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
          fieldLabel: 'Select Probability',
        },
        // STAGE FILTER
        {
            fieldName: 'stageIds',
            fieldType: 'select',
          fieldQuery: 'ticketsStages',
            multi: true,
            fieldValueVariable: '_id',
            fieldLabelVariable: 'name',
            fieldParentVariable: 'pipelineId',
          fieldParentQuery: "ticketsPipelines",
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
          fieldQueryVariables: `{"contentType": "tickets:ticket"}`,
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
          fieldQueryVariables: `{"contentType": "tickets:ticket"}`,
            logics: [
              {
                logicFieldName: 'groupIds',
                logicFieldVariable: 'groupIds',
                logicFieldExtraVariable: `{"contentType": "tickets:ticket"}`,
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
    serviceType: 'tickets',
    name: 'Ticket Average Time Spent In Each Stage',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
    getChartResult: async (
      models: IModels,
      filter: any,
      chartType: string,
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
          fieldQueryVariables: `{"type": "tickets:ticket", "perPage": 1000}`,
            multi: true,
          fieldLabel: 'Select tags',
        },

        // BOARD FILTER
        {
            fieldName: 'boardId',
            fieldType: 'select',
            multi: false,
          fieldQuery: 'ticketsBoards',
            fieldValueVariable: '_id',
            fieldLabelVariable: 'name',
          fieldRequiredQueryParams: ['type'],
            fieldQueryVariables: `{"type": "ticket"}`,
          fieldLabel: 'Select board',
        },
        // PIPELINE FILTER
        {
            fieldName: 'pipelineIds',
            fieldType: 'select',
            multi: true,
          fieldQuery: 'ticketsPipelines',
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
          fieldLabel: 'Select Probability',
        },
        // STAGE FILTER
        {
            fieldName: 'stageIds',
            fieldType: 'select',
          fieldQuery: 'ticketsStages',
            multi: true,
            fieldValueVariable: '_id',
            fieldLabelVariable: 'name',
          fieldParentVariable: 'pipelineId',
          fieldParentQuery: "ticketsPipelines",
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
          fieldQueryVariables: `{"contentType": "tickets:ticket"}`,
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
          fieldQueryVariables: `{"contentType": "tickets:ticket"}`,
            logics: [
              {
                logicFieldName: 'groupIds',
                logicFieldVariable: 'groupIds',
                logicFieldExtraVariable: `{"contentType": "tickets:ticket"}`,
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
    serviceType: 'tickets',
    name: 'Total Tickets Count',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table', 'number', "pivotTable"],
    getChartResult: async (
      models: IModels,
      filter: any,
      chartType: string,
        subdomain: string,
      ) => {

        const matchFilter = await buildMatchFilter(filter, 'ticket', subdomain, models)

        const pipeline = buildPipeline(filter, "ticket", matchFilter)
        const tickets = await models.Tickets.aggregate(pipeline)

        const title = 'Total Tickets Count';

      return { title, ...buildData({ chartType, data: tickets, filter, type: "ticket" }) };
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
          },
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
            },
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
          fieldQueryVariables: `{"type": "tickets:ticket", "perPage": 1000}`,
            multi: true,
          fieldLabel: 'Select tags',
        },
        // BOARD FILTER
        {
          fieldName: 'boardId',
          fieldType: 'select',
          multi: false,
          fieldQuery: 'ticketsBoards',
          fieldValueVariable: '_id',
          fieldLabelVariable: 'name',
          fieldRequiredQueryParams: ['type'],
          fieldQueryVariables: `{"type": "ticket"}`,
          fieldLabel: 'Select board',
        },
        // PIPELINE FILTER
        {
            fieldName: 'pipelineIds',
            fieldType: 'select',
            multi: true,
          fieldQuery: 'ticketsPipelines',
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
          multi: true,
          fieldOptions: PROBABILITY_TICKET,
          fieldLabel: 'Select Probability',
        },
        // STAGE FILTER
        {
            fieldName: 'stageIds',
            fieldType: 'select',
          fieldQuery: 'ticketsStages',
            multi: true,
            fieldValueVariable: '_id',
            fieldLabelVariable: 'name',
          fieldParentVariable: 'pipelineId',
          fieldParentQuery: "ticketsPipelines",
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
          fieldQueryVariables: `{"contentType": "tickets:ticket"}`,
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
          fieldQueryVariables: `{"contentType": "tickets:ticket"}`,
          logics: [
            {
              logicFieldName: 'groupIds',
              logicFieldVariable: 'groupIds',
              logicFieldExtraVariable: `{"contentType": "tickets:ticket"}`,
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