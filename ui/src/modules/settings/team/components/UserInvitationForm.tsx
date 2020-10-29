import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import Icon from 'modules/common/components/Icon';
import Info from 'modules/common/components/Info';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __, Alert } from 'modules/common/utils';
import { ICommonFormProps } from 'modules/settings/common/types';
import { IUserGroup } from 'modules/settings/permissions/types';
import React from 'react';
import { Description } from '../../styles';
import { InviteOption, LinkButton, RemoveRow } from '../styles';
import { IInvitationEntry } from '../types';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
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
        { email: '', password: '', groupId: '' },
        { email: '', password: '', groupId: '' },
        { email: '', password: '', groupId: '' }
      ],
      addMany: false,
      isSubmitted: false
    };
  }

  generateDoc = () => {
    const { entries } = this.state;

    const validEntries: IInvitationEntry[] = [];

    for (const entry of entries) {
      if (entry.email && entry.groupId) {
        validEntries.push(entry);
      }
    }

    return { entries: validEntries };
  };

  onChange = (
    i: number,
    type: 'email' | 'password' | 'groupId',
    e: React.FormEvent
  ) => {
    const { value } = e.target as HTMLInputElement;

    const entries = [...this.state.entries];

    entries[i] = { ...entries[i], [type]: value };

    this.setState({ entries });
  };

  onAddMoreInput = () => {
    this.setState({
      entries: [...this.state.entries, { email: '', password: '', groupId: '' }]
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

    emails.map(e =>
      entries.splice(0, 0, { email: e, password: '', groupId: '' })
    );

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
        <Icon icon="times" />
      </RemoveRow>
    );
  };

  renderMultipleEmail() {
    const onCancel = () => this.setState({ addMany: false });

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>
            Enter multiple email addresses
          </ControlLabel>
          <Description>
            {__('Please separate each email address with comma.')}
          </Description>
          <FormControl
            id="multipleEmailValue"
            componentClass="textarea"
            rows={5}
            required={true}
          />
        </FormGroup>
        <ModalFooter>
          <Button btnStyle="simple" onClick={onCancel} uppercase={false} icon="times-circle">
            Cancel
          </Button>

          <Button
            btnStyle="success"
            icon="check-circle"
            onClick={this.addInvitees}
            uppercase={false}
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
    const { closeModal, renderButton } = this.props;
    const { isSubmitted } = formProps;

    if (addMany) {
      return this.renderMultipleEmail();
    }

    return (
      <>
        <table style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>
                <ControlLabel required={true}>Email address</ControlLabel>
              </th>
              <th>
                <ControlLabel required={true}>Password</ControlLabel>
              </th>
              <th>
                <ControlLabel required={true}>Permission</ControlLabel>
              </th>
              <th />
            </tr>
          </thead>

          <tbody>
            {entries.map((input, i) => (
              <tr key={i}>
                <td>
                  <FormControl
                    {...formProps}
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    value={input.email}
                    autoFocus={i === 0}
                    onChange={this.onChange.bind(this, i, 'email')}
                    required={true}
                    autoComplete="off"
                  />
                </td>

                <td>
                  <FormControl
                    {...formProps}
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={input.password}
                    onChange={this.onChange.bind(this, i, 'password')}
                    required={true}
                    autoComplete="new-password"
                  />
                </td>

                <td>
                  <FormControl
                    {...formProps}
                    name="groupId"
                    componentClass="select"
                    options={[
                      { value: '', label: 'Choose group ...' },
                      ...this.generateGroupsChoices()
                    ]}
                    onChange={this.onChange.bind(this, i, 'groupId')}
                    required={true}
                  />
                </td>

                <td>{this.renderRemoveInput(i)}</td>
              </tr>
            ))}
          </tbody>
        </table>

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
          <Button
            btnStyle="simple"
            onClick={closeModal}
            icon="times-circle"
            uppercase={false}
          >
            Cancel
          </Button>

          {renderButton({
            name: 'team member invitation',
            values: this.generateDoc(),
            isSubmitted,
            callback: closeModal
          })}
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

        <Form autoComplete="off" renderContent={this.renderContent} />
      </>
    );
  }
}

export default UserInvitationForm;
