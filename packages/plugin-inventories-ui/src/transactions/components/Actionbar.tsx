import React from 'react';
// erxes
import { __ } from '@erxes/ui/src/utils';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import Button from '@erxes/ui/src/components/Button';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';

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
