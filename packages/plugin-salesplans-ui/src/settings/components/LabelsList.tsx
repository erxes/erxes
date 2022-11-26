import Form from '../containers/LabelsForm';
import React from 'react';
import Row from './LabelsRow';
import LabelsSidebar from './LabelsSidebar';
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
import { ISPLabel } from '../types';
import { MainStyleTitle as Title } from '@erxes/ui/src/styles/eindex';

type Props = {
  spLabels: ISPLabel[];
  totalCount: number;
  isAllSelected: boolean;
  toggleAll: (targets: ISPLabel[], containerId: string) => void;
  history: any;
  queryParams: any;
  bulk: any[];
  emptyBulk: () => void;
  toggleBulk: () => void;
  remove: (doc: { spLabelIds: string[] }, emptyBulk: () => void) => void;
  searchValue: string;
  filterStatus: string;
  minMultiplier: number;
  maxMultiplier: number;
};

type State = {
  searchValue: string;
  filterStatus: string;
};

class SPLabels extends React.Component<Props, State> {
  private timer?: NodeJS.Timer;

  constructor(props: Props) {
    super(props);

    this.state = {
      searchValue: this.props.searchValue || '',
      filterStatus: this.props.filterStatus || ''
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
    const { toggleAll, spLabels } = this.props;
    toggleAll(spLabels, 'spLabels');
  };

  renderRow = () => {
    const { spLabels, history, toggleBulk, bulk } = this.props;

    return spLabels.map(spLabel => (
      <Row
        key={spLabel._id}
        history={history}
        spLabel={spLabel}
        toggleBulk={toggleBulk}
        isChecked={bulk.includes(spLabel)}
      />
    ));
  };

  modalContent = props => {
    return <Form {...props} />;
  };

  removeSPLabels = spLabels => {
    const spLabelIds: string[] = [];

    spLabels.forEach(spLabel => {
      spLabelIds.push(spLabel._id);
    });

    this.props.remove({ spLabelIds }, this.props.emptyBulk);
  };

  actionBarRight() {
    const { bulk } = this.props;

    if (bulk.length) {
      const onClick = () =>
        confirm()
          .then(() => {
            this.removeSPLabels(bulk);
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
        Add label
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
    const { isAllSelected, totalCount, queryParams, history } = this.props;
    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Sales Plans Labels') }
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
            <th>{__('Title')}</th>
            <th>{__('Effect')}</th>
            <th>{__('Color')}</th>
            <th>{__('Status')}</th>
          </tr>
        </thead>
        <tbody>{this.renderRow()}</tbody>
      </Table>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Sales Plans Labels')}
            breadcrumb={breadcrumb}
          />
        }
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{__('Sales Plans Labels')}</Title>}
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
            children={LabelsSidebar}
          />
        }
        transparent={true}
        hasBorder
      />
    );
  }
}

export default SPLabels;
