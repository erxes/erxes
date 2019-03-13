import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  Info
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import { MaskWrapper } from 'modules/inbox/styles';
import * as React from 'react';
import { __ } from '../../../../common/utils';
import { IIntegration } from '../../types';
import { IntegrationPopover } from '../common';

type Props = {
  save: (
    params: { name: string; integrationId: string; formId: string },
    callback: () => void
  ) => void;
  integrations: IIntegration[];
  leads: IIntegration[];
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
    const { closeModal } = this.props;

    const trigger = (
      <MaskWrapper>
        <FormControl id="lead" componentClass="select" />
      </MaskWrapper>
    );

    return (
      <form onSubmit={this.handleSubmit}>
        <Info>
          {__(
            'Add a Lead here and see it on your Messenger Widget! In order to see Leads in your inbox, please make sure it is added in your channel.'
          )}
        </Info>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>

          <FormControl id="name" type="text" required={true} />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Messenger integration</ControlLabel>

          <IntegrationPopover
            title="Select integration"
            targets={this.props.integrations}
            trigger={trigger}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Lead</ControlLabel>

          <IntegrationPopover
            title="Select lead"
            targets={this.props.leads}
            trigger={trigger}
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

export default Lead;
