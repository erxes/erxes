import { IAction } from '../../../types';
import React from 'react';
import { ActionForms } from './';
import { IJob } from '../../../../flow/types';

type Props = {
  activeAction: IJob;
  triggerType: string;
  addAction: (action: IJob, actionId?: string, jobReferId?: string) => void;
  closeModal: () => void;
};

class ActionDetailForm extends React.Component<Props> {
  onSave = () => {
    const { addAction, activeAction, closeModal } = this.props;

    addAction(activeAction);

    closeModal();
  };

  render() {
    const Content = ActionForms.job;

    return <Content onSave={this.onSave} {...this.props} />;
  }
}

export default ActionDetailForm;
