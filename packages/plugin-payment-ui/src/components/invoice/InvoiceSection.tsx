import Box from '@erxes/ui/src/components/Box';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Icon from '@erxes/ui/src/components/Icon';
import Label from '@erxes/ui/src/components/Label';
import Table from '@erxes/ui/src/components/table';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';
import Modal from 'react-bootstrap/Modal';
import InvoiceDetail from '../../containers/invoice/Detail';
import { IInvoice } from '../../types';

export type Props = {
  invoices: IInvoice[];
  onReload: () => void;
};

export default function Component(props: Props) {
  const { invoices, onReload } = props;
  const [showModal, setShowModal] = React.useState(false);
  const [currentInvoiceId, setCurrentInvoiceId] = React.useState<
    string | undefined
  >(undefined);

  const onRefresh = () => {
    onReload();
  };

  const reload = (
    <a href="#refresh" onClick={onRefresh} tabIndex={0}>
      <Icon icon="refresh" size={8} />
    </a>
  );

  const renderBody = () => {
    if (!invoices || !invoices.length) {
      return <EmptyState icon="user-6" text="No data" />;
    }

    const renderStatus = status => {
      let labelStyle = 'error';

      switch (status) {
        case 'paid':
          labelStyle = 'success';
          break;
        case 'pending':
          labelStyle = 'warning';
          break;
        default:
          labelStyle = 'error';
      }

      return (
        <td>
          <Label lblStyle={labelStyle}>{status}</Label>
        </td>
      );
    };

    return (
      <div>
        <Table hover={true}>
          <thead>
            <tr>
              <th>{__('Kind')}</th>
              <th>{__('Amount')}</th>
              <th>{__('Status')}</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice, index) => (
              <tr
                key={index}
                onClick={() => {
                  setCurrentInvoiceId(invoice._id);
                  setShowModal(true);
                }}
              >
                <td>{invoice.payment.kind}</td>
                <td>{invoice.amount.toFixed(2)}</td>
                {renderStatus(invoice.status)}
              </tr>
            ))}
          </tbody>
        </Table>

        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton={true}>
            <Modal.Title>{__('Invoice detail')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <InvoiceDetail id={currentInvoiceId || ''} />
          </Modal.Body>
        </Modal>
      </div>
    );
  };

  return (
    <Box
      title={__('Invoices')}
      extraButtons={reload}
      isOpen={true}
      name="invoiceList"
    >
      {renderBody()}
    </Box>
  );
}
