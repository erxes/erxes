import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import Info from 'modules/common/components/Info';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import { ITopic } from 'modules/knowledgeBase/types';
import React from 'react';
import Select from 'react-select-plus';
import { Options } from '../../styles';
import { IIntegration, ISelectMessengerApps } from '../../types';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
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

  generateDoc = (values: { name: string }) => {
    return {
      name: values.name,
      integrationId: this.state.selectedMessengerId,
      topicId: this.state.selectedTopicId
    };
  };

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

  renderOption = option => {
    return (
      <Options>
        {option.label}
        <i>{option.brand && option.brand.name}</i>
      </Options>
    );
  };

  renderContent = (formProps: IFormProps) => {
    const { integrations, topics, closeModal, renderButton } = this.props;
    const { values, isSubmitted } = formProps;

    return (
      <>
        <Info>
          {__(
            'You can choose from our many messenger integrations and add to your knowledge base. The knowledge base will appear in the tab of your messenger widget. To do this, please create and add to your knowledge base.'
          )}
        </Info>
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>
          <FormControl
            {...formProps}
            name="name"
            required={true}
            autoFocus={true}
          />
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
            icon="times-circle"
            uppercase={false}
          >
            Cancel
          </Button>

          {renderButton({
            name: 'knowledge base',
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default KnowledgeBase;
