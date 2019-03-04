import { IUser } from 'modules/auth/types';
import {
  Button,
  ControlLabel,
  FormGroup,
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

          <RowActions
            {...this.props}
            object={object}
            renderForm={this.renderForm}
          />
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
        renderForm={this.renderInvitationForm}
        renderContent={this.renderContent}
        center={true}
        {...this.props}
      />
    );
  }
}

export default UserList;
