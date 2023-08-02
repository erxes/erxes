import { IAction } from '@erxes/ui-automations/src/types';
import React from 'react';
import SendMail from './SendMail';
type Props = {
  onSave: () => void;
  closeModal: () => void;
  activeAction: IAction;
  addAction: (action: IAction, actionId?: string, config?: any) => void;
  actionsConst: any[];
  propertyTypesConst: any[];
};

const Actions = {
  sendEmail: SendMail
};

class ExternalCommunications extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  renderActions() {
    const { activeAction } = this.props;

    const { type } = activeAction;
    ({ activeAction });

    const Component = Actions[type];

    const addAction = (action, actionId, config) => {
      ({ action, actionId, config });
      this.props.addAction(action, actionId, config);
    };

    const updatedProps = {
      ...this.props,
      addAction,
      action: activeAction
    };

    return <Component {...updatedProps} />;
  }

  render() {
    return <>{this.renderActions()}</>;
  }
}

export default ExternalCommunications;
