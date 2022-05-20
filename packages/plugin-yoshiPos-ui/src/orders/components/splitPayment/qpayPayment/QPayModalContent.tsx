import React from 'react';
import Modal from 'react-bootstrap/Modal';

import { IInvoiceCheckParams, IOrder } from '../../../../orders/types';
import QPayRow from './QPayRow';
import { IQPayInvoice } from '../../../../qpay/types';

type Props = {
  checkQPayInvoice: (params: IInvoiceCheckParams) => void;
  cancelQPayInvoice: (id: string) => void;
  order: IOrder;
  showModal: boolean;
  toggleModal: () => void;
  invoice: IQPayInvoice | null;
  setInvoice: (invoice: IQPayInvoice) => void;
  refetchOrder: () => void;
};

export default class QPayModalContent extends React.Component<Props> {
  renderContent() {
    const {
      cancelQPayInvoice,
      checkQPayInvoice,
      order,
      toggleModal,
      invoice,
      setInvoice,
      refetchOrder
    } = this.props;

    const { _id } = order;

    if (!invoice) {
      return null;
    }

    return (
      <QPayRow
        item={invoice}
        key={invoice._id}
        checkQPayInvoice={checkQPayInvoice}
        cancelQPayInvoice={cancelQPayInvoice}
        orderId={_id}
        toggleModal={toggleModal}
        setInvoice={setInvoice}
        refetchOrder={refetchOrder}
      />
    );
  }

  render() {
    const { showModal, toggleModal } = this.props;

    return (
      <Modal
        enforceFocus={false}
        onHide={() => toggleModal()}
        show={showModal}
        animation={false}
      >
        {this.renderContent()}
      </Modal>
    );
  }
}
