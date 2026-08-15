import { IconFileText, IconUser } from '@tabler/icons-react';
import {
  defineSearchProvider,
  getPersonName,
  ISearchProvider,
  readCursorList,
} from 'erxes-ui';

const UNNAMED = 'Unnamed';

type TContractNode = {
  id: string;
  contractNumber?: string | null;
};

const contractsSearchProvider = defineSearchProvider<TContractNode>({
  key: 'insurance-contracts',
  label: 'Contracts',
  icon: IconFileText,
  order: 260,
  selections: [
    {
      alias: 'gs_insurance_contracts',
      field: 'insuranceGlobalSearchContracts',
      args: 'searchValue: $searchValue, limit: $limit, cursor: $cursor, direction: forward',
      body: '{ list { id contractNumber } totalCount pageInfo { hasNextPage endCursor } }',
    },
  ],
  select: (payload) =>
    readCursorList<TContractNode>(payload, 'gs_insurance_contracts'),
  toItem: (contract) => ({
    id: contract.id,
    title: contract.contractNumber || UNNAMED,
    path: `/insurance/contracts/${contract.id}`,
  }),
});

type TInsuranceCustomerNode = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  companyName?: string | null;
  email?: string | null;
  phone?: string | null;
};

const customersSearchProvider = defineSearchProvider<TInsuranceCustomerNode>({
  key: 'insurance-customers',
  label: 'Insurance customers',
  icon: IconUser,
  order: 270,
  selections: [
    {
      alias: 'gs_insurance_customers',
      field: 'insuranceGlobalSearchCustomers',
      args: 'searchValue: $searchValue, limit: $limit, cursor: $cursor, direction: forward',
      body: '{ list { id firstName lastName companyName email phone } totalCount pageInfo { hasNextPage endCursor } }',
    },
  ],
  select: (payload) =>
    readCursorList<TInsuranceCustomerNode>(payload, 'gs_insurance_customers'),
  toItem: (customer) => ({
    id: customer.id,
    title:
      customer.companyName ||
      getPersonName(customer, customer.email || UNNAMED),
    description: customer.email || customer.phone || undefined,
    path: `/insurance/customers/${customer.id}`,
  }),
});

export const SEARCH_PROVIDERS: ISearchProvider[] = [
  contractsSearchProvider,
  customersSearchProvider,
];
