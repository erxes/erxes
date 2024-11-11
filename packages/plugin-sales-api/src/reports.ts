import * as dayjs from "dayjs";

import { IModels, generateModels } from "./connectionResolver";
import { sendCoreMessage } from "./messageBroker";

const checkFilterParam = (param: any) => {
  return param && param.length;
};
const NOW = new Date();
const returnDateRange = (dateRange: string, startDate: Date, endDate: Date) => {
  const startOfToday = new Date(NOW.setHours(0, 0, 0, 0));
  const endOfToday = new Date(NOW.setHours(23, 59, 59, 999));
  const startOfYesterday = new Date(
    dayjs(NOW).add(-1, "day").toDate().setHours(0, 0, 0, 0)
  );

  let $gte;
  let $lte;
  switch (dateRange) {
    case "today":
      $gte = startOfToday;
      $lte = endOfToday;
      break;
    case "yesterday":
      $gte = startOfYesterday;
      $lte = startOfToday;
    case "thisWeek":
      $gte = dayjs(NOW).startOf("week").toDate();
      $lte = dayjs(NOW).endOf("week").toDate();
      break;

    case "lastWeek":
      $gte = dayjs(NOW).add(-1, "week").startOf("week").toDate();
      $lte = dayjs(NOW).add(-1, "week").endOf("week").toDate();
      break;
    case "lastMonth":
      $gte = dayjs(NOW).add(-1, "month").startOf("month").toDate();
      $lte = dayjs(NOW).add(-1, "month").endOf("month").toDate();
      break;
    case "thisMonth":
      $gte = dayjs(NOW).startOf("month").toDate();
      $lte = dayjs(NOW).endOf("month").toDate();
      break;
    case "thisYear":
      $gte = dayjs(NOW).startOf("year").toDate();
      $lte = dayjs(NOW).endOf("year").toDate();
      break;
    case "lastYear":
      $gte = dayjs(NOW).add(-1, "year").startOf("year").toDate();
      $lte = dayjs(NOW).add(-1, "year").endOf("year").toDate();
      break;
    case "customDate":
      $gte = startDate;
      $lte = endDate;
      break;
    // all
    default:
      break;
  }

  if ($gte && $lte) {
    return { $gte, $lte };
  }

  return {};
};

const DATE_RANGE_TYPES = [
  { label: "All time", value: "all" },
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "This Week", value: "thisWeek" },
  { label: "Last Week", value: "lastWeek" },
  { label: "This Month", value: "thisMonth" },
  { label: "Last Month", value: "lastMonth" },
  { label: "This Year", value: "thisYear" },
  { label: "Last Year", value: "lastYear" },
  { label: "Custom Date", value: "customDate" }
];

const returnStage = (resolve: string | string[]) => {
  ("");
  // Handle the case when resolve is an array
  const firstResolve = Array.isArray(resolve) ? resolve[0] : resolve;

  switch (firstResolve) {
    case "10":
      return "10%";
    case "20":
      return "30%";
    case "30":
      return "30%";
    case "40":
      return "40%";
    case "50":
      return "50%";
    case "60":
      return "60%";
    case "70":
      return "70%";
    case "80":
      return "80%";
    case "90":
      return "90%";
    case "Won":
      return "Won";
    case "Lost":
      return "Lost";
    case "Done":
      return "Done";
    case "Resolved":
      return "Resolved";
    default:
      return {};
  }
};

const PROBABILITY_DEAL = [
  { label: "10%", value: "10" },
  { label: "20%", value: "20" },
  { label: "30%", value: "30" },
  { label: "40%", value: "40" },
  { label: "50%", value: "50" },
  { label: "60%", value: "60" },
  { label: "70%", value: "70" },
  { label: "80%", value: "80" },
  { label: "90%", value: "90" },
  { label: "Won", value: "Won" },
  { label: "Lost", value: "Lost" }
];

const PRIORITY = [
  { label: "Critical", value: "Critical" },
  { label: "High", value: "High" },
  { label: "Medium", value: "Medium" },
  { label: "Low", value: "Low" }
];
const PIPELINE_TYPE_DEAL = "deal";

const CUSTOM_PROPERTIES_DEAL = "sales:deal";

const reportTemplates = [
  {
    serviceType: "deal",
    title: "Deals chart",
    serviceName: "sales",
    description: "Deal conversation charts",
    charts: [
      "DealCountTags",
      "DealCountLabel",
      "DealCustomProperties",
      "DealAverageTimeSpentInEachStage",
      "DealAmountAverageByRep",
      "DealLeaderBoardAmountClosedByRep",
      "DealsByLastModifiedDate",
      "DealsClosedLostAllTimeByRep",
      "DealsOpenByCurrentStage",
      "DealsClosedWonAllTimeByRep",
      "DealRevenueByStage",
      "DealsSales",
      "DealCountInEachPipeline",
      "DealCountInEachStage",
      "DealCountByCompanies",
      "ClosedRevenueByMonthWithDealTotalAndClosedRevenueBreakdown"
    ],
    img: "https://sciter.com/wp-content/uploads/2022/08/chart-js.png"
  }
];

