import {
  Button,
  ButtonMutate,
  ControlLabel,
  Form,
  FormControl,
  FormGroup,
  Icon,
  Info
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import { IFormProps } from 'modules/common/types';
import { __, Alert } from 'modules/common/utils';
import { ICommonFormProps } from 'modules/settings/common/types';
import { IUserGroup } from 'modules/settings/permissions/types';
import * as React from 'react';
import { Description } from '../../styles';
import { mutations } from '../graphql';
import { FlexRow, InviteOption, LinkButton, RemoveRow } from '../styles';
import { IInvitationEntry } from '../types';

type Props = {
  save: (params: { doc: any }, callback: () => void, object: any) => void;
  usersGroups: IUserGroup[];
  refetchQueries: any;
} & ICommonFormProps;

type State = {
  entries: IInvitationEntry[];
  addMany: boolean;
  isSubmitted: boolean;
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
      addMany: false,
      isSubmitted: false
    };
  }

  onInvite = values => {
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
    // tslint:disable-next-line:no-console
    console.log(entries);
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
      <RemoveRow onClick={this.handleRemoveEntry.bind(this, i)}>
        <Icon icon="cancel" />
      </RemoveRow>
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
            Add Invites
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

  renderContent = (formProps: IFormProps) => {
    const { addMany, entries } = this.state;
    const { closeModal, refetchQueries } = this.props;

    if (addMany) {
      return this.renderMultipleEmail();
    }

    return (
      <>
        <FlexRow>
          <ControlLabel>Email address</ControlLabel>
          <ControlLabel>Permission</ControlLabel>
        </FlexRow>

        {entries.map((input, i) => (
          <FlexRow key={i}>
            <FormControl
              {...formProps}
              name="emailValue"
              type="email"
              placeholder="name@example.com"
              value={input.email}
              autoFocus={i === 0}
              onChange={this.onChange.bind(this, i, 'email')}
              required={true}
            />

            <FormControl
              {...formProps}
              name="group"
              componentClass="select"
              placeholder={__('Choose group')}
              options={[
                { value: '', label: '' },
                ...this.generateGroupsChoices()
              ]}
              onChange={this.onChange.bind(this, i, 'groupId')}
              required={true}
            />

            {this.renderRemoveInput(i)}
          </FlexRow>
        ))}

        <InviteOption>
          <LinkButton onClick={this.onAddMoreInput}>
            <Icon icon="add" /> {__('Add another')}
          </LinkButton>{' '}
          {__('or')}{' '}
          <LinkButton onClick={this.onAddManyEmail}>
            {__('add many at once')}{' '}
          </LinkButton>
        </InviteOption>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            Cancel
          </Button>

          <ButtonMutate
            mutation={mutations.usersInvite}
            variables={formProps.values}
            callback={closeModal}
            refetchQueries={refetchQueries}
            isSubmitted={this.state.isSubmitted}
            type="submit"
            icon="add"
            successMessage={`You successfully added a team member.`}
          >
            {__('Invite')}
          </ButtonMutate>
        </ModalFooter>
      </>
    );
  };

  render() {
    return (
      <>
        <Info>
          {__("Send an email and notify members that they've been invited!")}
        </Info>

        <Form renderContent={this.renderContent} onSubmit={this.onInvite} />
      </>
    );
  }
}

export default UserInvitationForm;
