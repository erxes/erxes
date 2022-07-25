import React from 'react';
import { __, Wrapper, Button, ModalTrigger } from '@erxes/ui/src';

const Actionbar = () => {
  const createTransactionTrigger = (
    <Button
      type="button"
      btnStyle="success"
      icon="plus-circle"
      size="small"
      uppercase={false}
    >
      {__('Create Transaction')}
    </Button>
  );

  const createTransactionContent = (formProps: any) => {
    return <></>;
  };

  const renderRight = () => (
    <ModalTrigger
      size="lg"
      title={__('Create Transaction')}
      autoOpenKey="showInvCreateTransactionsModal"
      trigger={createTransactionTrigger}
      content={createTransactionContent}
      enforceFocus={false}
    />
  );

  return <Wrapper.ActionBar right={renderRight()} />;
};

export default Actionbar;
