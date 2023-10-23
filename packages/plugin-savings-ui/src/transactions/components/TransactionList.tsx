import {
  Alert,
  Button,
  confirm,
  DataWithLoader,
  FormControl,
  ModalTrigger,
  Pagination,
  SortHandler,
  Table,
  Wrapper,
  BarItems,
  DropdownToggle,
  Icon
} from '@erxes/ui/src';
import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { menuContracts } from '../../constants';

import TransactionForm from '../containers/TransactionForm';
import { ContractsTableWrapper } from '../../contracts/styles';
import { ITransaction } from '../types';
import TransactionRow from './TransactionRow';
import RightMenu from './RightMenu';
import { can } from '@erxes/ui/src/utils/core';
import withConsumer from '../../withConsumer';
import { IUser } from '@erxes/ui/src/auth/types';
import { __ } from 'coreui/utils';
import Dropdown from 'react-bootstrap/Dropdown';
import InterestChange from '../../contracts/containers/detail/InterestChange';

interface IProps extends IRouterProps {
  transactions: ITransaction[];
  loading: boolean;
  totalCount: number;
  // TODO: check is below line not throwing error ?
  toggleBulk: () => void;
  toggleAll: (targets: ITransaction[], containerId: string) => void;
  bulk: any[];
  isAllSelected: boolean;
  emptyBulk: () => void;
  removeTransactions: (
    doc: { transactionIds: string[] },
    emptyBulk: () => void
  ) => void;

  onSearch: (search: string) => void;
  onSelect: (values: string[] | string, key: string) => void;
  queryParams: any;
  isFiltered: boolean;
  clearFilter: () => void;
  currentUser: IUser;
}

class TransactionsList extends React.Component<IProps> {
  private timer?: NodeJS.Timer = undefined;

  constructor(props) {
    super(props);
  }

  onChange = () => {
    const { toggleAll, transactions } = this.props;
    toggleAll(transactions, 'transactions');
  };

  removeTransactions = transactions => {
    const transactionIds: string[] = [];

    transactions.forEach(transaction => {
      transactionIds.push(transaction._id);
    });

    this.props.removeTransactions({ transactionIds }, this.props.emptyBulk);
  };

  render() {
    const {
      transactions,
      history,
      loading,
      toggleBulk,
      bulk,
      isAllSelected,
      totalCount,
      queryParams,
      onSelect,
      onSearch,
      isFiltered,
      clearFilter,
      currentUser
    } = this.props;

    const mainContent = (
      <ContractsTableWrapper>
        <Table whiteSpace="nowrap" bordered={true} hover={true}>
          <thead>
            <tr>
              <th>
                <FormControl
                  checked={isAllSelected}
                  componentClass="checkbox"
                  onChange={this.onChange}
                />
              </th>
              <th>
                <SortHandler
                  sortField={'contract.number'}
                  label={__('Contract Number')}
                />
              </th>
              <th>
                <SortHandler
                  sortField={'contract.description'}
                  label={__('Description')}
                />
              </th>
              <th>
                <SortHandler sortField={'payDate'} label={__('Date')} />
              </th>
              <th>
                <SortHandler sortField={'total'} label={__('Total')} />
              </th>

              <th></th>
            </tr>
          </thead>
          <tbody id="transactions">
            {transactions.map(transaction => (
              <TransactionRow
                transaction={transaction}
                isChecked={bulk.includes(transaction)}
                key={transaction._id}
                history={history}
                toggleBulk={toggleBulk}
              />
            ))}
          </tbody>
        </Table>
      </ContractsTableWrapper>
    );

    let actionBarLeft: React.ReactNode;

    if (bulk.length > 0) {
      const onClick = () =>
        confirm()
          .then(() => {
            this.removeTransactions(bulk);
          })
          .catch(error => {
            Alert.error(error.message);
          });

      actionBarLeft = (
        <BarItems>
          {can('transactionsRemove', currentUser) && (
            <Button
              btnStyle="danger"
              size="small"
              icon="cancel-1"
              onClick={onClick}
            >
              {__('Delete')}
            </Button>
          )}
        </BarItems>
      );
    }

    const incomeTransactionForm = props => {
      return (
        <TransactionForm type="income" {...props} queryParams={queryParams} />
      );
    };

    const outcomeTransactionForm = props => {
      return (
        <TransactionForm type="outcome" {...props} queryParams={queryParams} />
      );
    };

    const interestChangeForm = props => (
      <InterestChange {...props} type="interestChange" />
    );

    const interestReturnForm = props => (
      <InterestChange {...props} type="interestReturn" />
    );

    const rightMenuProps = {
      onSelect,
      onSearch,
      isFiltered,
      clearFilter,
      queryParams
    };

    const actionBarRight = (
      <BarItems>
        {can('manageTransactions', currentUser) && (
          <Dropdown>
            <Dropdown.Toggle as={DropdownToggle} id="dropdown-info">
              <Button btnStyle="success" size="medium">
                {__('New transaction')}
                <Icon icon="angle-down" />
              </Button>
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <li>
                <ModalTrigger
                  title={`${__('Income Transaction')}`}
                  trigger={
                    <a href="#Income Transaction">{__('Income Transaction')}</a>
                  }
                  size="lg"
                  content={incomeTransactionForm}
                />
              </li>
              <li>
                <ModalTrigger
                  title={`${__('Outcome Transaction')}`}
                  trigger={
                    <a href="#Outcome Transaction">
                      {__('Outcome Transaction')}
                    </a>
                  }
                  size="lg"
                  content={outcomeTransactionForm}
                />
              </li>
              <li>
                <ModalTrigger
                  title={`${__('Interest Change')}`}
                  trigger={
                    <a href="#Interest Change">{__('Interest Change')}</a>
                  }
                  size="lg"
                  content={interestChangeForm}
                />
              </li>
              <li>
                <ModalTrigger
                  title={`${__('Interest Return')}`}
                  trigger={
                    <a href="#Interest Return">{__('Interest Return')}</a>
                  }
                  size="lg"
                  content={interestReturnForm}
                />
              </li>
            </Dropdown.Menu>
          </Dropdown>
        )}
        <RightMenu {...rightMenuProps} />
      </BarItems>
    );

    const actionBar = (
      <Wrapper.ActionBar right={actionBarRight} left={actionBarLeft} />
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__(`Transactions`) + ` (${totalCount})`}
            queryParams={queryParams}
            submenu={menuContracts.filter(row =>
              can(row.permission, currentUser)
            )}
          />
        }
        actionBar={actionBar}
        footer={<Pagination count={totalCount} />}
        content={
          <DataWithLoader
            data={mainContent}
            loading={loading}
            count={transactions.length}
            emptyText="Add in your first transaction!"
            emptyImage="/images/actions/1.svg"
          />
        }
      />
    );
  }
}

export default withRouter<IRouterProps>(withConsumer(TransactionsList));
