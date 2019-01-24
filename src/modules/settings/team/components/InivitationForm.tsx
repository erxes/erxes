import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import { TypeList } from 'modules/settings/properties/styles';
import * as React from 'react';
import { ICommonFormProps, ICommonListProps } from '../../common/types';

class InivitationForm extends React.Component<
  ICommonListProps & ICommonFormProps,
  { emails: string[] }
> {
  private closeModal;

  constructor(props) {
    super(props);

    this.state = {
      emails: []
    };
  }

  handleRemoveOption = index => {
    const { emails } = this.state;

    this.setState({ emails: emails.splice(index, 1) && emails });
  };

  onSubmit = () => {
    this.props.save(
      { doc: { emails: this.state.emails } },
      this.closeModal,
      null
    );
  };

  add = () => {
    const { emails } = this.state;
    const optionValue = (document.getElementById(
      'optionValue'
    ) as HTMLInputElement).value;

    this.setState({ emails: [...emails, optionValue] });
  };

  renderEmails = () => {
    return (
      <TypeList>
        {this.state.emails.map((option, index) => (
          <li key={index}>
            {option}
            <Icon icon="cancel-1" onClick={this.handleRemoveOption} />
          </li>
        ))}
        <FormControl
          type="email"
          id="optionValue"
          placeholder="example@email.com"
        />
        <Button onClick={this.add} btnStyle="success" size="small" icon="add">
          Add email
        </Button>
      </TypeList>
    );
  };

  render() {
    return (
      <>
        <FormGroup>
          <ControlLabel>Emails</ControlLabel>
          {this.renderEmails()}
        </FormGroup>

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={this.props.closeModal}
            icon="cancel-1"
          >
            Cancel
          </Button>

          <Button
            btnStyle="success"
            type="submit"
            onClick={this.onSubmit}
            icon="checked-1"
          >
            Invite
          </Button>
        </ModalFooter>
      </>
    );
  }
}

export default InivitationForm;
