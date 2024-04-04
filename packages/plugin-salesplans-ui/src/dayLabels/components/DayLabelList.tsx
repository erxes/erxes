import Form from '../containers/Form';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import React from 'react';
import Row from './DayLabelRow';
import Sidebar from './DayLabelSidebar';
import { __, Alert, confirm } from '@erxes/ui/src/utils';
import { BarItems, Wrapper } from '@erxes/ui/src/layout';
import {
  Button,
  DataWithLoader,
  FormControl,
  ModalTrigger,
  Table
} from '@erxes/ui/src/components';
import { IDayLabel } from '../types';
import { MainStyleTitle as Title } from '@erxes/ui/src/styles/eindex';
import { menuSalesplans } from '../../constants';

type Props = {
  dayLabels: IDayLabel[];
  totalCount: number;
  isAllSelected: boolean;
  toggleAll: (targets: IDayLabel[], containerId: string) => void;
  history: any;
  queryParams: any;
  bulk: any[];
  emptyBulk: () => void;
  toggleBulk: () => void;
  remove: (doc: { dayLabelIds: string[] }, emptyBulk: () => void) => void;
  edit: (doc: IDayLabel) => void;
  searchValue: string;
};

type State = {};

class DayLabels extends React.Component<Props, State> {
  private timer?: NodeJS.Timer;

  constructor(props: Props) {
    super(props);

    this.state = {};
  }

  onChange = () => {
    const { toggleAll, dayLabels } = this.props;
    toggleAll(dayLabels, 'dayLabels');
  };

  renderRow = () => {
    const { dayLabels, history, toggleBulk, bulk, edit } = this.props;

    return dayLabels.map(dayLabel => (
      <Row
        key={dayLabel._id}
        history={history}
        dayLabel={dayLabel}
        toggleBulk={toggleBulk}
        isChecked={bulk.includes(dayLabel)}
        edit={edit}
      />
    ));
  };

  modalContent = props => {
    return <Form {...props} />;
  };

  removeDayLabels = dayLabels => {
    const dayLabelIds: string[] = [];

    dayLabels.forEach(dayLabel => {
      dayLabelIds.push(dayLabel._id);
    });

    this.props.remove({ dayLabelIds }, this.props.emptyBulk);
  };

  actionBarRight() {
    const { bulk } = this.props;

    if (bulk.length) {
      const onClick = () =>
        confirm()
          .then(() => {
            this.removeDayLabels(bulk);
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
        Set Labels
      </Button>
    );

    return (
      <BarItems>
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
    const { isAllSelected, totalCount, queryParams, history } = this.props;

    const content = (
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
            <th>{__('Date')}</th>
            <th>{__('Branch')}</th>
            <th>{__('Department')}</th>
            <th>{__('Labels')}</th>
            <th>{__('')}</th>
          </tr>
        </thead>
        <tbody>{this.renderRow()}</tbody>
      </Table>
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
            left={<Title>{__('Day labels')}</Title>}
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

export default DayLabels;
