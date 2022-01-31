import { IAction } from 'modules/automations/types';
import React from 'react';
import { ModalFooter } from 'modules/common/styles/main';
import Button from 'modules/common/components/Button';
import FormSubmit from 'modules/automations/containers/forms/triggers/subForms/FormSubmit';
import { __ } from 'modules/common/utils';

type Props = {
  closeModal: () => void;
  onSave: () => void;
  action: IAction;
};

class DefaultForm extends React.Component<Props> {
  render() {
    const { action, closeModal, onSave } = this.props;

    return (
      <>
        <div>
          {__('content')} {action.type}
        </div>
        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={closeModal}
            icon="times-circle"
          >
            {__('Cancel')}
          </Button>

          <Button btnStyle="success" icon="checked-1" onClick={onSave}>
            Save
          </Button>
        </ModalFooter>
      </>
    );
  }
}

export const TriggerForms = {
  default: DefaultForm,
  formSubmit: FormSubmit
};
