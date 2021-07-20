import Icon from 'modules/common/components/Icon';
import Tip from 'modules/common/components/Tip';
import { __ } from 'modules/common/utils';
import { NavButton } from 'modules/robot/components/styles';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import RTG from 'react-transition-group';
import Delayed from './Delayed';
import { Button, VersionContainer, VersionNotifier, Wrapper } from './styles';

type Props = {
  info;
  kind: 'notify' | 'plain';
  showNotify?: boolean;
};

const Version = (props: Props) => {
  const { info, kind, showNotify } = props;

  const [show, setShow] = useState(true);

  if (kind === 'notify' && !info.isLatest) {
    const onCloseClick = () => {
      setShow(false);
    };

    return (
      <Delayed wait={3500}>
        <RTG.CSSTransition
          in={showNotify && show}
          appear={true}
          timeout={600}
          classNames="slide-in-small"
          unmountOnExit={true}
        >
          <VersionNotifier>
            <NavButton onClick={onCloseClick} right={true}>
              <Icon icon="times" size={17} />
            </NavButton>
            <Wrapper>
              <Icon icon="exclamation-triangle" size={16} />
              <div>
                <h3>{__('New Release Available')}</h3>
                <p>
                  {`${__('Please upgrade your erxes')}.${__(
                    'Find out whats'
                  )}.`}
                  <Link to="/settings/release-info">
                    <strong>{__('new in erxes')}</strong>
                  </Link>
                </p>

                <Button
                  href="https://github.com/erxes/erxes/releases"
                  target="_blank"
                >
                  {__('See Releases')}
                </Button>
              </div>
            </Wrapper>
          </VersionNotifier>
        </RTG.CSSTransition>
      </Delayed>
    );
  }

  if (kind === 'plain') {
    return (
      <VersionContainer isLatest={info.isLatest}>
        Version{' '}
        <a
          href={`https://github.com/erxes/erxes/releases/tag/${info.version}`}
          target="__blank"
        >
          <strong>{info.version}</strong>
        </a>
        &nbsp;
        <Tip
          placement="top"
          text={
            info.isLatest
              ? __('You are using latest version of erxes')
              : __('You are using outdated version of erxes')
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
  }

  return null;
};

export default Version;
