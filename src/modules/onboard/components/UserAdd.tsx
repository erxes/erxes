import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon
} from 'modules/common/components';
import { FormColumn, FormWrapper } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import * as RTG from 'react-transition-group';
import { UserList } from '../containers';
import { Description, Footer, ScrollContent, TopContent } from './styles';

type Props = {
  usersTotalCount: number;
  save: (
    params: {
      doc: {
        username: string;
        email: string;
        role: string;
        password: string;
        passwordConfirmation: string;
      };
    },
    callback: () => void
  ) => void;
};

type State = {
  username: string;
  email: string;
  role: string;
  password: string;
  passwordConfirmation: string;
  showUsers?: boolean;
};

class UserAdd extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      showUsers: true,
      username: '',
      email: '',
      role: 'admin',
      password: '',
      passwordConfirmation: ''
    };
  }

  afterSave() {
    this.setState({
      username: '',
      email: '',
      role: '',
      password: '',
      passwordConfirmation: ''
    });
  }

  toggleBrands = () => {
    this.setState({ showUsers: !this.state.showUsers });
  };

  generateDoc = () => {
    const {
      username,
      email,
      role,
      password,
      passwordConfirmation
    } = this.state;

    return {
      doc: {
        username,
        email,
        role,
        password,
        passwordConfirmation
      }
    };
  };

  save = e => {
    e.preventDefault();
    const { save } = this.props;

    save(this.generateDoc(), this.afterSave.bind(this));
  };

  handleChange = <T extends keyof State>(name: T, e) => {
    e.preventDefault();
    this.setState({ [name]: e.target.value } as Pick<State, keyof State>);
  };

  renderContent() {
    const {
      username,
      email,
      role,
      password,
      passwordConfirmation,
      showUsers
    } = this.state;

    return (
      <>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel>Username</ControlLabel>

              <FormControl
                value={username}
                onChange={this.handleChange.bind(this, 'username')}
                type="text"
                required={true}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Email</ControlLabel>

              <FormControl
                value={email}
                onChange={this.handleChange.bind(this, 'email')}
                type="text"
                required={true}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Role</ControlLabel>

              <FormControl
                componentClass="select"
                value={role}
                onChange={this.handleChange.bind(this, 'role')}
              >
                <option value="admin">{__('Admin')}</option>
                <option value="contributor">{__('Contributor')}</option>
              </FormControl>
            </FormGroup>
          </FormColumn>

          <FormColumn>
            <FormGroup>
              <ControlLabel>Password</ControlLabel>

              <FormControl
                value={password}
                onChange={this.handleChange.bind(this, 'password')}
                type="text"
                required={true}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Password confirmation</ControlLabel>

              <FormControl
                value={passwordConfirmation}
                onChange={this.handleChange.bind(this, 'passwordConfirmation')}
                type="text"
                required={true}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>
        <Description>
          <Icon icon="information" /> There is another{' '}
          <b>{this.props.usersTotalCount}</b> users.
          <a href="javascript:;" onClick={this.toggleBrands}>
            {' '}
            {showUsers ? 'Hide' : 'Show'} ›
          </a>
        </Description>

        <RTG.CSSTransition
          in={showUsers}
          appear={true}
          timeout={300}
          classNames="slide"
          unmountOnExit={true}
        >
          <UserList queryParams={{}} />
        </RTG.CSSTransition>
      </>
    );
  }

  render() {
    return (
      <form onSubmit={this.save}>
        <ScrollContent>
          <TopContent>
            <img src="/images/icons/erxes-16.svg" />
            <h2>Add user on your team</h2>
          </TopContent>
          {this.renderContent()}
        </ScrollContent>
        <Footer>
          <Button btnStyle="link">Back</Button>
          <Button btnStyle="primary" type="submit">
            Next <Icon icon="rightarrow" />
          </Button>
        </Footer>
      </form>
    );
  }
}

export default UserAdd;
