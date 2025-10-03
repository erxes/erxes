import type { Meta, StoryObj } from '@storybook/react';
import { SelectCustomer } from 'frontend/libs/ui-modules/src/modules/contacts/components/SelectCustomer';
import { GET_CUSTOMERS } from 'frontend/libs/ui-modules/src/modules/contacts/graphql/queries/getCustomers';

const meta: Meta<typeof SelectCustomer> = {
  title: 'Modules/Contacts/SelectCustomer',
  component: SelectCustomer,
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
type Story = StoryObj<typeof SelectCustomer>;

const customersList = [
  {
    _id: '1',
    firstName: 'Jane',
    middleName: '',
    lastName: 'Doe',
    avatar: '',
    primaryEmail: 'jane.doe@example.com',
    primaryPhone: '+1234567890',
  },
  {
    _id: '2',
    firstName: 'John',
    middleName: '',
    lastName: 'Smith',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=JS',
    primaryEmail: 'john.smith@example.com',
    primaryPhone: '+1987654321',
  },
];

export const Default: Story = {
  args: {
    onValueChange: (value: string | string[]) => alert(`Selected customer ID: ${value}`),
  },
  parameters: {
    mocks: [
      {
        request: {
          query: GET_CUSTOMERS,
          variables: { page: 1, perPage: 20, searchValue: '' },
        },
        result: {
          data: {
            customersMain: {
              list: customersList,
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
    value: ['1'],
    onValueChange: (value: string | string[]) => alert(`Selected customer ID: ${value}`),
  },
  parameters: Default.parameters,
};

export const Empty: Story = {
  args: {},
  parameters: {
    mocks: [
      {
        request: {
          query: GET_CUSTOMERS,
          variables: { page: 1, perPage: 20, searchValue: '' },
        },
        result: {
          data: {
            customersMain: {
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
          query: GET_CUSTOMERS,
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
          query: GET_CUSTOMERS,
          variables: { page: 1, perPage: 20, searchValue: '' },
        },
        error: new window.Error('Failed to fetch customers'),
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
          query: GET_CUSTOMERS,
          variables: { page: 1, perPage: 20, searchValue: 'John' },
        },
        result: {
          data: {
            customersMain: {
              list: [customersList[1]],
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
          query: GET_CUSTOMERS,
          variables: { page: 1, perPage: 20, searchValue: 'NotFound' },
        },
        result: {
          data: {
            customersMain: {
              list: [],
              totalCount: 0,
            },
          },
        },
      },
    ],
  },
};
