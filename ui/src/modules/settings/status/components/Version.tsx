import { colors } from 'modules/common/styles';
import React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

type Props = {
  info;
};

const VersionContainer = styledTS<{ isLatest?: boolean }>(styled.div)`
  position: fixed;
  bottom: 0px;
  padding: 0px 14px;
  z-index: 15;
  font-size: 11px;
  text-align: center;
  color: ${props =>
    props.isLatest ? colors.colorCoreGreen : colors.colorCoreYellow};
  cursor: pointer;

  a {
    color: ${props =>
      props.isLatest ? colors.colorCoreGreen : colors.colorCoreYellow};
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
