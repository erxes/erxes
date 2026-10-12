import type { Meta, StoryObj } from '@storybook/react';
import { SelectCompany } from 'frontend/libs/ui-modules/src/modules/contacts/components/SelectCompany';
import { GET_COMPANIES } from 'frontend/libs/ui-modules/src/modules/contacts/graphql/queries/getCompanies';

const meta: Meta<typeof SelectCompany> = {
  title: 'Modules/Contacts/SelectCompany',
  component: SelectCompany,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-xs w-full">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SelectCompany>;

const companiesList = [
  {
    _id: '1',
    primaryName: 'Acme Corporation',
    names: [],
    primaryEmail: 'info@acme.com',
    avatar: '',
  },
  {
    _id: '2',
    primaryName: 'Globex Corporation',
    names: [],
    primaryEmail: 'contact@globex.com',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=GC',
  },
];

export const Default: Story = {
  args: {
    onValueChange: (value: string) => alert(`Selected company ID: ${value}`),
  },
  parameters: {
    mocks: [
      {
        request: {
          query: GET_COMPANIES,
          variables: { page: 1, perPage: 20, searchValue: '' },
        },
        result: {
          data: {
            companiesMain: {
              list: companiesList,
              totalCount: 2,
            },
          },
        },
      },
    ],
  },
};

export const WithInitialValue: Story = {
  args: {
    value: '1',
    onValueChange: (value: string) => alert(`Selected company ID: ${value}`),
  },
  parameters: Default.parameters,
};

export const Empty: Story = {
  args: {},
  parameters: {
    mocks: [
      {
        request: {
          query: GET_COMPANIES,
          variables: { page: 1, perPage: 20, searchValue: '' },
        },
        result: {
          data: {
            companiesMain: {
              list: [],
              totalCount: 0,
            },
          },
        },
      },
    ],
  },
};

export const Loading: Story = {
  args: {},
  parameters: {
    mocks: [
      {
        request: {
          query: GET_COMPANIES,
          variables: { page: 1, perPage: 20, searchValue: '' },
        },
        result: undefined, // Simulate loading by not returning data
        delay: 2000,
      },
    ],
  },
};

export const Error: Story = {
  args: {},
  parameters: {
    mocks: [
      {
        request: {
          query: GET_COMPANIES,
          variables: { page: 1, perPage: 20, searchValue: '' },
        },
        error: new window.Error('Failed to fetch companies'),
      },
    ],
  },
};

export const SearchResult: Story = {
  args: {},
  parameters: {
    mocks: [
      {
        request: {
          query: GET_COMPANIES,
          variables: { page: 1, perPage: 20, searchValue: 'Globex' },
        },
        result: {
          data: {
            companiesMain: {
              list: [companiesList[1]],
              totalCount: 1,
            },
          },
        },
      },
    ],
  },
};

export const NoResults: Story = {
  args: {},
  parameters: {
    mocks: [
      {
        request: {
          query: GET_COMPANIES,
          variables: { page: 1, perPage: 20, searchValue: 'NotFound' },
        },
        result: {
          data: {
            companiesMain: {
              list: [],
              totalCount: 0,
            },
          },
        },
      },
    ],
  },
};
