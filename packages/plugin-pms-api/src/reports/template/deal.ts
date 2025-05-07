import * as dayjs from "dayjs";
import { IModels } from "../../connectionResolver";
import { sendProductsMessage, sendSalesMessage } from "../../messageBroker";
import { DATERANGE_TYPES, USER_TYPES } from "../constants";
import { buildMatchFilter } from "../utils";
const util = require("util");

const MEASURE_OPTIONS = [
  { label: "Total Count", value: "count" },
  { label: "Total Amount", value: "totalAmount" },
  { label: "Average Amount", value: "averageAmount" },
  { label: "Unused Amount", value: "unusedAmount" },
  { label: "Forecast", value: "forecastAmount" }
];

const DIMENSION_OPTIONS = [
  { label: "Departments", value: "department" },
  { label: "Branches", value: "branch" },
  { label: "Companies", value: "company" },
  { label: "Customers", value: "customer" },
  { label: "Products", value: "product" },
  { label: "Boards", value: "board" },
  { label: "Pipelines", value: "pipeline" },
  { label: "Stages", value: "stage" },
  { label: "Probability", value: "probability" },
  { label: "Card", value: "card" },
  { label: "Tags", value: "tag" },
  { label: "Labels", value: "label" },
  { label: "Frequency (day, week, month)", value: "frequency" },
  { label: "Status", value: "status" },
  { label: "Priority", value: "priority" },
  { label: "Description", value: "description" },
  { label: "Is Complete", value: "isComplete" },
  { label: "Created by", value: "createdBy" },
  { label: "Modified by", value: "modifiedBy" },
  { label: "Assigned to", value: "assignedTo" },
  { label: "Created at", value: "createdAt" },
  { label: "Modified at", value: "modifiedAt" },
  { label: "Stage changed at", value: "stageChangedDate" },
  { label: "Start Date", value: "startDate" },
  { label: "Close Date", value: "closeDate" },
  { label: "Custom Propertry", value: "field" }
];

