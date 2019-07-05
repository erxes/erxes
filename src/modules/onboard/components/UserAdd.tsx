import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import ControlLabel from 'modules/common/components/form/Label';
import Icon from 'modules/common/components/Icon';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import React from 'react';
import RTG from 'react-transition-group';
import { IUserGroup } from '../../settings/permissions/types';
import {
  FlexRow,
  InviteOption,
  LinkButton,
  RemoveRow
} from '../../settings/team/styles';
import { IInvitationEntry } from '../../settings/team/types';
import UserList from '../containers/UserList';
import { Description, Footer, TopContent } from './styles';

type Props = {
  usersTotalCount: number;
  usersGroups: IUserGroup[];
  changeStep: (increase: boolean) => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
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

  changeStep = () => {
    return this.props.changeStep(true);
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
          <a href="#toggle" onClick={this.toggleUsers}>
            {showUsers ? __('Hide') : __('Show')} ›
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

  renderFormContent = (formProps: IFormProps) => {
    const { entries } = this.state;

    return (
      <>
        {entries.map((input, i) => (
          <FlexRow key={i}>
            <FormControl
              {...formProps}
              name="email"
              type="email"
              placeholder="name@example.com"
              value={input.email}
              autoFocus={i === 0}
              onChange={this.onChange.bind(this, i, 'email')}
              required={true}
            />

            <FormControl
              {...formProps}
              name="groupId"
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
            <Icon icon="add" /> {__('Add another email')}
          </LinkButton>
        </InviteOption>

        {this.renderOtherUsers()}
      </>
    );
  };

  renderContent = (formProps: IFormProps) => {
    const { changeStep, renderButton } = this.props;

    return (
      <>
        <TopContent>
          <h2>{__(`Let's grow your team`)}</h2>
          <FlexRow>
            <ControlLabel required={true}>Email address</ControlLabel>
            <ControlLabel required={true}>Permission</ControlLabel>
          </FlexRow>
          {this.renderFormContent({ ...formProps })}
        </TopContent>
        <Footer>
          <div>
            <Button btnStyle="link" onClick={changeStep.bind(null, false)}>
              Previous
            </Button>

            {renderButton({
              name: 'team member invitation',
              values: this.generateDoc(),
              isSubmitted: formProps.isSubmitted,
              callback: this.changeStep
            })}
          </div>
          <a href="#skip" onClick={changeStep.bind(null, true)}>
            {__('Skip for now')} »
          </a>
        </Footer>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default UserAdd;
