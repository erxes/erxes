import {
  __, Alert, Button, confirm, DataWithLoader, FormControl, ModalTrigger, Pagination, router,
  SortHandler, Table, Wrapper, BarItems, MainStyleTitle as Title, MainStyleCount as Count
} from 'erxes-ui';
import { IRouterProps } from 'erxes-ui/lib/types';
import React from 'react';
import { withRouter } from 'react-router-dom';

import SpinForm from '../containers/Form';
import { LoyaltiesTableWrapper } from '../../common/styles';
import { ISpin } from '../types';
import SpinRow from './Row';
import Sidebar from './Sidebar';
import { ISpinCompaign } from '../../../configs/spinCompaign/types';
import { menuLoyalties } from '../../common/constants';

interface IProps extends IRouterProps {
  spins: ISpin[];
  currentCompaign?: ISpinCompaign;
  loading: boolean;
  searchValue: string;
  totalCount: number;
  // TODO: check is below line not throwing error ?
  toggleBulk: () => void;
  toggleAll: (targets: ISpin[], containerId: string) => void;
  bulk: any[];
  isAllSelected: boolean;
  emptyBulk: () => void;
  removeSpins: (doc: { spinIds: string[] }, emptyBulk: () => void) => void;
  history: any;
  queryParams: any;
}

type State = {
  searchValue?: string;
};

class SpinsList extends React.Component<IProps, State> {
  private timer?: NodeJS.Timer = undefined;

  constructor(props) {
    super(props);

    this.state = {
      searchValue: this.props.searchValue
    };
  }

  onChange = () => {
    const { toggleAll, spins } = this.props;
    toggleAll(spins, 'spins');
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

  removeSpins = spins => {
    const spinIds: string[] = [];

    spins.forEach(spin => {
      spinIds.push(spin._id);
    });

    this.props.removeSpins({ spinIds }, this.props.emptyBulk);
  };

  moveCursorAtTheEnd = e => {
    const tmpValue = e.target.value;
    e.target.value = '';
    e.target.value = tmpValue;
  };

  render() {
    const {
      spins,
      history,
      loading,
      toggleBulk,
      bulk,
      isAllSelected,
      totalCount,
      queryParams,
      currentCompaign
    } = this.props;

    const mainContent = (

      <LoyaltiesTableWrapper>
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
                <SortHandler sortField={'createdAt'} label={__('Created')} />
              </th>
              <th>
                <SortHandler sortField={'ownerType'} label={__('Owner Type')} />
              </th>
              <th>
                <SortHandler sortField={'ownerId'} label={__('Owner')} />
              </th>
              <th>
                <SortHandler sortField={'status'} label={__('Status')} />
              </th>
              <th>
                Actions
              </th>
            </tr>
          </thead>
          <tbody id="spins">
            {spins.map(spin => (
              <SpinRow
                spin={spin}
                isChecked={bulk.includes(spin)}
                key={spin._id}
                history={history}
                toggleBulk={toggleBulk}
                currentCompaign={currentCompaign}
                queryParams={queryParams}
              />
            ))}
          </tbody>
        </Table>
      </LoyaltiesTableWrapper>
    );

    const addTrigger = (
      <Button btnStyle="success" size="small" icon="plus-circle">
        Add spin
      </Button>
    );

    const spinForm = props => {
      return <SpinForm {...props} queryParams={queryParams} />;
    };

    const actionBarRight = () => {
      if (bulk.length > 0) {
        const onClick = () =>
          confirm()
            .then(() => {
              this.removeSpins(bulk);
            })
            .catch(error => {
              Alert.error(error.message);
            });

        return (
          <BarItems>
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
      return (
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
            title="New spin"
            trigger={addTrigger}
            autoOpenKey="showSpinModal"
            content={spinForm}
            backDrop="static"
          />
        </BarItems>
      )
    };

    const actionBarLeft = (
      <Title>{currentCompaign && `${currentCompaign.title}` || 'All spin compaigns'} </Title>
    );
    const actionBar = (
      <Wrapper.ActionBar right={actionBarRight()} left={actionBarLeft} />
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__(`Spins`) + ` (${totalCount})`}
            submenu={menuLoyalties}
          />
        }
        actionBar={actionBar}
        footer={<Pagination count={totalCount} />}
        leftSidebar={
          <Sidebar
            loadingMainQuery={loading}
            queryParams={queryParams}
            history={history}
          />
        }
        content={
          <>
            <Count>
              {totalCount} spin{totalCount > 1 && 's'}
            </Count>
            <DataWithLoader
              data={mainContent}
              loading={loading}
              count={spins.length}
              emptyText="Add in your first spin!"
              emptyImage="/images/actions/1.svg"
            />
          </>

        }
      />
    );
  }
}

export default withRouter<IRouterProps>(SpinsList);