export const dealCharts = [
  {
    templateType: "roomVacancy",
    serviceType: "room",
    name: "Total room Vacancy",
    chartTypes: ["table"],
    getChartResult: async (
      models: IModels,
      filter: any,
      chartType: string,
      subdomain: string
    ) => {
      const matchFilter: any = await buildMatchFilter(
        filter,
        "deal",
        subdomain,
        models
      );

      const pipeline = [
        {
          $unwind: "$productsData"
        },
        {
          $match: {
            ...matchFilter
          }
        },
        {
          $project: {
            _id: 0, // Exclude _id if not needed
            startDate: 1,
            closeDate: 1,
            productsData: "$productsData"
          }
        }
      ];
      console.log(JSON.stringify(matchFilter));
      // const deals = await models.Deals.aggregate(pipeline)
      const deals = await sendSalesMessage({
        subdomain,
        action: "deals.aggregate",
        data: pipeline,
        isRPC: true,
        defaultValue: []
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
        {}
      );

      const data = Object.values(totalCount);
      const productIds = Object.keys(totalCount);
      const rooms = await sendProductsMessage({
        subdomain,
        action: "products.find",
        data: {
          query: {
            _id: { $in: productIds }
          }
        },
        isRPC: true,
        defaultValue: []
      });
      const start = dayjs(matchFilter?.startDate.$gte).format("YYYY-MM-DD");
      const end = dayjs(matchFilter?.startDate.$lte).format("YYYY-MM-DD");
      const diffInDays = dayjs(matchFilter?.startDate.$lte).diff(
        dayjs(matchFilter?.startDate.$gte),
        "day"
      );

      const title = matchFilter?.startDate
        ? `Room vacancy between ${start} and ${end}`
        : `Room vacancy`;
      console.log(rooms);
      const data2 = productIds.map(x => ({
        name: rooms.find(d => d._id === x).name,
        available: diffInDays,
        occupied: totalCount[x],
        unOccupied: diffInDays - totalCount[x]
      }));

      return {
        title,
        data: data2,
        headers: ["name", "available", "occupied", "unOccupied"]
      };
    },
    filterTypes: [
      {
        fieldName: "productIds",
        fieldType: "select",
        fieldQuery: "products",
        multi: true,
        fieldLabel: "Select products"
      },
      {
        fieldName: "productCategory",
        fieldType: "select",
        fieldQuery: "productCategories",
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        multi: true,
        fieldLabel: "Select product categories"
      },

      // BOARD FILTER
      {
        fieldName: "boardId",
        fieldType: "select",
        multi: false,
        fieldQuery: "salesBoards",
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        fieldRequiredQueryParams: ["type"],
        fieldQueryVariables: `{"type": "deal"}`,
        fieldLabel: "Select board"
      },
      // PIPELINE FILTER
      {
        fieldName: "pipelineIds",
        fieldType: "select",
        multi: true,
        fieldQuery: "salesPipelines",
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        fieldQueryVariables: `{"type": "deal"}`,
        logics: [
          {
            logicFieldName: "boardId",
            logicFieldVariable: "boardId"
          }
        ],
        fieldLabel: "Select pipelines"
      },

      {
        fieldName: "stageIds",
        fieldType: "select",
        fieldQuery: "salesStages",
        multi: true,
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        fieldParentVariable: "pipelineId",
        fieldParentQuery: "salesPipelines",
        logics: [
          {
            logicFieldName: "pipelineIds",
            logicFieldVariable: "pipelineIds"
          }
        ],
        fieldLabel: "Select stages"
      },

      {
        fieldName: "dateRange",
        fieldType: "select",
        multi: true,
        fieldQuery: "date",
        fieldOptions: DATERANGE_TYPES,
        fieldLabel: "Select date range",
        fieldDefaultValue: "all"
      }
    ]
  },
  {
    templateType: "roomVacancyCategory",
    serviceType: "room",
    name: "Total room Vacancy by room category",
    chartTypes: ["table"],
    getChartResult: async (
      models: IModels,
      filter: any,
      chartType: string,
      subdomain: string
    ) => {
      const matchFilter: any = await buildMatchFilter(
        filter,
        "deal",
        subdomain,
        models
      );

      const pipeline = [
        {
          $unwind: "$productsData"
        },
        {
          $match: {
            ...matchFilter
          }
        },
        {
          $project: {
            _id: 0, // Exclude _id if not needed
            startDate: 1,
            closeDate: 1,
            productsData: "$productsData"
          }
        }
      ];
      // const deals = await models.Deals.aggregate(pipeline)
      const deals = await sendSalesMessage({
        subdomain,
        action: "deals.aggregate",
        data: pipeline,
        isRPC: true,
        defaultValue: []
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
        {}
      );

      const data = Object.values(totalCount);
      const productIds = Object.keys(totalCount);
      const rooms = await sendProductsMessage({
        subdomain,
        action: "products.find",
        data: {
          query: {
            _id: { $in: productIds }
          }
        },
        isRPC: true,
        defaultValue: []
      });
      const start = dayjs(matchFilter?.startDate.$gte).format("YYYY-MM-DD");
      const end = dayjs(matchFilter?.startDate.$lte).format("YYYY-MM-DD");
      const diffInDays = dayjs(matchFilter?.startDate.$lte).diff(
        dayjs(matchFilter?.startDate.$gte),
        "day"
      );

      const title = matchFilter?.startDate
        ? `Room vacancy between ${start} and ${end}`
        : `Room vacancy`;

      const data2 = productIds.map(x => ({
        name: rooms.find(d => d._id === x).name,
        available: diffInDays,
        occupied: totalCount[x],
        unOccupied: diffInDays - totalCount[x]
      }));

      return {
        title,
        data: data2,
        headers: ["name", "available", "occupied", "unOccupied"]
      };
    },
    filterTypes: [
      // {
      //   fieldName: "productIds",
      //   fieldType: "select",
      //   fieldQuery: "products",
      //   multi: true,
      //   fieldLabel: "Select products"
      // },
      {
        fieldName: "productCategory",
        fieldType: "select",
        fieldQuery: "productCategories",
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        multi: true,
        fieldLabel: "Select product categories"
      },

      // BOARD FILTER
      {
        fieldName: "boardId",
        fieldType: "select",
        multi: false,
        fieldQuery: "salesBoards",
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        fieldRequiredQueryParams: ["type"],
        fieldQueryVariables: `{"type": "deal"}`,
        fieldLabel: "Select board"
      },
      // PIPELINE FILTER
      {
        fieldName: "pipelineIds",
        fieldType: "select",
        multi: true,
        fieldQuery: "salesPipelines",
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        fieldQueryVariables: `{"type": "deal"}`,
        logics: [
          {
            logicFieldName: "boardId",
            logicFieldVariable: "boardId"
          }
        ],
        fieldLabel: "Select pipelines"
      },

      {
        fieldName: "stageIds",
        fieldType: "select",
        fieldQuery: "salesStages",
        multi: true,
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        fieldParentVariable: "pipelineId",
        fieldParentQuery: "salesPipelines",
        logics: [
          {
            logicFieldName: "pipelineIds",
            logicFieldVariable: "pipelineIds"
          }
        ],
        fieldLabel: "Select stages"
      },

      {
        fieldName: "dateRange",
        fieldType: "select",
        multi: true,
        fieldQuery: "date",
        fieldOptions: DATERANGE_TYPES,
        fieldLabel: "Select date range",
        fieldDefaultValue: "all"
      }
    ]
  }
];
