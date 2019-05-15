import {
  Button,
  ControlLabel,
  FormControl,
  Icon
} from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import * as RTG from 'react-transition-group';
import { IUserGroup } from '../../settings/permissions/types';
import {
  FlexRow,
  InviteOption,
  LinkButton,
  RemoveRow
} from '../../settings/team/styles';
import { IInvitationEntry } from '../../settings/team/types';
import { UserList } from '../containers';
import { Description, Footer, TopContent } from './styles';

type Props = {
  usersTotalCount: number;
  usersGroups: IUserGroup[];
  changeStep: (increase: boolean) => void;
  save: (params: { doc: any }, callback: () => void) => void;
};

type State = {
  entries: IInvitationEntry[];
  showUsers?: boolean;
};

class UserAdd extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      showUsers: true,
      entries: [
        { email: '', groupId: '' },
        { email: '', groupId: '' },
        { email: '', groupId: '' }
      ]
    };
  }

  onAddMoreInput = () => {
    this.setState({
      entries: [...this.state.entries, { email: '', groupId: '' }]
    });
  };

  toggleUsers = () => {
    this.setState({ showUsers: !this.state.showUsers });
  };

  generateGroupsChoices = () => {
    return this.props.usersGroups.map(group => ({
      value: group._id,
      label: group.name
    }));
  };

  save = (e: React.FormEvent) => {
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

    this.props.save({ doc: { entries: validEntries } }, () => {
      this.setState({ entries: [] });
      this.props.changeStep(true);
    });
  };

  onChange = (i: number, type: 'email' | 'groupId', e: React.FormEvent) => {
    const { value } = e.target as HTMLInputElement;

    const entries = [...this.state.entries];

    entries[i] = { ...entries[i], [type]: value };

    this.setState({ entries });
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

  renderOtherUsers = () => {
    const { usersTotalCount } = this.props;

    if (usersTotalCount === 0) {
      return null;
    }

    const { showUsers } = this.state;

    return (
      <>
        <Description>
          <Icon icon="checked-1" /> {__('There is another')}{' '}
          <b>{usersTotalCount}</b> {__('users')}.{' '}
          <a href="javascript:;" onClick={this.toggleUsers}>
            {showUsers ? __('Show') : __('Hide')} ›
          </a>
        </Description>

        <RTG.CSSTransition
          in={showUsers}
          appear={true}
          timeout={300}
          classNames="slide-in-small"
          unmountOnExit={true}
        >
          <UserList userCount={usersTotalCount} />
        </RTG.CSSTransition>
      </>
    );
  };

  renderContent() {
    const { entries } = this.state;

    return (
      <>
        {entries.map((input, i) => (
          <FlexRow key={i}>
            <FormControl
              id="emailValue"
              type="email"
              placeholder="name@example.com"
              value={input.email}
              autoFocus={i === 0}
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

        <InviteOption>
          <LinkButton onClick={this.onAddMoreInput}>
            <Icon icon="add" /> {__('Add another email')}
          </LinkButton>
        </InviteOption>

        {this.renderOtherUsers()}
      </>
    );
  }

  render() {
    const { changeStep } = this.props;

    return (
      <form onSubmit={this.save}>
        <TopContent>
          <h2>{__(`Let's grow your team`)}</h2>
          <FlexRow>
            <ControlLabel>Email address</ControlLabel>
            <ControlLabel>Permission</ControlLabel>
          </FlexRow>
          {this.renderContent()}
        </TopContent>
        <Footer>
          <div>
            <Button btnStyle="link" onClick={changeStep.bind(null, false)}>
              Previous
            </Button>
            <Button btnStyle="success" onClick={this.save}>
              {__('Invite')} <Icon icon="rightarrow-2" />
            </Button>
          </div>
          <a onClick={changeStep.bind(null, true)}>{__('Skip for now')} »</a>
        </Footer>
      </form>
    );
  }
}

export default UserAdd;
