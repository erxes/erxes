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
import { IIntegration } from '../../types';

type Props = {
  save: (
    params: { name: string; integrationId: string; topicId: string },
    callback: () => void
  ) => void;
  integrations: IIntegration[];
  topics: ITopic[];
  closeModal: () => void;
};

class KnowledgeBase extends React.Component<Props> {
  generateDoc() {
    return {
      name: (document.getElementById('name') as HTMLInputElement).value,
      integrationId: (document.getElementById(
        'selectIntegration'
      ) as HTMLInputElement).value,
      topicId: (document.getElementById('selectTopic') as HTMLInputElement)
        .value
    };
  }

  handleSubmit = e => {
    e.preventDefault();

    this.props.save(this.generateDoc(), this.props.closeModal);
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
          <ControlLabel>Name</ControlLabel>

          <FormControl id="name" type="text" required={true} />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Messenger integration</ControlLabel>

          <FormControl componentClass="select" id="selectIntegration">
            <option />
            {integrations.map(i => (
              <option key={i._id} value={i._id}>
                {i.name}
              </option>
            ))}
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel>Knowledge base</ControlLabel>

          <FormControl componentClass="select" id="selectTopic">
            <option />
            {topics.map(topic => (
              <option key={topic._id} value={topic._id}>
                {topic.title}
              </option>
            ))}
          </FormControl>
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
