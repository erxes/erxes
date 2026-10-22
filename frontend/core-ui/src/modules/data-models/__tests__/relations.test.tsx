import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import type { ComponentProps } from 'react';
import { print } from 'graphql';
import { DataModelRelationInput } from '../components/DataModelRelationInput';
import {
  DATA_MODEL_RELATION_OPTIONS,
  DATA_MODEL_RELATION_REFERENCES,
} from '../graphql';
import { DataModelRelationValue } from '../components/DataModelRelationValue';
import { DataModelReverseRelationValue } from '../components/DataModelReverseRelationValue';
import {
  createRecordDocuments,
  createReverseRelationDocument,
  recordFromWire,
  recordInputByName,
} from '../recordDocuments';
import { withBuiltinModelFields } from '../builtinDocuments';
import { gql } from '@apollo/client';
import { getWritableFields } from '../recordUtils';
import { field, model, record } from './fixtures';

const mockOpenRecord = jest.fn();
jest.mock('ui-modules', () => ({
  useSidePanel: () => ({ openRecord: mockOpenRecord }),
}));

jest.mock('erxes-ui', () => ({
  Button: (props: ComponentProps<'button'>) => <button {...props} />,
  Input: (props: ComponentProps<'input'>) => <input {...props} />,
  Checkbox: ({
    checked,
    disabled,
    onCheckedChange,
  }: {
    checked: boolean;
    disabled: boolean;
    onCheckedChange: () => void;
  }) => (
    <input
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={onCheckedChange}
    />
  ),
}));
const link = field({
  _id: 'building',
  name: 'building',
  label: 'Building',
  type: 'relation',
  relation: {
    targetModelId: 'building-model',
    multiple: false,
    inverseFieldId: 'assets',
    isInverse: false,
  },
});
const reverse = field({
  _id: 'assets',
  name: 'assets',
  type: 'relation',
  relation: {
    targetModelId: model._id,
    multiple: true,
    inverseFieldId: link._id,
    isInverse: true,
  },
});
const options = (search = '') => ({
  request: {
    query: DATA_MODEL_RELATION_OPTIONS,
    variables: { fieldId: link._id, search, limit: 25, offset: 0 },
  },
  result: {
    data: {
      dataModelRelationOptions: {
        list: [
          { _id: 'building-a', label: 'Headquarters', imageUrl: null },
          { _id: 'building-b', label: 'Warehouse', imageUrl: null },
        ],
        totalCount: 2,
      },
    },
  },
});
const references = (recordIds = ['building-a'], fieldId = link._id) => ({
  request: {
    query: DATA_MODEL_RELATION_REFERENCES,
    variables: { fieldId, recordIds },
  },
  result: {
    data: {
      dataModelRelationOptions: {
        list: [{ _id: recordIds[0], label: 'Headquarters', imageUrl: null }],
        totalCount: 1,
      },
    },
  },
});

it('selects one related record by its label and submits only its ID', async () => {
  const change = jest.fn();
  render(
    <MockedProvider mocks={[options()]}>
      <DataModelRelationInput
        field={link}
        value={null}
        onChange={change}
        id="building"
        disabled={false}
      />
    </MockedProvider>,
  );
  expect(screen.getByRole('status').textContent).toContain('Loading');
  fireEvent.click(await screen.findByLabelText('Headquarters'));
  expect(change).toHaveBeenCalledWith('building-a');
});

it('preserves selections across a search and adds to a multiple relation', async () => {
  const multiple = {
    ...link,
    relation: {
      ...link.relation,
      targetModelId: 'building-model',
      inverseFieldId: 'assets',
      isInverse: false,
      multiple: true,
    },
  };
  const change = jest.fn();
  render(
    <MockedProvider mocks={[options(), options('Warehouse'), references()]}>
      <DataModelRelationInput
        field={multiple}
        value={['building-a']}
        onChange={change}
        id="building"
        disabled={false}
      />
    </MockedProvider>,
  );
  await screen.findByLabelText('Warehouse');
  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: 'Warehouse' },
  });
  await waitFor(() => expect(screen.queryByRole('status')).toBeNull());
  fireEvent.click(screen.getByLabelText('Warehouse'));
  expect(change).toHaveBeenCalledWith(['building-a', 'building-b']);
});

it('resolves existing selections by ID even when they are not on the first picker page', async () => {
  render(
    <MockedProvider mocks={[options(), references(['off-page'])]}>
      <DataModelRelationInput
        field={link}
        value="off-page"
        onChange={jest.fn()}
        id="selected"
        disabled={false}
      />
    </MockedProvider>,
  );
  expect(
    await screen.findByRole('button', { name: 'Remove Headquarters' }),
  ).toBeTruthy();
  expect(screen.queryByText('off-page')).toBeNull();
});

