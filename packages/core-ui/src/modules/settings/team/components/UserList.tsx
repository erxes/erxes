import { AppConsumer } from 'appContext';
import { IUser } from '@erxes/ui/src/auth/types';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import NameCard from '@erxes/ui/src/components/nameCard/NameCard';
import Table from '@erxes/ui/src/components/table';
import TextInfo from '@erxes/ui/src/components/TextInfo';
import Tip from '@erxes/ui/src/components/Tip';
import Toggle from '@erxes/ui/src/components/Toggle';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { __ } from 'modules/common/utils';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import React from 'react';
import { Link } from 'react-router-dom';
import {
  ICommonFormProps,
  ICommonListProps
} from '@erxes/ui-settings/src/common/types';
import UserForm from '@erxes/ui/src/team/containers/UserForm';
import UserResetPasswordForm from '@erxes/ui/src/team/containers/UserResetPasswordForm';
import { UserAvatar } from '../styles';
import { ControlLabel } from '@erxes/ui/src/components/form';

type IProps = {
  changeStatus: (id: string) => void;
  resendInvitation: (email: string) => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  totalCount: number;
  queryParams?: any;
};

type FinalProps = ICommonListProps &
  ICommonFormProps &
  IProps & { currentUser: IUser };

type States = {
  searchValue: string;
};

class UserList extends React.Component<FinalProps, States> {
  constructor(props: FinalProps) {
    super(props);

    const {
      queryParams: { searchValue }
    } = props;

    this.state = {
      searchValue: searchValue || ''
    };
  }

  onAvatarClick = object => {
    return this.props.history.push(`team/details/${object._id}`);
  };

  renderForm = props => {
    return <UserForm {...props} renderButton={this.props.renderButton} />;
  };

  renderEditAction = (user: IUser) => {
    const { currentUser } = this.props;

    if (user._id === currentUser._id) {
      return (
        <Tip text={__('View Profile')} placement="top">
          <Link to="/profile">
            <Icon icon="user-6" size={15} />
          </Link>
        </Tip>
      );
    }

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')} placement="top">
          <Icon icon="pen-1" size={15} />
        </Tip>
      </Button>
    );

    const content = props => {
      return this.renderForm({ ...props, object: user });
    };

    return (
      <ModalTrigger
        size="lg"
        title="Edit"
        trigger={editTrigger}
        content={content}
      />
    );
  };

  renderResetPasswordForm = props => {
    return <UserResetPasswordForm {...props} />;
  };

  renderResetPassword = (user: IUser) => {
    const editTrigger = (
      <Button btnStyle="link">
        <Tip text={__('Reset Member Password')} placement="top">
          <Icon icon="lock-alt" size={15} />
        </Tip>
      </Button>
    );

    const content = props => {
      return this.renderResetPasswordForm({ ...props, object: user });
    };

    return (
      <ModalTrigger
        title="Reset member password"
        trigger={editTrigger}
        content={content}
      />
    );
  };

  renderResendInvitation(user: IUser) {
    const onClick = () => {
      this.props.resendInvitation(user.email);
    };

    if (user.status !== 'Not verified') {
      return null;
    }

    return (
      <Button btnStyle="link" onClick={onClick}>
        <Tip text={__('Resend')} placement="top">
          <Icon icon="redo" size={15} />
        </Tip>
      </Button>
    );
  }

  renderRows({ objects }: { objects: IUser[] }) {
    return objects.map(object => {
      const onClick = () => this.onAvatarClick(object);
      const onChange = () => this.props.changeStatus(object._id);

      return (
        <tr key={object._id}>
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
            <Toggle
              defaultChecked={object.isActive}
              icons={{
                checked: <span>Yes</span>,
                unchecked: <span>No</span>
              }}
              onChange={onChange}
            />
          </td>
          <td>
            <ActionButtons>
              {this.renderResendInvitation(object)}
              {this.renderEditAction(object)}
              {this.renderResetPassword(object)}
            </ActionButtons>
          </td>
        </tr>
      );
    });
  }

  renderContent = props => {
    return (
      <>
        <Table wideHeader={true}>
          <thead>
            <tr>
              <th>
                <ControlLabel>{__('Full name')}</ControlLabel>
              </th>
              <th>
                <ControlLabel>{__('Invitation status')}</ControlLabel>
              </th>
              <th>
                <ControlLabel>{__('Email')}</ControlLabel>
              </th>
              <th>
                <ControlLabel>{__('Status')}</ControlLabel>
              </th>
              <th>
                <ControlLabel>{__('Actions')}</ControlLabel>
              </th>
            </tr>
          </thead>
          <tbody>{this.renderRows(props)}</tbody>
        </Table>
        <Pagination count={this.props.totalCount} />
      </>
    );
  };

  render() {
    return this.renderContent(this.props);
  }
}

const WithConsumer = (props: IProps & ICommonListProps & ICommonFormProps) => {
  return (
    <AppConsumer>
      {({ currentUser }) => (
        <UserList {...props} currentUser={currentUser || ({} as IUser)} />
      )}
    </AppConsumer>
  );
};

export default WithConsumer;
