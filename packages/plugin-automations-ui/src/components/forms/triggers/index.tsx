import { IAction } from '../../../types';
import React from 'react';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import Button from '@erxes/ui/src/components/Button';
import FormSubmit from '../../../containers/forms/triggers/subForms/FormSubmit';
import { __ } from '@erxes/ui/src/utils/core';

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
