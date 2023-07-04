import {
  loadDynamicComponent,
  Alert,
  __,
  confirm,
  router
} from '@erxes/ui/src/utils';
import { Count, Title } from '@erxes/ui/src/styles/main';
import { IAccount, IAccountCategory } from '../../types';
import { BarItems } from '@erxes/ui/src/layout/styles';
import Button from '@erxes/ui/src/components/Button';
import CategoryList from '../../containers/accountCategory/CategoryList';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Form from '@erxes/ui-accounts/src/containers/AccountForm';
import FormControl from '@erxes/ui/src/components/form/Control';
import HeaderDescription from '@erxes/ui/src/components/HeaderDescription';
import { IRouterProps } from '@erxes/ui/src/types';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import AccountsMerge from './detail/AccountsMerge';
import React from 'react';
import Row from './AccountRow';
import { TAG_TYPES } from '@erxes/ui-tags/src/constants';
import Table from '@erxes/ui/src/components/table';
import TaggerPopover from '@erxes/ui-tags/src/components/TaggerPopover';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { isEnabled } from '@erxes/ui/src/utils/core';
import TemporarySegment from '@erxes/ui-segments/src/components/filter/TemporarySegment';
import AccountsPrintAction from './AccountPrintAction';

interface IProps extends IRouterProps {
  history: any;
  queryParams: any;
  accounts: IAccount[];
  accountsCount: number;
  isAllSelected: boolean;
  bulk: any[];
  emptyBulk: () => void;
  remove: (doc: { accountIds: string[] }, emptyBulk: () => void) => void;
  toggleBulk: () => void;
  toggleAll: (targets: IAccount[], containerId: string) => void;
  loading: boolean;
  searchValue: string;
  currentCategory: IAccountCategory;
  mergeAccounts: () => void;
  mergeAccountLoading;
}

type State = {
  searchValue?: string;
};

class List extends React.Component<IProps, State> {
  private timer?: NodeJS.Timer;

  constructor(props) {
    super(props);

    this.state = {
      searchValue: this.props.searchValue
    };
  }

  renderRow = () => {
    const { accounts, history, toggleBulk, bulk } = this.props;

    return accounts.map(account => (
      <Row
        history={history}
        key={account._id}
        account={account}
        toggleBulk={toggleBulk}
        isChecked={bulk.includes(account)}
      />
    ));
  };

  onChange = () => {
    const { toggleAll, accounts } = this.props;
    toggleAll(accounts, 'accounts');
  };

  removeAccounts = accounts => {
    const accountIds: string[] = [];

    accounts.forEach(account => {
      accountIds.push(account._id);
    });

    this.props.remove({ accountIds }, this.props.emptyBulk);
  };

  renderCount = accountCount => {
    return (
      <Count>
        {accountCount} account{accountCount > 1 && 's'}
      </Count>
    );
  };

  search = e => {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    const { history } = this.props;
    const searchValue = e.target.value;

    this.setState({ searchValue });

    this.timer = setTimeout(() => {
      router.removeParams(history, 'page');
      router.setParams(history, { searchValue });
    }, 500);
  };

  moveCursorAtTheEnd(e) {
    const tmpValue = e.target.value;

    e.target.value = '';
    e.target.value = tmpValue;
  }

  render() {
    const {
      accountsCount,
      loading,
      queryParams,
      isAllSelected,
      history,
      bulk,
      emptyBulk,
      currentCategory,
      mergeAccounts,
      mergeAccountLoading
    } = this.props;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Account') }
    ];

    const trigger = (
      <Button btnStyle="success" icon="plus-circle">
        Add items
      </Button>
    );

    const modalContent = props => <Form {...props} />;

    let actionBarRight = (
      <BarItems>
        <FormControl
          type="text"
          placeholder={__('Type to search')}
          onChange={this.search}
          value={this.state.searchValue}
          autoFocus={true}
          onFocus={this.moveCursorAtTheEnd}
        />
        {isEnabled('segments') && (
          <TemporarySegment contentType={`accounts:account`} />
        )}

        <ModalTrigger
          title="Add Account/Services"
          trigger={trigger}
          autoOpenKey="showAccountModal"
          content={modalContent}
          size="lg"
        />
      </BarItems>
    );

    let content = (
      <>
        {this.renderCount(currentCategory.accountCount || accountsCount)}
        <Table hover={true}>
          <thead>
            <tr>
              <th style={{ width: 60 }}>
                <FormControl
                  checked={isAllSelected}
                  componentClass="checkbox"
                  onChange={this.onChange}
                />
              </th>
              <th>{__('Code')}</th>
              <th>{__('Name')}</th>
              <th>{__('Type')}</th>
              <th>{__('Category')}</th>
              <th>{__('Currency')}</th>
              <th>{__('Is Balance')}</th>
              <th>{__('Close Percent')}</th>
              <th>{__('Journal')}</th>
              <th>{__('Created At')}</th>
              <th>{__('Actions')}</th>
            </tr>
          </thead>
          <tbody>{this.renderRow()}</tbody>
        </Table>
      </>
    );

    if (currentCategory.accountCount === 0) {
      content = (
        <EmptyState
          image="/images/actions/8.svg"
          text="No Brands"
          size="small"
        />
      );
    }

    const accountsMerge = props => {
      return (
        <AccountsMerge
          {...props}
          objects={bulk}
          save={mergeAccounts}
          mergeAccountLoading={mergeAccountLoading}
        />
      );
    };

    if (bulk.length > 0) {
      const tagButton = (
        <Button btnStyle="simple" size="small" icon="tag-alt">
          Tag
        </Button>
      );

      const onClick = () =>
        confirm()
          .then(() => {
            this.removeAccounts(bulk);
          })
          .catch(error => {
            Alert.error(error.message);
          });

      const mergeButton = (
        <Button btnStyle="primary" size="small" icon="merge">
          Merge
        </Button>
      );

      actionBarRight = (
        <BarItems>
          {isEnabled('documents') && <AccountsPrintAction bulk={bulk} />}

          {bulk.length === 2 && (
            <ModalTrigger
              title="Merge Account"
              size="lg"
              dialogClassName="modal-1000w"
              trigger={mergeButton}
              content={accountsMerge}
            />
          )}
          {isEnabled('tags') && (
            <TaggerPopover
              type={TAG_TYPES.ACCOUNT}
              successCallback={emptyBulk}
              targets={bulk}
              trigger={tagButton}
              refetchQueries={['accountCountByTags']}
            />
          )}
          <Button
            btnStyle="danger"
            size="small"
            icon="cancel-1"
            onClick={onClick}
          >
            Remove
          </Button>
        </BarItems>
      );
    }

    const actionBarLeft = (
      <Title>{currentCategory.name || 'All accounts'}</Title>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header title={__('Account')} breadcrumb={breadcrumb} />
        }
        mainHead={
          <HeaderDescription
            icon="/images/actions/30.svg"
            title={'Account '}
            description={`${__(
              'All information and know-how related to your business accounts and services are found here'
            )}.${__(
              'Create and add in unlimited accounts and servicess so that you and your team members can edit and share'
            )}`}
          />
        }
        actionBar={
          <Wrapper.ActionBar left={actionBarLeft} right={actionBarRight} />
        }
        leftSidebar={
          <CategoryList queryParams={queryParams} history={history} />
        }
        footer={<Pagination count={accountsCount} />}
        content={
          <DataWithLoader
            data={content}
            loading={loading}
            count={accountsCount}
            emptyText="There is no data"
            emptyImage="/images/actions/5.svg"
          />
        }
        transparent={true}
        hasBorder
      />
    );
  }
}

export default List;
