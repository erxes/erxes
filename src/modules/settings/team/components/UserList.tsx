import { AppConsumer } from 'appContext';
import { IUser } from 'modules/auth/types';
import {
  Button,
  ControlLabel,
  FormGroup,
  HeaderDescription,
  Info,
  ModifiableList,
  NameCard,
  Table,
  TextInfo
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import styled from 'styled-components';
import { List, RowActions } from '../../common/components';
import { ICommonFormProps, ICommonListProps } from '../../common/types';
import { UserForm } from '../containers';

const UserAvatar = styled.td`
  &:hover {
    cursor: pointer;
  }
`;

class UserList extends React.Component<
  ICommonListProps & ICommonFormProps & { currentUser: IUser },
  { emails: string[] }
> {
  private closeModal;

  constructor(props) {
    super(props);

    this.state = {
      emails: []
    };
  }

  onAvatarClick = object => {
    return this.props.history.push(`team/details/${object._id}`);
  };

  onChangeEmail = options => {
    this.setState({ emails: options });
  };

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

  renderInvitationForm = props => {
    this.closeModal = props.closeModal;

    return (
      <div>
        <Info>
          {__("Send an email and notify members that they've been invited!")}
        </Info>
        <FormGroup>
          <ControlLabel>Emails</ControlLabel>
          <ModifiableList
            options={this.state.emails}
            addButtonLabel="Add another"
            onChangeOption={this.onChangeEmail}
          />
        </FormGroup>

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={props.closeModal}
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
      </div>
    );
  };

  renderForm = props => {
    return <UserForm {...props} />;
  };

  renderRowActions = (user: IUser) => {
    const { currentUser } = this.props;

    if (user._id === currentUser._id) {
      return <td>-</td>;
    }

    return (
      <RowActions
        {...this.props}
        size="lg"
        object={user}
        renderForm={this.renderForm}
      />
    );
  };

  renderRows({ objects }: { objects: IUser[] }) {
    return objects.map((object, index) => {
      const onClick = () => {
        this.onAvatarClick(object);
      };

      return (
        <tr key={index}>
          <UserAvatar onClick={onClick}>
            <NameCard user={object} avatarSize={30} singleLine={true} />
          </UserAvatar>
          <td>
            <TextInfo
              textStyle={object.status === 'Verified' ? 'success' : 'warning'}
            >
              {object.status || 'Verified'}
            </TextInfo>
          </td>
          <td>{object.email}</td>
          <td>
            <TextInfo>{object.role || '-'}</TextInfo>
          </td>
          {this.renderRowActions(object)}
        </tr>
      );
    });
  }

  renderContent = props => {
    return (
      <Table>
        <thead>
          <tr>
            <th>{__('Full name')}</th>
            <th>{__('Status')}</th>
            <th>{__('Email')}</th>
            <th>{__('Role')}</th>
            <th>{__('Actions')}</th>
          </tr>
        </thead>
        <tbody>{this.renderRows(props)}</tbody>
      </Table>
    );
  };

  breadcrumb() {
    return [
      { title: __('Settings'), link: '/settings' },
      { title: __('Team members') }
    ];
  }

  render() {
    return (
      <List
        title="Invite team members"
        breadcrumb={[
          { title: __('Settings'), link: '/settings' },
          { title: __('Team members') }
        ]}
        leftActionBar={
          <HeaderDescription
            icon="/images/actions/21.svg"
            title="Team members"
            description="Your team members are the bolts and nuts of your business. Make sure all the parts are set and ready to go. Here you can see a list of all your team members, you can categorize them into groups, welcome new members and edit their info."
          />
        }
        renderForm={this.renderInvitationForm}
        renderContent={this.renderContent}
        center={true}
        {...this.props}
      />
    );
  }
}

const WithConsumer = (
  props: ICommonListProps & ICommonFormProps & { currentUser: IUser }
) => {
  return (
    <AppConsumer>
      {({ currentUser }) => (
        <UserList {...props} currentUser={currentUser || ({} as IUser)} />
      )}
    </AppConsumer>
  );
};

export default WithConsumer;
