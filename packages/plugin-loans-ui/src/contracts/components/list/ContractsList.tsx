import {
  Alert,
  Button,
  confirm,
  DataWithLoader,
  FormControl,
  ModalTrigger,
  Pagination,
  router,
  SortHandler,
  Table,
  Wrapper,
  BarItems
} from '@erxes/ui/src';
import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { menuContracts } from '../../../constants';

import ContractForm from '../../containers/ContractForm';
import { ContractsTableWrapper } from '../../styles';
import { IContract } from '../../types';
// import ContractsMerge from '../detail/ContractsMerge';
import ContractRow from './ContractRow';
import RightMenu from './RightMenu';
import { can } from '@erxes/ui/src/utils/core';
import withConsumer from '../../../withConsumer';
import { IUser } from '@erxes/ui/src/auth/types';
import { __ } from 'coreui/utils';
import ClassificationForm from '../../containers/ClassificationForm';
// import Sidebar from './Sidebar';

type ContractAlert = { name: string; count: number; filter: any };
interface IProps extends IRouterProps {
  contracts: IContract[];
  loading: boolean;
  searchValue: string;
  totalCount: number;
  // TODO: check is below line not throwing error ?
  toggleBulk: () => void;
  toggleAll: (targets: IContract[], containerId: string) => void;
  bulk: any[];
  isAllSelected: boolean;
  emptyBulk: () => void;
  removeContracts: (
    doc: { contractIds: string[] },
    emptyBulk: () => void
  ) => void;
  // mergeContracts: () => void;
  history: any;
  onSearch: (search: string) => void;
  onSelect: (values: string[] | string, key: string) => void;
  queryParams: any;
  isFiltered: boolean;
  clearFilter: () => void;
  currentUser: IUser;
  alerts: ContractAlert[];
}

type State = {
  searchValue?: string;
};

class ContractsList extends React.Component<IProps, State> {
  private timer?: NodeJS.Timer = undefined;

  constructor(props) {
    super(props);

    this.state = {
      searchValue: this.props.searchValue
    };
  }

  onChange = () => {
    const { toggleAll, contracts } = this.props;
    toggleAll(contracts, 'contracts');
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

  removeContracts = contracts => {
    const contractIds: string[] = [];

    contracts.forEach(contract => {
      contractIds.push(contract._id);
    });

    this.props.removeContracts({ contractIds }, this.props.emptyBulk);
  };

  moveCursorAtTheEnd = e => {
    const tmpValue = e.target.value;
    e.target.value = '';
    e.target.value = tmpValue;
  };

  render() {
    const {
      contracts,
      history,
      loading,
      toggleBulk,
      bulk,
      isAllSelected,
      totalCount,
      // mergeContracts,
      queryParams,
      onSelect,
      onSearch,
      isFiltered,
      clearFilter,
      currentUser,
      alerts
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
                  sortField={'number'}
                  label={__('Contract Number')}
                />
              </th>
              <th>
                <SortHandler
                  sortField={'marginAmount'}
                  label={__('marginAmount')}
                />
              </th>
              <th>
                <SortHandler
                  sortField={'leaseAmount'}
                  label={__('leaseAmount')}
                />
              </th>
              <th>
                <SortHandler sortField={'tenor'} label={__('Status')} />
              </th>
              <th>
                <SortHandler sortField={'tenor'} label={__('Tenor')} />
              </th>
              <th>
                <SortHandler
                  sortField={'interestRate'}
                  label={__('Interest Rate')}
                />
              </th>
              <th>
                <SortHandler sortField={'repayment'} label={__('Repayment')} />
              </th>
              <th>
                <SortHandler
                  sortField={'classification'}
                  label={__('Classification')}
                />
              </th>
              <th>
                <SortHandler
                  sortField={'scheduleDays'}
                  label={__('Schedule Day')}
                />
              </th>
            </tr>
          </thead>
          <tbody id="contracts">
            {contracts.map(contract => (
              <ContractRow
                contract={contract}
                isChecked={bulk.includes(contract)}
                key={contract._id}
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
        {__('Add contract')}
      </Button>
    );

    let actionBarLeft: React.ReactNode;

    if (bulk.length > 0) {
      const onClick = () =>
        confirm()
          .then(() => {
            this.removeContracts(bulk);
          })
          .catch(error => {
            Alert.error(error.message);
          });

      const classificationForm = props => {
        return <ClassificationForm {...props} contracts={bulk} />;
      };

      actionBarLeft = (
        <BarItems>
          <ModalTrigger
            title={`${__('Change classification')}`}
            trigger={
              <Button btnStyle="warning" size="small" icon="cancel-1">
                {__('Change classification')}
              </Button>
            }
            autoOpenKey="showTransactionModal"
            size="lg"
            content={classificationForm}
            backDrop="static"
          />
          {can('contractsRemove', currentUser) && (
            <Button
              btnStyle="danger"
              size="small"
              icon="cancel-1"
              onClick={onClick}
            >
              {__('Delete')}
            </Button>
          )}
          {alerts.map(mur => (
            <Button onClick={() => onSelect(mur.filter, 'ids')}>
              {mur.name}:{mur.count}
            </Button>
          ))}
        </BarItems>
      );
    } else {
      actionBarLeft = (
        <BarItems>
          {alerts.map(mur => (
            <Button onClick={() => onSelect(mur.filter, 'ids')}>
              {mur.name}:{mur.count}
            </Button>
          ))}
        </BarItems>
      );
    }

    const contractForm = props => {
      return <ContractForm {...props} queryParams={queryParams} />;
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
        <FormControl
          type="text"
          placeholder={__('Type to search')}
          onChange={this.search}
          value={this.state.searchValue}
          autoFocus={true}
          onFocus={this.moveCursorAtTheEnd}
        />
        {can('contractsAdd', currentUser) && (
          <ModalTrigger
            title={`${__('New contract')}`}
            trigger={addTrigger}
            autoOpenKey="showContractModal"
            size="xl"
            content={contractForm}
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
            title={__(`Contracts`) + ` (${totalCount})`}
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
            count={contracts.length}
            emptyText="Add in your first contract!"
            emptyImage="/images/actions/1.svg"
          />
        }
      />
    );
  }
}

export default withRouter<IRouterProps>(withConsumer(ContractsList));
