import { AppConsumer } from 'appContext';
import { IUser } from 'modules/auth/types';
import ActionButtons from 'modules/common/components/ActionButtons';
import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import NameCard from 'modules/common/components/nameCard/NameCard';
import Table from 'modules/common/components/table';
import TextInfo from 'modules/common/components/TextInfo';
import Tip from 'modules/common/components/Tip';
import Toggle from 'modules/common/components/Toggle';
import { IButtonMutateProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import Pagination from 'modules/common/components/pagination/Pagination';
import React from 'react';
import { Link } from 'react-router-dom';
import { ICommonFormProps, ICommonListProps } from '../../common/types';
import UserForm from '../containers/UserForm';
import UserResetPasswordForm from '../containers/UserResetPasswordForm';
import { UserAvatar } from '../styles';

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
        <Table>
          <thead>
            <tr>
              <th>{__('Full name')}</th>
              <th>{__('Invitation status')}</th>
              <th>{__('Email')}</th>
              <th>{__('Status')}</th>
              <th>{__('Actions')}</th>
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
