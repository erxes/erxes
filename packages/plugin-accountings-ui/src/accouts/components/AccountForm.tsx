import React from 'react';
import CustomForm from '../../components/form';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import { accountQuery } from '../graphql/query';
import { IAccountDocument } from '../../types/IAccount';
import { IOption } from '@erxes/ui/src/types';

export function generateCategoryOptions(
  array: IAccountDocument[] = []
): IOption[] {
  return array.map((node, level) => ({
    value: node._id,
    label: `${'\u00A0 \u00A0 '.repeat(level)} ${node.code} - ${node.name}`
  }));
}

interface IProps {
  mutation: string;
  defaultValue?: any;
  closeModal: () => void;
  queryParams: any;
  successMessage: string;
}

function AccountForm(props: IProps): React.ReactNode {
  return (
    <CustomForm
      {...props}
      fields={[
        [
          {
            label: 'code',
            name: 'code',
            type: 'input'
          },
          {
            label: 'name',
            name: 'name',
            type: 'input'
          },
          {
            label: 'category',
            name: 'categoryId',
            type: 'selectWithSearch',
            selectProps: {
              filterParams: {},
              multi: false,
              queryName: 'accountCategories',
              generateOptions: generateCategoryOptions,
              customQuery: accountQuery.accountCategories
            }
          },
          {
            label: 'parent',
            name: 'parentId',
            type: 'selectWithSearch',
            selectProps: {
              filterParams: {},
              multi: false,
              queryName: 'accounts',
              generateOptions: generateCategoryOptions,
              customQuery: accountQuery.accounts
            }
          },
          {
            label: 'currency',
            name: 'currency',
            type: 'input'
          },

          {
            label: 'description',
            name: 'description',
            type: 'input',
            controlProps: {
              componentclass: 'textarea'
            }
          }
        ],
        [
          {
            label: 'journal',
            name: 'journal',
            type: 'select',
            controlProps: {
              options: [
                { label: 'main', value: 'main' },
                { label: 'cash', value: 'cash' },
                { label: 'bank', value: 'bank' },
                { label: 'debt', value: 'debt' },
                { label: 'inventory', value: 'inventory' },
                { label: 'fixedAsset', value: 'fixedAsset' },
                { label: 'vat', value: 'vat' }
              ]
            }
          },
          {
            label: 'kind',
            name: 'kind',
            type: 'select',
            controlProps: {
              options: [
                { label: 'active', value: 'active' },
                { label: 'passive', value: 'passive' }
              ]
            }
          },
          {
            label: 'Branch',
            name: 'branchId',
            type: 'custom',
            customField: (p) => {
              return (
                <SelectBranches
                  {...p}
                  multi={false}
                  showAvatar={false}
                  onSelect={(value) => p.onChange(value, p.name)}
                />
              );
            }
          },
          {
            label: 'Status',
            name: 'status',
            type: 'select',
            controlProps: {
              options: [
                { label: 'active', value: 'active' },
                { label: 'deleted', value: 'deleted' }
              ]
            }
          },

          {
            label: 'Department',
            name: 'departmentId',
            type: 'custom',
            customField: (p) => {
              return (
                <SelectDepartments
                  {...p}
                  onSelect={(value) => p.onChange(value, p.name)}
                />
              );
            }
          },
          {
            label: 'isOutBalance',
            name: 'isOutBalance',
            type: 'checkbox'
          }
        ]
      ]}
      mutation={props.mutation}
      refetchQueries={['accounts', 'accountsTotalCount']}
    />
  );
}

export default AccountForm;
