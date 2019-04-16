import {
  Button,
  ControlLabel,
  FormGroup,
  Icon,
  ModifiableList
} from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import * as RTG from 'react-transition-group';
import { UserList } from '../containers';
import { Description, Footer, TopContent } from './styles';

type Props = {
  usersTotalCount: number;
  changeStep: (increase: boolean) => void;
  save: (
    params: {
      doc: {
        emails: string[];
      };
    },
    callback: () => void
  ) => void;
};

type State = {
  emails: string[];
  showUsers?: boolean;
};

class UserAdd extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      showUsers: true,
      emails: []
    };
  }

  afterSave() {
    this.setState({ emails: [] });

    this.props.changeStep(true);
  }

  toggleUsers = () => {
    this.setState({ showUsers: !this.state.showUsers });
  };

  generateDoc = () => {
    const { emails } = this.state;

    return {
      doc: { emails }
    };
  };

  save = e => {
    e.preventDefault();
    const { save } = this.props;

    if (this.state.emails.length === 0) {
      return Alert.warning('Empty emails');
    }

    save(this.generateDoc(), this.afterSave.bind(this));
  };

  onChangeEmails = options => {
    this.setState({ emails: options });
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
    const { showUsers, emails } = this.state;

    return (
      <>
        <FormGroup>
          <ControlLabel>Emails</ControlLabel>
          <ModifiableList
            options={emails}
            addButtonLabel="Add another"
            onChangeOption={this.onChangeEmails}
          />
        </FormGroup>

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
