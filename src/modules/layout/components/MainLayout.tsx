import * as React from 'react';
import { withRouter } from 'react-router';
import { IUser } from '../../settings/channels/types';
import { Navigation } from '../containers';
import { Layout } from '../styles';

type Props = {
  history: any,
  currentUser: IUser,
  children: React.ReactNode
}

class MainLayout extends React.Component<Props> {
  getChildContext() {
    return {
      currentUser: this.props.currentUser
    };
  }

  componentDidMount() {
    const { history, currentUser } = this.props;

    if (history.location.pathname !== '/reset-password' && !currentUser) {
      history.push('/sign-in');
    }

    // browser default form validation event listener
    document.addEventListener(
      'invalid',
      (function() {
        return function(e) {
          // prevent the browser from showing default error hint
          e.preventDefault();

          e.target.classList.add('form-invalid');
        };
      })(),
      true
    );
  }

  render() {
    const { currentUser, children } = this.props;

    return (
      <Layout>
        {currentUser && <Navigation />}
        {children}
      </Layout>
    );
  }
}

MainLayout.childContextTypes = {
  currentUser: PropTypes.object
};

export default withRouter(MainLayout);
