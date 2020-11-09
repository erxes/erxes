import CollapseContent from 'modules/common/components/CollapseContent';
import Icon from 'modules/common/components/Icon';
import colors from 'modules/common/styles/colors';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import styled from 'styled-components';
import { TUTORIALS } from '../constants';

const Description = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 3px;
  color: ${colors.textSecondary};

  span {
    color: ${colors.colorCoreGray};
    margin-left: 5px;
    font-style: italic;
  }
`;

const Header = styled.div`
  margin-bottom: 20px;

  h1 {
    margin: 20px 0 5px;
    font-size: 24px;
  }

  p {
    margin: 0;
    font-size: 16px;
    color: ${colors.colorCoreGray};
  }
`;

const IconWrapper = styled.div`
  margin-right: 20px;
  font-size: 18px;
  color: ${colors.colorCoreGray};
`;

function Tutorial() {
  const breadcrumb = [
    { title: __('Tutorials'), link: '/tutorial' },
    { title: __('Help') }
  ];

  const isOpen = (id: string) => {
    return window.location.toString().includes(id);
  };

  const renderVideo = (url: string) => {
    return (
      <iframe
        title="erxes tutorial"
        width="100%"
        height="478"
        src={url}
        frameBorder="0"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen={true}
      />
    );
  };

  const renderHeader = () => {
    return (
      <Header>
        <h1>
          {__('Welcome to erxes video tutorial')}{' '}
          <span role="img" aria-label="Wave">
            👋
          </span>
        </h1>
        <p>
          {__(
            'Here is where you can check your performance and find some tips'
          )}
          ! For further help, please consult the{' '}
          <a
            target="_blank"
            href="https://erxes.org/overview/getting-started"
            rel="noopener noreferrer"
          >
            documentation
          </a>
          .
        </p>
      </Header>
    );
  };

  const renderIcon = () => {
    return (
      <IconWrapper>
        <Icon icon="plus-circle" />
      </IconWrapper>
    );
  };

  const renderDescription = (step: string, time: string) => {
    return (
      <Description>
        {__(step)}. <span>{__(time)}</span>
      </Description>
    );
  };

  const content = (
    <>
      {TUTORIALS.map(group => (
        <CollapseContent
          key={group.key}
          id={group.key}
          contendId={group.key}
          open={isOpen(group.key)}
          beforeTitle={renderIcon()}
          title={__(group.title)}
          image={group.image}
          imageBackground={group.color}
          description={renderDescription(
            group.description.step,
            group.description.duration
          )}
        >
          {group.videos.map(video => (
            <CollapseContent
              key={video.name}
              title={__(video.name)}
              compact={true}
              open={isOpen(video.key || video.name)}
            >
              {renderVideo(video.url)}
            </CollapseContent>
          ))}
        </CollapseContent>
      ))}
    </>
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header title={__('System status')} breadcrumb={breadcrumb} />
      }
      actionBar={
        <Wrapper.ActionBar background="transparent" left={renderHeader()} />
      }
      content={content}
      transparent={true}
      center={true}
    />
  );
}

export default Tutorial;
