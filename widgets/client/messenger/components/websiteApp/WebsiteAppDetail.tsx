import * as React from 'react';
import { __ } from '../../../utils';
import { IWebsiteApp } from '../../types';
import Container from '../common/Container';

type Props = {
  websiteApp: IWebsiteApp;
  changeRoute: (route: string) => void;
  loading: boolean;
};

export default class WebsiteAppDetail extends React.PureComponent<Props> {
  render() {
    const { websiteApp, loading } = this.props;

    return (
      <Container
        title={websiteApp.credentials.description}
        withBottomNavBar={false}
      >
        <div className="erxes-content">
          {loading ? (
            <div className="loader" />
          ) : (
            <iframe src={websiteApp.credentials.url} className="websiteApp" />
          )}
        </div>
      </Container>
    );
  }
}
