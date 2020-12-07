import parseMd from 'modules/common/utils/parseMd';
import React from 'react';

type Props = {
  info;
};

const ReleaseInfo = (props: Props) => {
  const releaseInfo = props.info.releaseInfo || {};

  return (
    <p
      dangerouslySetInnerHTML={{
        __html: parseMd(releaseInfo.body || '')
      }}
    />
  );
};

export default ReleaseInfo;
