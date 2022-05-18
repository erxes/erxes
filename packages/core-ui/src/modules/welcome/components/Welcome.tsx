import { IUser } from 'modules/auth/types';
import { DescImg } from '@erxes/ui/src/components/HeaderDescription';
import { __ } from 'modules/common/utils';
import _ from 'lodash';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { STEPS, BANNER, COMMUNITY } from '../constants';
import {
  BoxedStep,
  BoxHeader,
  Left,
  Boxes,
  Card,
  Header,
  SideNumber,
  LinkedButton
} from '../styles';
import Box from '@erxes/ui/src/components/Box';
import Button from '@erxes/ui/src/components/Button';
import { WidgetBackgrounds } from '@erxes/ui-settings/src/styles';
import { Step, Steps } from '@erxes/ui/src/components/step';
import ProgressBar from '@erxes/ui/src/components/ProgressBar';
import Icon from '@erxes/ui/src/components/Icon';

type Props = {
  currentUser: IUser;
};

function Welcome({ currentUser }: Props) {
  const history = useHistory();
  const completedSteps =
    currentUser.onboardingHistory &&
    currentUser.onboardingHistory.completedSteps;

  let active = 0;

  if (currentUser.username && currentUser.email) active = 1;

  if (
    (completedSteps && completedSteps.indexOf('generalSettingsCreate') > -1) ||
    (currentUser.configs.dealCurrency &&
      currentUser.configs.dealCurrency.length !== 0) ||
    (currentUser.configs.dealUOM && currentUser.configs.dealUOM.length !== 0)
  )
    active = 2;

  if (currentUser.brands!.length !== 0) active = 3;

  if (completedSteps && completedSteps.indexOf('userGroupCreate') > -1)
    active = 4;

  if (completedSteps && completedSteps.indexOf('userCreate') > -1) active = 5;

  Object.keys(currentUser.configs).map((value: string) => {
    if (
      value.includes('AWS') ||
      value.includes('GOOGLE') ||
      value.includes('COMPANY') ||
      value.includes('FILE') ||
      value.includes('MAIL') ||
      value.includes('EMAIL') ||
      value.includes('WIDGETS') ||
      value.includes('UPLOAD')
    ) {
      active = 6;
      return;
    }
  });

  const renderUserName = () => {
    if (!currentUser) {
      return null;
    }

    if (currentUser.details) {
      return currentUser.details.fullName;
    }

    if (currentUser.username) {
      return `@${currentUser.username}`;
    }

    return null;
  };

  const renderHeader = () => {
    return (
      <Header>
        <h1>
          {__('Welcome!')} {renderUserName()} &nbsp;
          <span role="img" aria-label="Wave">
            👋
          </span>
        </h1>
        <div>
          {__(
            'Enjoy a frictionless development experience and expand upon the erxes platform without modifying the core platform'
          )}
          <ul>
            <li>
              {__('Free and fair code licensed experience operating system')}
            </li>
            <li>{__('Monetization - earn from your creations')}</li>
          </ul>
        </div>
      </Header>
    );
  };

  const renderBoxHeader = (
    title: string,
    image?: string,
    description?: string
  ) => {
    return (
      <BoxHeader>
        <Left>
          {image && <DescImg src={image} />}
          <div>
            <h4>{title}</h4>
            {description}
          </div>
        </Left>
        {title === 'Setup Process' && (
          <ProgressBar
            percentage={Math.floor((active / 6) * 100)}
            type="circle"
            height="70px"
          />
        )}
      </BoxHeader>
    );
  };

  const renderDocContent = (title: string, url: string) => {
    return (
      <LinkedButton href={url} target="_blank">
        <h3>
          {title}
          <Icon icon="angle-right" />
        </h3>
      </LinkedButton>
    );
  };

  const renderDocumentation = () => {
    return (
      <WidgetBackgrounds>
        <Boxes>
          {renderDocContent(
            'Documentation',
            'https://www.erxes.org/overview/deployment-overview'
          )}
          {renderDocContent(
            "User's guide",
            'https://www.erxes.org/user/subscription-getting-started'
          )}
        </Boxes>
        <Boxes>
          {renderDocContent('Invest', 'https://www.erxes.org/invest')}
          {renderDocContent('Service', 'https://www.erxes.org/service')}
        </Boxes>
      </WidgetBackgrounds>
    );
  };

  const renderSetup = () => {
    return (
      <Steps type="stepperColumn" active={active}>
        <Step type="stepper" title="General Information">
          <Button size="large" onClick={() => history.push('/profile')}>
            Go to your profile
          </Button>
        </Step>
        <Step type="stepper" title="General system configuration">
          <Button
            size="large"
            onClick={() => history.push('/settings/general')}
          >
            Go to the general setting
          </Button>
        </Step>
        <Step type="stepper" title="Create a brand">
          <Button
            size="large"
            onClick={() =>
              history.push('/settings/brands#showBrandAddModal=true')
            }
          >
            Go to the brand settings
          </Button>
        </Step>
        <Step type="stepper" title="Create a user group">
          <Button
            size="large"
            onClick={() => history.push('/settings/permissions')}
          >
            Go to permissions
          </Button>
        </Step>
        <Step type="stepper" title="Invite team members">
          <Button size="large" onClick={() => history.push('/settings/team')}>
            Go to team members
          </Button>
        </Step>
        <Step type="stepper" title="Connecting service">
          <Button
            size="large"
            onClick={() => history.push('/settings/general')}
          >
            Go to the general settings
          </Button>
        </Step>
      </Steps>
    );
  };

  const renderVideo = (title: string, url: string) => {
    return (
      <Box title={title} noBackground={true}>
        <iframe
          title="erxes tutorial"
          width="100%"
          height="478"
          src={url}
          frameBorder="0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen={true}
        />
      </Box>
    );
  };

  const renderGuide = () => {
    return (
      <WidgetBackgrounds>
        <Boxes>
          {renderVideo(
            'Profile settings',
            'https://www.youtube-nocookie.com/embed/sDzPEEBSp44'
          )}
          {renderVideo(
            'System configuration',
            'https://www.youtube-nocookie.com/embed/PDP9Jd7BCZs'
          )}
        </Boxes>
        <Boxes>
          {renderVideo(
            'Signature',
            'https://www.youtube-nocookie.com/embed/Eg9D4r38aso'
          )}
          {renderVideo(
            'Brands',
            'https://www.youtube-nocookie.com/embed/ri17N4J478E'
          )}
        </Boxes>
      </WidgetBackgrounds>
    );
  };

  const renderCommunity = () => {
    return (
      <BoxedStep>
        {renderBoxHeader(
          'Join our community',
          '',
          'Discuss with team member, contributors and developers on different channels'
        )}
        <BoxHeader>
          <WidgetBackgrounds>
            {COMMUNITY.map((com, index) => (
              <Button
                key={index}
                href={com.link}
                btnStyle="simple"
                icon={com.icon}
                img={com.image}
                iconColor="black"
              >
                {com.name}
              </Button>
            ))}
          </WidgetBackgrounds>
        </BoxHeader>
      </BoxedStep>
    );
  };

  const renderBanner = (banner, index) => {
    const { key, background, title, desc, button, img } = banner;

    return (
      <React.Fragment key={index}>
        <Card background={background} img={img}>
          <div>
            <h4>{title}</h4>
            <p>{desc}</p>
            <br />
            <Button size="large" btnStyle="white">
              {button}
            </Button>
          </div>
          {key === 'market' && (
            <SideNumber>
              <h3>+1200</h3>
              <p>plugin added</p>
            </SideNumber>
          )}
        </Card>
        {key === 'market' && renderCommunity()}
      </React.Fragment>
    );
  };

  const content = (
    <>
      {STEPS.map((group, index) => (
        <BoxedStep key={index}>
          {renderBoxHeader(group.title, group.image, group.description)}
          {group.key === 'documentation' && renderDocumentation()}
          {group.key === 'usingGuide' && renderGuide()}
          {group.key === 'setup' && renderSetup()}
        </BoxedStep>
      ))}
      {BANNER.map((banner, index) => renderBanner(banner, index))}
    </>
  );

  return (
    <Wrapper
      actionBar={
        <Wrapper.ActionBar
          background="transparent"
          noBorder={true}
          left={renderHeader()}
        />
      }
      content={content}
      transparent={true}
      center={true}
      initialOverflow={true}
    />
  );
}

export default Welcome;
