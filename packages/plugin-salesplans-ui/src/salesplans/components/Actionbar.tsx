import React from 'react';
import { __, Wrapper, Button, ModalTrigger } from '@erxes/ui/src';
import FormContainer from '../containers/Form';

type Props = {
  addData: (data: any) => void;
};

const Actionbar = (props: Props) => {
  const { addData } = props;

  const createPlanContent = (formProps: any) => {
    return <FormContainer {...formProps} submit={addData} />;
  };

  const createPlanTrigger = (
    <Button
      type="button"
      btnStyle="success"
      icon="plus-circle"
      size="small"
      uppercase={false}
    >
      Create sales plan
    </Button>
  );

  const renderRight = () => (
    <>
      <ModalTrigger
        title={'Create Sales Log'}
        autoOpenKey="showSLCreateSalesLogModal"
        trigger={createPlanTrigger}
        content={createPlanContent}
        enforceFocus={false}
      />
    </>
  );

  return <Wrapper.ActionBar right={renderRight()} />;
};

export default Actionbar;
