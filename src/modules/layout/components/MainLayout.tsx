import { IUser } from 'modules/auth/types';
import * as React from 'react';
import { withRouter } from 'react-router';
import { Navigation } from '../containers';
import { Layout } from '../styles';

type Props = {
  history: any,
  location: any,
  match: any,
  currentUser?: IUser,
  children: React.ReactNode
}

class MainLayout extends React.Component<Props> {
  componentDidMount() {
    const { history, currentUser } = this.props;

    if (history.location.pathname !== '/reset-password' && !currentUser) {
      history.push('/sign-in');
    }

    // browser default form validation event listener
    document.addEventListener(
      'invalid',
      (() => {
        return (e) => {
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

export default withRouter<Props>(MainLayout);
