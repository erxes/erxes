import { ACTIONS } from '../../../constants';
import BoardItemForm from '../../../containers/forms/actions/subForms/BoardItemForm';
import IfForm from '../../../containers/forms/actions/subForms/IfForm';
import SetProperty from '../../../containers/forms/actions/subForms/SetProperty';
import { IAction } from '../../../types';
import Button from '@erxes/ui/src/components/Button';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';
import Common from './Common';
import CustomCode from './subForms/CustomCode';
import Delay from './subForms/Delay';
import LoyaltyForm from '../../../containers/forms/actions/subForms/LoyaltyForm';
import ChangeScore from './subForms/ChangeScore';

type Props = {
  onSave: () => void;
  closeModal: () => void;
  activeAction: IAction;
  addAction: (action: IAction, actionId?: string, config?: any) => void;
};

class DefaultForm extends React.Component<Props> {
  render() {
    const { activeAction, onSave, closeModal } = this.props;

    const currentAction = ACTIONS.find(
      action => action.type === activeAction.type && action.component
    );

    if (currentAction) {
      const Component = currentAction.component;
      return <Component {...this.props} common={Common} />;
    }

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
  customCode: CustomCode,
  voucher: LoyaltyForm,
  changeScore: ChangeScore
};
