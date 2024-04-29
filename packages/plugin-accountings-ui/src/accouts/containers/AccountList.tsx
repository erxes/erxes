import { gql, useQuery, useMutation } from '@apollo/client';
import {
  IAccountsResponse,
  IAccountsTotalCountResponse,
  accountQuery
} from '../graphql/query';
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
import { Title, FlexItem, InputBar } from '@erxes/ui-settings/src/styles';
import AccountCategoryList from './AccountCategoryList';
import AccountForm from '../components/AccountForm';
import Icon from '@erxes/ui/src/components/Icon';
import mutation from '../graphql/mutation';
import Bulk from '@erxes/ui/src/components/Bulk';
import { Alert } from '@erxes/ui/src';

interface IProps {
  queryParams: any;
  searchValue: string;
  toggleBulk: any;
  bulk: any[];
  toggleAll: any;
  emptyBulk: any;
  isAllSelected: boolean;
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

function List({ queryParams, ...props }: IProps): React.ReactNode {
  const { toggleBulk, bulk, toggleAll, emptyBulk, isAllSelected } = props;

  const navigate = useNavigate();

  const [searchValue, setSearchValue] = useState<string | undefined>(
    props.searchValue
  );

  const variables = useMemo(() => {
    return {
      page: Number(queryParams?.page | 1),
      searchValue: queryParams.searchValue
    };
  }, [queryParams]);

  const { data, loading } = useQuery<IAccountsResponse>(
    gql(accountQuery.accounts),
    {
      variables: variables
    }
  );

  const { data: accountsTotal } = useQuery<IAccountsTotalCountResponse>(
    gql(accountQuery.accountsTotalCount),
    {
      variables: variables
    }
  );

  const [accountsRemove] = useMutation(gql(mutation.accountsRemove), {
    onError: (error) => {
      Alert.error(error.message);
    },
    onCompleted: () => {
      emptyBulk();
      Alert.success(`You successfully deleted a accounts`);
    }
  });

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

  const accountForm = (props, mutation) => {
    return <AccountForm {...props} mutation={mutation} />;
  };

  const onClickRemove = () => {
    accountsRemove({
      variables: {
        accountIds: bulk.map((a) => a._id)
      },
      refetchQueries: ['accounts', 'accountsTotalCount']
    });
  };

  const actionBarRight = (
    <BarItems>
      {bulk?.length > 0 && (
        <Button btnStyle="danger" icon="cancel-1" onClick={onClickRemove}>
          Remove
        </Button>
      )}
      <InputBar type="searchBar">
        <Icon icon="search-1" size={20} />
        <FlexItem>
          <FormControl
            type="text"
            placeholder={__('Type to search')}
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
        content={(p) => accountForm(p, mutation.accountAdd)}
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
              action={{
                editForm: (p) => accountForm(p, mutation.accountsEdit)
              }}
              check={{ toggleBulk, bulk, toggleAll, emptyBulk, isAllSelected }}
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
      footer={<Pagination count={accountsTotal?.accountsTotalCount} />}
    />
  );
}

function AccountList(props) {
  const renderList = (bulkProps) => <List {...bulkProps} {...props} />;
  return <Bulk content={renderList} />;
}

export default AccountList;