const chartTemplates = [
  {
    templateType: "DealCountTags",
    name: "Deals Count Tags",
    chartTypes: [
      "bar",
      "line",
      "pie",
      "doughnut",
      "radar",
      "polarArea",
      "table"
    ],
    // Bar Chart Table
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string
    ) => {
      const { pipelineId, boardId, stageId, stageType, tagIds } = filter;
      const matchedFilter = await filterData(filter, subdomain);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageId,
        stageType,
        PIPELINE_TYPE_DEAL,
        models
      );
      const title: string = "Deal count tags";

      let query = await QueryFilter(filterPipelineId, matchedFilter);
      const deals = await models?.Deals.find({
        ...query
      }).lean();
      if (deals) {
        const tagsCount = deals.map(result => result.tagIds);
        let flattenedTagIds = tagsCount.flat();
        let tagId = tagIds || flattenedTagIds; // Assigns tagIds if it exists, otherwise uses flattenedTagIds
        // Use the flattenedTagIds to query tag information
        const tagInfo = await sendCoreMessage({
          subdomain,
          action: "tagFind",
          data: {
            _id: { $in: tagId || [] } // Use flattenedTagIds here
          },
          isRPC: true,
          defaultValue: []
        });

        const tagData = {};

        tagId.forEach(tagId => {
          if (!tagData[tagId]) {
            tagData[tagId] = {
              _id: tagId,
              count: 0,
              name: null,
              type: null
            };
          }
          tagData[tagId].count++;
        });

        for (let tag of tagInfo) {
          let tagId = tagIds || tag._id;

          if (tagData[tagId]) {
            tagData[tagId].name = tag.name;
            tagData[tagId].type = tag.type;
          }
        }

        const groupedTagData: { count: number; name: string }[] =
          Object.values(tagData);

        // Create an array of objects with count and label
        const dataWithLabels = groupedTagData
          .filter(tag => tag.name !== null)
          .map(tag => ({
            count: tag.count,
            label: tag.name
          }));

        dataWithLabels.sort((a, b) => a.count - b.count);

        const data: number[] = dataWithLabels.map(item => item.count);
        const labels: string[] = dataWithLabels.map(item => item.label);

        const datasets = {
          title,
          data,
          labels
        };
        return datasets;
      } else {
        const datasets = {
          title,
          data: [],
          labels: []
        };
        return datasets;
      }
    },

    filterTypes: [
      {
        fieldName: "assignedUserIds",
        fieldType: "select",
        multi: true,
        fieldQuery: "users",
        fieldLabel: "Select assigned users"
      },
      {
        fieldName: "dateRange",
        fieldType: "select",
        multi: true,
        fieldQuery: "date",
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: "Select date range",
        fieldDefaultValue: "all"
      },
      {
        fieldName: "branchIds",
        fieldType: "select",
        multi: true,
        fieldQuery: "branches",
        fieldLabel: "Select branches"
      },
      {
        fieldName: "departmentIds",
        fieldType: "select",
        multi: true,
        fieldQuery: "departments",
        fieldLabel: "Select departments"
      },
      {
        fieldName: "boardId",
        fieldType: "select",
        fieldQuery: "boards",
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        fieldLabel: "Select boards"
      },
      {
        fieldName: "pipelineId",
        fieldType: "select",
        multi: false,
        fieldQuery: "pipelines",
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        logics: [
          {
            logicFieldName: "boardId",
            logicFieldVariable: "boardId"
          }
        ],
        fieldLabel: "Select pipeline"
      },
      {
        fieldName: "stageId",
        fieldType: "select",
        fieldQuery: "stages",
        multi: false,
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        logics: [
          {
            logicFieldName: "pipelineId",
            logicFieldVariable: "pipelineId"
          }
        ],
        fieldLabel: "Select stage"
      },
      {
        fieldName: "stageType",
        fieldType: "select",
        multi: false,
        fieldQuery: "stages",
        fieldOptions: PROBABILITY_DEAL,
        fieldLabel: "Select Probability"
      },
      {
        fieldName: "priority",
        fieldType: "select",
        multi: false,
        fieldQuery: "stages",
        fieldOptions: PRIORITY,
        fieldLabel: "Select Stage priority"
      },
      {
        fieldName: "tagIds",
        fieldType: "select",
        fieldQuery: "tags",
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        fieldQueryVariables: `{"type": "${CUSTOM_PROPERTIES_DEAL}", "perPage": 1000}`,
        multi: true,
        fieldLabel: "Select tags"
      }
    ]
  },

  {
    templateType: "DealCountLabel",
    name: "Deal Count Label",
    chartTypes: [
      "bar",
      "line",
      "pie",
      "doughnut",
      "radar",
      "polarArea",
      "table"
    ],
    // Bar Chart Table
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string
    ) => {
      const { pipelineId, boardId, stageId, stageType } = filter;
      const matchedFilter = await filterData(filter, subdomain);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageId,
        stageType,
        PIPELINE_TYPE_DEAL,
        models
      );

      let query = await QueryFilter(filterPipelineId, matchedFilter);
      const title = "Deal Count Label";
      const deals = await models?.Deals.find({
        ...query
      }).lean();

      if (deals) {
        const labelIds = deals.map(item => item.labelIds).flat();

        const labels = await models?.PipelineLabels.find({
          _id: {
            $in: labelIds
          }
        }).lean();

        if (labels) {
          const labelData: Record<
            string,
            { _id: string; count: number; name: string }
          > = {};

          // Count occurrences of labels
          deals.forEach(deal => {
            (deal.labelIds || []).forEach(labelId => {
              if (!labelData[labelId]) {
                labelData[labelId] = {
                  _id: labelId,
                  count: 0,
                  name: ""
                };
              }
              labelData[labelId].count++;
            });
          });

          // Update label names
          labels.forEach(label => {
            const labelId = label._id;
            if (labelData[labelId]) {
              labelData[labelId].name = label.name;
            }
          });

          // Convert labelData to an array and sort based on count
          const groupedLabelData: any[] = Object.values(labelData);

          groupedLabelData.sort((a, b) => a.count - b.count);

          const counts: number[] = groupedLabelData.map(label => label.count);
          const labelNames: string[] = groupedLabelData.map(
            label => label.name
          );

          const datasets = {
            title,
            data: counts,
            labels: labelNames
          };

          return datasets;
        }
      }
    },

    filterTypes: [
      {
        fieldName: "assignedUserIds",
        fieldType: "select",
        multi: true,
        fieldQuery: "users",
        fieldLabel: "Select assigned users"
      },
      {
        fieldName: "dateRange",
        fieldType: "select",
        multi: true,
        fieldQuery: "date",
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: "Select date range",
        fieldDefaultValue: "all"
      },
      {
        fieldName: "branchIds",
        fieldType: "select",
        multi: true,
        fieldQuery: "branches",
        fieldLabel: "Select branches"
      },
      {
        fieldName: "departmentIds",
        fieldType: "select",
        multi: true,
        fieldQuery: "departments",
        fieldLabel: "Select departments"
      },
      {
        fieldName: "boardId",
        fieldType: "select",
        fieldQuery: "boards",
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        fieldLabel: "Select boards"
      },
      {
        fieldName: "pipelineId",
        fieldType: "select",
        multi: false,
        fieldQuery: "pipelines",
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        logics: [
          {
            logicFieldName: "boardId",
            logicFieldVariable: "boardId"
          }
        ],
        fieldLabel: "Select pipeline"
      },
      {
        fieldName: "stageId",
        fieldType: "select",
        fieldQuery: "stages",
        multi: false,
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        logics: [
          {
            logicFieldName: "pipelineId",
            logicFieldVariable: "pipelineId"
          }
        ],
        fieldLabel: "Select stage"
      },
      {
        fieldName: "stageType",
        fieldType: "select",
        multi: false,
        fieldQuery: "stages",
        fieldOptions: PIPELINE_TYPE_DEAL,
        fieldLabel: "Select Probability"
      },
      {
        fieldName: "priority",
        fieldType: "select",
        multi: false,
        fieldQuery: "stages",
        fieldOptions: PRIORITY,
        fieldLabel: "Select Stage priority"
      },
      {
        fieldName: "pipelineLabels",
        fieldType: "select",
        fieldQuery: "pipelineLabels",
        multi: false,
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        logics: [
          {
            logicFieldName: "pipelineId",
            logicFieldVariable: "pipelineId"
          }
        ],
        fieldLabel: "select label"
      }
    ]
  },

  {
    templateType: "DealCustomProperties",
    name: "Deal Custom Properties",
    chartTypes: [
      "bar",
      "line",
      "pie",
      "doughnut",
      "radar",
      "polarArea",
      "table"
    ],
    // Bar Chart Table
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string
    ) => {
      const { pipelineId, boardId, stageId, stageType } = filter;
      const matchedFilter = await filterData(filter, subdomain);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageId,
        stageType,
        PIPELINE_TYPE_DEAL,
        models
      );
      const customFieldsDataFilter = filter.fieldsGroups;

      const title: string = "Deal Custom Properties";
      let query = await QueryFilter(filterPipelineId, matchedFilter);

      const deals = await models?.Deals.find({
        ...query
      }).lean();

      if (deals) {
        const idCounts = {};
        deals.forEach(dealItem => {
          (dealItem.customFieldsData || []).forEach(fieldData => {
            if (fieldData.value && Array.isArray(fieldData.value)) {
              fieldData.value.forEach(obj => {
                const id = Object.keys(obj)[0];
                idCounts[id] = (idCounts[id] || 0) + 1;
              });
            }
          });
        });

        const fields = Object.keys(idCounts).map(id => ({
          _id: id,
          count: idCounts[id]
        }));
        const customProperty = fields.map(result => result._id);

        let customField;
        if (customFieldsDataFilter) {
          customField = customFieldsDataFilter;
        } else {
          customField = customProperty;
        }

        const fieldsGroups = await sendCoreMessage({
          subdomain,
          action: "fields.find",
          data: {
            query: {
              _id: {
                $in: customField
              }
            }
          },
          isRPC: true
        });

        let result = fieldsGroups.map(field => {
          let correspondingData = fields.find(item => item._id === field._id);
          if (correspondingData) {
            return {
              _id: correspondingData._id,
              label: field.text,
              count: correspondingData.count
            };
          }

          return null; // Handle if no corresponding data is found
        });

        result.sort((a, b) => a.count - b.count);

        const data: number[] = result.map(item => item.count);
        const labels: string[] = result.map(item => item.label);

        const datasets = {
          title,
          data,
          labels
        };
        return datasets;
      } else {
        const datasets = {
          title,
          data: [],
          labels: []
        };
        return datasets;
      }
    },
    filterTypes: [
      {
        fieldName: "dateRange",
        fieldType: "select",
        multi: true,
        fieldQuery: "date",
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: "Select date range",
        fieldDefaultValue: "all"
      },
      {
        fieldName: "branchIds",
        fieldType: "select",
        multi: true,
        fieldQuery: "branches",
        fieldLabel: "Select branches"
      },
      {
        fieldName: "departmentIds",
        fieldType: "select",
        multi: true,
        fieldQuery: "departments",
        fieldLabel: "Select departments"
      },
      {
        fieldName: "boardId",
        fieldType: "select",
        fieldQuery: "boards",
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        fieldLabel: "Select a board"
      },
      {
        fieldName: "pipelineId",
        fieldType: "select",
        multi: false,
        fieldQuery: "pipelines",
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        logics: [
          {
            logicFieldName: "boardId",
            logicFieldVariable: "boardId"
          }
        ],
        fieldLabel: "Select pipeline"
      },
      {
        fieldName: "stageId",
        fieldType: "select",
        fieldQuery: "stages",
        multi: false,
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        logics: [
          {
            logicFieldName: "pipelineId",
            logicFieldVariable: "pipelineId"
          }
        ],
        fieldLabel: "Select stage"
      },
      {
        fieldName: "stageType",
        fieldType: "select",
        multi: false,
        fieldQuery: "stages",
        fieldOptions: PROBABILITY_DEAL,
        fieldLabel: "Select Probability"
      },
      {
        fieldName: "priority",
        fieldType: "select",
        multi: false,
        fieldQuery: "stages",
        fieldOptions: PRIORITY,
        fieldLabel: "Select Stage priority"
      },
      {
        fieldName: "contentType",
        fieldType: "select",
        fieldQuery: "fieldsGetTypes",
        fieldValueVariable: "contentType",
        fieldLabelVariable: "description",
        multi: false,
        fieldLabel: "Select properties type "
      },
      {
        fieldName: "fieldsGroups",
        fieldType: "groups",
        fieldQuery: "fieldsGroups",
        fieldValueVariable: "fields",
        fieldLabelVariable: "name",
        logics: [
          {
            logicFieldName: "contentType",
            logicFieldVariable: "contentType"
          }
        ],
        multi: true,
        fieldLabel: "Select custom properties"
      }
    ]
  },
  {
    templateType: "DealRevenueByStage",
    name: "Deal Revenue By Stage",
    chartTypes: [
      "bar",
      "line",
      "pie",
      "doughnut",
      "radar",
      "polarArea",
      "table"
    ],
    // Bar Chart Table
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string
    ) => {
      const { pipelineId, boardId, stageId, stageType } = filter;
      const matchedFilter = await filterData(filter, subdomain);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageType,
        stageId,
        PIPELINE_TYPE_DEAL,
        models
      );
      let query = await QueryFilter(filterPipelineId, matchedFilter);
      const deals = await models?.Deals.find({
        ...query
      });

      if (deals) {
        const dealAmount = await amountProductData(deals);

        const stageIds = dealAmount.map(item => item.stageId);

        const stageName = await models?.Stages.find({
          _id: { $in: stageIds }
        });

        const stageNames = stageName
          ?.map(result => {
            const item = dealAmount.find(item => item.stageId === result._id);
            if (item) {
              const totalAmount = Number(item.totalAmount);
              return {
                name: result.name,
                totalAmount: totalAmount
              };
            }
            return null; // Handle if stage ID is not found in transformedResult
          })
          .filter(
            (item): item is { name: string; totalAmount: number } => !!item
          );
        stageNames.sort((a, b) => a.totalAmount - b.totalAmount);
        if (stageNames) {
          const data: number[] = stageNames.map(item => item.totalAmount); // Data is numbers now

          const labels: string[] = stageNames.map(item => item.name); // Labels are strings

          const finalObject = {
            title: "Deal Revenue By Stage",
            data: data,
            labels: labels
          };

          return finalObject;
        } else {
          throw new Error("namesWithAverage is undefined");
        }
      }
    },

    filterTypes: [
      {
        fieldName: "dateRange",
        fieldType: "select",
        multi: true,
        fieldQuery: "date",
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: "Select date range",
        fieldDefaultValue: "all"
      },
      {
        fieldName: "boardId",
        fieldType: "select",
        fieldQuery: "boards",
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        fieldLabel: "Select boards"
      },
      {
        fieldName: "pipelineId",
        fieldType: "select",
        multi: false,
        fieldQuery: "pipelines",
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        logics: [
          {
            logicFieldName: "boardId",
            logicFieldVariable: "boardId"
          }
        ],
        fieldLabel: "Select pipeline"
      },
      {
        fieldName: "stageId",
        fieldType: "select",
        fieldQuery: "stages",
        multi: false,
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        logics: [
          {
            logicFieldName: "pipelineId",
            logicFieldVariable: "pipelineId"
          }
        ],
        fieldLabel: "Select stage"
      },
      {
        fieldName: "stageType",
        fieldType: "select",
        multi: false,
        fieldQuery: "stages",
        fieldOptions: PROBABILITY_DEAL,
        fieldLabel: "Select Probability"
      },
      {
        fieldName: "priority",
        fieldType: "select",
        multi: false,
        fieldQuery: "stages",
        fieldOptions: PRIORITY,
        fieldLabel: "Select Stage priority"
      }
    ]
  },
  {
    templateType: "ClosedRevenueByMonthWithDealTotalAndClosedRevenueBreakdown",
    name: "Closed revenue by month with deal total and closed revenue breakdown",
    chartTypes: [
      "bar",
      "line",
      "pie",
      "doughnut",
      "radar",
      "polarArea",
      "table"
    ],
    // Bar Chart Table
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string
    ) => {
      const { pipelineId, boardId, stageId, stageType } = filter;
      const matchedFilter = await filterData(filter, subdomain);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageId,
        stageType,
        PIPELINE_TYPE_DEAL,
        models
      );
      let query = await QueryFilter(filterPipelineId, matchedFilter);

      const totalDeals = await models?.Deals.find(query).sort({
        closedDate: -1
      });

      const monthNames: string[] = [];
      const monthlyDealsCount: number[] = [];
      if (totalDeals) {
        const now = new Date(); // Get the current date
        const startOfYear = new Date(now.getFullYear(), 0, 1); // Get the start of the year
        const endOfYear = new Date(now.getFullYear(), 12, 31); // Get the start of the year
        const endRange = dayjs(
          new Date(totalDeals.at(-1)?.createdAt || endOfYear)
        );

        let startRange = dayjs(startOfYear);
        while (startRange < endRange) {
          monthNames.push(startRange.format("MMMM"));

          const getStartOfNextMonth = startRange.add(1, "month").toDate();
          const getDealsCountOfMonth = totalDeals.filter(
            deal =>
              new Date(deal.createdAt || "").getTime() >=
                startRange.toDate().getTime() &&
              new Date(deal.createdAt || "").getTime() <
                getStartOfNextMonth.getTime()
          );
          monthlyDealsCount.push(getDealsCountOfMonth.length);
          startRange = startRange.add(1, "month");
        }
      }
      const title =
        "Closed revenue by month with deal total and closed revenue breakdown";
      const datasets = { title, data: monthlyDealsCount, labels: monthNames };

      return datasets;
    },
    filterTypes: [
      {
        fieldName: "assignedUserIds",
        fieldType: "select",
        multi: true,
        fieldQuery: "users",
        fieldLabel: "Select assigned users"
      },
      {
        fieldName: "dateRange",
        fieldType: "select",
        multi: true,
        fieldQuery: "date",
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: "Select date range",
        fieldDefaultValue: "all"
      },
      {
        fieldName: "branchIds",
        fieldType: "select",
        multi: true,
        fieldQuery: "branches",
        fieldLabel: "Select branches"
      },
      {
        fieldName: "departmentIds",
        fieldType: "select",
        multi: true,
        fieldQuery: "departments",
        fieldLabel: "Select departments"
      },
      {
        fieldName: "boardId",
        fieldType: "select",
        fieldQuery: "boards",
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        fieldLabel: "Select  board"
      },
      {
        fieldName: "pipelineId",
        fieldType: "select",
        multi: false,
        fieldQuery: "pipelines",
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        logics: [
          {
            logicFieldName: "boardId",
            logicFieldVariable: "boardId"
          }
        ],
        fieldLabel: "Select pipeline"
      },
      {
        fieldName: "stageId",
        fieldType: "select",
        fieldQuery: "stages",
        multi: false,
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        logics: [
          {
            logicFieldName: "pipelineId",
            logicFieldVariable: "pipelineId"
          }
        ],
        fieldLabel: "Select stage"
      },
      {
        fieldName: "stageType",
        fieldType: "select",
        multi: false,
        fieldQuery: "stages",
        fieldOptions: PROBABILITY_DEAL,
        fieldLabel: "Select Probability"
      },
      {
        fieldName: "priority",
        fieldType: "select",
        multi: false,
        fieldQuery: "stages",
        fieldOptions: PRIORITY,
        fieldLabel: "Select Stage priority"
      }
    ]
  },

  {
    templateType: "DealAmountAverageByRep",
    name: "Deal amount average by rep",
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
      const { pipelineId, boardId, stageId, stageType } = filter;
      const matchedFilter = await filterData(filter, subdomain);
      const selectedUserIds = filter.assignedUserIds || [];
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageId,
        stageType,
        PIPELINE_TYPE_DEAL,
        models
      );
      let query = await QueryFilter(filterPipelineId, matchedFilter);
      const deals = await models?.Deals.find(query);

      const dealCounts = calculateAverageDealAmountByRep(
        deals,
        selectedUserIds
      );
      const getTotalAssignedUserIds = await Promise.all(
        dealCounts.map(async result => {
          return await sendCoreMessage({
            subdomain,
            action: "users.find",
            data: {
              query: {
                _id: {
                  $in: result.userId
                }
              }
            },
            isRPC: true,
            defaultValue: []
          });
        })
      );
      const assignedUsersMap: Record<
        string,
        { fullName: string; amount: string }
      > = {};

      for (let i = 0; i < getTotalAssignedUserIds.length; i++) {
        const assignedUsers = getTotalAssignedUserIds[i];
        for (const assignedUser of assignedUsers) {
          const fullName = assignedUser.details?.fullName || assignedUser.email;
          assignedUsersMap[assignedUser._id] = {
            fullName: fullName,
            amount: dealCounts[i].amount || "0"
          };
        }
      }

      // Convert assignedUsersMap to an array of key-value pairs
      const assignedUsersArray: [
        string,
        { fullName: string; amount: string }
      ][] = Object.entries(assignedUsersMap);

      // Sort the array based on the amount values
      assignedUsersArray.sort(
        (a, b) => parseFloat(a[1].amount) - parseFloat(b[1].amount)
      );

      // Reconstruct the sorted object
      const sortedAssignedUsersMap: Record<
        string,
        { fullName: string; amount: string }
      > = {};
      for (const [userId, userInfo] of assignedUsersArray) {
        sortedAssignedUsersMap[userId] = userInfo;
      }

      // Extract sorted data and labels
      const sortedData = Object.values(sortedAssignedUsersMap).map(
        (t: any) => t.amount
      );
      const sortedLabels = Object.values(sortedAssignedUsersMap).map(
        (t: any) => t.fullName
      );

      const title = "Deal amount average by rep";
      const datasets = { title, data: sortedData, labels: sortedLabels };
      return datasets;
    },

    filterTypes: [
      {
        fieldName: "assignedUserIds",
        fieldType: "select",
        multi: true,
        fieldQuery: "users",
        fieldLabel: "Select assigned users"
      },
      {
        fieldName: "dateRange",
        fieldType: "select",
        multi: true,
        fieldQuery: "date",
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: "Select date range",
        fieldDefaultValue: "all"
      },
      {
        fieldName: "branchIds",
        fieldType: "select",
        multi: true,
        fieldQuery: "branches",
        fieldLabel: "Select branches"
      },
      {
        fieldName: "departmentIds",
        fieldType: "select",
        multi: true,
        fieldQuery: "departments",
        fieldLabel: "Select departments"
      },
      {
        fieldName: "boardId",
        fieldType: "select",
        fieldQuery: "boards",
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        fieldLabel: "Select  board"
      },
      {
        fieldName: "pipelineId",
        fieldType: "select",
        multi: false,
        fieldQuery: "pipelines",
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        logics: [
          {
            logicFieldName: "boardId",
            logicFieldVariable: "boardId"
          }
        ],
        fieldLabel: "Select pipeline"
      },
      {
        fieldName: "stageId",
        fieldType: "select",
        fieldQuery: "stages",
        multi: false,
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        logics: [
          {
            logicFieldName: "pipelineId",
            logicFieldVariable: "pipelineId"
          }
        ],
        fieldLabel: "Select stage"
      },
      {
        fieldName: "stageType",
        fieldType: "select",
        multi: false,
        fieldQuery: "stages",
        fieldOptions: PROBABILITY_DEAL,
        fieldLabel: "Select Probability"
      },
      {
        fieldName: "priority",
        fieldType: "select",
        multi: false,
        fieldQuery: "stages",
        fieldOptions: PRIORITY,
        fieldLabel: "Select Stage priority"
      }
    ]
  },

  {
    templateType: "DealLeaderBoardAmountClosedByRep",
    name: "Deal leader board - amount closed by rep",
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
      const { pipelineId, boardId, stageId, stageType } = filter;
      const matchedFilter = await filterData(filter, subdomain);
      const selectedUserIds = filter.assignedUserIds || [];
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageId,
        stageType,
        PIPELINE_TYPE_DEAL,
        models
      );
      let query = await QueryFilter(filterPipelineId, matchedFilter);

      const deals = await models?.Deals.find(query);

      const dealCounts = calculateAverageDealAmountByRep(
        deals,
        selectedUserIds
      );
      const getTotalAssignedUserIds = await Promise.all(
        dealCounts.map(async result => {
          return await sendCoreMessage({
            subdomain,
            action: "users.find",
            data: {
              query: {
                _id: {
                  $in: result.userId
                }
              }
            },
            isRPC: true,
            defaultValue: []
          });
        })
      );
      const assignedUsersMap: Record<
        string,
        { fullName: string; amount: string }
      > = {};

      for (let i = 0; i < getTotalAssignedUserIds.length; i++) {
        const assignedUsers = getTotalAssignedUserIds[i];
        for (const assignedUser of assignedUsers) {
          assignedUsersMap[assignedUser._id] = {
            fullName: assignedUser.details?.fullName,
            amount: dealCounts[i].amount // Match the amount with the correct index
          };
        }
      }
      const assignedUsersArray: [
        string,
        { fullName: string; amount: string }
      ][] = Object.entries(assignedUsersMap);

      // Sort the array based on the amount values
      assignedUsersArray.sort(
        (a, b) => parseFloat(a[1].amount) - parseFloat(b[1].amount)
      );

      // Reconstruct the sorted object
      const sortedAssignedUsersMap: Record<
        string,
        { fullName: string; amount: string }
      > = {};
      for (const [userId, userInfo] of assignedUsersArray) {
        sortedAssignedUsersMap[userId] = userInfo;
      }

      // Extract sorted data and labels
      const sortedData = Object.values(sortedAssignedUsersMap).map(
        (t: any) => t.amount
      );
      const sortedLabels = Object.values(sortedAssignedUsersMap).map(
        (t: any) => t.fullName
      );

      const title = "Deal amount average by rep";
      const datasets = { title, data: sortedData, labels: sortedLabels };
      return datasets;
    },
    filterTypes: [
      {
        fieldName: "assignedUserIds",
        fieldType: "select",
        multi: true,
        fieldQuery: "users",
        fieldLabel: "Select assigned users"
      },
      {
        fieldName: "dateRange",
        fieldType: "select",
        multi: true,
        fieldQuery: "date",
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: "Select date range",
        fieldDefaultValue: "all"
      },
      {
        fieldName: "branchIds",
        fieldType: "select",
        multi: true,
        fieldQuery: "branches",
        fieldLabel: "Select branches"
      },
      {
        fieldName: "departmentIds",
        fieldType: "select",
        multi: true,
        fieldQuery: "departments",
        fieldLabel: "Select departments"
      },
      {
        fieldName: "boardId",
        fieldType: "select",
        fieldQuery: "boards",
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        fieldLabel: "Select boards"
      },
      {
        fieldName: "pipelineId",
        fieldType: "select",
        multi: false,
        fieldQuery: "pipelines",
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        logics: [
          {
            logicFieldName: "boardId",
            logicFieldVariable: "boardId"
          }
        ],
        fieldLabel: "Select pipeline"
      },
      {
        fieldName: "stageId",
        fieldType: "select",
        fieldQuery: "stages",
        multi: false,
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        logics: [
          {
            logicFieldName: "pipelineId",
            logicFieldVariable: "pipelineId"
          }
        ],
        fieldLabel: "Select stage"
      },
      {
        fieldName: "stageType",
        fieldType: "select",
        multi: false,
        fieldQuery: "stages",
        fieldOptions: PROBABILITY_DEAL,
        fieldLabel: "Select Probability"
      },
      {
        fieldName: "priority",
        fieldType: "select",
        multi: false,
        fieldQuery: "stages",
        fieldOptions: PRIORITY,
        fieldLabel: "Select Stage priority"
      }
    ]
  },

  {
    templateType: "DealsByLastModifiedDate",
    name: "Deals by last modified date",
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
      const { pipelineId, boardId, stageId, stageType } = filter;
      const matchedFilter = await filterData(filter, subdomain);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageId,
        stageType,
        PIPELINE_TYPE_DEAL,
        models
      );
      let query = await QueryFilter(filterPipelineId, matchedFilter);

      const totalDeals = await models?.Deals.find(query)
        .sort({
          modifiedAt: -1
        })
        .limit(1000);
      const dealsCount = totalDeals?.map(deal => {
        return {
          dealName: deal.name,
          dealStage: deal.stageId,
          currentStatus: deal.status,
          lastModifiedDate: deal.modifiedAt,
          stageChangedDate: deal.stageChangedDate
        };
      });

      const sortedData = dealsCount?.sort((a, b) => {
        const dateA = new Date(a.lastModifiedDate ?? 0);
        const dateB = new Date(b.lastModifiedDate ?? 0);
        return dateB.getTime() - dateA.getTime();
      });

      const data = sortedData?.map((deal: any) => {
        const dateWithTime = new Date(deal.lastModifiedDate);
        const dateOnly = dateWithTime.toISOString().substring(0, 10); // Extract YYYY-MM-DD
        return dateOnly;
      });

      const labels = sortedData?.map((deal: any) => deal.dealName);
      const label = "Deals count by modified month";

      const datasets = {
        title: label,
        data,
        labels
      };
      return datasets;
    },

    filterTypes: [
      {
        fieldName: "assignedUserIds",
        fieldType: "select",
        multi: true,
        fieldQuery: "users",
        fieldLabel: "Select assigned users"
      },
      {
        fieldName: "dateRange",
        fieldType: "select",
        multi: true,
        fieldQuery: "date",
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: "Select date range",
        fieldDefaultValue: "all"
      },
      {
        fieldName: "branchIds",
        fieldType: "select",
        multi: true,
        fieldQuery: "branches",
        fieldLabel: "Select branches"
      },
      {
        fieldName: "departmentIds",
        fieldType: "select",
        multi: true,
        fieldQuery: "departments",
        fieldLabel: "Select departments"
      },
      {
        fieldName: "boardId",
        fieldType: "select",
        fieldQuery: "boards",
        multi: false,
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        fieldLabel: "Select boards"
      },
      {
        fieldName: "pipelineId",
        fieldType: "select",
        multi: false,
        fieldQuery: "pipelines",
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        logics: [
          {
            logicFieldName: "boardId",
            logicFieldVariable: "boardId"
          }
        ],
        fieldLabel: "Select pipeline"
      },
      {
        fieldName: "stageId",
        fieldType: "select",
        fieldQuery: "stages",
        multi: false,
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        logics: [
          {
            logicFieldName: "pipelineId",
            logicFieldVariable: "pipelineId"
          }
        ],
        fieldLabel: "Select stage"
      },
      {
        fieldName: "stageType",
        fieldType: "select",
        multi: false,
        fieldQuery: "stages",
        fieldOptions: PROBABILITY_DEAL,
        fieldLabel: "Select Probability"
      },
      {
        fieldName: "priority",
        fieldType: "select",
        multi: false,
        fieldQuery: "stages",
        fieldOptions: PRIORITY,
        fieldLabel: "Select Stage priority"
      }
    ]
  },

  {
    templateType: "DealsClosedLostAllTimeByRep",
    name: "Deals closed lost all time by rep",
    chartTypes: [
      "bar",
      "line",
      "pie",
      "doughnut",
      "radar",
      "polarArea",
      "table"
    ],
    // Bar Chart Table
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string
    ) => {
      const selectedUserIds = filter.assignedUserIds || [];
      const matchedFilter = await filterData(filter, subdomain);
      const { pipelineId, boardId, stageId, stageType } = filter;
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageType,
        stageId,
        PIPELINE_TYPE_DEAL,
        models
      );
      let query = await QueryFilter(filterPipelineId, matchedFilter);

      let dealCounts = await models?.Deals.find({
        ...query
      }).lean();

      if (dealCounts) {
        const data = await Promise.all(
          dealCounts.map(async item => {
            const getTotalRespondedUsers = await sendCoreMessage({
              subdomain,
              action: "users.find",
              data: {
                query: {
                  _id:
                    selectedUserIds.length > 0
                      ? { $in: selectedUserIds }
                      : { $in: item.assignedUserIds }
                }
              },
              isRPC: true,
              defaultValue: []
            });

            const processedUsers = await Promise.all(
              getTotalRespondedUsers.map(async user => {
                const fullName = user.details?.fullName || user.email;
                const counts = await models?.Deals.countDocuments({
                  status: "active",
                  assignedUserIds: user._id
                });
                return {
                  FullName: fullName,
                  _id: user._id,
                  count: counts || 0
                };
              })
            );

            // Flatten the array of arrays and remove duplicates based on _id
            const uniqueData = processedUsers.reduce((acc, val) => {
              acc[val._id] = val;
              return acc;
            }, {});

            return Object.values(uniqueData);
          })
        );

        const filteredData = data.filter(arr => arr.length > 0);
        const uniqueUserEntries = Array.from(
          new Set(filteredData.map(entry => JSON.stringify(entry))),
          str => JSON.parse(str)
        );

        const summedResultArray =
          await sumCountsByUserIdName(uniqueUserEntries);
        const filteredResult =
          selectedUserIds.length > 0
            ? summedResultArray.filter(user =>
                selectedUserIds.includes(user._id)
              )
            : summedResultArray;

        filteredResult.sort((a, b) => a.count - b.count);

        // Extract sorted data and labels
        const setData = filteredResult.map((item: any) => item.count);
        const setLabels = filteredResult.map((item: any) => item.fullName);

        const title = "Deals closed lost all time by rep";
        const datasets = { title, data: setData, labels: setLabels };
        return datasets;
      } else {
        throw new Error("No dealCounts found");
      }
    },
    filterTypes: [
      {
        fieldName: "assignedUserIds",
        fieldType: "select",
        multi: true,
        fieldQuery: "users",
        fieldLabel: "Select assigned users"
      },
      {
        fieldName: "dateRange",
        fieldType: "select",
        multi: true,
        fieldQuery: "date",
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: "Select date range",
        fieldDefaultValue: "all"
      },
      {
        fieldName: "branchIds",
        fieldType: "select",
        multi: true,
        fieldQuery: "branches",
        fieldLabel: "Select branches"
      },
      {
        fieldName: "departmentIds",
        fieldType: "select",
        multi: true,
        fieldQuery: "departments",
        fieldLabel: "Select departments"
      },
      {
        fieldName: "boardId",
        fieldType: "select",
        fieldQuery: "boards",
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        fieldLabel: "Select boards"
      },
      {
        fieldName: "pipelineId",
        fieldType: "select",
        multi: false,
        fieldQuery: "pipelines",
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        logics: [
          {
            logicFieldName: "boardId",
            logicFieldVariable: "boardId"
          }
        ],
        fieldLabel: "Select pipeline"
      },
      {
        fieldName: "stageId",
        fieldType: "select",
        fieldQuery: "stages",
        multi: false,
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        logics: [
          {
            logicFieldName: "pipelineId",
            logicFieldVariable: "pipelineId"
          }
        ],
        fieldLabel: "Select stage"
      },
      {
        fieldName: "stageType",
        fieldType: "select",
        multi: false,
        fieldQuery: "stages",
        fieldOptions: PROBABILITY_DEAL,
        fieldLabel: "Select Probability"
      },
      {
        fieldName: "priority",
        fieldType: "select",
        multi: false,
        fieldQuery: "stages",
        fieldOptions: PRIORITY,
        fieldLabel: "Select Stage priority"
      }
    ]
  },
  {
    templateType: "DealAverageTimeSpentInEachStage",
    name: "Deal Average Time Spent In Each Stage",
    chartTypes: [
      "bar",
      "line",
      "pie",
      "doughnut",
      "radar",
      "polarArea",
      "table"
    ],
    // Bar Chart Table
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string
    ) => {
      const { pipelineId, boardId, stageId, stageType } = filter;
      const matchedFilter = await filterData(filter, subdomain);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageType,
        stageId,
        PIPELINE_TYPE_DEAL,
        models
      );
      let query = await QueryFilter(filterPipelineId, matchedFilter);
      const deals = await models?.Deals.find({
        ...query
      });

      if (deals) {
        const totalStageTime: { [key: string]: number } = {};
        const stageCount: { [key: string]: number } = {};
        deals.forEach(deal => {
          const createdAtTime = deal.createdAt
            ? new Date(deal.createdAt).getTime()
            : undefined;
          const stageChangedTime = deal.stageChangedDate
            ? new Date(deal.stageChangedDate).getTime()
            : undefined;

          if (createdAtTime !== undefined && stageChangedTime !== undefined) {
            const timeSpent = stageChangedTime - createdAtTime;

            if (!totalStageTime[deal.stageId]) {
              totalStageTime[deal.stageId] = 0;
              stageCount[deal.stageId] = 0;
            }

            totalStageTime[deal.stageId] += timeSpent;
            stageCount[deal.stageId]++;
          }
        });

        const averageTimeSpent: { [key: string]: number } = {};
        for (const stageId in totalStageTime) {
          if (totalStageTime.hasOwnProperty(stageId)) {
            averageTimeSpent[stageId] =
              totalStageTime[stageId] / stageCount[stageId];
          }
        }

        const transformedResult = Object.entries(averageTimeSpent).map(
          ([stageId, average]) => ({
            _id: stageId,
            average: average.toString()
          })
        );

        const stageIds = transformedResult.map(item => item._id);
        const stageName = await models?.Stages.find({
          _id: { $in: stageIds }
        });

        const namesWithAverage = stageName
          ?.map(result => {
            const item = transformedResult.find(
              item => item._id === result._id
            );
            if (item) {
              const averageHours = Number(item.average) / 3600000; // Convert average from milliseconds to hours
              return {
                name: result.name,
                averageHours: averageHours
              };
            }
            return null; // Handle if stage ID is not found in transformedResult
          })
          .filter(
            (item): item is { name: string; averageHours: number } => !!item
          );

        if (namesWithAverage) {
          const data: number[] = namesWithAverage.map(
            item => item.averageHours
          ); // No need for parseFloat
          const labels: string[] = namesWithAverage.map(item => item.name); // Labels are strings

          const finalObject = {
            title: "Deal Average Time Spent In Each Stage",
            data: data,
            labels: labels
          };
          return finalObject;
        } else {
          throw new Error("namesWithAverage is undefined");
        }
      }
    },
    filterTypes: [
      {
        fieldName: "dateRange",
        fieldType: "select",
        multi: true,
        fieldQuery: "date",
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: "Select date range",
        fieldDefaultValue: "all"
      },
      {
        fieldName: "boardId",
        fieldType: "select",
        fieldQuery: "boards",
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        fieldLabel: "Select boards"
      },
      {
        fieldName: "pipelineId",
        fieldType: "select",
        multi: false,
        fieldQuery: "pipelines",
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        logics: [
          {
            logicFieldName: "boardId",
            logicFieldVariable: "boardId"
          }
        ],
        fieldLabel: "Select pipeline"
      },
      {
        fieldName: "stageId",
        fieldType: "select",
        fieldQuery: "stages",
        multi: false,
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        logics: [
          {
            logicFieldName: "pipelineId",
            logicFieldVariable: "pipelineId"
          }
        ],
        fieldLabel: "Select stage"
      },
      {
        fieldName: "stageType",
        fieldType: "select",
        multi: false,
        fieldQuery: "stages",
        fieldOptions: PROBABILITY_DEAL,
        fieldLabel: "Select Probability"
      },
      {
        fieldName: "priority",
        fieldType: "select",
        multi: false,
        fieldQuery: "stages",
        fieldOptions: PRIORITY,
        fieldLabel: "Select Stage priority"
      }
    ]
  },
  {
    templateType: "DealsOpenByCurrentStage",
    name: "Deals open by current stage",
    chartTypes: [
      "bar",
      "line",
      "pie",
      "doughnut",
      "radar",
      "polarArea",
      "table"
    ],
    // Bar Chart Table
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string
    ) => {
      const {
        pipelineId,
        boardId,
        stageId,
        stageType,
        dateRange,
        startDate,
        endDate
      } = filter;
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageType,
        stageId,
        PIPELINE_TYPE_DEAL,
        models
      );
      const matchfilter = {};
      const title = "Deals open by current stage";
      if (dateRange) {
        const dateFilter = returnDateRange(
          filter.dateRange,
          startDate,
          endDate
        );
        if (Object.keys(dateFilter).length) {
          matchfilter["createdAt"] = dateFilter;
        }
      }
      const stageCount = await models?.Stages.find({
        ...matchfilter,
        _id: { $in: filterPipelineId }
      });
      if (stageCount) {
        const groupedData: { [key: string]: string[] } = stageCount.reduce(
          (acc, curr) => {
            if (!acc[curr.pipelineId]) {
              acc[curr.pipelineId] = [];
            }
            acc[curr.pipelineId].push(curr.name);
            return acc;
          },
          {}
        );
        const datasets = {
          title: title,
          data: Object.entries(groupedData).map(([_, value]) => value.length),
          labels: Object.entries(groupedData).map(([_, value]) =>
            value.join(", ")
          )
        };
        return datasets;
      } else {
        const datasets = { title, data: [], labels: [] };
        return datasets;
      }
    },
    filterTypes: [
      {
        fieldName: "dateRange",
        fieldType: "select",
        multi: true,
        fieldQuery: "date",
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: "Select date range",
        fieldDefaultValue: "all"
      },
      {
        fieldName: "boardId",
        fieldType: "select",
        fieldQuery: "boards",
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        fieldLabel: "Select boards"
      },
      {
        fieldName: "pipelineId",
        fieldType: "select",
        multi: false,
        fieldQuery: "pipelines",
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        logics: [
          {
            logicFieldName: "boardId",
            logicFieldVariable: "boardId"
          }
        ],
        fieldLabel: "Select pipeline"
      },
      {
        fieldName: "stageId",
        fieldType: "select",
        fieldQuery: "stages",
        multi: false,
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        logics: [
          {
            logicFieldName: "pipelineId",
            logicFieldVariable: "pipelineId"
          }
        ],
        fieldLabel: "Select stage"
      },
      {
        fieldName: "stageType",
        fieldType: "select",
        multi: false,
        fieldQuery: "stages",
        fieldOptions: PROBABILITY_DEAL,
        fieldLabel: "Select Probability"
      },
      {
        fieldName: "priority",
        fieldType: "select",
        multi: false,
        fieldQuery: "stages",
        fieldOptions: PRIORITY,
        fieldLabel: "Select Stage priority"
      }
    ]
  },

  {
    templateType: "DealsClosedWonAllTimeByRep",
    name: "Deals closed won all time by rep",
    chartTypes: [
      "bar",
      "line",
      "pie",
      "doughnut",
      "radar",
      "polarArea",
      "table"
    ],
    // Bar Chart Table
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string
    ) => {
      const selectedUserIds = filter.assignedUserIds || [];
      const matchedFilter = await filterData(filter, subdomain);
      const { pipelineId, boardId, stageId, stageType } = filter;
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageId,
        stageType,
        PIPELINE_TYPE_DEAL,
        models
      );
      let query = await QueryFilter(filterPipelineId, matchedFilter);

      let dealCounts = await models?.Deals.find({
        ...query
      }).lean();

      if (dealCounts) {
        const data = await Promise.all(
          dealCounts.map(async item => {
            const getTotalRespondedUsers = await sendCoreMessage({
              subdomain,
              action: "users.find",
              data: {
                query: {
                  _id:
                    selectedUserIds.length > 0
                      ? { $in: selectedUserIds }
                      : { $in: item.assignedUserIds }
                }
              },
              isRPC: true,
              defaultValue: []
            });

            const processedUsers = await Promise.all(
              getTotalRespondedUsers.map(async user => {
                const fullName = user.details?.fullName || user.email;
                const counts = await models?.Deals.countDocuments({
                  status: "active",
                  assignedUserIds: user._id
                });
                return {
                  FullName: fullName,
                  _id: user._id,
                  count: counts || 0
                };
              })
            );

            // Flatten the array of arrays and remove duplicates based on _id
            const uniqueData = processedUsers.reduce((acc, val) => {
              acc[val._id] = val;
              return acc;
            }, {});

            return Object.values(uniqueData);
          })
        );

        const filteredData = data.filter(arr => arr.length > 0);
        const uniqueUserEntries = Array.from(
          new Set(filteredData.map(entry => JSON.stringify(entry))),
          str => JSON.parse(str)
        );

        const summedResultArray =
          await sumCountsByUserIdName(uniqueUserEntries);
        const filteredResult =
          selectedUserIds.length > 0
            ? summedResultArray.filter(user =>
                selectedUserIds.includes(user._id)
              )
            : summedResultArray;

        filteredResult.sort((a, b) => a.count - b.count);

        // Extract sorted data and labels
        const setData = filteredResult.map((item: any) => item.count);
        const setLabels = filteredResult.map((item: any) => item.fullName);

        const title = "Deals closed won all time by rep";
        const datasets = { title, data: setData, labels: setLabels };
        return datasets;
      } else {
        throw new Error("No dealCounts found");
      }
    },
    filterTypes: [
      {
        fieldName: "assignedUserIds",
        fieldType: "select",
        multi: true,
        fieldQuery: "users",
        fieldLabel: "Select assigned users"
      },
      {
        fieldName: "dateRange",
        fieldType: "select",
        multi: true,
        fieldQuery: "date",
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: "Select date range",
        fieldDefaultValue: "all"
      },
      {
        fieldName: "branchIds",
        fieldType: "select",
        multi: true,
        fieldQuery: "branches",
        fieldLabel: "Select branches"
      },
      {
        fieldName: "departmentIds",
        fieldType: "select",
        multi: true,
        fieldQuery: "departments",
        fieldLabel: "Select departments"
      },
      {
        fieldName: "boardId",
        fieldType: "select",
        fieldQuery: "boards",
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        fieldLabel: "Select boards"
      },
      {
        fieldName: "pipelineId",
        fieldType: "select",
        multi: false,
        fieldQuery: "pipelines",
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        logics: [
          {
            logicFieldName: "boardId",
            logicFieldVariable: "boardId"
          }
        ],
        fieldLabel: "Select pipeline"
      },
      {
        fieldName: "stageId",
        fieldType: "select",
        fieldQuery: "stages",
        multi: false,
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        logics: [
          {
            logicFieldName: "pipelineId",
            logicFieldVariable: "pipelineId"
          }
        ],
        fieldLabel: "Select stage"
      },
      {
        fieldName: "stageType",
        fieldType: "select",
        multi: false,
        fieldQuery: "stages",
        fieldOptions: PROBABILITY_DEAL,
        fieldLabel: "Select Probability"
      },
      {
        fieldName: "priority",
        fieldType: "select",
        multi: false,
        fieldQuery: "stages",
        fieldOptions: PRIORITY,
        fieldLabel: "Select Stage priority"
      }
    ]
  },
  {
    templateType: "DealsSales",
    name: "Deals sales",
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
      const { pipelineId, boardId, stageId, stageType } = filter;
      const filerData = await filterData(filter, subdomain);
      const data = await pipelineFilterData(
        filerData,
        pipelineId,
        boardId,
        stageType,
        models
      );
      return data;
    },
    filterTypes: [
      {
        fieldName: "assignedUserIds",
        fieldType: "select",
        multi: true,
        fieldQuery: "users",
        fieldLabel: "Select assigned users"
      },
      {
        fieldName: "dateRange",
        fieldType: "select",
        multi: true,
        fieldQuery: "date",
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: "Select date range",
        fieldDefaultValue: "all"
      },
      {
        fieldName: "branchIds",
        fieldType: "select",
        multi: true,
        fieldQuery: "branches",
        fieldLabel: "Select branches"
      },
      {
        fieldName: "departmentIds",
        fieldType: "select",
        multi: true,
        fieldQuery: "departments",
        fieldLabel: "Select departments"
      },
      {
        fieldName: "boardId",
        fieldType: "select",
        fieldQuery: "boards",
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        fieldLabel: "Select boards"
      },
      {
        fieldName: "pipelineId",
        fieldType: "select",
        multi: false,
        fieldQuery: "pipelines",
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        logics: [
          {
            logicFieldName: "boardId",
            logicFieldVariable: "boardId"
          }
        ],
        fieldLabel: "Select pipeline"
      },
      {
        fieldName: "stageId",
        fieldType: "select",
        fieldQuery: "stages",
        multi: false,
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        logics: [
          {
            logicFieldName: "pipelineId",
            logicFieldVariable: "pipelineId"
          }
        ],
        fieldLabel: "Select stage"
      },
      {
        fieldName: "stageType",
        fieldType: "select",
        multi: false,
        fieldQuery: "stages",
        fieldOptions: PROBABILITY_DEAL,
        fieldLabel: "Select Probability"
      },
      {
        fieldName: "priority",
        fieldType: "select",
        multi: false,
        fieldQuery: "stages",
        fieldOptions: PRIORITY,
        fieldLabel: "Select Stage priority"
      }
    ]
  }
];

