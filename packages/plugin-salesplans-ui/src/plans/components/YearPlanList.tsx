import React from 'react';
import Row from './YearPlanRow';
import Sidebar from './YearPlanSidebar';
import { __, Alert, confirm, router } from '@erxes/ui/src/utils';
import { BarItems, Wrapper } from '@erxes/ui/src/layout';
import {
  Button,
  DataWithLoader,
  FormControl,
  ModalTrigger,
  Table
} from '@erxes/ui/src/components';
import { IYearPlan } from '../types';
import { MainStyleTitle as Title } from '@erxes/ui/src/styles/eindex';
import Form from '../containers/YearPlanForm';
import { menuSalesplans, MONTHS } from '../../constants';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import { TableWrapper } from '../../styles';

type Props = {
  yearPlans: IYearPlan[];
  totalCount: number;
  totalSum: any;
  isAllSelected: boolean;
  toggleAll: (targets: IYearPlan[], containerId: string) => void;
  history: any;
  queryParams: any;
  bulk: any[];
  emptyBulk: () => void;
  toggleBulk: () => void;
  remove: (doc: { yearPlanIds: string[] }, emptyBulk: () => void) => void;
  edit: (doc: IYearPlan) => void;
  searchValue: string;
};

type State = {
  searchValue: string;
};

class YearPlans extends React.Component<Props, State> {
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
    const { toggleAll, yearPlans } = this.props;
    toggleAll(yearPlans, 'yearPlans');
  };

  renderRow = () => {
    const { yearPlans, history, toggleBulk, bulk, edit } = this.props;

    return yearPlans.map(yearPlan => (
      <Row
        key={yearPlan._id}
        history={history}
        yearPlan={yearPlan}
        toggleBulk={toggleBulk}
        isChecked={bulk.includes(yearPlan)}
        edit={edit}
      />
    ));
  };

  modalContent = props => {
    return <Form {...props} />;
  };

  removeYearPlans = yearPlans => {
    const yearPlanIds: string[] = [];

    yearPlans.forEach(yearPlan => {
      yearPlanIds.push(yearPlan._id);
    });

    this.props.remove({ yearPlanIds }, this.props.emptyBulk);
  };

  actionBarRight() {
    const { bulk } = this.props;

    if (bulk.length) {
      const onClick = () =>
        confirm()
          .then(() => {
            this.removeYearPlans(bulk);
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
      </BarItems>
    );
  }

  render() {
    const {
      isAllSelected,
      totalCount,
      totalSum,
      queryParams,
      history
    } = this.props;

    const content = (
      <TableWrapper>
        <Table hover={true}>
          <thead>
            <tr>
              <th style={{ width: 60 }} rowSpan={2}>
                <FormControl
                  checked={isAllSelected}
                  componentClass="checkbox"
                  onChange={this.onChange}
                />
              </th>
              <th rowSpan={2}>{__('Year')}</th>
              <th rowSpan={2}>{__('Branch')}</th>
              <th rowSpan={2}>{__('Department')}</th>
              <th rowSpan={2}>{__('Product')}</th>
              <th>{__('Uom')}</th>
              {MONTHS.map(m => (
                <th key={m}>{m}</th>
              ))}
              <th>{__('Sum')}</th>
              <th>{__('')}</th>
            </tr>
            <tr>
              <th>{__('Sum')}:</th>
              {MONTHS.map(m => (
                <th key={m}>{totalSum[m]}</th>
              ))}
              <th>
                {Object.values(totalSum).reduce(
                  (sum, i) => Number(sum) + Number(i),
                  0
                )}
              </th>
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
            title={__('Sales Year plans')}
            submenu={menuSalesplans}
          />
        }
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{__('Sales Year plans')}</Title>}
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

export default YearPlans;
