import * as React from 'react';
import { iconLeft } from '../../../icons/Icons';
import { __ } from '../../../utils';
import TopBar from '../../containers/TopBar';
import { IWebsiteApp } from '../../types';

type Props = {
  websiteApp: IWebsiteApp;
  changeRoute: (route: string) => void;
  loading: boolean;
};

export default class WebsiteAppDetail extends React.PureComponent<Props> {
  render() {
    const { changeRoute, websiteApp, loading } = this.props;

    const onClick = () => changeRoute('home');

    return (
      <>
        <TopBar
          middle={loading ? '' : websiteApp.credentials.description}
          buttonIcon={iconLeft()}
          onLeftButtonClick={onClick}
        />
        <div className="erxes-content">
          {loading ? (
            <div className="loader" />
          ) : (
            <iframe src={websiteApp.credentials.url} className="websiteApp" />
          )}
        </div>
      </>
    );
  }
}