const getChartResult = async ({ subdomain, data }) => {
  const models = await generateModels(subdomain);
  const { templateType, filter, dimension } = data;

  const template =
    chartTemplates.find(t => t.templateType === templateType) || ({} as any);

  return template.getChartResult(models, filter, dimension, subdomain);
};

export default {
  chartTemplates,
  reportTemplates,
  getChartResult
};

function amountProductData(deals: any[]): Promise<any[]> {
  return new Promise(resolve => {
    const repAmounts: Record<string, any> = {};

    deals.forEach(deal => {
      if (deal.productsData) {
        const { productsData } = deal;
        productsData.forEach(product => {
          if (product.amount) {
            if (!repAmounts[deal.stageId]) {
              repAmounts[deal.stageId] = {
                totalAmount: 0,
                stageId: deal.stageId
              };
            }

            repAmounts[deal.stageId].totalAmount += product.amount;
          }
        });
      }
    });

    // Convert the repAmounts object into an array
    const resultArray = Object.values(repAmounts);

    resolve(resultArray);
  });
}

// Function to calculate the average deal amounts by rep
function calculateAverageDealAmountByRep(deals: any, selectedUserIds: any) {
  const repAmounts = {};
  const dealCounts: Record<string, number> = {};

  if (selectedUserIds.length > 0) {
    selectedUserIds.forEach(userId => {
      repAmounts[userId] = { totalAmount: 0, count: 0 };
      dealCounts[userId] = 0;
    });
  }
  deals.forEach(deal => {
    if (deal.productsData && deal.status === "active") {
      const { productsData } = deal;

      productsData.forEach(product => {
        if (product.amount) {
          const { assignedUserIds } = deal;
          if (selectedUserIds.length > 0) {
            assignedUserIds.forEach(userId => {
              if (selectedUserIds.includes(userId)) {
                repAmounts[userId] = repAmounts[userId] || {
                  totalAmount: 0,
                  count: 0
                };
                repAmounts[userId].totalAmount += product.amount;
                repAmounts[userId].count += 1;

                // If you want counts for each user, increment the deal count
                dealCounts[userId] = (dealCounts[userId] || 0) + 1;
              }
            });
          } else {
            assignedUserIds.forEach(userId => {
              repAmounts[userId] = repAmounts[userId] || {
                totalAmount: 0,
                count: 0
              };
              repAmounts[userId].totalAmount += product.amount;
              repAmounts[userId].count += 1;
            });
          }
        }
      });
    }
  });

  const result: Array<{ userId: string; amount: string }> = [];

  // tslint:disable-next-line:forin
  for (const userId in repAmounts) {
    const { totalAmount, count } = repAmounts[userId];
    const averageAmount = count > 0 ? totalAmount / count : 0;

    result.push({ userId, amount: averageAmount.toFixed(3) });
  }

  return result;
}