it('opens custom record references through the existing side-panel navigator', async () => {
  render(
    <MockedProvider mocks={[references()]}>
      <DataModelRelationValue
        field={link}
        fields={[link]}
        read={() => 'building-a'}
      />
    </MockedProvider>,
  );
  fireEvent.click(await screen.findByRole('button', { name: 'Headquarters' }));
  expect(mockOpenRecord).toHaveBeenLastCalledWith(
    { contentType: 'core:dataModel_building-model', contentId: 'building-a' },
    { stack: true },
  );
});

it('opens a customer reference in the normal customer panel', async () => {
  const customer = {
    ...link,
    relation: {
      multiple: false,
      inverseFieldId: 'assets',
      isInverse: false,
      targetModelId: 'core:customer',
    },
  };
  render(
    <MockedProvider mocks={[references()]}>
      <DataModelRelationValue
        field={customer}
        fields={[customer]}
        read={() => 'building-a'}
      />
    </MockedProvider>,
  );
  fireEvent.click(await screen.findByRole('button', { name: 'Headquarters' }));
  expect(mockOpenRecord).toHaveBeenLastCalledWith(
    { contentType: 'core:customer', contentId: 'building-a' },
    { stack: true },
  );
});

it('does not offer navigation for a deleted or missing target', async () => {
  const missing = {
    ...references(),
    result: { data: { dataModelRelationOptions: { list: [], totalCount: 0 } } },
  };
  render(
    <MockedProvider mocks={[missing]}>
      <DataModelRelationValue
        field={link}
        fields={[link]}
        read={() => 'building-a'}
      />
    </MockedProvider>,
  );
  await screen.findByText('Unavailable record');
  expect(screen.queryByRole('button')).toBeNull();
});

it('pages reverse links rather than silently truncating them at 25', async () => {
  const query = createReverseRelationDocument(model, reverse);
  const ids = Array.from({ length: 26 }, (_, index) => ({
    _id: `asset-${index}`,
  }));
  const names = {
    request: {
      query: DATA_MODEL_RELATION_REFERENCES,
      variables: {
        fieldId: reverse._id,
        recordIds: ids.slice(0, 25).map((entry) => entry._id),
      },
    },
    result: {
      data: {
        dataModelRelationOptions: {
          list: ids
            .slice(0, 25)
            .map((entry) => ({ ...entry, label: entry._id, imageUrl: null })),
          totalCount: 25,
        },
      },
    },
  };
  render(
    <MockedProvider
      mocks={[
        {
          request: { query, variables: { _id: record._id, offset: 0 } },
          result: {
            data: {
              record: {
                __typename: 'DataModel_asset',
                _id: record._id,
                links: ids,
              },
            },
          },
        },
        {
          request: { query, variables: { _id: record._id, offset: 25 } },
          result: {
            data: {
              record: {
                __typename: 'DataModel_asset',
                _id: record._id,
                links: ids.slice(25),
              },
            },
          },
        },
        names,
        references(['asset-25'], reverse._id),
      ]}
    >
      <DataModelReverseRelationValue
        model={model}
        field={reverse}
        recordId={record._id}
      />
    </MockedProvider>,
  );
  await screen.findByText('Page 1');
  fireEvent.click(screen.getByRole('button', { name: 'Next links' }));
  await screen.findByText('Page 2');
  expect(
    screen.getByRole('button', { name: 'Next links' }).hasAttribute('disabled'),
  ).toBe(true);
  expect(
    screen
      .getByRole('button', { name: 'Previous links' })
      .hasAttribute('disabled'),
  ).toBe(false);
});

it('shows permission errors and provides a retry action', async () => {
  render(
    <MockedProvider
      mocks={[
        {
          ...options(),
          result: undefined,
          error: new Error('Related object access denied'),
        },
      ]}
    >
      <DataModelRelationInput
        field={link}
        value={null}
        onChange={jest.fn()}
        id="building"
        disabled={false}
      />
    </MockedProvider>,
  );
  expect((await screen.findByRole('alert')).textContent).toContain(
    'permission',
  );
  expect(screen.getByRole('button', { name: 'Try again' })).toBeTruthy();
});

it('generates nested selections for normal business and custom object queries and excludes reverse writes', () => {
  const documents = createRecordDocuments(model, [link, reverse]);
  expect(print(documents.list)).toMatch(/building\s*\{\s*_id/);
  const business = withBuiltinModelFields(
    gql`
      query contactsRelationTest {
        customerDetail {
          _id
        }
      }
    `,
    'customer',
    [link],
    [['customerDetail']],
  );
  expect(print(business)).toMatch(/building\s*\{\s*_id/);
  const wire = {
    ...record,
    building: { _id: 'building-a' },
    assets: [{ _id: 'asset-a' }],
  };
  expect(recordFromWire(wire, [link, reverse]).values).toEqual({
    building: 'building-a',
    assets: ['asset-a'],
  });
  expect(
    recordInputByName({ building: 'building-a', assets: ['asset-a'] }, [
      link,
      reverse,
    ]),
  ).toEqual({ building: 'building-a' });
  expect(getWritableFields(model, [link, reverse])).toEqual([link]);
});
