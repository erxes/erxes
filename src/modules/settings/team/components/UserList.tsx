import { AppConsumer } from 'appContext';
import { IUser } from 'modules/auth/types';
import ActionButtons from 'modules/common/components/ActionButtons';
import Button from 'modules/common/components/Button';
import ControlLabel from 'modules/common/components/form/Label';
import { Input } from 'modules/common/components/form/styles';
import HeaderDescription from 'modules/common/components/HeaderDescription';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import NameCard from 'modules/common/components/nameCard/NameCard';
import Table from 'modules/common/components/table';
import TextInfo from 'modules/common/components/TextInfo';
import Tip from 'modules/common/components/Tip';
import Toggle from 'modules/common/components/Toggle';
import { IButtonMutateProps } from 'modules/common/types';
import { router } from 'modules/common/utils';
import { __ } from 'modules/common/utils';
import { FlexItem, FlexRow } from 'modules/insights/styles';
import { IUserGroup } from 'modules/settings/permissions/types';
import React from 'react';
import Select from 'react-select-plus';
import List from '../../common/components/List';
import { ICommonFormProps, ICommonListProps } from '../../common/types';
import UserForm from '../containers/UserForm';
import { AlignedTd, FilterContainer, UserAvatar } from '../styles';
import UserInvitationForm from './UserInvitationForm';

type IProps = {
  changeStatus: (id: string) => void;
  resendInvitation: (email: string) => void;
  usersGroups: IUserGroup[];
  refetchQueries: any;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
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

  renderInvitationForm = props => {
    const { usersGroups, refetchQueries, renderButton } = this.props;

    return (
      <UserInvitationForm
        closeModal={props.closeModal}
        usersGroups={usersGroups}
        refetchQueries={refetchQueries}
        renderButton={renderButton}
      />
    );
  };

  renderForm = props => {
    return <UserForm {...props} renderButton={this.props.renderButton} />;
  };

  renderEditAction = (user: IUser) => {
    const { currentUser } = this.props;
    const { save } = this.props;

    const editTrigger = (
      <Button btnStyle="link" disabled={user._id === currentUser._id}>
        <Tip text={__('Edit')}>
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    const content = props => {
      return this.renderForm({ ...props, object: user, save });
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

  renderResendInvitation(user: IUser) {
    const onClick = () => {
      this.props.resendInvitation(user.email);
    };

    if (user.status !== 'Pending Invitation') {
      return null;
    }

    return (
      <Button btnStyle="link" onClick={onClick}>
        <Tip text={__('Resend')}>
          <Icon icon="reload" />
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
          <AlignedTd>
            <Toggle
              defaultChecked={object.isActive}
              icons={{
                checked: <span>Yes</span>,
                unchecked: <span>No</span>
              }}
              onChange={onChange}
            />
          </AlignedTd>
          <td>
            <ActionButtons>
              {this.renderResendInvitation(object)}
              {this.renderEditAction(object)}
            </ActionButtons>
          </td>
        </tr>
      );
    });
  }

  handleKeyDown = (e: React.KeyboardEvent<Element>) => {
    if (e.key === 'Enter') {
      const { value, name } = e.currentTarget as HTMLInputElement;

      router.setParams(this.props.history, { [name]: value });
    }
  };

  onStatusChange = (status: { label: string; value: boolean }) => {
    router.setParams(this.props.history, { isActive: status.value });
  };

  onChange = (e: React.FormEvent) => {
    const { value } = e.currentTarget as HTMLInputElement;

    this.setState({ searchValue: value });
  };

  renderFilter = () => {
    return (
      <FilterContainer>
        <FlexRow>
          <FlexItem>
            <ControlLabel>Search</ControlLabel>
            <Input
              placeholder="Search"
              name="searchValue"
              onChange={this.onChange}
              value={this.state.searchValue}
              onKeyDown={this.handleKeyDown}
            />
          </FlexItem>

          <FlexItem>
            <ControlLabel>Status</ControlLabel>
            <Select
              placeholder={__('Choose status')}
              value={this.props.queryParams.isActive || true}
              onChange={this.onStatusChange}
              clearable={false}
              options={[
                {
                  value: true,
                  label: 'Active'
                },
                {
                  value: false,
                  label: 'Deactivated'
                }
              ]}
            />
          </FlexItem>
        </FlexRow>
      </FilterContainer>
    );
  };

  renderContent = props => {
    return (
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
        formTitle="Invite team members"
        breadcrumb={[
          { title: __('Settings'), link: '/settings' },
          { title: __('Team members') }
        ]}
        title={__('Team members')}
        leftActionBar={
          <HeaderDescription
            icon="/images/actions/21.svg"
            title="Team members"
            description="Your team members are the bolts and nuts of your business. Make sure all the parts are set and ready to go. Here you can see a list of all your team members, you can categorize them into groups, welcome new members and edit their info."
          />
        }
        renderFilter={this.renderFilter}
        renderForm={this.renderInvitationForm}
        renderContent={this.renderContent}
        center={true}
        {...this.props}
      />
    );
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
