import {
  __,
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
// import Sidebar from './Sidebar';

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
  queryParams: any;
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
      queryParams
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
                <SortHandler sortField={'number'} label={__('Number')} />
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
                  sortField={'scheduleDay'}
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

    // const mergeButton = (
    //   <Button btnStyle="primary" size="small" icon="merge">
    //     Merge
    //   </Button>
    // );

    let actionBarLeft: React.ReactNode;

    // const contractsMerge = props => {
    //   return <ContractsMerge {...props} objects={bulk} save={mergeContracts} />;
    // };

    if (bulk.length > 0) {
      const onClick = () =>
        confirm()
          .then(() => {
            this.removeContracts(bulk);
          })
          .catch(error => {
            Alert.error(error.message);
          });

      actionBarLeft = (
        <BarItems>
          {/* {bulk.length === 2 && (
            <ModalTrigger
              title="Merge Contracts"
              size="lg"
              trigger={mergeButton}
              content={contractsMerge}
            />
          )} */}

          <Button
            btnStyle="danger"
            size="small"
            icon="cancel-1"
            onClick={onClick}
          >
            Delete
          </Button>
        </BarItems>
      );
    }

    const contractForm = props => {
      return <ContractForm {...props} queryParams={queryParams} />;
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

        <ModalTrigger
          title={`${__('New contract')}`}
          trigger={addTrigger}
          autoOpenKey="showContractModal"
          size="lg"
          content={contractForm}
          backDrop="static"
        />
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
            submenu={menuContracts}
          />
        }
        actionBar={actionBar}
        footer={<Pagination count={totalCount} />}
        // leftSidebar={
        //   <Sidebar
        //     loadingMainQuery={loading}
        //     queryParams={queryParams}
        //     history={history}
        //   />
        // }
        content={
          <DataWithLoader
            data={mainContent}
            loading={loading}
            count={contracts.length}
            emptyText="Add in your first contract!"
            emptyImage="/images/actions/1.svg"
          />
        }
        hasBorder
      />
    );
  }
}

export default withRouter<IRouterProps>(ContractsList);