function sumCountsByUserIdName(inputArray: any[]) {
  const resultMap = new Map<
    string,
    { count: number; fullName: string; _id: string }
  >();
  inputArray.forEach(userEntries => {
    userEntries.forEach(entry => {
      const userId = entry._id;
      const { count } = entry;

      if (resultMap.has(userId)) {
        resultMap.get(userId)!.count += count;
      } else {
        resultMap.set(userId, {
          count,
          fullName: entry.FullName,
          _id: entry._id
        });
      }
    });
  });

  return Array.from(resultMap.values());
}

async function filterData(filter: any, subdomain: any) {
  const {
    dateRange,
    startDate,
    endDate,
    assignedUserIds,
    branchIds,
    departmentIds,
    companyIds,
    stageId,
    stageIds,
    tagIds,
    pipelineLabels,
    groupIds,
    fieldIds,
    priority,
    attachment
  } = filter;
  const matchfilter = {};

  if (attachment === true) {
    matchfilter["attachments"] = { $ne: [] };
  }

  if (attachment === false) {
    matchfilter["attachments"] = { $eq: [] };
  }

  if (assignedUserIds) {
    matchfilter["assignedUserIds"] = { $in: assignedUserIds };
  }
  if (dateRange) {
    const dateFilter = returnDateRange(filter.dateRange, startDate, endDate);

    if (Object.keys(dateFilter).length) {
      matchfilter["createdAt"] = dateFilter;
    }
  }
  if (branchIds) {
    matchfilter["branchIds"] = { $in: branchIds };
  }
  if (departmentIds) {
    matchfilter["departmentIds"] = { $in: departmentIds };
  }

  if (stageId) {
    matchfilter["stageId"] = { $eq: stageId };
  }

  if (stageIds) {
    matchfilter["stageId"] = { $in: stageIds };
  }

  if (tagIds) {
    matchfilter["tagIds"] = { $in: tagIds };
  }
  if (pipelineLabels) {
    matchfilter["labelIds"] = { $in: pipelineLabels };
  }
  if (priority) {
    matchfilter["priority"] = { $eq: priority };
  }

  // FIELD GROUP FILTER
  if (groupIds && groupIds.length) {
    const fields = await sendCoreMessage({
      subdomain,
      action: "fields.find",
      data: {
        query: {
          groupId: { $in: groupIds }
        }
      },
      isRPC: true,
      defaultValue: []
    });

    const fieldIds = (fields || []).map(field => field._id);

    matchfilter["customFieldsData.field"] = { $in: fieldIds };
  }

  // FIELD FILTER
  if (fieldIds && fieldIds.length) {
    matchfilter["customFieldsData.field"] = { $in: fieldIds };
  }

  // COMPANY FILTER
  if (companyIds) {
    const conformities = await sendCoreMessage({
      subdomain,
      action: "conformities.findConformities",
      data: {
        relType: "company",
        relTypeId: { $in: companyIds }
      },
      isRPC: true,
      defaultValue: []
    });

    const mainTypeIds = conformities.map(conformity => conformity.mainTypeId);

    matchfilter["_id"] = { $in: mainTypeIds };
  }

  return matchfilter;
}

