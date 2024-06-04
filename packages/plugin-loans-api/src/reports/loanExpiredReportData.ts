import BigNumber from 'bignumber.js';
import { IModels } from '../connectionResolver';
import * as moment from 'moment';
import * as __ from 'lodash';

export async function loanExpiredReportData(models: IModels, filter: any) {
  const result = await models.Contracts.aggregate([
    {
      $group: {
        _id: '$classification',
        total_groups: { $sum: 1 }
      }
    }
  ]);

  return result;
}

const DIMENSION_OPTIONS = [
  {
    label: 'Number',
    value: 'number',
    aggregate: { path: 'number', value: 1 }
  },
  {
    label: 'Classification',
    value: 'classification',
    aggregate: { path: 'classification', value: 1 }
  },
  {
    label: 'Interest Rate',
    value: 'interestRate',
    aggregate: { path: 'interestRate', value: 1 }
  },
  {
    label: 'Loss Percent',
    value: 'lossPercent',
    aggregate: { path: 'lossPercent', value: 1 }
  },
  {
    label: 'Contract Type',
    value: 'contractType',
    aggregate: {
      path: 'contractType',
      value: '$contractType.name',
      lookup: [
        {
          $lookup: {
            from: 'loan_contract_types', // The collection name in MongoDB (usually the plural of the model name)
            localField: 'contractTypeId', // The field from the Order collection
            foreignField: '_id', // The field from the User collection
            as: 'contractType' // The field to add the results
          }
        },
        {
          $unwind: '$contractType' // Deconstruct the array field from the $lookup stage
        }
      ]
    }
  },
  {
    label: 'StartDate',
    value: 'startDate',
    format: (v: Date | undefined) => v && moment(v).format('YYYY-MM-DD'),
    aggregate: { path: 'startDate', value: 1 }
  },
  {
    label: 'EndDate',
    value: 'endDate',
    format: (v: Date | undefined) => v && moment(v).format('YYYY-MM-DD'),
    aggregate: { path: 'endDate', value: 1 }
  },
  {
    label: 'MustPayDate',
    value: 'mustPayDate',
    format: (v: Date | undefined) => v && moment(v).format('YYYY-MM-DD'),
    aggregate: { path: 'mustPayDate', value: 1 }
  }
];

const MEASURE_OPTIONS = [
  {
    label: 'Margin amount',
    value: 'marginAmount',
    aggregate: { path: 'marginAmount', value: 1 },
    format: (v: number = 0) => new BigNumber(v).toFormat()
  },
  {
    label: 'Balance Amount',
    value: 'loanBalanceAmount',
    aggregate: { path: 'loanBalanceAmount', value: 1 },
    format: (v: number = 0) => new BigNumber(v).toFormat()
  },
  {
    label: 'Loan Amount',
    value: 'leaseAmount',
    aggregate: { path: 'leaseAmount', value: 1 },
    format: (v: number = 0) => new BigNumber(v).toFormat()
  },
];

const loanReportData = {
  templateType: 'loanExpiredReportData',
  serviceType: 'loans',
  name: 'Loan Expired Data',
  chartTypes: ['table', 'bar'],
  getChartResult: async (models: IModels, filter: any, chartType: string) => {
    try {
      let filterValue: any = {};

      if (filter.leaseExpertId) {
        filterValue.leaseExpertId = filter.leaseExpertId;
      }

      let aggregate: any = [{ $project: { _id: 0 } }];
      let project: any = { _id: 0 };

      if (filter.dimension) {
        for (let key of filter.dimension) {
          const dimension = DIMENSION_OPTIONS.find((row) => row.value == key);
          if (dimension) {
            if (__.isArray(dimension.aggregate)) {
              aggregate = [...aggregate, ...dimension.aggregate];
            } else if (__.isObject(dimension.aggregate)) {
              __.set(
                project,
                dimension.aggregate.path,
                dimension.aggregate.value
              );
              if (dimension.aggregate.lookup) {
                aggregate = [...aggregate, ...dimension.aggregate.lookup];
              }
            }
          }
        }
      }

      if (filter.measure) {
        for (let key of filter.measure) {
          const measure = MEASURE_OPTIONS.find((row) => row.value == key);
          if (measure) {
            if (__.isArray(measure.aggregate)) {
              aggregate = [...aggregate, ...measure.aggregate];
            } else if (__.isObject(measure.aggregate)) {
              __.set(project, measure.aggregate.path, measure.aggregate.value);
            }
          }
        }
      }

      const contractData = await models.Contracts.aggregate([
        ...aggregate,
        { $project: project }
      ]);

      contractData.forEach((row) => {
        DIMENSION_OPTIONS.forEach((field) => {
          if (field.format) {
            row[field.value] = field.format(row[field.value]);
          }
        });
        MEASURE_OPTIONS.forEach((field) => {
          if (field.format) {
            row[field.value] = field.format(row[field.value]);
          }
        });
      });

      const title = 'Loan expiration Data';

      const datasets = { title, data: contractData };

      return datasets;
    } catch (error) {
      console.log('error', error);
    }
  },

  filterTypes: [
    {
      fieldName: 'leaseExpertId',
      fieldType: 'select',
      multi: false,
      fieldQuery: 'users',
      fieldLabel: 'Select lease expert'
    },
    {
      fieldName: 'branchId',
      fieldType: 'select',
      multi: false,
      fieldQuery: 'branches',
      fieldLabel: 'Select branches'
    },
    {
      fieldName: 'customerId',
      fieldType: 'select',
      fieldQuery: 'customers',
      multi: false,
      fieldOptions: 'customerId',
      fieldLabel: 'Select source'
    },
    {
      fieldName: 'dimension',
      fieldType: 'select',
      multi: true,
      fieldOptions: DIMENSION_OPTIONS,
      fieldDefaultValue: ['number'],
      fieldLabel: 'Select dimension'
    },
    {
      fieldName: 'measure',
      fieldType: 'select',
      multi: true,
      fieldOptions: MEASURE_OPTIONS,
      fieldDefaultValue: ['loanBalanceAmount'],
      fieldLabel: 'Select measure'
    }
  ]
};

export default loanReportData;
