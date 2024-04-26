import React from 'react';
import CustomForm from '../../components/form';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import SelectWithSearch from '@erxes/ui/src/components/SelectWithSearch';
import mutation from '../graphql/mutation';
import { accountQuery } from '../graphql/query';
import { IAccountDocument } from '../../types/IAccount';
import { IOption } from '@erxes/ui/src/types';

export function generateCategoryOptions(array: IAccountDocument[] = []): IOption[] {
  return array.map((node, level) => ({
    value: node._id,
    label: `${'\u00A0 \u00A0 '.repeat(level)} ${node.code} - ${node.name}`
  }));
}

function AccountForm(props: any): React.ReactNode {
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
            type: 'custom',
            customField: (p) => {
              return (
                <SelectWithSearch
                  {...p}
                  filterParams={{}}
                  multi={false}
                  queryName="accountCategories"
                  initialValue={p.value}
                  generateOptions={generateCategoryOptions}
                  customQuery={accountQuery.accountCategories}
                  onSelect={(value) => p.onChange(value, p.name)}
                />
              );
            }

          },
          {
            label: 'parent',
            name: 'parentId',
            type: 'input'
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
            type: 'input'
          },
          {
            label: 'kind',
            name: 'kind',
            type: 'input'
          },
          {
            label: 'Branch',
            name: 'branchId',
            type: 'custom',
            customField: (p) => {
              return (
                <SelectBranches
                  {...p}
                  showAvatar={false}
                  onSelect={(value) => p.onChange(value, p.name)}
                />
              );
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
      size="lg"
      mutation={mutation.accountAdd}
      refetchQueries={['accounts']}
    />
  );
}

export default AccountForm;
