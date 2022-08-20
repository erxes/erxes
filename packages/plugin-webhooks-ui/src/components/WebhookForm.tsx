import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { Formgroup } from '@erxes/ui/src/components/form/styles';
import { IFormProps } from '@erxes/ui/src/types';
import { __, Alert } from '@erxes/ui/src/utils';
import { WEBHOOK_DOC_URL } from '@erxes/ui/src/constants/integrations';
import React from 'react';
import Select from 'react-select-plus';
import CommonForm from '@erxes/ui-settings/src/common/components/Form';
import { ICommonFormProps } from '@erxes/ui-settings/src/common/types';
import { IWebhook } from '../types';
import { getWebhookActions } from '../utils';

type Props = {
  object?: IWebhook;
  webhookActions: any;
};

type State = {
  selectedActions: any[];
};

class WebhookForm extends React.Component<Props & ICommonFormProps, State> {
  constructor(props) {
    super(props);

    const webhook = props.object || {};

    let selectedActions = [] as any;

    if (webhook.actions) {
      selectedActions =
        webhook.actions.map(item => {
          return { label: item.label, value: item.label };
        }) || [];
    }

    this.state = {
      selectedActions
    };
  }

  select = <T extends keyof State>(name: T, value) => {
    this.setState({ [name]: value } as Pick<State, keyof State>);
  };

  onChange = e => {
    const index = (e.currentTarget as HTMLInputElement).value;
    const isChecked = (e.currentTarget as HTMLInputElement).checked;

    const selected = this.state.selectedActions[index];
    const selectedActions = this.state.selectedActions;

    selectedActions[index] = {
      type: selected.type,
      action: selected.action,
      label: selected.label,
      checked: isChecked
    };

    this.setState({ selectedActions });
  };

  collectValues = selectedActions =>
    selectedActions.map(
      selectedAction =>
        getWebhookActions(this.props.webhookActions).find(
          action => action.label === selectedAction.label
        ) || {}
    );

  generateDoc = (values: { _id?: string; url: string }) => {
    const { object } = this.props;
    const { selectedActions } = this.state;
    const finalValues = values;

    if (!selectedActions) {
      return Alert.error('Choose action!');
    }

    if (object) {
      finalValues._id = object._id;
    }

    return {
      _id: finalValues._id,
      url: finalValues.url,
      actions: this.collectValues(selectedActions)
    };
  };

  generateActions = () => {
    const actions = getWebhookActions(this.props.webhookActions);
    return actions.map(action => {
      return { label: action.label, value: action.label };
    });
  };

  renderContent = (formProps: IFormProps) => {
    const object = this.props.object || ({} as IWebhook);
    const { selectedActions } = this.state;

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Endpoint url</ControlLabel>
          <FormControl
            {...formProps}
            name="url"
            defaultValue={object.url}
            required={true}
            autoFocus={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Actions</ControlLabel>
          <Select
            placeholder={__('Choose actions')}
            options={this.generateActions()}
            value={selectedActions}
            onChange={this.select.bind(this, 'selectedActions')}
            multi={true}
          />
        </FormGroup>

        <Formgroup>
          <p>
            {'For more information, please review the '}
            <a target="_blank" rel="noopener noreferrer" href={WEBHOOK_DOC_URL}>
              documentaion.
            </a>
          </p>
        </Formgroup>
      </>
    );
  };

  render() {
    return (
      <CommonForm
        {...this.props}
        name="Webhook"
        renderContent={this.renderContent}
        generateDoc={this.generateDoc}
        object={this.props.object}
      />
    );
  }
}

export default WebhookForm;
