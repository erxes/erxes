import { gql, useQuery } from '@apollo/client';
import { IAccountsResponse, accountQuery } from '../graphql/query';
import React, { useMemo, useState } from 'react';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import CustomTable from '../../components/table';
import { BarItems } from '@erxes/ui/src/layout/styles';
import FormControl from '@erxes/ui/src/components/form/Control';
import Button from '@erxes/ui/src/components/Button';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import { Alert, __, confirm, router } from 'coreui/utils';
import { useNavigate } from 'react-router-dom';
import CustomForm from '../../components/form';
import mutation from '../graphql/mutation';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';

interface IProps {
  queryParams: any;
  searchValue: string;
}

let timer;

export const breadcrumb = [
  { title: __('Accountings'), link: '/accountings' },
  { title: __('Accounts') }
];

const moveCursorAtTheEnd = (e) => {
  const tmpValue = e.target.value;

  e.target.value = '';
  e.target.value = tmpValue;
};

function AccountList({ queryParams, ...props }: IProps): React.ReactNode {
  const navigate = useNavigate();

  const [searchValue, setSearchValue] = useState<string | undefined>(
    props.searchValue
  );

  const variables = useMemo(() => {
    return {};
  }, [queryParams]);

  const { data, loading } = useQuery<IAccountsResponse>(
    gql(accountQuery.accounts),
    {
      variables: variables
    }
  );

  const search = (e) => {
    if (timer) {
      clearTimeout(timer);
    }

    const searchValue = e.target.value;

    setSearchValue(searchValue);

    timer = setTimeout(() => {
      router.removeParams(navigate, location, 'page');
      router.setParams(navigate, location, { searchValue });
    }, 500);
  };

  const addTrigger = (
    <Button btnStyle="success" size="small" icon="plus-circle">
      Add {'account'}
    </Button>
  );

  const customerForm = (props) => {
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
              type: 'input'
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
              controlProps:{
                componentclass:"textarea"
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
        queryParams={queryParams}
      />
    );
  };

  const actionBarRight = (
    <BarItems>
      <FormControl
        type="text"
        placeholder={__('Type to search')}
        onChange={search}
        value={searchValue}
        autoFocus={true}
        onFocus={moveCursorAtTheEnd}
      />
      <ModalTrigger
        title="New customer"
        autoOpenKey="showCustomerModal"
        trigger={addTrigger}
        size="lg"
        content={customerForm}
        backDrop="static"
      />
    </BarItems>
  );

  const actionBar = <Wrapper.ActionBar right={actionBarRight} />;

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__('List accounts')}
          breadcrumb={breadcrumb}
          queryParams={queryParams}
        />
      }
      actionBar={actionBar}
      content={
        <DataWithLoader
          data={
            <CustomTable
              columns={[{ label: 'name', key: 'name' }]}
              data={data?.accounts}
            />
          }
          loading={loading}
          count={data?.accounts.length}
          emptyText="There is no data"
          emptyImage="/images/actions/5.svg"
        />
      }
      transparent={true}
      hasBorder={true}
      footer={<Pagination count={data?.accounts.length} />}
    />
  );
}

export default AccountList;