async function getStageIds(filter: any, type: string, models: IModels) {
  const { pipelineId, boardId, stageId, stageType } = filter;

  const probability = returnStage(stageType);

  const boards = await models.Boards.find({
    ...(boardId ? { _id: { $in: [boardId] } } : {}),
    type: type
  });

  const getBoardIds = (boards || []).map(board => board._id);

  const pipelines = await models.Pipelines.find({
    ...(pipelineId ? { _id: { $in: [pipelineId] } } : {}),
    boardId: {
      $in: getBoardIds
    },
    type: type
  });

  const getPipelineIds = (pipelines || []).map(pipeline => pipeline._id);

  const stages = await models.Stages.find({
    ...(stageId ? { _id: { $in: [stageId] } } : {}),
    ...(stageType ? { probability: { $eq: probability } } : {}),
    pipelineId: {
      $in: getPipelineIds
    },
    type: type
  });

  const getStageIds = (stages || []).map(stage => stage._id);

  return getStageIds;
}

async function pipelineFilterData(
  filter: any,
  models: IModels,
  pipelineId: any,
  boardId: any,
  stageType: any
) {
  let pipelineIds: string[] = [];
  let stageFilters = {};
  if (stageType) {
    const stageFilter = returnStage(stageType);
    // Check if stageFilter is not empty
    if (Object.keys(stageFilter).length) {
      stageFilters["probability"] = stageFilter;
    }
  }
  if (checkFilterParam(pipelineId)) {
    const findPipeline = await models?.Pipelines.find({
      _id: {
        $in: pipelineId
      },
      type: "deal",
      status: "active"
    });
    if (findPipeline) {
      pipelineIds.push(...findPipeline.map(item => item._id));
    }
  }
  if (checkFilterParam(boardId)) {
    const findBoard = await models?.Boards.find({
      _id: {
        $in: boardId
      },
      type: "deal"
    });
    if (findBoard) {
      const boardId = findBoard?.map(item => item._id);
      const pipeline = await models?.Pipelines.find({
        boardId: {
          $in: boardId
        },
        type: "deal",
        status: "active"
      });
      if (pipeline) {
        pipelineIds.push(...pipeline.map((item: any) => item._id));
      }
    }
  }

  const stages = await models?.Stages.find({
    ...stageFilters,
    pipelineId: {
      $in: pipelineIds
    },
    type: "deal"
  });
  const pipeline = stages?.map(item => item._id);

  const deals = await models?.Deals.find({
    ...filter,
    stageId: {
      $in: pipeline
    }
  }).lean();

  if (deals) {
    const dealAmount = await amountProductData(deals);

    const dealAmountMap = {};
    dealAmount.forEach(item => {
      dealAmountMap[item.stageId] = item.totalAmount;
    });

    // Assign totalAmount to each deal
    const groupStage = deals.map(deal => ({
      ...deal,
      productCount: deal.productsData?.length,
      totalAmount: dealAmountMap[deal.stageId]
    }));
    const title = "Deals sales and average";

    const filteredGroupStage = groupStage.filter(
      (item: any) => typeof item.totalAmount === "number"
    );

    // Sort the filtered array by totalAmount
    filteredGroupStage.sort((a, b) => a.totalAmount - b.totalAmount);

    // Extract sorted data and labels
    const data = filteredGroupStage.map((item: any) => item.totalAmount);
    const labels = filteredGroupStage.map(
      (item: any) => `Name: ${item.name}, Product Count: ${item.productCount}`
    );

    const datasets = { title, data, labels };
    return datasets;
  } else {
    throw new Error("No deals found");
  }
}

