import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import { IForm } from 'modules/forms/types';
import * as React from 'react';
import { IIntegration } from '../../types';

type Props = {
  save: (
    params: { name: string; integrationId: string; formId: string },
    callback: () => void
  ) => void;
  integrations: IIntegration[];
  leads: IForm[];
  closeModal: () => void;
};

class Lead extends React.Component<Props> {
  generateDoc() {
    return {
      name: (document.getElementById('name') as HTMLInputElement).value,
      integrationId: (document.getElementById(
        'selectIntegration'
      ) as HTMLInputElement).value,
      formId: (document.getElementById('selectLead') as HTMLInputElement).value
    };
  }

  handleSubmit = e => {
    e.preventDefault();

    this.props.save(this.generateDoc(), this.props.closeModal);
  };

  render() {
    const { integrations, leads, closeModal } = this.props;

    return (
      <form onSubmit={this.handleSubmit}>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>

          <FormControl id="name" type="text" required={true} />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Integration</ControlLabel>

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
          <ControlLabel>Lead</ControlLabel>

          <FormControl componentClass="select" id="selectLead">
            <option />
            {leads.map(lead => (
              <option key={lead._id} value={lead._id}>
                {lead.title}
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

export default Lead;
