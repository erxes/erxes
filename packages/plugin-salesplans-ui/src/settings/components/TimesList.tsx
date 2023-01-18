import Form from '../containers/TimesForm';
import ManageConfigsContainer from '../containers/ManageConfigs';
import React from 'react';
import Row from './TimesRow';
import TimesSidebar from './TimesSidebar';
import Sidebar from './Sidebar';
import { __, Alert, confirm, router } from '@erxes/ui/src/utils';
import { BarItems, Wrapper } from '@erxes/ui/src/layout';
import {
  Button,
  DataWithLoader,
  FormControl,
  ModalTrigger,
  Table
} from '@erxes/ui/src/components';
import { ITimeProportion } from '../types';
import { MainStyleTitle as Title } from '@erxes/ui/src/styles/eindex';

type Props = {
  timeProportions: ITimeProportion[];
  totalCount: number;
  isAllSelected: boolean;
  toggleAll: (targets: ITimeProportion[], containerId: string) => void;
  history: any;
  queryParams: any;
  bulk: any[];
  emptyBulk: () => void;
  toggleBulk: () => void;
  remove: (doc: { timeProportionIds: string[] }, emptyBulk: () => void) => void;
};

type State = {};

class TimeProportion extends React.Component<Props, State> {
  private timer?: NodeJS.Timer;

  constructor(props: Props) {
    super(props);

    this.state = {};
  }

  onChange = () => {
    const { toggleAll, timeProportions } = this.props;
    toggleAll(timeProportions, 'timeProportions');
  };

  renderRow = () => {
    const { timeProportions, history, toggleBulk, bulk } = this.props;

    return timeProportions.map(timeProportion => (
      <Row
        key={timeProportion._id}
        history={history}
        timeProportion={timeProportion}
        toggleBulk={toggleBulk}
        isChecked={bulk.includes(timeProportion)}
      />
    ));
  };

  modalContent = props => {
    return <Form {...props} />;
  };

  removeTimeProportion = timeProportions => {
    const timeProportionIds: string[] = [];

    timeProportions.forEach(timeProportion => {
      timeProportionIds.push(timeProportion._id);
    });

    this.props.remove({ timeProportionIds }, this.props.emptyBulk);
  };

  actionBarRight() {
    const { bulk } = this.props;

    if (bulk.length) {
      const onClick = () =>
        confirm()
          .then(() => {
            this.removeTimeProportion(bulk);
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

    const manageConfigContent = (formProps: any) => {
      return <ManageConfigsContainer {...formProps} />;
    };
    const manageConfigTrigger = (
      <Button type="button" icon="processor" size="small" uppercase={false}>
        {__('Manage Day interval')}
      </Button>
    );

    const trigger = (
      <Button btnStyle="success" icon="plus-circle">
        Add time proportions
      </Button>
    );

    return (
      <BarItems>
        <ModalTrigger
          size="lg"
          title={__('Manage Day interval')}
          autoOpenKey="showSLManageDayConfigs"
          trigger={manageConfigTrigger}
          content={manageConfigContent}
          enforceFocus={false}
        />
        <ModalTrigger
          size={'lg'}
          title="Add time proportions"
          trigger={trigger}
          autoOpenKey="showProductModal"
          content={this.modalContent}
        />
      </BarItems>
    );
  }

  render() {
    const { isAllSelected, totalCount, queryParams, history } = this.props;
    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Sales Plans Times') }
    ];

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
            <th>{__('Branch')}</th>
            <th>{__('Department')}</th>
            <th>{__('Product Category')}</th>
            <th>{__('Percents')}</th>
          </tr>
        </thead>
        <tbody>{this.renderRow()}</tbody>
      </Table>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Sales Plans Times')}
            breadcrumb={breadcrumb}
          />
        }
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{__('Sales Plans Times')}</Title>}
            right={this.actionBarRight()}
          />
        }
        content={
          <DataWithLoader
            data={content}
            loading={false}
            count={totalCount}
            emptyText="There is no data"
            emptyImage="/images/actions/5.svg"
          />
        }
        leftSidebar={
          <Sidebar
            queryParams={queryParams}
            history={history}
            children={TimesSidebar}
          />
        }
        transparent={true}
        hasBorder
      />
    );
  }
}

export default TimeProportion;
