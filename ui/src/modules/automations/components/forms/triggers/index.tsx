import { IAction } from 'modules/automations/types';
import React from 'react';
import { ModalFooter } from 'modules/common/styles/main';
import Button from 'modules/common/components/Button';
import FormSubmit from 'modules/automations/containers/forms/triggers/FormSubmit';
import { __ } from 'modules/common/utils';

type Props = {
  closeModal: () => void;
  onSave: (contentId: string) => void;
  action: IAction;
};

class DefaultForm extends React.Component<Props> {
  render() {
    console.log('action: ', this.props.action);
    return (
      <>
        <div>content {this.props.action.type}</div>
        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={this.props.closeModal}
            icon="times-circle"
          >
            {__('Cancel')}
          </Button>

          <Button
            btnStyle="success"
            icon="checked-1"
            onClick={this.props.onSave.bind(this, '')}
          >
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
