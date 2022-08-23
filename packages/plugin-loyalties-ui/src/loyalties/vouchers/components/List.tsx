import React from 'react';
import Sidebar from './Sidebar';
import VoucherForm from '../containers/Form';
import VoucherRow from './Row';
import {
  Button,
  DataWithLoader,
  FormControl,
  ModalTrigger,
  Pagination,
  SortHandler,
  Table
} from '@erxes/ui/src/components';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __, Alert, confirm, router } from '@erxes/ui/src/utils';
import { BarItems } from '@erxes/ui/src/layout/styles';
import {
  MainStyleCount as Count,
  MainStyleTitle as Title
} from '@erxes/ui/src/styles/eindex';
import { IRouterProps, IQueryParams } from '@erxes/ui/src/types';
import { IVoucher } from '../types';
import { IVoucherCampaign } from '../../../configs/voucherCampaign/types';
import { LoyaltiesTableWrapper } from '../../common/styles';
import { menuLoyalties } from '../../common/constants';
import { withRouter } from 'react-router-dom';

interface IProps extends IRouterProps {
  vouchers: IVoucher[];
  currentCampaign?: IVoucherCampaign;
  loading: boolean;
  searchValue: string;
  totalCount: number;
  // TODO: check is below line not throwing error ?
  toggleBulk: () => void;
  toggleAll: (targets: IVoucher[], containerId: string) => void;
  bulk: any[];
  isAllSelected: boolean;
  emptyBulk: () => void;
  removeVouchers: (
    doc: { voucherIds: string[] },
    emptyBulk: () => void
  ) => void;
  history: any;
  queryParams: IQueryParams;
}

type State = {
  searchValue?: string;
};

class VouchersList extends React.Component<IProps, State> {
  private timer?: NodeJS.Timer = undefined;

  constructor(props) {
    super(props);

    this.state = {
      searchValue: this.props.searchValue
    };
  }

  onChange = () => {
    const { toggleAll, vouchers } = this.props;
    toggleAll(vouchers, 'vouchers');
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

  removeVouchers = vouchers => {
    const voucherIds: string[] = [];

    vouchers.forEach(voucher => {
      voucherIds.push(voucher._id);
    });

    this.props.removeVouchers({ voucherIds }, this.props.emptyBulk);
  };

  moveCursorAtTheEnd = e => {
    const tmpValue = e.target.value;
    e.target.value = '';
    e.target.value = tmpValue;
  };

  render() {
    const {
      vouchers,
      history,
      loading,
      toggleBulk,
      bulk,
      isAllSelected,
      totalCount,
      queryParams,
      currentCampaign
    } = this.props;

    const renderCheckbox = () => {
      if (
        !currentCampaign ||
        ['spin', 'lottery'].includes(currentCampaign.voucherType)
      ) {
        return;
      }
      return (
        <th>
          <FormControl
            checked={isAllSelected}
            componentClass="checkbox"
            onChange={this.onChange}
          />
        </th>
      );
    };

    const mainContent = (
      <LoyaltiesTableWrapper>
        <Table whiteSpace="nowrap" bordered={true} hover={true}>
          <thead>
            <tr>
              {renderCheckbox()}
              <th>
                <SortHandler sortField={'createdAt'} label={__('Created')} />
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="vouchers">
            {vouchers.map(voucher => (
              <VoucherRow
                voucher={voucher}
                isChecked={bulk.includes(voucher)}
                key={voucher._id}
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
        Add voucher
      </Button>
    );

    const voucherForm = props => {
      return <VoucherForm {...props} queryParams={queryParams} />;
    };

    const actionBarRight = () => {
      if (bulk.length > 0) {
        const onClick = () =>
          confirm()
            .then(() => {
              this.removeVouchers(bulk);
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
            title="New voucher"
            trigger={addTrigger}
            autoOpenKey="showVoucherModal"
            content={voucherForm}
            backDrop="static"
          />
        </BarItems>
      );
    };

    const actionBarLeft = (
      <Title>
        {(currentCampaign &&
          `${currentCampaign.voucherType}: ${currentCampaign.title}`) ||
          'All voucher campaigns'}{' '}
      </Title>
    );
    const actionBar = (
      <Wrapper.ActionBar right={actionBarRight()} left={actionBarLeft} />
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__(`Vouchers`) + ` (${totalCount})`}
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
          />
        }
        content={
          <>
            <Count>
              {totalCount} voucher{totalCount > 1 && 's'}
            </Count>
            <DataWithLoader
              data={mainContent}
              loading={loading}
              count={vouchers.length}
              emptyText="Add in your first voucher!"
              emptyImage="/images/actions/1.svg"
            />
          </>
        }
        hasBorder
      />
    );
  }
}

export default withRouter<IRouterProps>(VouchersList);
