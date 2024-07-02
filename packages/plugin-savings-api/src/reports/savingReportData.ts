import BigNumber from "bignumber.js";
import { IModels } from "../connectionResolver";
import * as moment from "moment";
import { generateChartData, generateData } from "./utils";

const DIMENSION_OPTIONS = [
  {
    label: "Number",
    value: "number",
    aggregate: { project: { path: "number", value: 1 } }
  },
  {
    label: "Status",
    value: "status",
    aggregate: { project: { path: "status", value: 1 } }
  },
  {
    label: "Duration",
    value: "duration",
    aggregate: { project: { path: "duration", value: 1 } }
  },
  {
    label: "Interest Rate",
    value: "interestRate",
    aggregate: { project: { path: "interestRate", value: 1 } }
  },
  {
    label: "Close Interest Rate",
    value: "closeInterestRate",
    aggregate: { project: { path: "closeInterestRate", value: 1 } }
  },
  {
    label: "Contract Type",
    value: "contractType",
    aggregate: {
      project: {
        path: "contractType",
        value: "$contractType.name"
      },
      lookup: [
        {
          $lookup: {
            from: "saving_contract_types", // The collection name in MongoDB (usually the plural of the model name)
            localField: "contractTypeId", // The field from the Order collection
            foreignField: "_id", // The field from the User collection
            as: "contractType" // The field to add the results
          }
        },
        {
          $unwind: "$contractType" // Deconstruct the array field from the $lookup stage
        }
      ]
    }
  },
  {
    label: "StartDate",
    value: "startDate",
    format: (v: Date | undefined) => v && moment(v).format("YYYY-MM-DD"),
    aggregate: { project: { path: "startDate", value: 1 } }
  },
  {
    label: "EndDate",
    value: "endDate",
    format: (v: Date | undefined) => v && moment(v).format("YYYY-MM-DD"),
    aggregate: { project: { path: "endDate", value: 1 } }
  }
];

const MEASURE_OPTIONS = [
  {
    label: "Saving Amount",
    value: "savingAmount",
    aggregate: { project: { path: "savingAmount", value: 1 } },
    format: (v: number = 0) => new BigNumber(v).toFormat()
  },
  {
    label: "Clock Amount",
    value: "blockAmount",
    aggregate: { project: { path: "blockAmount", value: 1 } },
    format: (v: number = 0) => new BigNumber(v).toFormat()
  },
  {
    label: "Stored Interest",
    value: "storedInterest",
    aggregate: { project: { path: "storedInterest", value: 1 } },
    format: (v: number = 0) => new BigNumber(v).toFormat()
  }
];

const loanReportData = {
  templateType: "savingReportData",
  serviceType: "savings",
  name: "Saving Data",
  chartTypes: ["table"],
  getChartResult: async (models: IModels, filter: any, chartType: string) => {
    const title = "Saving Data";

    if (!filter.dimension && filter.dimension?.length == 0) {
      filter.dimension = ["number"];
    }

    if (filter.measure && filter.measure?.length == 0) {
      filter.measure = ["savingAmount"];
    }

    const data = await generateData(
      models,
      "Contracts",
      DIMENSION_OPTIONS,
      MEASURE_OPTIONS,
      filter,
      chartType
    );

    if (chartType !== "table") {
      let chartData = generateChartData(
        data,
        filter.dimension[0],
        filter.measure[0]
      );
      return { title, data: chartData.data, labels: chartData.labels };
    }

    return { title, data };
  },

  filterTypes: [
    {
      fieldName: "branchId",
      fieldType: "select",
      multi: false,
      fieldQuery: "branches",
      fieldLabel: "Select branches"
    },
    {
      fieldName: "customerId",
      fieldType: "select",
      fieldQuery: "customers",
      multi: false,
      fieldOptions: "customerId",
      fieldLabel: "Select source"
    },
    {
      fieldName: "dimension",
      fieldType: "select",
      multi: true,
      fieldOptions: DIMENSION_OPTIONS,
      fieldDefaultValue: ["number"],
      fieldLabel: "Select dimension"
    },
    {
      fieldName: "measure",
      fieldType: "select",
      multi: true,
      fieldOptions: MEASURE_OPTIONS,
      fieldDefaultValue: ["loanBalanceAmount"],
      fieldLabel: "Select measure"
    }
  ]
};

export default loanReportData;
