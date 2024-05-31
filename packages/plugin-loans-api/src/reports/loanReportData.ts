import { IModels } from '../connectionResolver';

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
  { label: 'Team members', value: 'teamMember' },
  { label: 'Departments', value: 'department' },
  { label: 'Branches', value: 'branch' },
  { label: 'Companies', value: 'company' },
  { label: 'Customers', value: 'customer' },
  { label: 'Products', value: 'product' },
  { label: 'Boards', value: 'board' },
  { label: 'Pipelines', value: 'pipeline' },
  { label: 'Stages', value: 'stage' },
  { label: 'Card', value: 'card' },
  { label: 'Tags', value: 'tag' },
  { label: 'Labels', value: 'label' },
  { label: 'Frequency (day, week, month)', value: 'frequency' },
  { label: 'Status', value: 'status' },
  { label: 'Priority', value: 'priority' }
];

const loanReportData = {
  templateType: 'loanReportData',
  serviceType: 'loans',
  name: 'Loan Data',
  chartTypes: ['table'],
  getChartResult: async () => {
    const data = [0, 1, 5, 6, 5];

    const labels = ['normal', 'expired', 'doubtful', 'negative', 'bad'];

    const title = 'Loan expiration Data';

    const datasets = { title, data, labels };

    return datasets;
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
      fieldDefaultValue: ['teamMember'],
      fieldLabel: 'Select dimension'
    }
  ]
};

export default loanReportData;
