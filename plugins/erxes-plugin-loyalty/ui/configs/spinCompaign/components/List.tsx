import {
  __, Button, ControlLabel, FormControl, FormGroup, HeaderDescription, Info,
  MainStyleTitle as Title, Wrapper, CollapseContent, BarItems, DataWithLoader, Table, ModalTrigger, router, confirm
} from 'erxes-ui';
import React from 'react';
import Sidebar from '../../general/components/Sidebar';
import { ISpinCompaign } from '../types';
import Row from './Row';
import Form from '../containers/Form'
import { Alert } from 'erxes-ui';

type Props = {
  spinCompaigns: ISpinCompaign[];
  loading: boolean;
  isAllSelected: boolean;
  toggleAll: (targets: ISpinCompaign[], containerId: string) => void;
  history: any;
  queryParams: any;
  bulk: any[];
  emptyBulk: () => void;
  toggleBulk: () => void;
  remove: (doc: { spinCompaignIds: string[] }, emptyBulk: () => void) => void;
  searchValue: string;
  filterStatus: string;
  // configsMap: IConfigsMap;
};

type State = {
  // configsMap: IConfigsMap;
  searchValue: string,
  filterStatus: string
};

class SpinCompaigns extends React.Component<Props, State> {
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
    const { toggleAll, spinCompaigns } = this.props;
    toggleAll(spinCompaigns, 'spinCompaigns');
  };

  renderRow = () => {
    const { spinCompaigns, history, toggleBulk, bulk } = this.props;

    return spinCompaigns.map(spinCompaign => (
      <Row
        key={spinCompaign._id}
        history={history}
        spinCompaign={spinCompaign}
        toggleBulk={toggleBulk}
        isChecked={bulk.includes(spinCompaign)}
      />
    ));
  };

  modalContent = props => {
    return (
      <Form {...props} />
    )
  };

  removeSpinCompaigns = spinCompaigns => {
    const spinCompaignIds: string[] = [];

    spinCompaigns.forEach(spinCompaign => {
      spinCompaignIds.push(spinCompaign._id);
    });

    this.props.remove({ spinCompaignIds }, this.props.emptyBulk);
  };

  actionBarRight() {
    const { bulk } = this.props;

    if (bulk.length) {
      const onClick = () =>
        confirm()
          .then(() => {
            this.removeSpinCompaigns(bulk);
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
        Add spin
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
          title="Add spin compaign"
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
      { title: __('Spin Compaign') }
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
            title={__('Spin Compaign')}
            breadcrumb={breadcrumb}
          />
        }
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{__('Spin Compaign')}</Title>}
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

export default SpinCompaigns;
