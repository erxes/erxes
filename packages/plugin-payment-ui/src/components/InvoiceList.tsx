import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import FormControl from '@erxes/ui/src/components/form/Control';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Table from '@erxes/ui/src/components/table';
import { Count } from '@erxes/ui/src/styles/main';
import { IRouterProps } from '@erxes/ui/src/types';
import { __, Alert, confirm, router } from '@erxes/ui/src/utils';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { BarItems } from '@erxes/ui/src/layout/styles';
import React from 'react';
import { IInvoice } from 'types';
import Row from './InvoiceListRow';
import client from '@erxes/ui/src/apolloClient';
import gql from 'graphql-tag';
import { mutations } from '../graphql';

interface IProps extends IRouterProps {
  history: any;
  queryParams: any;
  invoices: IInvoice[];
  invoicesTotalCount: number;
  isAllSelected: boolean;
  bulk: any[];
  emptyBulk: () => void;
  toggleBulk: () => void;
  toggleAll: (targets: IInvoice[], containerId: string) => void;
  loading: boolean;
  searchValue: string;
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

  cancelInvoice = invoices => {
    const invoice = invoices[0];

    if (invoices.length > 1) {
      alert('Please cancel invoice one by one!');
      return;
    }

    console.log('invoice:', invoice);

    if (!invoice.paymentId) {
      alert('Payment config id not defined');
      return;
    }

    client
      .query({
        query: gql(mutations.cancelInvoice),
        fetchPolicy: 'network-only',
        variables: {
          invoiceId: invoice.invoiceNo,
          paymentId: invoice.paymentId
        }
      })
      .then(async response => {
        const data = response.data.cancelInvoice;
        console.log('data: ', data);

        alert('Successfully canceled.');
      })
      .catch(error => {
        alert(error);
      });
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
    const { invoicesTotalCount, loading, isAllSelected, bulk } = this.props;

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
              <th>{__('Type')}</th>
              <th>{__('Amount')}</th>
              <th>{__('Content type')}</th>
              <th>{__('Status')}</th>
              <th>{__('Customer')}</th>
              <th>{__('Company')}</th>
              <th>{__('Comment')}</th>
              <th>{__('Created date')}</th>
              <th>{__('Payment date')}</th>
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
            this.cancelInvoice(bulk);
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
            Cancel invoice
          </Button>
        </BarItems>
      );
    }

    return (
      <Wrapper
        header={<Wrapper.Header title={__('Flow')} />}
        footer={<Pagination count={invoicesTotalCount} />}
        actionBar={
          <Wrapper.ActionBar
            left={this.renderCount(invoicesTotalCount)}
            right={invoiceBarRight}
          />
        }
        content={
          <DataWithLoader
            data={content}
            loading={loading}
            count={invoicesTotalCount}
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
