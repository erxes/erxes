import SelectCustomers from '@erxes/ui-contacts/src/customers/containers/SelectCustomers';
import SelectCompanies from '@erxes/ui-contacts/src/companies/containers/SelectCompanies';
import { SelectTeamMembers } from '@erxes/ui/src';
export const PROPERTY_FIELD = [
  {
    value: 'size',
    label: 'Size'
  },
  {
    value: 'amount',
    label: 'Amount'
  },
  {
    value: 'state',
    label: 'State'
  }
];

export const PROPERTY_OPERATOR = {
  String: [
    {
      value: 'set',
      label: 'Set'
    },
    {
      value: 'concat',
      label: 'Concat'
    }
  ],
  Date: [
    {
      value: 'set',
      label: 'Set'
    },
    {
      value: 'addDay',
      label: 'Add Day'
    },
    {
      value: 'subtractDay',
      label: 'Subtract Day'
    }
  ],
  Number: [
    {
      value: 'add',
      label: 'Add'
    },
    {
      value: 'subtract',
      label: 'subtract'
    },
    {
      value: 'multiply',
      label: 'Multiply'
    },
    {
      value: 'divide',
      label: 'Divide'
    }
  ],
  Default: [
    {
      value: 'set',
      label: 'Set'
    }
  ]
};

export const RECIPIENT_TYPES = [
  {
    label: 'Team Member',
    value: 'team_member',
    name: 'teamMemberIds',
    component: SelectTeamMembers
  },
  {
    label: 'Lead',
    value: 'lead',
    name: 'leadIds',
    component: SelectCustomers
  },
  {
    label: 'Customer',
    value: 'customer',
    name: 'customerIds',
    component: SelectCustomers
  },
  {
    label: 'Company',
    value: 'company',
    name: 'companyIds',
    component: SelectCompanies
  },
  {
    label: 'Custom Mail',
    value: 'customMail'
  }
];
