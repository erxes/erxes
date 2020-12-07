import React from 'react';
import styled from 'styled-components';

type Props = {
  info;
};

const VersionContainer = styled.div`
  position: fixed;
  bottom: 0px;
  padding: 0px 14px;
  z-index: 15;
  font-size: 11px;
  text-align: center;
  color: #fff;
`;

const Version = (props: Props) => {
  const { info } = props;

  return (
    <VersionContainer>
      <span>v{info.version}</span>
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
