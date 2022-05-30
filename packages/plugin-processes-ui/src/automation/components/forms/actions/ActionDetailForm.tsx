import { IAction } from '../../../types';
import React from 'react';
import { ActionForms } from './';
import { IJob } from '../../../../flow/types';

type Props = {
  activeAction: IJob;
  triggerType: string;
  addAction: (action: IJob, actionId?: string, config?: any) => void;
  closeModal: () => void;
};

class ActionDetailForm extends React.Component<Props> {
  onSave = () => {
    const { addAction, activeAction, closeModal } = this.props;

    addAction(activeAction);

    closeModal();
  };

  render() {
    const { activeAction } = this.props;

    const type = 'job';

    const Content = ActionForms[type] || ActionForms.default;

    return <Content onSave={this.onSave} {...this.props} />;
  }
}

export default ActionDetailForm;
