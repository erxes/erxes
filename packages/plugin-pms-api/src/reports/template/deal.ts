import * as dayjs from 'dayjs';
import { IModels } from '../../connectionResolver';
import { sendProductsMessage, sendSalesMessage } from '../../messageBroker';
import {
  AMOUNT_RANGE_ATTRIBUTES,
  ATTACHMENT_TYPES,
  CUSTOM_DATE_FREQUENCY_TYPES,
  DATERANGE_BY_TYPES,
  DATERANGE_TYPES,
  DUE_DATERANGE_TYPES,
  DUE_TYPES,
  MONTH_NAMES,
  PRIORITY,
  PROBABILITY_DEAL,
  STATUS_TYPES,
  USER_TYPES,
} from '../constants';
import {
  buildMatchFilter,
  buildPipeline,
  buildData,
  buildOptions,
} from '../utils';
const util = require('util');

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
    templateType: 'roomVacancy',
    serviceType: 'room',
    name: 'Total room Vacancy',
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
      chartType: string,
      subdomain: string,
    ) => {
      const matchFilter: any = await buildMatchFilter(
        filter,
        'deal',
        subdomain,
        models,
      );

      const pipeline = [
        {
          $unwind: '$productsData',
        },
        {
          $match: {
            ...matchFilter,
          },
        },
        {
          $project: {
            _id: 0, // Exclude _id if not needed
            startDate: 1,
            closeDate: 1,
            productsData: '$productsData',
          },
        },
      ];
      console.log(JSON.stringify(matchFilter));
      // const deals = await models.Deals.aggregate(pipeline)
      const deals = await sendSalesMessage({
        subdomain,
        action: 'deals.aggregate',
        data: pipeline,
        isRPC: true,
        defaultValue: [],
      });

      const totalCount = (deals || []).reduce(
        (acc, { count, productsData }) => {
          if (acc[productsData.productId]) {
            acc[productsData.productId] =
              acc[productsData.productId] + productsData.quantity;
          } else {
            acc[productsData.productId] = productsData.quantity;
          }
          return acc;
        },
        {},
      );

      const data = Object.values(totalCount);
      const productIds = Object.keys(totalCount);
      const rooms = await sendProductsMessage({
        subdomain,
        action: 'products.find',
        data: {
          query: {
            _id: { $in: productIds },
          },
        },
        isRPC: true,
        defaultValue: [],
      });
      const start = dayjs(matchFilter?.startDate.$gte).format('YYYY-MM-DD');
      const end = dayjs(matchFilter?.startDate.$lte).format('YYYY-MM-DD');
      const diffInDays = dayjs(matchFilter?.startDate.$lte).diff(
        dayjs(matchFilter?.startDate.$gte),
        'day',
      );

      const title = matchFilter?.startDate
        ? `Room vacancy between ${start} and ${end}`
        : `Room vacancy`;
      console.log(rooms);
      const data2 = productIds.map(x => ({
        name: rooms.find(d => d._id === x).name,
        available: diffInDays,
        occupied: totalCount[x],
        unOccupied: diffInDays - totalCount[x],
      }));

      // title: 'Total Deals Count',
      //  data: [
      //     { product: 'room1', stage: 'Checked out', totalAmount: 20000 },
      //     { product: 'room2', stage: 'Checked out', totalAmount: 75000 },
      //     { total: 2, totalAmount: 95000 }
      //  ],
      //  headers: [ 'product', 'stage', 'totalAmount' ],
      return {
        title,
        data: data2,
        headers: ['name', 'available', 'occupied', 'unOccupied'],
      };
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
      //   {
      //     fieldName: "userIds",
      //     fieldType: "select",
      //     multi: true,
      //     fieldQuery: "users",
      //     fieldLabel: "Select users"
      //   },
      //   // BRANCH FILTER
      //   {
      //     fieldName: "branchIds",
      //     fieldType: "select",
      //     multi: true,
      //     fieldQuery: "branches",
      //     fieldLabel: "Select branches"
      //   },
      //   // DEPARTMENT FILTER
      //   {
      //     fieldName: "departmentIds",
      //     fieldType: "select",
      //     multi: true,
      //     fieldQuery: "departments",
      //     fieldLabel: "Select departments"
      //   },
      //   // COMPANY FILTER
      //   {
      //     fieldName: "companyIds",
      //     fieldType: "select",
      //     fieldQuery: "companies",
      //     multi: true,
      //     fieldValueVariable: "_id",
      //     fieldLabelVariable: "primaryName",
      //     fieldQueryVariables: `{"conformityMainType": "deal", "conformityRelType": "company"}`,
      //     fieldLabel: "Select companies"
      //   },
      //   // CUSTOMER FILTER
      //   {
      //     fieldName: "customerIds",
      //     fieldType: "select",
      //     fieldQuery: "customers",
      //     multi: true,
      //     fieldQueryVariables: `{"conformityMainType": "deal", "conformityRelType": "customer"}`,
      //     fieldLabel: "Select customers"
      //   },
      //   // TAG FILTER
      //   {
      //     fieldName: "tagIds",
      //     fieldType: "select",
      //     fieldQuery: "tags",
      //     fieldValueVariable: "_id",
      //     fieldLabelVariable: "name",
      //     fieldQueryVariables: `{"type": "sales:deal", "perPage": 1000}`,
      //     multi: true,
      //     fieldLabel: "Select tags"
      //   },
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
      //   // STAGE PROBABILITY FILTER
      //   {
      //     fieldName: "stageProbability",
      //     fieldType: "select",
      //     fieldOptions: PROBABILITY_DEAL,
      //     fieldLabel: "Select Probability"
      //   },
      // STAGE FILTER
      {
        fieldName: 'stageIds',
        fieldType: 'select',
        fieldQuery: 'salesStages',
        multi: true,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldParentVariable: 'pipelineId',
        fieldParentQuery: 'salesPipelines',
        logics: [
          {
            logicFieldName: 'pipelineIds',
            logicFieldVariable: 'pipelineIds',
          },
        ],
        fieldLabel: 'Select stages',
      },
      //   // LABEL FILTER
      //   {
      //     fieldName: "labelIds",
      //     fieldType: "select",
      //     fieldQuery: "salesPipelineLabels",
      //     multi: true,
      //     fieldValueVariable: "_id",
      //     fieldLabelVariable: "name",
      //     fieldParentVariable: "pipelineId",
      //     fieldParentQuery: "salesPipelines",
      //     logics: [
      //       {
      //         logicFieldName: "pipelineIds",
      //         logicFieldVariable: "pipelineIds"
      //       }
      //     ],
      //     fieldLabel: "Select labels"
      //   },
      //   // PRIORITY FILTER
      //   {
      //     fieldName: "status",
      //     fieldType: "select",
      //     fieldOptions: STATUS_TYPES,
      //     fieldLabel: "Select status"
      //   },
      //   // PRIORITY FILTER
      //   {
      //     fieldName: "priority",
      //     fieldType: "select",
      //     fieldOptions: PRIORITY,
      //     fieldLabel: "Select priority"
      //   },
      //   // ATTACHMENT FILTER
      //   {
      //     fieldName: "attachment",
      //     fieldType: "select",
      //     fieldOptions: ATTACHMENT_TYPES,
      //     fieldLabel: "Select attachment"
      //   },
      //   // CUSTOM PROPERTIES FILTER
      //   {
      //     fieldName: "groupIds",
      //     fieldType: "select",
      //     fieldQuery: "fieldsGroups",
      //     fieldValueVariable: "_id",
      //     fieldLabelVariable: "name",
      //     fieldQueryVariables: `{"contentType": "sales:deal"}`,
      //     multi: true,
      //     fieldLabel: "Select field group"
      //   },
      //   // CUSTOM PROPERTIES FIELD FILTER
      //   {
      //     fieldName: "fieldIds",
      //     fieldType: "select",
      //     fieldQuery: "fields",
      //     fieldValueVariable: "_id",
      //     fieldLabelVariable: "text",
      //     fieldParentVariable: "groupId",
      //     fieldParentQuery: "fieldsGroups",
      //     fieldRequiredQueryParams: ["contentType"],
      //     fieldQueryVariables: `{"contentType": "sales:deal"}`,
      //     logics: [
      //       {
      //         logicFieldName: "groupIds",
      //         logicFieldVariable: "groupIds",
      //         logicFieldExtraVariable: `{"contentType": "sales:deal"}`
      //       }
      //     ],
      //     multi: true,
      //     fieldLabel: "Select field"
      //   },
      //   // DATERANGE FILTER
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
      // {
      //   fieldName: "dateRangeType",
      //   fieldType: "select",
      //   multi: false,
      //   fieldQuery: "date",
      //   fieldOptions: DATERANGE_BY_TYPES,
      //   fieldLabel: "Select date range type",
      //   fieldDefaultValue: "createdAt"
      // }
    ],
  },
];
