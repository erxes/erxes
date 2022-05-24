import dayjs from 'dayjs';
import { Icon, __, Alert, Button, confirm, ModalTrigger } from '@erxes/ui/src';
import { ActivityIcon, ActivityRow } from '@erxes/ui/src/activityLogs/styles';
import React from 'react';
import {
  ItemLabel,
  ItemValue,
  ScheduleItem,
  ItemDesc
} from '../../contracts/styles';
import { IActivityLog } from '@erxes/ui/src/activityLogs/types';
import InvoiceForm from '../containers/InvoiceForm';
import TransactionForm from '../../transactions/containers/TransactionForm';

type Props = {
  activity: IActivityLog;
  removeInvoices: (doc: { invoiceIds: string[] }) => void;
  contractId: string;
};

const renderCol = (label, value, desc?) => {
  return (
    <ScheduleItem>
      <ItemLabel>{__(`${label}`)}</ItemLabel>
      <ItemValue>{value || '-'}</ItemValue>
      <ItemDesc>{desc}</ItemDesc>
    </ScheduleItem>
  );
};

const renderAddInvoice = content => {
  const invoiceForm = props => {
    return <InvoiceForm {...props} invoice={content} />;
  };

  const addTrigger = (
    <Button btnStyle="success" size="small" icon="plus-circle">
      {__('Add invoice')}
    </Button>
  );

  return (
    <ModalTrigger
      title={`${__('New invoice')}`}
      trigger={addTrigger}
      autoOpenKey="showContractModal"
      content={invoiceForm}
      size="lg"
      backDrop="static"
    />
  );
};

const renderAddTransaction = invoice => {
  const transactionForm = props => {
    return <TransactionForm {...props} invoice={invoice} />;
  };

  const addTrigger = (
    <Button btnStyle="success" size="small" icon="check-circle">
      {__('To Pay')}
    </Button>
  );

  return (
    <ModalTrigger
      title={`${__('To pay')}`}
      trigger={addTrigger}
      autoOpenKey="showContractModal"
      content={transactionForm}
      size="lg"
      backDrop="static"
    />
  );
};

const renderStatus = status => {
  if (status === 'done') {
    return (
      <ActivityIcon color={'blue'}>
        <Icon icon={'check'} />
      </ActivityIcon>
    );
  }
  return (
    <ActivityIcon color={'orange'}>
      <Icon icon={'file'} />
    </ActivityIcon>
  );
};

const renderButtons = (content, removeInvoices) => {
  const onDelete = () =>
    confirm()
      .then(() => {
        removeInvoices({ invoiceIds: [content._id] });
      })
      .catch(error => {
        Alert.error(error.message);
      });

  if (content.status === 'done') {
    return <></>;
  }
  return (
    <>
      <Button btnStyle="danger" size="small" icon="cancel-1" onClick={onDelete}>
        Delete
      </Button>
      {renderAddTransaction(content)}
    </>
  );
};

function PerInvoice(props: Props) {
  const { activity, removeInvoices } = props;
  const { content } = activity;

  if (content.status === 'empty') {
    return (
      <ActivityRow key={Math.random()}>{renderAddInvoice(content)}</ActivityRow>
    );
  }

  return (
    <ActivityRow key={Math.random()}>
      {renderStatus(content.status)}
      {renderCol('Pay Date', dayjs(content.payDate).format('ll'))}
      {renderCol(
        'Invoice payment',
        (content.payment || 0).toLocaleString(),
        content.transaction && content.transaction.payment
      )}
      {renderCol(
        'Invoice interest',
        (
          (content.interestEve || 0) + (content.interestNonce || 0)
        ).toLocaleString()
      )}
      {renderCol('Invoice undue', (content.undue || 0).toLocaleString())}
      {renderCol(
        'Invoice insurance',
        (content.insurance || 0).toLocaleString()
      )}
      {renderCol('Invoice debt', (content.debt || 0).toLocaleString())}
      {renderCol('Invoice total', (content.total || 0).toLocaleString())}
      {renderButtons(content, removeInvoices)}
    </ActivityRow>
  );
}

export default PerInvoice;
