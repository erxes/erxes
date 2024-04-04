import { Alert, __, confirm, router } from '@erxes/ui/src/utils';
import {
  Button,
  DataWithLoader,
  FormControl,
  HeaderDescription,
  ModalTrigger,
  Pagination,
  Table
} from '@erxes/ui/src/components';
import {
  FilterContainer,
  FlexItem,
  FlexRow,
  InputBar,
  Title
} from '@erxes/ui-settings/src/styles';

import Form from '../containers/Form';
import { IVoucherCampaign } from '../types';
import Icon from '@erxes/ui/src/components/Icon';
import React from 'react';
import Row from './Row';
import Sidebar from '../../general/components/Sidebar';
import { Wrapper } from '@erxes/ui/src/layout';

type Props = {
  voucherCampaigns: IVoucherCampaign[];
  loading: boolean;
  isAllSelected: boolean;
  toggleAll: (targets: IVoucherCampaign[], containerId: string) => void;
  history: any;
  queryParams: any;
  bulk: any[];
  emptyBulk: () => void;
  toggleBulk: () => void;
  remove: (
    doc: { voucherCampaignIds: string[] },
    emptyBulk: () => void
  ) => void;
  searchValue: string;
  filterStatus: string;
  totalCount?: number;
};

type State = {
  searchValue: string;
  filterStatus: string;
};

class VoucherCampaigns extends React.Component<Props, State> {
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
    const { toggleAll, voucherCampaigns } = this.props;
    toggleAll(voucherCampaigns, 'voucherCampaigns');
  };

  renderRow = () => {
    const { voucherCampaigns, history, toggleBulk, bulk } = this.props;

    return voucherCampaigns.map(voucherCampaign => (
      <Row
        key={voucherCampaign._id}
        history={history}
        voucherCampaign={voucherCampaign}
        toggleBulk={toggleBulk}
        isChecked={bulk.includes(voucherCampaign)}
      />
    ));
  };

  modalContent = props => {
    return <Form {...props} />;
  };

  removeVoucherCampaigns = voucherCampaigns => {
    const voucherCampaignIds: string[] = [];

    voucherCampaigns.forEach(voucherCampaign => {
      voucherCampaignIds.push(voucherCampaign._id);
    });

    this.props.remove({ voucherCampaignIds }, this.props.emptyBulk);
  };

  actionBarRight() {
    const { bulk } = this.props;

    if (bulk.length) {
      const onClick = () =>
        confirm()
          .then(() => {
            this.removeVoucherCampaigns(bulk);
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
        Add voucher campaign
      </Button>
    );

    return (
      <FilterContainer>
        <FlexRow>
          <InputBar type="searchBar">
            <Icon icon="search-1" size={20} />
            <FlexItem>
              <FormControl
                type="text"
                placeholder={__('Type to search')}
                onChange={this.search}
                value={this.state.searchValue}
                autoFocus={true}
                onFocus={this.moveCursorAtTheEnd}
              />
            </FlexItem>
          </InputBar>
          <ModalTrigger
            size={'lg'}
            title="Add voucher campaign"
            trigger={trigger}
            autoOpenKey="showProductModal"
            content={this.modalContent}
          />
        </FlexRow>
      </FilterContainer>
    );
  }

  render() {
    const { loading, isAllSelected, totalCount, voucherCampaigns } = this.props;

    const header = (
      <HeaderDescription
        icon="/images/actions/25.svg"
        title="Loyalty configs"
        description=""
      />
    );

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      {
        title: __('Loyalties Config'),
        link: '/erxes-plugin-loyalty/settings/general'
      },
      { title: __('Voucher Campaign') }
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
            <th>{__('Finish Date of Use')}</th>
            <th>{__('Type')}</th>
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
            title={__('Voucher Campaign')}
            breadcrumb={breadcrumb}
          />
        }
        mainHead={header}
        actionBar={
          <Wrapper.ActionBar
            left={<Title capitalize={true}>{__('Voucher Campaign')}</Title>}
            right={this.actionBarRight()}
          />
        }
        content={
          <DataWithLoader
            data={content}
            loading={loading}
            count={voucherCampaigns.length}
            emptyText="There is no data"
            emptyImage="/images/actions/5.svg"
          />
        }
        leftSidebar={<Sidebar />}
        transparent={true}
        hasBorder={true}
        footer={<Pagination count={totalCount && totalCount} />}
      />
    );
  }
}

export default VoucherCampaigns;
