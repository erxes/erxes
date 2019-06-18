import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import { ITopic } from 'modules/knowledgeBase/types';
import { IIntegration } from 'modules/settings/integrations/types';
import * as React from 'react';
import Select from 'react-select-plus';
import { Form as CommonForm } from '../../common/components';
import { ICommonFormProps } from '../../common/types';
import { IScript } from '../types';

type Props = {
  object?: IScript;
  forms: IIntegration[];
  messengers: IIntegration[];
  kbTopics: ITopic[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

type State = {
  leads?: Array<{ value: string; label: string }>;
};

class Form extends React.Component<Props & ICommonFormProps, State> {
  constructor(props) {
    super(props);

    const object = (props.object || {}) as IScript;

    this.state = {
      leads: this.generateLeadOptions(object.leads || [])
    };
  }

  generateDoc = (values: {
    _id?: string;
    name: string;
    messengerId: string;
    kbTopicId: string;
  }) => {
    const { object } = this.props;
    const finalValues = values;

    if (object) {
      finalValues._id = object._id;
    }

    return {
      _id: finalValues._id,
      name: finalValues.name,
      messengerId: finalValues.messengerId,
      kbTopicId: finalValues.kbTopicId,
      leadIds: (this.state.leads || []).map(lead => lead.value)
    };
  };

  onChangeLeads = leads => {
    this.setState({ leads });
  };

  generateLeadOptions = (leads: IIntegration[]) => {
    return leads.map(lead => ({
      value: lead._id,
      label: lead.name
    }));
  };

  renderContent = (formProps: IFormProps) => {
    const { forms, messengers, kbTopics } = this.props;
    const object = this.props.object || ({} as IScript);

    return (
      <React.Fragment>
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>
          <FormControl
            {...formProps}
            name="name"
            defaultValue={object.name || ''}
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Messenger</ControlLabel>

          <FormControl
            {...formProps}
            name="messengerId"
            componentClass="select"
            placeholder={__('Select messenger')}
            defaultValue={object.messengerId}
            required={true}
          >
            <option />
            {messengers.map(integration => (
              <option key={integration._id} value={integration._id}>
                {integration.name}
              </option>
            ))}
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel>Leads</ControlLabel>

          <Select
            placeholder={__('Select leads')}
            onChange={this.onChangeLeads}
            value={this.state.leads}
            options={this.generateLeadOptions(forms)}
            multi={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Knowledgebase topic</ControlLabel>

          <FormControl
            {...formProps}
            name="kbTopicId"
            componentClass="select"
            placeholder={__('Select topic')}
            defaultValue={object.kbTopicId}
            required={true}
          >
            <option />
            {kbTopics.map(topic => (
              <option key={topic._id} value={topic._id}>
                {topic.title}
              </option>
            ))}
          </FormControl>
        </FormGroup>
      </React.Fragment>
    );
  };

  render() {
    return (
      <CommonForm
        {...this.props}
        name="response template"
        renderContent={this.renderContent}
        generateDoc={this.generateDoc}
        object={this.props.object}
      />
    );
  }
}

export default Form;
