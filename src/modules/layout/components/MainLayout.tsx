import { IUser } from 'modules/auth/types';
import { IRouterProps } from 'modules/common/types';
import { Welcome } from 'modules/onboard/containers';
import { ImportIndicator } from 'modules/settings/importHistory/containers';
import * as React from 'react';
import { withRouter } from 'react-router';
import { Navigation } from '../containers';
import { Layout } from '../styles';

interface IProps extends IRouterProps {
  currentUser?: IUser;
  children: React.ReactNode;
  isLoading: boolean;
  closeLoadingBar: () => void;
}

class MainLayout extends React.Component<IProps> {
  componentDidMount() {
    const { history, currentUser } = this.props;

    if (history.location.pathname !== '/reset-password' && !currentUser) {
      history.push('/sign-in');
    }

    // browser default form validation event listener
    document.addEventListener(
      'invalid',
      (() => {
        return e => {
          // prevent the browser from showing default error hint
          e.preventDefault();

          e.target.classList.add('form-invalid');
        };
      })(),
      true
    );
  }

  getLastImport = () => {
    return localStorage.getItem('erxes_import_data') || '';
  };

  render() {
    const { currentUser, children, isLoading, closeLoadingBar } = this.props;
    const hasSeenOnboard = (currentUser && currentUser.hasSeenOnBoard) || false;

    return (
      <>
        {isLoading && (
          <ImportIndicator id={this.getLastImport()} close={closeLoadingBar} />
        )}
        <Layout isSqueezed={isLoading}>
          {currentUser && <Navigation currentUser={currentUser} />}
          {children}
          <Welcome hasSeen={hasSeenOnboard} />
        </Layout>
      </>
    );
  }
}

export default withRouter<IProps>(MainLayout);
