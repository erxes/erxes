import { BANNER, COMMUNITY, STEPS } from '../constants';
import {
  BoxHeader,
  BoxedStep,
  Boxes,
  Card,
  Header,
  Left,
  LinkedButton,
  SideNumber
} from '../styles';
import { Step, Steps } from '@erxes/ui/src/components/step';

import Box from '@erxes/ui/src/components/Box';
import Button from '@erxes/ui/src/components/Button';
import { DescImg } from '@erxes/ui/src/components/HeaderDescription';
import { IUser } from 'modules/auth/types';
import Icon from '@erxes/ui/src/components/Icon';
import ProgressBar from '@erxes/ui/src/components/ProgressBar';
import React from 'react';
import { WidgetBackgrounds } from '@erxes/ui-settings/src/styles';
import Wrapper from 'modules/layout/components/Wrapper';
import _ from 'lodash';
import { __ } from 'modules/common/utils';
import { useHistory } from 'react-router-dom';

type Props = {
  currentUser: IUser;
};

function Welcome({ currentUser }: Props) {
  const history = useHistory();
  const { onboardingHistory, username } = currentUser;
  const completedSteps = onboardingHistory && onboardingHistory.completedSteps;
  let active = 0;

  if (username) active = 1;

  if (completedSteps && completedSteps.indexOf('generalSettingsCreate') > -1)
    active = 2;

  if (completedSteps && completedSteps.indexOf('brandCreate') !== -1)
    active = 3;

  if (completedSteps && completedSteps.indexOf('userGroupCreate') > -1)
    active = 4;

  if (completedSteps && completedSteps.indexOf('userCreate') > 1) active = 5;

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
    const percentage = Math.floor((active / 5) * 100);
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
            percentage={percentage}
            color={percentage === 100 ? '#3CCC38' : '#673FBD'}
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

  const renderSetupStep = (title: string, text: string, url: string) => {
    return (
      <Step title={title} active={active}>
        <Button
          size="small"
          icon="arrow-right"
          onClick={() => history.push(url)}
        >
          {text}
        </Button>
      </Step>
    );
  };

  const renderSetup = () => {
    return (
      <Steps direction="vertical" active={active}>
        {renderSetupStep(
          'General Information',
          'Go to your profile',
          '/profile'
        )}
        {renderSetupStep(
          'General system configuration',
          'Go to the general setting',
          '/settings/general'
        )}
        {renderSetupStep(
          'Create a brand',
          'Go to the brand settings',
          '/settings/brands#showBrandAddModal=true'
        )}
        {renderSetupStep(
          'Create a user group',
          'Go to permissions',
          '/settings/permissions'
        )}
        {renderSetupStep(
          'Invite team members',
          'Go to team members',
          '/settings/team'
        )}
      </Steps>
    );
  };

  const renderVideo = (title: string, url: string) => {
    return (
      <Box title={title}>
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
          {renderVideo(
            'Notification',
            'https://www.youtube-nocookie.com/embed/PDP9Jd7BCZs'
          )}
          {renderVideo(
            'Logs',
            'https://www.youtube-nocookie.com/embed/AHOtbefxwaw'
          )}
        </Boxes>
        <Boxes>
          {renderVideo(
            'Organization settings',
            'https://www.youtube-nocookie.com/embed/wzOyqmoxhmo'
          )}
          {renderVideo(
            'Signature',
            'https://www.youtube-nocookie.com/embed/Eg9D4r38aso'
          )}
          {renderVideo(
            'Brands',
            'https://www.youtube-nocookie.com/embed/ri17N4J478E'
          )}
          {renderVideo(
            'Use cases',
            'https://www.youtube.com/embed/videoseries?list=PLwRYODuwm31um-syg-C2j6QhCDByopXNQ'
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
                target="_blank"
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
    const { key, background, title, desc, button, img, href } = banner;

    return (
      <React.Fragment key={index}>
        <Card background={background} img={img}>
          <div>
            <h4>{title}</h4>
            <p>{desc}</p>
            <br />
            <Button size="large" btnStyle="white" href={href} target="_blank">
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
