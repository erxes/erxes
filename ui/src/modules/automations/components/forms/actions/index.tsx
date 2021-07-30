import { IAction } from 'modules/automations/types';
import React from 'react';
import { ModalFooter } from 'modules/common/styles/main';
import { PerformMathForm } from './PerformMath';
import IfForm from 'modules/automations/containers/forms/actions/IfForm';
import Button from 'modules/common/components/Button';
import { __ } from 'modules/common/utils';

type Props = {
  closeModal: () => void;
  onSave: (contentId: string) => void;
  action: IAction;
};

class DefaultForm extends React.Component<Props> {
  render() {
    const { closeModal, action, onSave } = this.props;

    return (
      <>
        <div>content {action.type}</div>
        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={closeModal}
            icon="times-circle"
          >
            {__('Cancel')}
          </Button>

          <Button
            btnStyle="success"
            icon="checked-1"
            onClick={onSave.bind(this, '')}
          >
            Save
          </Button>
        </ModalFooter>
      </>
    );
  }
}

export const ActionForms = {
  default: DefaultForm,
  performMath: PerformMathForm,
  if: IfForm
};
