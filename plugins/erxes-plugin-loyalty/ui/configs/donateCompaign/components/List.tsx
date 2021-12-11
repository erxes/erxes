import {
  __, Button, ControlLabel, FormControl, FormGroup, HeaderDescription, Info,
  MainStyleTitle as Title, Wrapper, CollapseContent, BarItems, DataWithLoader, Table, ModalTrigger, router, confirm
} from 'erxes-ui';
import React from 'react';
import Sidebar from '../../general/components/Sidebar';
import { IDonateCompaign } from '../types';
import Row from './Row';
import { Link } from 'react-router-dom';
import Form from '../containers/Form'
import { Alert } from 'erxes-ui';

type Props = {
  donateCompaigns: IDonateCompaign[];
  loading: boolean;
  isAllSelected: boolean;
  toggleAll: (targets: IDonateCompaign[], containerId: string) => void;
  history: any;
  queryParams: any;
  bulk: any[];
  emptyBulk: () => void;
  toggleBulk: () => void;
  remove: (doc: { donateCompaignIds: string[] }, emptyBulk: () => void) => void;
  searchValue: string;
  filterStatus: string;
  // configsMap: IConfigsMap;
};

type State = {
  // configsMap: IConfigsMap;
  searchValue: string,
  filterStatus: string
};

class DonateCompaigns extends React.Component<Props, State> {
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
    const { toggleAll, donateCompaigns } = this.props;
    toggleAll(donateCompaigns, 'donateCompaigns');
  };

  renderRow = () => {
    const { donateCompaigns, history, toggleBulk, bulk } = this.props;

    return donateCompaigns.map(donateCompaign => (
      <Row
        key={donateCompaign._id}
        history={history}
        donateCompaign={donateCompaign}
        toggleBulk={toggleBulk}
        isChecked={bulk.includes(donateCompaign)}
      />
    ));
  };

  modalContent = props => {
    return (
      <Form {...props} />
    )
  };

  removeDonateCompaigns = donateCompaigns => {
    const donateCompaignIds: string[] = [];

    donateCompaigns.forEach(donateCompaign => {
      donateCompaignIds.push(donateCompaign._id);
    });

    this.props.remove({ donateCompaignIds }, this.props.emptyBulk);
  };

  actionBarRight() {
    const { bulk } = this.props;

    if (bulk.length) {
      const onClick = () =>
        confirm()
          .then(() => {
            this.removeDonateCompaigns(bulk);
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
      )
    }

    const trigger = (
      <Button btnStyle="success" icon="plus-circle">
        Add donate
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
          title="Add donate compaign"
          trigger={trigger}
          autoOpenKey="showProductModal"
          content={this.modalContent}
        />
      </BarItems>
    )
  }

  render() {
    const { loading, isAllSelected } = this.props;
    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Donate Compaign') }
    ];

    const content = (
      <>
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
              <th>{__('Status')}</th>
            </tr>
          </thead>
          <tbody>{this.renderRow()}</tbody>
        </Table>
      </>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Donate Compaign')}
            breadcrumb={breadcrumb}
          />
        }
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{__('Donate Compaign')}</Title>}
            right={this.actionBarRight()}
          />
        }
        content={
          <DataWithLoader
            data={content}
            loading={loading}
            // count={productsCount}
            emptyText="There is no data"
            emptyImage="/images/actions/5.svg"
          />
        }
        leftSidebar={<Sidebar />}
      />
    );
  }
}

export default DonateCompaigns;
