import { IUser } from '@erxes/ui/src/auth/types';
import Icon from '@erxes/ui/src/components/Icon';
import React from 'react';
import { __ } from 'modules/common/utils';
import {
  ErxesGreeting,
  ErxesTopbar,
  GreetingInfo,
  Links,
  Socials,
  TopBarIcon,
  TopBarTab,
} from 'modules/saas/onBoarding/styles';
import Supporters from './Supporters';

type Props = {
  color: string;
  textColor: string;
  message?: string;
  logoPreviewUrl?: string;
  currentUser: IUser;
  avatar: string;
  brandName: string;
};

class TopBar extends React.Component<Props> {
  renderIcons(icon: string, left?: boolean, size?: number) {
    return (
      <TopBarIcon isLeft={left || false}>
        <Icon icon={icon} size={size || 24} />
      </TopBarIcon>
    );
  }

  renderLink(icon) {
    return (
      <a href="#icon">
        <Icon icon={icon} size={18} />
      </a>
    );
  }

  renderSupporters() {
    const { currentUser, avatar } = this.props;

    return (
      <Supporters isOnline={false} currentUser={currentUser} avatar={avatar} />
    );
  }

  renderGreetingTitle(message) {
    const { brandName } = this.props;

    if (message) {
      return <h3>{message}</h3>;
    }

    return <h3>{__('Hello, we are ') + `${brandName!}`}</h3>;
  }

  renderGreetingMessage(message) {
    if (message) {
      return <p>{message}</p>;
    }

    return (
      <p>
        {__(
          'We are available between 9.00 am and 6.00 pm (GMT +8). Please leave us a message if you are connecting outside the above hours. We will get back to you as soon as possible.',
        )}{' '}
      </p>
    );
  }

  renderGreetings() {
    const { message } = this.props;

    return (
      <GreetingInfo>
        {this.renderGreetingTitle(message)}
        {this.renderGreetingMessage(message)}
      </GreetingInfo>
    );
  }

  renderTabs() {
    return (
      <TopBarTab>
        <div style={{ backgroundColor: this.props.color }} />
        <span>{__('Support')}</span>
        <span>{__('Faq')}</span>
      </TopBarTab>
    );
  }

  renderGreetingTopbar() {
    return (
      <>
        <ErxesGreeting>
          <Links>
            <Socials>
              {this.renderLink('facebook-official')}
              {this.renderLink('whatsapp')}
              {this.renderLink('twitter')}
              {this.renderLink('youtube-play')}
            </Socials>
          </Links>

          {this.renderGreetings()}
          {this.renderSupporters()}
          {this.renderTabs()}
        </ErxesGreeting>
        {this.renderIcons('cancel', false, 11)}
      </>
    );
  }

  renderContent() {
    return this.renderGreetingTopbar();
  }

  render() {
    const { color, textColor } = this.props;

    return (
      <ErxesTopbar style={{ backgroundColor: color, color: textColor }}>
        {this.renderContent()}
      </ErxesTopbar>
    );
  }
}

export default TopBar;
