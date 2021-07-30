import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import React from 'react';
import { IDashboard } from '../types';

type Props = {
  dashboard?: IDashboard;
  trigger?: React.ReactNode;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

type FinalProps = {
  closeModal: () => void;
} & Props;

const DashbaordFormContent = (props: FinalProps) => {
  const generateDoc = (values: { _id?: string; name: string }) => {
    const { dashboard } = props;
    const finalValues = values;

    if (dashboard) {
      finalValues._id = dashboard._id;
    }

    return {
      _id: finalValues._id,
      name: finalValues.name
    };
  };

  const renderContent = (formProps: IFormProps) => {
    const { dashboard, renderButton } = props;
    const { values, isSubmitted } = formProps;
    const object = dashboard || { name: '' };

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>

          <FormControl
            {...formProps}
            name="name"
            defaultValue={object.name}
            required={true}
            autoFocus={true}
          />
        </FormGroup>

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            icon="times-circle"
            onClick={props.closeModal}
          >
            Cancel
          </Button>

          {renderButton({
            name: 'dashboard',
            values: generateDoc(values),
            isSubmitted,
            callback: props.closeModal,
            object: dashboard
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form {...props} renderContent={renderContent} />;
};

const DashbaordForm = (props: Props) => {
  const defatulTrigger = (
    <Button icon="sitemap-1">{__('Create new Dashboard')}</Button>
  );

  const { dashboard, trigger = defatulTrigger, renderButton } = props;

  const content = modalProps => {
    const updatedProps = {
      ...modalProps,
      dashboard,
      renderButton
    };

    return <DashbaordFormContent {...updatedProps} />;
  };

  return (
    <ModalTrigger
      title={dashboard ? `Edit dashboard` : `Add dashboard`}
      autoOpenKey="showDashboardAddModal"
      trigger={trigger}
      content={content}
    />
  );
};

export default DashbaordForm;
