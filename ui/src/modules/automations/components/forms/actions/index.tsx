import { IAction } from 'modules/automations/types';
import React from 'react';
import { ModalFooter } from 'modules/common/styles/main';
import SetProperty from './subForms/SetProperty';
import IfForm from 'modules/automations/containers/forms/actions/subForms/IfForm';
import Button from 'modules/common/components/Button';
import { __ } from 'modules/common/utils';
import BoardItemForm from 'modules/automations/containers/forms/actions/subForms/BoardItemForm';
import Delay from './subForms/Delay';

type Props = {
  onSave: () => void;
  closeModal: () => void;
  activeAction: IAction;
  addAction: (action: IAction, contentId?: string, actionId?: string) => void;
};

class DefaultForm extends React.Component<Props> {
  render() {
    const { activeAction, onSave, closeModal } = this.props;

    return (
      <>
        <div>contents {activeAction.type}</div>
        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            icon="times-circle"
            onClick={closeModal}
          >
            {__('Cancel')}
          </Button>

          <Button btnStyle="success" icon="checked-1" onClick={onSave}>
            Saves
          </Button>
        </ModalFooter>
      </>
    );
  }
}

export const ActionForms = {
  default: DefaultForm,
  delay: Delay,
  setProperty: SetProperty,
  if: IfForm,
  boardItem: BoardItemForm
};
