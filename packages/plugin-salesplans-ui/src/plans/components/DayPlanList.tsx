import Form from '../containers/DayPlanForm';
import moment from 'moment';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import React from 'react';
import Row from './DayPlanRow';
import Sidebar from './DayPlanSidebar';
import { __, Alert, confirm, router } from '@erxes/ui/src/utils';
import { BarItems, Wrapper } from '@erxes/ui/src/layout';
import {
  Button,
  DataWithLoader,
  FormControl,
  ModalTrigger,
  Table
} from '@erxes/ui/src/components';
import { IDayPlan, IDayPlanConfirmParams } from '../types';
import { ITimeframe } from '../../settings/types';
import { MainStyleTitle as Title } from '@erxes/ui/src/styles/eindex';
import { menuSalesplans } from '../../constants';
import { TableWrapper } from '../../styles';

type Props = {
  dayPlans: IDayPlan[];
  totalCount: number;
  totalSum: any;
  timeFrames: ITimeframe[];
  isAllSelected: boolean;
  toggleAll: (targets: IDayPlan[], containerId: string) => void;
  history: any;
  queryParams: any;
  bulk: any[];
  emptyBulk: () => void;
  toggleBulk: () => void;
  remove: (doc: { dayPlanIds: string[] }, emptyBulk: () => void) => void;
  edit: (doc: IDayPlan) => void;
  searchValue: string;
  toConfirm: (doc: IDayPlanConfirmParams, callback: () => void) => void;
};

type State = {
  searchValue: string;
};

class DayPlans extends React.Component<Props, State> {
  private timer?: NodeJS.Timer;

  constructor(props: Props) {
    super(props);

    this.state = {
      searchValue: this.props.searchValue || ''
    };
  }

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

  onChange = () => {
    const { toggleAll, dayPlans } = this.props;
    toggleAll(dayPlans, 'dayPlans');
  };

  renderRow = () => {
    const {
      dayPlans,
      history,
      toggleBulk,
      bulk,
      edit,
      timeFrames
    } = this.props;

    return dayPlans.map(dayPlan => (
      <Row
        key={dayPlan._id}
        history={history}
        dayPlan={dayPlan}
        timeFrames={timeFrames}
        toggleBulk={toggleBulk}
        isChecked={bulk.includes(dayPlan)}
        edit={edit}
      />
    ));
  };

  modalContent = props => {
    return <Form {...props} history={this.props.history} />;
  };

  removeDayPlans = dayPlans => {
    const dayPlanIds: string[] = [];

    dayPlans.forEach(dayPlan => {
      dayPlanIds.push(dayPlan._id);
    });

    this.props.remove({ dayPlanIds }, this.props.emptyBulk);
  };

  actionBarRight() {
    const { bulk, queryParams, emptyBulk, toConfirm } = this.props;
    const {
      date,
      branchId,
      departmentId,
      productCategoryId,
      productId
    } = queryParams;
    const _date = new Date(moment(date).format('YYYY/MM/DD'));

    if (bulk.length) {
      const onClick = () =>
        confirm()
          .then(() => {
            this.removeDayPlans(bulk);
          })
          .catch(error => {
            Alert.error(error.message);
          });

      return (
        <Button
          btnStyle="danger"
          size="small"
          icon="cancel-1"
          onClick={onClick}
        >
          Remove
        </Button>
      );
    }

    const trigger = (
      <Button btnStyle="success" icon="plus-circle">
        Add plans
      </Button>
    );

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
          size={'lg'}
          title="Add label"
          trigger={trigger}
          autoOpenKey="showProductModal"
          content={this.modalContent}
        />
        <Button
          btnStyle="primary"
          icon="calcualtor"
          disabled={!(branchId && departmentId && date)}
          // disabled={!(branchId && departmentId && date && _date > new Date())}
          onClick={() =>
            toConfirm(
              {
                date: _date,
                departmentId: (departmentId || '').toString(),
                branchId: (branchId || '').toString(),
                productCategoryId: (productCategoryId || '').toString(),
                productId: (productId || '').toString(),
                ids: bulk.map(b => b._id)
              },
              emptyBulk
            )
          }
        >
          {__('To Confirm')}
        </Button>
      </BarItems>
    );
  }

  render() {
    const {
      isAllSelected,
      totalCount,
      totalSum,
      queryParams,
      history,
      timeFrames
    } = this.props;

    const timeIds = Object.keys(totalSum).filter(k => k !== 'planCount');
    const totalSumValue = timeIds.reduce(
      (sum, i) => Number(sum) + Number(totalSum[i]),
      0
    );
    const totalDiff = totalSumValue - totalSum.planCount;
    const content = (
      <TableWrapper>
        <Table hover={true} responsive={true}>
          <thead>
            <tr>
              <th rowSpan={2} style={{ width: 60 }}>
                <FormControl
                  checked={isAllSelected}
                  componentClass="checkbox"
                  onChange={this.onChange}
                />
              </th>
              <th rowSpan={2}>{__('Date')}</th>
              <th rowSpan={2}>{__('Branch')}</th>
              <th rowSpan={2}>{__('Department')}</th>
              <th rowSpan={2}>{__('Product')}</th>
              <th>{__('Uom')}</th>
              <th>{__('Plan')}</th>
              {timeFrames.map(tf => (
                <th key={tf._id}>{tf.name}</th>
              ))}

              <th>{__('Sum')}</th>
              <th>{__('Diff')}</th>
              <th>{__('')}</th>
            </tr>
            <tr>
              <th>{__('Sum')}:</th>
              <th>{(totalSum.planCount || 0).toLocaleString()}</th>
              {timeFrames.map(tf => (
                <th key={tf._id}>{totalSum[tf._id || '']}</th>
              ))}

              <th>{(totalSumValue || 0).toLocaleString()}</th>
              <th>{(totalDiff || 0).toLocaleString()}</th>
              <th>{__('')}</th>
            </tr>
          </thead>
          <tbody>{this.renderRow()}</tbody>
        </Table>
      </TableWrapper>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Sales Day plans')}
            submenu={menuSalesplans}
          />
        }
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{__('Sales Day plans')}</Title>}
            right={this.actionBarRight()}
          />
        }
        leftSidebar={<Sidebar queryParams={queryParams} history={history} />}
        content={
          <DataWithLoader
            data={content}
            loading={false}
            count={totalCount}
            emptyText="There is no data"
            emptyImage="/images/actions/5.svg"
          />
        }
        footer={<Pagination count={totalCount} />}
        transparent={true}
        hasBorder
      />
    );
  }
}

export default DayPlans;
