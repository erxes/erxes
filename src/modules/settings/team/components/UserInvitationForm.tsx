import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon,
  Info,
  Tip
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import { __, Alert } from 'modules/common/utils';
import { ICommonFormProps } from 'modules/settings/common/types';
import * as React from 'react';
import { Emails, FlexRow } from '../styles';

type Props = {
  emails: string[];
  save: (params: { doc: any }, callback: () => void, object: any) => void;
} & ICommonFormProps;

type State = {
  emails: string[];
};

class UserInvitationForm extends React.Component<Props, State> {
  private closeModal;

  constructor(props: Props) {
    super(props);

    this.state = {
      emails: props.emails || []
    };
  }

  afterInvite = () => {
    this.setState({ emails: [] });
    this.closeModal();
  };

  onSubmit = () => {
    this.props.save(
      { doc: { emails: this.state.emails } },
      this.afterInvite,
      null
    );
  };

  onChangeEmail = (emails: string[], value?: string) => {
    this.setState({ emails });
  };

  handleSaveOption = () => {
    const { emails } = this.state;
    const optionValue = (document.getElementById(
      'emailValue'
    ) as HTMLInputElement).value;

    if (!optionValue) {
      return Alert.warning('No email address found!');
    }

    this.setState({ emails: [...emails, optionValue] }, () => {
      (document.getElementById('emailValue') as HTMLInputElement).value = '';
    });
  };

  handleRemoveOption = (i: string) => {
    const { emails } = this.state;

    this.setState({ emails: emails.filter(item => item !== i) });
  };

  onKeyPress = e => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      this.handleSaveOption();
    }
  };

  renderEmails() {
    const { emails } = this.state;

    return (
      <Emails className="Select--multi">
        {emails.map((email, index) => (
          <span className="Select-value" key={index}>
            <label className="Select-value-label">{email}</label>
            <span className="Select-value-icon">
              <Icon
                icon="cancel-1"
                onClick={this.handleRemoveOption.bind(this, email)}
              />
            </span>
          </span>
        ))}
      </Emails>
    );
  }

  render() {
    const { closeModal } = this.props;

    return (
      <>
        <Info>
          {__("Send an email and notify members that they've been invited!")}
        </Info>
        <FormGroup>
          {this.renderEmails()}
          <FlexRow>
            <ControlLabel>Add email address(es)</ControlLabel>
            <Tip
              placement="top"
              text="Adding more than one team member? Separate each email address with a comma or click enter."
            >
              <Icon icon="information" />
            </Tip>
          </FlexRow>
          <FormControl
            id="emailValue"
            type="email"
            placeholder="name@mail.com"
            autoFocus={true}
            onKeyPress={this.onKeyPress}
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

export default UserInvitationForm;