async function PipelineAndBoardFilter(
  pipelineId: string,
  boardId: string,
  stageType: string,
  stageId: string,
  type: string,
  models: IModels
) {
  let pipelineIds: string[] = [];

  let stageFilters = {};
  if (stageType) {
    const stageFilter = returnStage(stageType);
    // Check if stageFilter is not empty
    if (Object.keys(stageFilter).length) {
      stageFilters["probability"] = stageFilter;
    }
  }

  if (checkFilterParam(boardId)) {
    const findPipeline = await models?.Pipelines.find({
      boardId: {
        $in: boardId
      },
      type: type,
      status: "active"
    });
    if (findPipeline) {
      pipelineIds.push(...findPipeline.map(item => item._id));
    }
  }
  if (checkFilterParam(pipelineId)) {
    const findPipeline = await models?.Pipelines.find({
      _id: {
        $in: pipelineId
      },
      type: type,
      status: "active"
    });
    if (findPipeline) {
      pipelineIds.push(...findPipeline.map(item => item._id));
    }
  }
  if (checkFilterParam(stageId)) {
    const findStages = await models?.Stages.find({
      ...stageFilters,
      _id: {
        $in: stageId
      },
      type: type
    });
    if (findStages) {
      const stage_ids = findStages?.map(item => item._id);
      return stage_ids;
    }
  }
  let uniquePipelineIdsSet = new Set(pipelineIds);
  let uniquePipelineIds = Array.from(uniquePipelineIdsSet);
  const stages = await models?.Stages.find({
    ...stageFilters,
    pipelineId: {
      $in: uniquePipelineIds
    },
    type: type
  });
  const stage_ids = stages?.map(item => item._id);
  return stage_ids;
}

function QueryFilter(filterPipelineId: any, matchedFilter: any) {
  let constructedQuery: any = {};

  if (filterPipelineId && Object.keys(filterPipelineId).length > 0) {
    constructedQuery.stageId = { $in: filterPipelineId };
  }

  if (
    matchedFilter &&
    typeof matchedFilter === "object" &&
    Object.keys(matchedFilter).length > 0
  ) {
    constructedQuery = {
      ...constructedQuery,
      ...matchedFilter
    };
  }

  return constructedQuery;
}
