import React from 'react';
import CustomForm from '../../components/form';
import mutation from '../graphql/mutation';

function AccountCategoryForm(props: any): React.ReactNode {
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
            type: 'input'
          },
          {
            label: 'status',
            name: 'status',
            type: 'input'
          },
          {
            label: 'maskType',
            name: 'maskType',
            type: 'input'
          },
          {
            label: 'mask',
            name: 'mask',
            type: 'input'
          }
        ]
      ]}
      size="lg"
      mutation={mutation.accountCategoryAdd}
      refetchQueries={['accountCategories']}
    />
  );
}

export default AccountCategoryForm;
