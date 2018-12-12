import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
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
};

type State = {
  name: string;
  messengerId?: string;
  leads?: Array<{ value: string; label: string }>;
  kbTopicId?: string;
};

class Form extends React.Component<Props & ICommonFormProps, State> {
  constructor(props) {
    super(props);

    const object = (props.object || {}) as IScript;

    this.state = {
      name: object.name,
      messengerId: object.messengerId,
      leads: this.generateLeadOptions(object.leads || []),
      kbTopicId: object.kbTopicId
    };
  }

  generateDoc = () => {
    return {
      doc: {
        ...this.state,
        leadIds: (this.state.leads || []).map(lead => lead.value)
      }
    };
  };

  onChangeLeads = leads => {
    this.setState({ leads });
  };

  onNameChange = (e: React.FormEvent<HTMLElement>) => {
    this.setState({ name: (e.currentTarget as HTMLInputElement).value });
  };

  onMessengerChange = (e: React.FormEvent<HTMLElement>) => {
    this.setState({
      messengerId: (e.currentTarget as HTMLSelectElement).value
    });
  };

  onTopicChange = (e: React.FormEvent<HTMLElement>) => {
    this.setState({ kbTopicId: (e.currentTarget as HTMLSelectElement).value });
  };

  generateLeadOptions = (leads: IIntegration[]) => {
    return leads.map(lead => ({
      value: lead._id,
      label: lead.name
    }));
  };

  renderContent = () => {
    const { forms, messengers, kbTopics } = this.props;

    return (
      <React.Fragment>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>
          <FormControl
            id="template-name"
            value={this.state.name}
            onChange={this.onNameChange}
            type="text"
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Messenger</ControlLabel>

          <FormControl
            componentClass="select"
            placeholder={__('Select messenger')}
            value={this.state.messengerId}
            id="messenger-id"
            onChange={this.onMessengerChange}
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
          <ControlLabel>Knowledgebase topic</ControlLabel>

          <FormControl
            componentClass="select"
            placeholder={__('Select topic')}
            value={this.state.kbTopicId}
            onChange={this.onTopicChange}
            id="topicId"
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
        renderContent={this.renderContent}
        generateDoc={this.generateDoc}
      />
    );
  }
}

export default Form;
