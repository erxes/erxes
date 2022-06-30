import React from 'react';
import { Button, ModalTrigger } from '@erxes/ui/src';
import ManageLabelsContainer from '../containers/ManageLabels';
import ManageConfigsContainer from '../containers/ManageConfigs';
import FormContainer from '../containers/Form';

type Props = {
  addData: (data: any) => void;
};

const ActionBar = (props: Props) => {
  const { addData } = props;

  const createLabelContent = (formProps: any) => {
    return <ManageLabelsContainer {...formProps} />;
  };

  const manageConfigContent = (formProps: any) => {
    return <ManageConfigsContainer {...formProps} />;
  };

  const createPlanContent = (formProps: any) => {
    return <FormContainer {...formProps} submit={addData} />;
  };

  const createLabelTrigger = (
    <Button type="button" icon="processor" size="small" uppercase={false}>
      Manage Labels
    </Button>
  );

  const manageConfigTrigger = (
    <Button type="button" icon="processor" size="small" uppercase={false}>
      Manage Day Configs
    </Button>
  );

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

  return (
    <>
      <ModalTrigger
        size="lg"
        title={'Manage Labels'}
        autoOpenKey="showSLManageLabels"
        trigger={createLabelTrigger}
        content={createLabelContent}
        enforceFocus={false}
      />
      <ModalTrigger
        size="lg"
        title={'Manage Day Configs'}
        autoOpenKey="showSLManageDayConfigs"
        trigger={manageConfigTrigger}
        content={manageConfigContent}
        enforceFocus={false}
      />
      <ModalTrigger
        size="lg"
        title={'Create Sales Log'}
        autoOpenKey="showSLCreateSalesLogModal"
        trigger={createPlanTrigger}
        content={createPlanContent}
        enforceFocus={false}
      />
    </>
  );
};

export default ActionBar;
