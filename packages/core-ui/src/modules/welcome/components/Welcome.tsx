import { IUser } from 'modules/auth/types';
import { DescImg } from '@erxes/ui/src/components/HeaderDescription';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import { WELCOME, CARDS } from '../constants';
import {
  BoxedStep,
  BoxHeader,
  Left,
  Boxes,
  Card,
  Header,
  SideNumber
} from '../styles';
import Box from '@erxes/ui/src/components/Box';
import Button from '@erxes/ui/src/components/Button';
import { WidgetBackgrounds } from '@erxes/ui-settings/src/styles';
import { Step, Steps } from '@erxes/ui/src/components/step';
import ProgressBar from '@erxes/ui/src/components/ProgressBar';

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
          <Box title="Docs" noBackground={true}>
            hello
          </Box>
          <Box title="How To Plugin" noBackground={true}>
            hello
          </Box>
        </Boxes>
        <Boxes>
          <Box title="API" noBackground={true}>
            hello
          </Box>
          <Box title="Plugin Monetization" noBackground={true}>
            hello
          </Box>
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
    const community = [
      {
        name: 'github',
        link: 'https://github.com/erxes/erxes',
        icon: 'github-circled'
      },
      {
        name: 'Discord',
        link: 'https://discord.com/invite/aaGzy3gQK5',
        image: '/images/discord.png'
      },
      {
        name: 'Youtube',
        link: 'https://www.youtube.com/channel/UCunYU3kJiiDsXGfB068BbDA',
        icon: 'youtube-play'
      },
      { name: 'Figma', link: '', image: '/images/figma.png' },
      { name: 'Twitter', link: 'https://twitter.com/erxeshq', icon: 'twitter' },
      {
        name: 'Facebook',
        link: 'https://www.facebook.com/erxesHQ/',
        icon: 'facebook-official'
      },
      {
        name: 'Blog',
        link: 'https://erxes.io/blog',
        image: '/images/glyph_dark.png'
      }
    ];
    return (
      <BoxedStep>
        {renderBoxHeader(
          'Join our community',
          '',
          'Discuss with team member, contributors and developers on different channels'
        )}
        <BoxHeader>
          <WidgetBackgrounds>
            {community.map(com => (
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

  const renderCard = (
    key: string,
    background: string,
    title: string,
    desc: string,
    button: string,
    icon: string,
    img: string
  ) => {
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
      {CARDS.map(card =>
        renderCard(
          card.key,
          card.background,
          card.title,
          card.desc,
          card.button,
          card.icon,
          card.img
        )
      )}
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
