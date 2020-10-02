import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { IFormProps } from 'modules/common/types';
import { __, Alert } from 'modules/common/utils';
import { WEBHOOK_ACTIONS } from 'modules/settings/constants';
import React from 'react';
import Select from 'react-select-plus';
import CommonForm from '../../common/components/Form';
import { ICommonFormProps } from '../../common/types';
import { IWebhook } from '../types';

type Props = {
  object?: IWebhook;
};

type State = {
  selectedActions: any[];
};

class WebhookForm extends React.Component<Props & ICommonFormProps, State> {
  constructor(props) {
    super(props);

    const webhook = props.object || {};

    let webhookActions = [] as any;

    if (webhook.actions) {
      webhookActions =
        webhook.actions.map(item => {
          return { label: item.label, value: item.label };
        }) || [];
    }

    const selectedActions = webhookActions;

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
        WEBHOOK_ACTIONS.find(action => action.label === selectedAction.label) ||
        {}
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
    return WEBHOOK_ACTIONS.map(action => {
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
