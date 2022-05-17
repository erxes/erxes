import { IUser } from 'modules/auth/types';
import { DescImg } from '@erxes/ui/src/components/HeaderDescription';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import { WELCOME, CARDS, COMMUNITY } from '../constants';
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
  const renderHeader = () => {
    return (
      <Header>
        <h1>
          {__('Welcome!')} {currentUser.username}{' '}
          <span role="img" aria-label="Wave">
            👋
          </span>
        </h1>
        <p>
          {__(
            'Enjoy a frictionless development experience and expand upon the erxes platform without modifying the core platform'
          )}
          <ul>
            <li>
              {__('Free and fair code licensed experience operating system')}
            </li>
            <li>{__('Monetization - earn from your creations')}</li>
          </ul>
        </p>
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
          <ProgressBar percentage={50} type="circle" height="70px" />
        )}
      </BoxHeader>
    );
  };

  const renderDocumentation = () => {
    return (
      <WidgetBackgrounds>
        <Boxes>
          <LinkedButton
            href="https://www.erxes.org/overview/deployment-overview"
            target="_blank"
          >
            <h3>
              Documentation
              <Icon icon="angle-right" />
            </h3>
          </LinkedButton>
          <LinkedButton
            href="https://www.erxes.org/user/subscription-getting-started"
            target="_blank"
          >
            <h3>
              User's guide
              <Icon icon="angle-right" />
            </h3>
          </LinkedButton>
        </Boxes>
        <Boxes>
          <LinkedButton href="https://www.erxes.org/invest" target="_blank">
            <h3>
              Invest
              <Icon icon="angle-right" />
            </h3>
          </LinkedButton>
          <LinkedButton href="https://www.erxes.org/service" target="_blank">
            <h3>
              Service
              <Icon icon="angle-right" />
            </h3>
          </LinkedButton>
        </Boxes>
      </WidgetBackgrounds>
    );
  };

  const renderSetup = () => {
    return (
      <>
        <Steps
          type="stepperColumn"
          allStep={5}
          titles={[
            'General information',
            'General system configuration',
            'Campaign config / File Upload',
            'Constant',
            'Connecting service'
          ]}
        >
          <Step type="stepperColumn" noButton={true}>
            hi
          </Step>
          <Step type="stepperColumn" noButton={true}>
            hi
          </Step>
          <Step type="stepperColumn" noButton={true}>
            hi
          </Step>
          <Step type="stepperColumn" noButton={true}>
            hi
          </Step>
          <Step type="stepperColumn" noButton={true}>
            hi
          </Step>
        </Steps>
      </>
    );
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

  const renderGuide = () => {
    return (
      <WidgetBackgrounds>
        <Boxes>
          <Box title="Profile settings" noBackground={true}>
            {renderVideo('https://www.youtube-nocookie.com/embed/sDzPEEBSp44')}
          </Box>
          <Box title="System configuration" noBackground={true}>
            {renderVideo('https://www.youtube-nocookie.com/embed/PDP9Jd7BCZs')}
          </Box>
        </Boxes>
        <Boxes>
          <Box title="Signature" noBackground={true}>
            {renderVideo('https://www.youtube-nocookie.com/embed/Eg9D4r38aso')}
          </Box>
          <Box title="Brands" noBackground={true}>
            {renderVideo('https://www.youtube-nocookie.com/embed/ri17N4J478E')}
          </Box>
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
            {COMMUNITY.map(com => (
              <Button
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

  const renderCard = card => {
    const { key, background, title, desc, button, img } = card;
    return (
      <>
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
      </>
    );
  };

  const content = (
    <>
      {WELCOME.map(group => (
        <BoxedStep>
          {renderBoxHeader(group.title, group.image, group.description)}
          {group.key === 'documentation' && renderDocumentation()}
          {group.key === 'usingGuide' && renderGuide()}
          {group.key === 'setup' && renderSetup()}
        </BoxedStep>
      ))}
      {CARDS.map(card => renderCard(card))}
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
