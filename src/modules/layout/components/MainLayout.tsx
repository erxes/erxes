import { IUser } from 'modules/auth/types';
import { IRouterProps } from 'modules/common/types';
import Welcome from 'modules/onboard/containers/Welcome';
import ImportIndicator from 'modules/settings/importHistory/containers/ImportIndicator';
import React from 'react';
import { withRouter } from 'react-router';
import Navigation from '../containers/Navigation';
import { Layout } from '../styles';
import DetectBrowser from './DetectBrowser';

interface IProps extends IRouterProps {
  currentUser?: IUser;
  children: React.ReactNode;
  isShownIndicator: boolean;
  closeLoadingBar: () => void;
}

class MainLayout extends React.Component<IProps> {
  componentDidMount() {
    const { history, currentUser } = this.props;

    if (history.location.pathname !== '/reset-password' && !currentUser) {
      history.push('/sign-in');
    }
  }

  getLastImport = () => {
    return localStorage.getItem('erxes_import_data') || '';
  };

  renderBackgroundProccess = () => {
    const { isShownIndicator, closeLoadingBar } = this.props;

    if (isShownIndicator) {
      return (
        <ImportIndicator id={this.getLastImport()} close={closeLoadingBar} />
      );
    }

    return null;
  };

  render() {
    const { currentUser, children, isShownIndicator } = this.props;
    const hasSeenOnboard = (currentUser && currentUser.hasSeenOnBoard) || false;

    return (
      <>
        {this.renderBackgroundProccess()}
        <Layout isSqueezed={isShownIndicator}>
          {currentUser && <Navigation currentUser={currentUser} />}
          {children}
          <Welcome hasSeen={hasSeenOnboard} />
          <DetectBrowser />
        </Layout>
      </>
    );
  }
}

export default withRouter<IProps>(MainLayout);
