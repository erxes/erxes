import { __ } from 'modules/common/utils';
import React from 'react';
import jquery from 'jquery';
import { TriggerBox } from '../../styles';
import Icon from 'modules/common/components/Icon';
import { FlexRow } from 'modules/settings/styles';
import { IAction, ITrigger } from '../../types';
// import Button from "modules/common/components/Button";
import ModalTrigger from 'modules/common/components/ModalTrigger';

const actions: IAction[] = JSON.parse(localStorage.getItem('actions') || '[]');
const triggers: ITrigger[] = JSON.parse(
  localStorage.getItem('triggers') || '[]'
);

type Props = {
  closeModal: () => void;
};

type State = {
  activeTrigger: string;
};

class TriggerForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      activeTrigger: ''
    };
  }

  onSave = () => {
    for (const action of actions) {
      action.style = jquery(`#action-${action.id}`).attr('style');
    }

    localStorage.setItem('actions', JSON.stringify(actions));

    for (const trigger of triggers) {
      trigger.style = jquery(`#trigger-${trigger.id}`).attr('style');
    }

    localStorage.setItem('triggers', JSON.stringify(triggers));
  };

  onClickTrigger = (key: string) => {
    this.setState({ activeTrigger: key });
  };

  renderTrigger(key: string, icon: string, btnText: string) {
    const addTrigger = (
      <TriggerBox onClick={this.onClickTrigger.bind(this, key)}>
        <Icon icon={icon} size={30} />
        {__(btnText)}
      </TriggerBox>
    );

    const content = props => <Form {...props} />;

    return (
      <ModalTrigger
        title="Action?"
        trigger={addTrigger}
        content={content}
        size="lg"
      />
    );
  }

  render() {
    return (
      <>
        {/* <p>
          <label>Triggers</label>

          <select id="add-trigger">
            <option>Choose trigger</option>
            <option value="formSubmit">Form submit</option>
            <option value="dealCreate">Deal create</option>
          </select>
        </p> */}
        <FlexRow>
          {this.renderTrigger('form', 'file-plus-alt', 'Form Submit')}
          {this.renderTrigger('deal', 'file-plus', 'Deal create')}
        </FlexRow>
        {/* <p>
          <label>Actions</label>

          <select id="add-action">
            <option>Choose action</option>
            <option value="createTask">Create task</option>
            <option value="createDeal">Create deal</option>
            <option value="createTicket">Create ticket</option>
            <option value="if">IF</option>
            <option value="goto">Go to another action</option>
          </select>
        </p>

        <p>
          <button id="save">Save</button>
        </p> */}
      </>
    );
  }
}

export default TriggerForm;
