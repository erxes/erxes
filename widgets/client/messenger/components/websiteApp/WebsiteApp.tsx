import * as React from 'react';
import { __ } from '../../../utils';
import { IWebsiteApp } from '../../types';

type Props = {
  websiteApp: IWebsiteApp;
  goToWebsiteApp: (name: string) => void;
  color: string;
};

function WebsiteApp(props: Props) {
  const { websiteApp, goToWebsiteApp, color } = props;

  const onClick = () => goToWebsiteApp(websiteApp._id);

  return (
    <div className="websiteApp-home">
      <p>{websiteApp.credentials.description}</p>

      <button
        onClick={onClick}
        className="erxes-button btn-block"
        style={{ backgroundColor: color }}
      >
        {websiteApp.credentials.buttonText}
      </button>
    </div>
  );
}

export default WebsiteApp;
