import React from 'react';
import CustomForm from '../../../components/form';
import queries from '../graphql/queries';
import { IAccountCategory } from '../../../types/accountCategory';
import { IOption } from '@erxes/ui/src/types';

export function generateCategoryOptions(
  array: IAccountCategory[] = []
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

function AccountCategoryForm(props: IProps): React.ReactNode {
  return (
    <CustomForm
      {...props}
      defaultValue={props.defaultValue}
      fields={[
        [
          {
            label: 'code',
            name: 'code',
            type: 'input',
            required:true
          },
          {
            label: 'name',
            name: 'name',
            type: 'input',
            required:true
          },
          {
            label: 'order',
            name: 'order',
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
            label: 'parent',
            name: 'parentId',
            type: 'selectWithSearch',
            selectProps: {
              filterParams: {},
              multi: false,
              queryName: 'accountCategories',
              generateOptions: generateCategoryOptions,
              customQuery: queries.accountCategories
            }
          },
          {
            label: 'status',
            name: 'status',
            type:'select',
            controlProps: {
              options: [
                { label: 'active', value: 'active' },
                { label: 'archived', value: 'archived' }
              ]
            }
          },
          {
            label: 'maskType',
            name: 'maskType',
            type:'select',
            controlProps: {
              options: [
                { label: 'Any: No mask', value: '' },
                { label: 'Soft: Удамших албагүй', value: 'soft' },
                { label: 'Hard: Заавал удамших', value: 'hard' }
              ]
            }
          }
        ]
      ]}
      refetchQueries={['accountCategories']}
    />
  );
}

export default AccountCategoryForm;
