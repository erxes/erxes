import { AppConsumer } from 'appContext';
import { IUser } from 'modules/auth/types';
import {
  ActionButtons,
  Button,
  ControlLabel,
  FormGroup,
  HeaderDescription,
  Icon,
  Info,
  ModalTrigger,
  ModifiableList,
  NameCard,
  Table,
  TextInfo,
  Tip
} from 'modules/common/components';
import { Input } from 'modules/common/components/form/styles';
import { ModalFooter } from 'modules/common/styles/main';
import { router } from 'modules/common/utils';
import { __ } from 'modules/common/utils';
import { FlexItem, FlexRow } from 'modules/insights/styles';
import * as React from 'react';
import Select from 'react-select-plus';
import Toggle from 'react-toggle';
import { List } from '../../common/components';
import { ICommonFormProps, ICommonListProps } from '../../common/types';
import { UserForm } from '../containers';
import { ButtonContainer, FilterContainer, UserAvatar } from '../styles';

type Props = {
  statusChanged?: (id: string) => void;
};

type FinalProps = ICommonListProps &
  ICommonFormProps &
  Props & { currentUser: IUser };

type States = {
  isActive: boolean;
  searchValue: string;
  emails: string[];
};

class UserList extends React.Component<FinalProps, States> {
  private closeModal;

  constructor(props) {
    super(props);

    const {
      queryParams: { isActive, searchValue }
    } = props;

    this.state = {
      emails: [],
      searchValue: searchValue || '',
      isActive: isActive || true
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

  onApplyClick = () => {
    const { history } = this.props;
    const { searchValue, isActive } = this.state;

    router.setParams(history, {
      searchValue,
      isActive
    });
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

  renderEditAction = (user: IUser) => {
    const { currentUser } = this.props;

    if (user._id === currentUser._id) {
      return null;
    }

    const { save } = this.props;

    const editTrigger = (
      <Button btnStyle="link">
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

  visibleHandler = (user: IUser) => {
    const { statusChanged } = this.props;

    return statusChanged ? statusChanged(user._id) : null;
  };

  renderRows({ objects }: { objects: IUser[] }) {
    return objects.map(object => {
      const onClick = () => this.onAvatarClick(object);
      const onChange = () => this.visibleHandler(object);

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
            <ActionButtons>{this.renderEditAction(object)}</ActionButtons>
          </td>
        </tr>
      );
    });
  }

  onStatusChange = (status: { label: string; value: boolean }) => {
    this.setState({ isActive: status.value });
  };

  onChange = (e: React.FormEvent) => {
    const { value } = e.currentTarget as HTMLInputElement;

    this.setState({ searchValue: value });
  };

  renderStatus = () => {
    const options = option => (
      <div className="simple-option">
        <span>{option.label}</span>
      </div>
    );

    return (
      <FlexItem>
        <ControlLabel>Status</ControlLabel>
        <Select
          placeholder={__('Choose status')}
          value={this.state.isActive}
          onChange={this.onStatusChange}
          optionRenderer={options}
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
    );
  };

  renderFilter = () => {
    const { searchValue } = this.state;

    return (
      <FilterContainer>
        <FlexRow>
          <FlexItem>
            <ControlLabel>Search</ControlLabel>
            <Input value={searchValue} onChange={this.onChange} />
          </FlexItem>

          {this.renderStatus()}

          <ButtonContainer>
            <Button btnStyle="success" icon="apply" onClick={this.onApplyClick}>
              Apply
            </Button>
          </ButtonContainer>
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
            <th />
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
        renderFilter={this.renderFilter}
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
