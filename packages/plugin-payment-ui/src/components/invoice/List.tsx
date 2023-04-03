import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import FormControl from '@erxes/ui/src/components/form/Control';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { BarItems } from '@erxes/ui/src/layout/styles';
import { Count } from '@erxes/ui/src/styles/main';
import { IRouterProps } from '@erxes/ui/src/types';
import { __, Alert, confirm, router } from '@erxes/ui/src/utils';
import React from 'react';

import { IInvoice, InvoicesCount } from '../../types';
import Row from './Row';
import Sidebar from './SideBar';

interface IProps extends IRouterProps {
  history: any;
  queryParams: any;
  invoices: IInvoice[];
  isAllSelected: boolean;
  bulk: any[];
  emptyBulk: () => void;
  remove: (doc: { invoiceIds: string[] }, emptyBulk: () => void) => void;
  toggleBulk: () => void;
  toggleAll: (targets: IInvoice[], containerId: string) => void;
  loading: boolean;
  searchValue: string;
  counts: InvoicesCount;
}

type State = {
  searchValue?: string;
};

class List extends React.Component<IProps, State> {
  private timer?: NodeJS.Timer;

  constructor(props) {
    super(props);

    this.state = {
      searchValue: this.props.searchValue
    };
  }

  renderRow = () => {
    const { invoices, history, toggleBulk, bulk } = this.props;

    return invoices.map(invoice => (
      <Row
        history={history}
        key={invoice._id}
        invoice={invoice}
        toggleBulk={toggleBulk}
        isChecked={bulk.includes(invoice)}
      />
    ));
  };

  onChange = () => {
    const { toggleAll, invoices } = this.props;
    toggleAll(invoices, 'invoices');
  };

  removeInvoices = invoices => {
    const invoiceIds: string[] = [];

    invoices.forEach(i => {
      invoiceIds.push(i._id);
    });

    this.props.remove({ invoiceIds }, this.props.emptyBulk);
  };

  renderCount = invoicesCount => {
    return (
      <Count>
        {invoicesCount} Invoice{invoicesCount > 1 && 's'}
      </Count>
    );
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

  moveCursorAtTheEnd(e) {
    const tmpValue = e.target.value;

    e.target.value = '';
    e.target.value = tmpValue;
  }

  render() {
    const { counts, loading, isAllSelected, bulk } = this.props;

    let invoiceBarRight = (
      <BarItems>
        <FormControl
          type="text"
          placeholder={__('Type to search')}
          onChange={this.search}
          value={this.state.searchValue}
          autoFocus={true}
          onFocus={this.moveCursorAtTheEnd}
        />
      </BarItems>
    );

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
              <th>{__('Payment name')}</th>
              <th>{__('Kind')}</th>
              <th>{__('Amount')}</th>
              <th>{__('Status')}</th>
              <th>{__('Customer')}</th>
              <th>{__('Customer Type')}</th>
              <th>{__('Description')}</th>
              <th>{__('Created date')}</th>
              <th>{__('Resolved date')}</th>
            </tr>
          </thead>
          <tbody>{this.renderRow()}</tbody>
        </Table>
      </>
    );

    if (bulk.length > 0) {
      const onClick = () =>
        confirm()
          .then(() => {
            this.removeInvoices(bulk);
          })
          .catch(error => {
            Alert.error(error.message);
          });

      invoiceBarRight = (
        <BarItems>
          <Button
            btnStyle="danger"
            size="small"
            icon="cancel-1"
            onClick={onClick}
          >
            Remove
          </Button>
        </BarItems>
      );
    }

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Invoices')}
            breadcrumb={[{ title: __('Invoices') }]}
            queryParams={this.props.queryParams}
          />
        }
        leftSidebar={
          <Sidebar counts={this.props.counts || ({} as InvoicesCount)} />
        }
        footer={<Pagination count={counts.total} />}
        actionBar={<Wrapper.ActionBar right={invoiceBarRight} />}
        content={
          <DataWithLoader
            data={content}
            loading={loading}
            count={counts.total}
            emptyText="There is no data"
            emptyImage="/images/actions/5.svg"
          />
        }
        hasBorder={true}
        transparent={true}
      />
    );
  }
}

export default List;
