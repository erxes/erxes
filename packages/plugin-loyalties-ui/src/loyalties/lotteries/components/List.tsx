import {
   Button, DataWithLoader, FormControl, ModalTrigger, Pagination,
  SortHandler, Table
} from '@erxes/ui/src/components';
import { MainStyleTitle as Title, MainStyleCount as Count } from '@erxes/ui/src/styles/eindex';
import { __, Alert, confirm, router } from '@erxes/ui/src/utils';
import { BarItems } from '@erxes/ui/src/layout/styles';
import { Wrapper } from '@erxes/ui/src/layout';
import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import { withRouter } from 'react-router-dom';

import LotteryForm from '../containers/Form';
import { LoyaltiesTableWrapper } from '../../common/styles';
import { ILottery } from '../types';
import LotteryRow from './Row';
import Sidebar from './Sidebar';
import { ILotteryCampaign } from '../../../configs/lotteryCampaign/types';
import { menuLoyalties } from '../../common/constants';

interface IProps extends IRouterProps {
  lotteries: ILottery[];
  currentCampaign?: ILotteryCampaign;
  loading: boolean;
  searchValue: string;
  totalCount: number;
  // TODO: check is below line not throwing error ?
  toggleBulk: () => void;
  toggleAll: (targets: ILottery[], containerId: string) => void;
  bulk: any[];
  isAllSelected: boolean;
  emptyBulk: () => void;
  removeLotteries: (doc: { lotteryIds: string[] }, emptyBulk: () => void) => void;
  history: any;
  queryParams: any;
}

type State = {
  searchValue?: string;
};

class LotteriesList extends React.Component<IProps, State> {
  private timer?: NodeJS.Timer = undefined;

  constructor(props) {
    super(props);

    this.state = {
      searchValue: this.props.searchValue
    };
  }

  onChange = () => {
    const { toggleAll, lotteries } = this.props;
    toggleAll(lotteries, 'lotteries');
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

  removeLotteries = lotteries => {
    const lotteryIds: string[] = [];

    lotteries.forEach(lottery => {
      lotteryIds.push(lottery._id);
    });

    this.props.removeLotteries({ lotteryIds }, this.props.emptyBulk);
  };

  moveCursorAtTheEnd = e => {
    const tmpValue = e.target.value;
    e.target.value = '';
    e.target.value = tmpValue;
  };

  render() {
    const {
      lotteries,
      history,
      loading,
      toggleBulk,
      bulk,
      isAllSelected,
      totalCount,
      queryParams,
      currentCampaign
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
                <SortHandler sortField={'number'} label={__('Number')} />
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
          <tbody id="lotteries">
            {lotteries.map(lottery => (
              <LotteryRow
                lottery={lottery}
                isChecked={bulk.includes(lottery)}
                key={lottery._id}
                history={history}
                toggleBulk={toggleBulk}
                currentCampaign={currentCampaign}
                queryParams={queryParams}
              />
            ))}
          </tbody>
        </Table>
      </LoyaltiesTableWrapper>
    );

    const addTrigger = (
      <Button btnStyle="success" size="small" icon="plus-circle">
        Add lottery
      </Button>
    );

    const lotteryForm = props => {
      return <LotteryForm {...props} queryParams={queryParams} />;
    };

    const actionBarRight = () => {
      if (bulk.length > 0) {
        const onClick = () =>
          confirm()
            .then(() => {
              this.removeLotteries(bulk);
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
            title="New lottery"
            trigger={addTrigger}
            autoOpenKey="showLotteryModal"
            content={lotteryForm}
            backDrop="static"
          />
        </BarItems>
      )
    };

    const actionBarLeft = (
      <Title>{currentCampaign && `${currentCampaign.title}` || 'All lottery campaigns'} </Title>
    );
    const actionBar = (
      <Wrapper.ActionBar right={actionBarRight()} left={actionBarLeft} />
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__(`Lotteries`) + ` (${totalCount})`}
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
            isAward={true}
          />
        }
        content={
          <>
            <Count>
              {totalCount} lottery{totalCount > 1 && 's'}
            </Count>
            <DataWithLoader
              data={mainContent}
              loading={loading}
              count={lotteries.length}
              emptyText="Add in your first lottery!"
              emptyImage="/images/actions/1.svg"
            />
          </>

        }
      />
    );
  }
}

export default withRouter<IRouterProps>(LotteriesList);
