import * as React from 'react';
import { isValidURL } from '../../../utils';

type Props = {
  url?: string;
  icon: React.ReactNode;
};

function SocialLink(props: Props) {
  const { url, icon } = props;

  if (!url || !isValidURL(url)) {
    return null;
  }

  return (
    <a href={url} target="_blank" className="social-link">
      {/* <img src={icon} /> */}
      {icon && <div className="icon-container">{icon}</div>}
    </a>
  );
}

export default SocialLink;
