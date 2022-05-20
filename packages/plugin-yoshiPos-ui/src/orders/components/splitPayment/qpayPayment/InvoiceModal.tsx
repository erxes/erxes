import React from 'react';
import Modal from 'react-bootstrap/Modal';
import dayjs from 'dayjs';

import Icon from 'modules/common/components/Icon';
import { IOrder, IQPayInvoice } from 'modules/orders/types';
import { InvoiceList, InvoiceListIcon } from './styles';
import Table from 'modules/common/components/table';
import { __ } from 'modules/common/utils';
import Button from 'modules/common/components/Button';
import { formatNumber } from 'modules/utils';
import Label from 'modules/common/components/Label';

type Props = {
  order: IOrder;
  toggleQPayModal: (invoce: IQPayInvoice) => void;
};

type State = {
  showModal: boolean;
};

export default class InvoiceModal extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      showModal: false
    };
  }

  toggleModal = () => {
    this.setState({ showModal: !this.state.showModal });
  };

  renderList(invoice) {
    return (
      <tr key={invoice._id}>
        <td>
          <Label lblStyle={invoice.status === 'PAID' ? 'success' : 'warning'}>
            {invoice.status}
          </Label>
        </td>
        <td>{formatNumber(Number(invoice.amount) || 0)}₮</td>
        <td>
          {invoice.paymentDate
            ? dayjs(invoice.paymentDate).format('YY/MM/DD HH:mm')
            : '-'}
        </td>
        <td>
          <Button
            size="small"
            btnStyle="warning"
            icon="eye"
            onClick={() => this.props.toggleQPayModal(invoice)}
          >
            {__('Show')}
          </Button>
        </td>
      </tr>
    );
  }

  renderContent() {
    const { qpayInvoices = [] } = this.props.order || ({} as IOrder);

    return (
      <InvoiceList>
        <Table hover={true} bordered={true} responsive={true}>
          <thead>
            <tr>
              <th>{__('Status')}</th>
              <th>{__('Amount')}</th>
              <th>{__('Paid date')}</th>
              <th>{__('Actions')}</th>
            </tr>
          </thead>
          <tbody>{qpayInvoices.map(invoice => this.renderList(invoice))}</tbody>
        </Table>
      </InvoiceList>
    );
  }

  render() {
    const { order } = this.props;

    if ((order.qpayInvoices || []).length === 0) {
      return null;
    }

    return (
      <>
        <InvoiceListIcon onClick={this.toggleModal}>
          <Icon icon="list-ul" />
        </InvoiceListIcon>
        <Modal
          enforceFocus={false}
          onHide={this.toggleModal}
          show={this.state.showModal}
          animation={false}
          size="lg"
        >
          {this.renderContent()}
        </Modal>
      </>
    );
  }
}
