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
import { __, router } from 'coreui/utils';
import { useNavigate } from 'react-router-dom';
import { Title } from '@erxes/ui-settings/src/styles';
import AccountCategoryList from './AccountCategoryList';
import AccountForm from '../components/AccountForm';
import { FlexItem, InputBar } from "@erxes/ui-settings/src/styles";
import { Icon } from "@erxes/ui/src";

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
    return queryParams;
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
    <Button btnStyle="success" icon="plus-circle">
      Add {'account'}
    </Button>
  );

  const customerForm = (props) => {
    return <AccountForm {...props} />;
  };

  const actionBarRight = (
    <BarItems>
      <InputBar type="searchBar">
            <Icon icon="search-1" size={20} />
            <FlexItem>
              <FormControl
                type="text"
                placeholder={__("Type to search")}
                onChange={search}
                value={searchValue}
                autoFocus={true}
                onFocus={moveCursorAtTheEnd}
              />
            </FlexItem>
          </InputBar>
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

  const actionBarLeft = <Title>{`All accounts`}</Title>;

  const actionBar = (
    <Wrapper.ActionBar left={actionBarLeft} right={actionBarRight} />
  );

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
              columns={[
                { label: 'code', key: 'code' },
                { label: 'name', key: 'name' },
                { label: 'currency', key: 'currency' },
                { label: 'kind', key: 'kind' },
                { label: 'journal', key: 'journal' }
              ]}
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
      leftSidebar={<AccountCategoryList queryParams={queryParams} />}
      footer={<Pagination count={data?.accounts.length} />}
    />
  );
}

export default AccountList;
