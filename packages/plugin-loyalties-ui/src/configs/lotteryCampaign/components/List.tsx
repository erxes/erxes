import Form from '../containers/Form';
import React from 'react';
import Row from './Row';
import Sidebar from '../../general/components/Sidebar';
import {
  Button,
  DataWithLoader,
  FormControl,
  ModalTrigger,
  Table
} from '@erxes/ui/src/components';
import { MainStyleTitle as Title } from '@erxes/ui/src/styles/eindex';
import { BarItems, Wrapper } from '@erxes/ui/src/layout';
import { __, confirm, router, Alert } from '@erxes/ui/src/utils';
import { ILotteryCampaign } from '../types';

type Props = {
  lotteryCampaigns: ILotteryCampaign[];
  loading: boolean;
  isAllSelected: boolean;
  toggleAll: (targets: ILotteryCampaign[], containerId: string) => void;
  history: any;
  queryParams: any;
  bulk: any[];
  emptyBulk: () => void;
  toggleBulk: () => void;
  remove: (
    doc: { lotteryCampaignIds: string[] },
    emptyBulk: () => void
  ) => void;
  searchValue: string;
  filterStatus: string;
};

type State = {
  searchValue: string;
  filterStatus: string;
};

class LotteryCampaigns extends React.Component<Props, State> {
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
    const { toggleAll, lotteryCampaigns } = this.props;
    toggleAll(lotteryCampaigns, 'lotteryCampaigns');
  };

  renderRow = () => {
    const { lotteryCampaigns, history, toggleBulk, bulk } = this.props;

    return lotteryCampaigns.map(lotteryCampaign => (
      <Row
        key={lotteryCampaign._id}
        history={history}
        lotteryCampaign={lotteryCampaign}
        toggleBulk={toggleBulk}
        isChecked={bulk.includes(lotteryCampaign)}
      />
    ));
  };

  modalContent = props => {
    return <Form {...props} />;
  };

  removeLotteryCampaigns = lotteryCampaigns => {
    const lotteryCampaignIds: string[] = [];

    lotteryCampaigns.forEach(lotteryCampaign => {
      lotteryCampaignIds.push(lotteryCampaign._id);
    });

    this.props.remove({ lotteryCampaignIds }, this.props.emptyBulk);
  };

  actionBarRight() {
    const { bulk } = this.props;

    if (bulk.length) {
      const onClick = () =>
        confirm()
          .then(() => {
            this.removeLotteryCampaigns(bulk);
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
        Add lottery
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
          title="Add lottery campaign"
          trigger={trigger}
          autoOpenKey="showProductModal"
          content={this.modalContent}
        />
      </BarItems>
    );
  }

  render() {
    const { loading, isAllSelected } = this.props;
    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Lottery Campaign') }
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
            <th>{__('Start Date')}</th>
            <th>{__('End Date')}</th>
            <th>{__('Finish date of Use')}</th>
            <th>{__('Status')}</th>
            <th>{__('Actions')}</th>
          </tr>
        </thead>
        <tbody>{this.renderRow()}</tbody>
      </Table>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Lottery Campaign')}
            breadcrumb={breadcrumb}
          />
        }
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{__('Lottery Campaign')}</Title>}
            right={this.actionBarRight()}
          />
        }
        content={
          <DataWithLoader
            data={content}
            loading={loading}
            emptyText="There is no data"
            emptyImage="/images/actions/5.svg"
          />
        }
        leftSidebar={<Sidebar />}
        hasBorder={true}
        transparent={true}
      />
    );
  }
}

export default LotteryCampaigns;
