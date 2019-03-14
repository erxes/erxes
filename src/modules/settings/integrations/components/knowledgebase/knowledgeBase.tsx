import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  Info
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import { ITopic } from 'modules/knowledgeBase/types';
import * as React from 'react';
import Select from 'react-select-plus';
import { Options } from '../../styles';
import { IIntegration, ISelectMessengerApps } from '../../types';

type Props = {
  save: (
    params: { name: string; integrationId: string; topicId: string },
    callback: () => void
  ) => void;
  integrations: IIntegration[];
  topics: ITopic[];
  closeModal: () => void;
};

type State = {
  selectedMessenger?: ISelectMessengerApps;
  selectedMessengerId: string;
  selectedKb?: ISelectMessengerApps;
  selectedTopicId: string;
};

class KnowledgeBase extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      selectedMessengerId: '',
      selectedTopicId: ''
    };
  }

  generateDoc() {
    const { selectedMessengerId, selectedTopicId } = this.state;

    return {
      name: (document.getElementById('name') as HTMLInputElement).value,
      integrationId: selectedMessengerId,
      topicId: selectedTopicId
    };
  }

  generateIntegrationsParams = integrations => {
    return integrations.map(integration => ({
      value: integration._id,
      label: integration.name || integration.title,
      brand: integration.brand
    }));
  };

  onChangeMessenger = obj => {
    this.setState({ selectedMessenger: obj });
    this.setState({ selectedMessengerId: obj ? obj.value : '' });
  };

  onChangeTopics = obj => {
    this.setState({ selectedKb: obj });
    this.setState({ selectedTopicId: obj ? obj.value : '' });
  };

  handleSubmit = e => {
    e.preventDefault();

    this.props.save(this.generateDoc(), this.props.closeModal);
  };

  renderOption = option => {
    return (
      <Options>
        {option.label}
        <i>{option.brand && option.brand.name}</i>
      </Options>
    );
  };

  render() {
    const { integrations, topics, closeModal } = this.props;

    return (
      <form onSubmit={this.handleSubmit}>
        <Info>
          {__(
            'You can choose from our many messenger integrations and add to your knowledge base. The knowledge base will appear in the tab of your messenger widget. To do this, please create and add to your knowledge base.'
          )}
        </Info>
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>

          <FormControl id="name" type="text" required={true} />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Messenger integration</ControlLabel>

          <Select
            value={this.state.selectedMessenger}
            options={this.generateIntegrationsParams(integrations)}
            onChange={this.onChangeMessenger}
            optionRenderer={this.renderOption}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Knowledge base</ControlLabel>

          <Select
            value={this.state.selectedKb}
            options={this.generateIntegrationsParams(topics)}
            onChange={this.onChangeTopics}
            optionRenderer={this.renderOption}
          />
        </FormGroup>

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={closeModal}
            icon="cancel-1"
          >
            Cancel
          </Button>
          <Button btnStyle="success" type="submit" icon="checked-1">
            Save
          </Button>
        </ModalFooter>
      </form>
    );
  }
}

export default KnowledgeBase;
