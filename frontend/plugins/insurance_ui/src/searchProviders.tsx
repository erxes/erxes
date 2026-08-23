import { IconFileText, IconUser } from '@tabler/icons-react';
import {
  defineSearchProvider,
  getPersonName,
  ISearchProvider,
  readArray,
} from 'erxes-ui';

const UNNAMED = 'Unnamed';

type TContractNode = {
  id: string;
  createdAt?: string | null;
  contractNumber?: string | null;
  insuredObject?: Record<string, unknown> | null;
  customer?: {
    firstName?: string | null;
    lastName?: string | null;
    registrationNumber?: string | null;
  } | null;
};

const contractsSearchProvider = defineSearchProvider<TContractNode>({
  key: 'insurance-contracts',
  label: 'Contracts',
  icon: IconFileText,
  order: 260,
  selections: [
    {
      alias: 'gs_insurance_contracts',
      field: 'contracts',
      args: 'searchValue: $searchValue, orderBy: $orderBy',
      body: '{ id contractNumber insuredObject customer { firstName lastName registrationNumber } createdAt }',
    },
  ],
  select: (payload) => {
    const nodes = readArray<TContractNode>(payload, 'gs_insurance_contracts');
    return {
      nodes,
      totalCount: nodes.length,
      pageInfo: { hasNextPage: false, endCursor: null },
    };
  },
  toItem: (contract) => ({
    id: contract.id,
    title: contract.contractNumber || UNNAMED,
    createdAt: contract.createdAt ?? undefined,
    matchFields: [
      {
        label: 'Plate number',
        value:
          typeof contract.insuredObject?.['Улсын дугаар'] === 'string'
            ? contract.insuredObject['Улсын дугаар']
            : undefined,
      },
      {
        label: 'Customer name',
        value: [contract.customer?.firstName, contract.customer?.lastName]
          .filter(Boolean)
          .join(' '),
      },
      {
        label: 'Customer registration',
        value: contract.customer?.registrationNumber,
      },
    ].flatMap(({ label, value }) => (value ? [{ label, value }] : [])),
    path: `/insurance/contracts/${contract.id}`,
  }),
});

type TInsuranceCustomerNode = {
  id: string;
  createdAt?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  companyName?: string | null;
  email?: string | null;
  phone?: string | null;
  registrationNumber?: string | null;
};

const customersSearchProvider = defineSearchProvider<TInsuranceCustomerNode>({
  key: 'insurance-customers',
  label: 'Insurance customers',
  icon: IconUser,
  order: 270,
  selections: [
    {
      alias: 'gs_insurance_customers',
      field: 'insuranceCustomers',
      args: 'search: $searchValue, limit: $limit, orderBy: $orderBy',
      body: '{ id firstName lastName companyName email phone registrationNumber createdAt }',
    },
  ],
  select: (payload) => {
    const nodes = readArray<TInsuranceCustomerNode>(
      payload,
      'gs_insurance_customers',
    );
    return {
      nodes,
      totalCount: nodes.length,
      pageInfo: { hasNextPage: false, endCursor: null },
    };
  },
  toItem: (customer) => ({
    id: customer.id,
    title:
      customer.companyName ||
      getPersonName(customer, customer.email || UNNAMED),
    description: customer.email || customer.phone || undefined,
    createdAt: customer.createdAt ?? undefined,
    matchFields: customer.registrationNumber
      ? [
          {
            label: 'Registration number',
            value: customer.registrationNumber,
          },
        ]
      : undefined,
    path: `/insurance/customers/${customer.id}`,
  }),
});

export const SEARCH_PROVIDERS: ISearchProvider[] = [
  contractsSearchProvider,
  customersSearchProvider,
];
