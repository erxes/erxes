import Icon from 'modules/common/components/Icon';
import Tip from 'modules/common/components/Tip';
import { colors } from 'modules/common/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

type Props = {
  info;
};

const VersionContainer = styledTS<{ isLatest?: boolean }>(styled.div)`
  padding: 3px 10px 3px 1.5rem;
  font-size: 11px;
  color: ${colors.colorCoreGray};

  i {
    color: ${props =>
      props.isLatest ? colors.colorCoreGreen : colors.colorCoreRed};
  }

  a {
    color: ${colors.colorCoreGray};

    &:hover {
      cursor: pointer;
      text-decoration: underline;
    }
  }
`;

const Version = (props: Props) => {
  const { info } = props;

  return (
    <VersionContainer isLatest={info.isLatest}>
      Version{' '}
      <Link to="/settings/release-info" target="__blank">
        <strong>{info.version}</strong>
      </Link>
      &nbsp;
      <Tip
        placement="top"
        text={
          info.isLatest
            ? 'You are using latest version of erxes'
            : 'You are using outdated version of erxes'
        }
      >
        <Icon icon="exclamation-octagon" />
      </Tip>
      &nbsp;
      <span aria-hidden="true">·</span>&nbsp;
      <span>
        {info.isUsingRedis && info.isUsingRabbitMQ && info.isUsingElkSyncer
          ? 'Enterprise'
          : 'Lite'}
      </span>{' '}
      Edition
    </VersionContainer>
  );
};

export default Version;
