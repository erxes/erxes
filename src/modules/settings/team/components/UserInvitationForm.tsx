import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon,
  Info
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import { __, Alert } from 'modules/common/utils';
import { ICommonFormProps } from 'modules/settings/common/types';
import * as React from 'react';
import { Description } from '../../styles';
import { FlexRow, LinkButton } from '../styles';
import { IEmails } from '../types';

type Props = {
  save: (params: { doc: any }, callback: () => void, object: any) => void;
} & ICommonFormProps;

type State = {
  inputs: IEmails[];
  addMany: boolean;
};

class UserInvitationForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      inputs: [{ email: '' }, { email: '' }, { email: '' }],
      addMany: false
    };
  }

  onInvite = (e: React.FormEvent) => {
    e.preventDefault();

    const { inputs } = this.state;
    const filterInputs = inputs.filter(input => input.email);
    const emails = filterInputs.map(item => item.email);

    if (emails.length === 0) {
      return Alert.warning('No email address found!');
    }

    this.props.save(
      { doc: { emails } },
      () => {
        this.setState({ inputs: [] });
        this.props.closeModal();
      },
      null
    );
  };

  onEmailValueChange = (i: number, e: React.FormEvent) => {
    const { value } = e.target as HTMLInputElement;

    const inputs = [...this.state.inputs];
    inputs[i] = { ...inputs[i], email: value };

    this.setState({ inputs });
  };

  onAddMoreInput = () => {
    this.setState({ inputs: [...this.state.inputs, { email: '' }] });
  };

  onAddManyEmail = () => {
    this.setState({ addMany: true });
  };

  addInvitees = () => {
    const { inputs } = this.state;

    const values = (document.getElementById(
      'multipleEmailValue'
    ) as HTMLInputElement).value;

    if (!values) {
      return Alert.warning('No email address found!');
    }

    const emails = values.split(',');

    emails.map(e => inputs.splice(0, 0, { email: e }));

    this.setState({ addMany: false });
  };

  handleRemoveInput = (i: number) => {
    const { inputs } = this.state;

    this.setState({ inputs: inputs.filter((item, index) => index !== i) });
  };

  renderRemoveInput = (i: number) => {
    const { inputs } = this.state;

    if (inputs.length <= 1) {
      return null;
    }

    return (
      <Icon icon="cancel-1" onClick={this.handleRemoveInput.bind(this, i)} />
    );
  };

  renderMultipleEmail() {
    const onCancel = () => this.setState({ addMany: false });

    return (
      <>
        <FormGroup>
          <ControlLabel>Enter multiple email addresses</ControlLabel>
          <Description>
            {__('Please separate each email address with comma.')}
          </Description>
          <FormControl
            id="multipleEmailValue"
            componentClass="textarea"
            rows={5}
          />
        </FormGroup>
        <ModalFooter>
          <Button btnStyle="simple" onClick={onCancel} icon="cancel-1">
            Cancel
          </Button>

          <Button
            btnStyle="success"
            type="submit"
            icon="checked-1"
            onClick={this.addInvitees}
          >
            Add Invitees
          </Button>
        </ModalFooter>
      </>
    );
  }

  renderContent() {
    const { addMany, inputs } = this.state;

    if (addMany) {
      return this.renderMultipleEmail();
    }

    return (
      <form onSubmit={this.onInvite}>
        <ControlLabel>Email address</ControlLabel>
        {inputs.map((input, i) => (
          <FlexRow key={i}>
            <FormControl
              id="emailValue"
              type="email"
              placeholder="name@example.com"
              value={input.email}
              onChange={this.onEmailValueChange.bind(this, i)}
            />
            {this.renderRemoveInput(i)}
          </FlexRow>
        ))}

        <div>
          <LinkButton onClick={this.onAddMoreInput}>
            <Icon icon="add" /> {__('Add another')}
          </LinkButton>
          {__('or')}
          <LinkButton onClick={this.onAddManyEmail}>
            {' '}
            {__('add many at once')}{' '}
          </LinkButton>
        </div>

        <ModalFooter>
          <Button
            btnStyle="simple"
            onClick={this.props.closeModal}
            icon="cancel-1"
          >
            Cancel
          </Button>

          <Button btnStyle="success" type="submit" icon="add">
            Invite
          </Button>
        </ModalFooter>
      </form>
    );
  }

  render() {
    return (
      <>
        <Info>
          {__("Send an email and notify members that they've been invited!")}
        </Info>

        {this.renderContent()}
      </>
    );
  }
}

export default UserInvitationForm;
