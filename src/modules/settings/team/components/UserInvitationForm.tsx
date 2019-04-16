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
import { IUserGroup } from 'modules/settings/permissions/types';
import * as React from 'react';
import { Description } from '../../styles';
import { FlexRow, LinkButton } from '../styles';
import { IInvitationEntry } from '../types';

type Props = {
  save: (params: { doc: any }, callback: () => void, object: any) => void;
  usersGroups: IUserGroup[];
} & ICommonFormProps;

type State = {
  entries: IInvitationEntry[];
  addMany: boolean;
};

class UserInvitationForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      entries: [
        { email: '', groupId: '' },
        { email: '', groupId: '' },
        { email: '', groupId: '' }
      ],
      addMany: false
    };
  }

  onInvite = (e: React.FormEvent) => {
    e.preventDefault();

    const { entries } = this.state;

    const validEntries: IInvitationEntry[] = [];

    for (const entry of entries) {
      if (entry.email && entry.groupId) {
        validEntries.push(entry);
      }
    }

    if (validEntries.length === 0) {
      return Alert.warning('Please complete the form');
    }

    this.props.save(
      { doc: { entries: validEntries } },
      () => {
        this.setState({ entries: [] });
        this.props.closeModal();
      },
      null
    );
  };

  onChange = (i: number, type: 'email' | 'groupId', e: React.FormEvent) => {
    const { value } = e.target as HTMLInputElement;

    const entries = [...this.state.entries];

    entries[i] = { ...entries[i], [type]: value };

    this.setState({ entries });
  };

  onAddMoreInput = () => {
    this.setState({
      entries: [...this.state.entries, { email: '', groupId: '' }]
    });
  };

  onAddManyEmail = () => {
    this.setState({ addMany: true });
  };

  addInvitees = () => {
    const { entries } = this.state;

    const values = (document.getElementById(
      'multipleEmailValue'
    ) as HTMLInputElement).value;

    if (!values) {
      return Alert.warning('No email address found!');
    }

    const emails = values.split(',');

    emails.map(e => entries.splice(0, 0, { email: e, groupId: '' }));

    this.setState({ addMany: false });
  };

  handleRemoveEntry = (i: number) => {
    const { entries } = this.state;

    this.setState({ entries: entries.filter((item, index) => index !== i) });
  };

  renderRemoveInput = (i: number) => {
    const { entries } = this.state;

    if (entries.length <= 1) {
      return null;
    }

    return (
      <Icon icon="cancel-1" onClick={this.handleRemoveEntry.bind(this, i)} />
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

  generateGroupsChoices = () => {
    return this.props.usersGroups.map(group => ({
      value: group._id,
      label: group.name
    }));
  };

  renderContent() {
    const { addMany, entries } = this.state;

    if (addMany) {
      return this.renderMultipleEmail();
    }

    return (
      <form onSubmit={this.onInvite}>
        <FlexRow>
          <ControlLabel>Email address</ControlLabel>
          <ControlLabel>Choose Group</ControlLabel>
        </FlexRow>

        {entries.map((input, i) => (
          <FlexRow key={i}>
            <FormControl
              id="emailValue"
              type="email"
              placeholder="name@example.com"
              value={input.email}
              onChange={this.onChange.bind(this, i, 'email')}
            />

            <FormControl
              componentClass="select"
              placeholder={__('Choose group')}
              options={[
                { value: '', label: '' },
                ...this.generateGroupsChoices()
              ]}
              onChange={this.onChange.bind(this, i, 'groupId')}
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
