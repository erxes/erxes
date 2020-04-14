import CollapseContent from 'modules/common/components/CollapseContent';
import Icon from 'modules/common/components/Icon';
import colors from 'modules/common/styles/colors';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import styled from 'styled-components';

const Description = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 3px;
  color: ${colors.textSecondary};

  span {
    color: ${colors.colorCoreGray};
    margin-left: 5px;
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

  const renderVideo = () => {
    return (
      <iframe
        title="erxes tutorial"
        width="100%"
        height="478"
        src="https://www.youtube.com/embed/hd07s0oZ83A"
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
          {__('Welcome to video tutorial Dashboard')}{' '}
          <span role="img" aria-label="Wave">
            👋
          </span>
        </h1>
        <p>
          {__(
            'Here is where you can check your performance and find some tips'
          )}
          !
        </p>
      </Header>
    );
  };

  const renderIcon = () => {
    return (
      <IconWrapper>
        <Icon icon="check-circle" />
      </IconWrapper>
    );
  };

  const renderDescription = (step: string, time: string) => {
    return (
      <Description>
        {__(step)} <span>{__(time)}</span>
      </Description>
    );
  };

  const content = (
    <>
      <CollapseContent
        id="defaultStage"
        title="Default stage"
        open={isOpen('defaultStage')}
        beforeTitle={renderIcon()}
        image="/images/actions/23.svg"
        description={renderDescription('6 steps.', 'About 5 minutes')}
      >
        <CollapseContent title={__('Profile settings')} compact={true}>
          {renderVideo()}
        </CollapseContent>
        <CollapseContent title={__('Organization settings')} compact={true}>
          {renderVideo()}
        </CollapseContent>
        <CollapseContent title={__('System configuration')} compact={true}>
          {renderVideo()}
        </CollapseContent>
        <CollapseContent title={__('Signature')} compact={true}>
          {renderVideo()}
        </CollapseContent>
        <CollapseContent title={__('Notification')} compact={true}>
          {renderVideo()}
        </CollapseContent>
      </CollapseContent>
      <CollapseContent
        id="settingStage"
        open={isOpen('settingStage')}
        beforeTitle={renderIcon()}
        title={__('Setting up stage')}
        image="/images/actions/21.svg"
        description={renderDescription('19 steps.', 'About 19 minutes')}
      >
        <CollapseContent title={__('Brands')} compact={true}>
          {renderVideo()}
        </CollapseContent>
        <CollapseContent title={__('NotifiChannelscation')} compact={true}>
          {renderVideo()}
        </CollapseContent>
        <CollapseContent title={__('App store')} compact={true}>
          {renderVideo()}
        </CollapseContent>
        <CollapseContent
          title={__('Sales pipeline stage + Product service')}
          compact={true}
        >
          {renderVideo()}
        </CollapseContent>
        <CollapseContent title={__('Campaign & projects')} compact={true}>
          {renderVideo()}
        </CollapseContent>
        <CollapseContent title={__('Task stage')} compact={true}>
          {renderVideo()}
        </CollapseContent>
        <CollapseContent title={__('Tickets stage')} compact={true}>
          {renderVideo()}
        </CollapseContent>
        <CollapseContent
          title={__('Tags - inbox, customer, engage pop, up')}
          compact={true}
        >
          {renderVideo()}
        </CollapseContent>
        <CollapseContent title={__('Segments - customer')} compact={true}>
          {renderVideo()}
        </CollapseContent>
      </CollapseContent>
      <CollapseContent
        id="usingStage"
        beforeTitle={renderIcon()}
        open={isOpen('usingStage')}
        title={__('Using stage')}
        image="/images/actions/35.svg"
        description={renderDescription('8 steps.', 'About 20 minutes')}
      >
        <CollapseContent title="Team inbox" compact={true}>
          {renderVideo()}
        </CollapseContent>
      </CollapseContent>
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
