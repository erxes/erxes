import BoardItemForm from 'modules/automations/containers/forms/actions/subForms/BoardItemForm';
import IfForm from 'modules/automations/containers/forms/actions/subForms/IfForm';
import SetProperty from 'modules/automations/containers/forms/actions/subForms/SetProperty';
import { IAction } from 'modules/automations/types';
import Button from 'modules/common/components/Button';
import { ModalFooter } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import React from 'react';
import CustomCode from './subForms/CustomCode';
import Delay from './subForms/Delay';

type Props = {
  onSave: () => void;
  closeModal: () => void;
  activeAction: IAction;
  addAction: (action: IAction, actionId?: string, config?: any) => void;
};

class DefaultForm extends React.Component<Props> {
  render() {
    const { activeAction, onSave, closeModal } = this.props;

    return (
      <>
        <div>
          {__('contents')} {activeAction.type}
        </div>
        <ModalFooter>
          <Button
            btnStyle="simple"
            size="small"
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
  boardItem: BoardItemForm,
  customCode: CustomCode
};
