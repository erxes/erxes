import { IconBuildingSkyscraper, IconUser } from '@tabler/icons-react';
import { defineSearchProvider, getPersonName, readCursorList } from 'erxes-ui';

const UNNAMED = 'Unnamed';

type TCustomerNode = {
  _id: string;
  firstName?: string | null;
  lastName?: string | null;
  primaryEmail?: string | null;
  primaryPhone?: string | null;
};

export const customersSearchProvider = defineSearchProvider<TCustomerNode>({
  key: 'core-customers',
  label: 'Contacts',
  labelKey: 'contacts',
  labelNamespace: 'common',
  icon: IconUser,
  order: 10,
  selections: [
    {
      alias: 'gs_core_customers',
      field: 'customers',
      args: 'searchValue: $searchValue, limit: $limit',
      body: '{ list { _id firstName lastName primaryEmail primaryPhone } totalCount }',
    },
  ],
  select: (payload) => readCursorList<TCustomerNode>(payload, 'gs_core_customers'),
  toItem: (customer) => ({
    id: customer._id,
    title: getPersonName(customer, UNNAMED),
    description: customer.primaryEmail || customer.primaryPhone || undefined,
    path: `/contacts/customers?contactId=${customer._id}`,
  }),
});

type TCompanyNode = {
  _id: string;
  primaryName?: string | null;
  primaryEmail?: string | null;
  primaryPhone?: string | null;
};

export const companiesSearchProvider = defineSearchProvider<TCompanyNode>({
  key: 'core-companies',
  label: 'Companies',
  labelKey: 'companies',
  labelNamespace: 'common',
  icon: IconBuildingSkyscraper,
  order: 20,
  selections: [
    {
      alias: 'gs_core_companies',
      field: 'companies',
      args: 'searchValue: $searchValue, limit: $limit',
      body: '{ list { _id primaryName primaryEmail primaryPhone } totalCount }',
    },
  ],
  select: (payload) => readCursorList<TCompanyNode>(payload, 'gs_core_companies'),
  toItem: (company) => ({
    id: company._id,
    title: company.primaryName || UNNAMED,
    description: company.primaryEmail || company.primaryPhone || undefined,
    path: `/contacts/companies?companyId=${company._id}`,
  }),
});
