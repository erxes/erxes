import {
  __,
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
  BarItems
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
                <SortHandler sortField={'payment'} label={__('Payment')} />
              </th>
              <th>
                <SortHandler
                  sortField={'interestEve'}
                  label={__('Interest Eve')}
                />
              </th>
              <th>
                <SortHandler
                  sortField={'interestNonce'}
                  label={__('Interest Nonce')}
                />
              </th>
              <th>
                <SortHandler sortField={'undue'} label={__('Undue')} />
              </th>
              <th>
                <SortHandler sortField={'insurance'} label={__('Insurance')} />
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

    const addTrigger = (
      <Button btnStyle="success" size="small" icon="plus-circle">
        {__('Add transaction')}
      </Button>
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
              Delete
            </Button>
          )}
        </BarItems>
      );
    }

    const transactionForm = props => {
      return <TransactionForm {...props} queryParams={queryParams} />;
    };

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
          <ModalTrigger
            title={`${__('New transaction')}`}
            trigger={addTrigger}
            autoOpenKey="showTransactionModal"
            size="lg"
            content={transactionForm}
            backDrop="static"
          />
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
