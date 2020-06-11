import * as React from "react";

type Props = {
  url?: string;
  icon: string;
};

function SocialLink(props: Props) {
  const { url, icon } = props;

  if (!url) {
    return null;
  }

  return (
    <a href={url} target="_blank">
      <img src={icon} />
    </a>
  );
}

export default SocialLink;
