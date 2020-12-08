import { colors } from 'modules/common/styles';
import React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

type Props = {
  info;
};

const VersionContainer = styledTS<{ isLatest?: boolean }>(styled.div)`
  padding: 0px 14px;
  font-size: 11px;
  font-weight: bold;
  text-align: center;

  color: ${props =>
    props.isLatest ? colors.colorCoreGreen : colors.colorCoreRed};

  cursor: pointer;

  a {
    color: ${props =>
      props.isLatest ? colors.colorCoreGreen : colors.colorCoreRed};
  }
`;

const Version = (props: Props) => {
  const { info } = props;

  return (
    <VersionContainer isLatest={info.isLates}>
      <a href="/settings/release-info" target="__blank">
        v{info.version}
      </a>

      <br />
      <span>
        {info.isUsingRedis && info.isUsingRabbitMQ && info.isUsingElkSyncer
          ? 'Full'
          : 'Lite'}
      </span>
    </VersionContainer>
  );
};

export default Version;
