import {
  ErxesGreeting,
  ErxesMiddleTitle,
  ErxesTopbar,
  GreetingInfo,
  Links,
  ServerInfo,
  Socials,
  TopBarIcon,
  TopBarTab
} from './styles';

import { IBrand } from '@erxes/ui/src/brands/types';
import { IMessagesItem } from '@erxes/ui-inbox/src/settings/integrations/types';
import { IMessengerApps } from '@erxes/ui-inbox/src/settings/integrations/types';
import { IUser } from '@erxes/ui/src/auth/types';
import Icon from '@erxes/ui/src/components/Icon';
import React from 'react';
import SupporterComponent from './Supporters';
import { __ } from 'coreui/utils';
import dayjs from 'dayjs';

type Props = {
  color: string;
  textColor: string;
  message?: IMessagesItem;
  wallpaper: string;
  supporterIds?: string[];
  isOnline: boolean;
  logoPreviewUrl?: string;
  brandId?: string;
  brands?: IBrand[];
  teamMembers: IUser[];
  showChatPreview?: boolean;
  activeStep?: string;
  messengerApps?: IMessengerApps;
  timezone?: string;
  showTimezone?: boolean;
  facebook?: string;
  twitter?: string;
  youtube?: string;
};

class TopBar extends React.Component<Props> {
  renderIcons(icon: string, left?: boolean, size?: number) {
    return (
      <TopBarIcon isLeft={left || false}>
        <Icon icon={icon} size={size || 24} />
      </TopBarIcon>
    );
  }

  renderLink(value, icon) {
    if (!value) {
      return null;
    }

    return (
      <a href="#icon">
        <Icon icon={icon} size={18} />
      </a>
    );
  }

  renderServerInfo() {
    const { showChatPreview, timezone } = this.props;

    if (!showChatPreview) {
      return null;
    }

    return (
      <ServerInfo>
        <div>
          {__('Server time')}: {dayjs(new Date()).format('lll')}
        </div>
        {__('Timezone')}: {timezone ? timezone : __('Asia/Ulaanbaatar')}
      </ServerInfo>
    );
  }

  renderSupporters() {
    const {
      supporterIds,
      isOnline,
      teamMembers,
      showChatPreview,
      showTimezone,
      timezone
    } = this.props;

    return (
      <SupporterComponent
        supporterIds={supporterIds}
        isOnline={isOnline}
        teamMembers={teamMembers}
        showChatPreview={showChatPreview}
        showTimezone={showTimezone}
        timezone={timezone}
      />
    );
  }

  renderTopBar() {
    const { brands = [], brandId } = this.props;
    let currentBrand = {} as IBrand;

    brands.map(brand => {
      if (brand._id !== brandId) {
        return null;
      }

      return (currentBrand = brand);
    });

    return (
      <>
        {this.renderIcons('angle-left', true)}
        <ErxesMiddleTitle>
          {currentBrand && <h3>{currentBrand.name}</h3>}
          {currentBrand && <span>{currentBrand.description}</span>}
          {this.renderSupporters()}
        </ErxesMiddleTitle>
        {this.renderIcons('times', false)}
      </>
    );
  }

  renderGreetingTitle(message) {
    if (message && message.greetings.title) {
      return <h3>{message.greetings.title}</h3>;
    }

    return <h3>{__('Welcome')}</h3>;
  }

  renderGreetingMessage(message) {
    if (message && message.greetings.message) {
      return <p>{message.greetings.message}</p>;
    }

    return (
      <p>
        {__('Hi, any questions?')} <br /> {__('We are ready to help you') + '.'}
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
    const { messengerApps, activeStep } = this.props;

    if (
      !messengerApps ||
      (messengerApps.knowledgebases || []).length === 0 ||
      !(messengerApps.knowledgebases || [])[0].topicId ||
      activeStep !== 'addon'
    ) {
      return null;
    }

    return (
      <TopBarTab>
        <div style={{ backgroundColor: this.props.color }} />
        <span>{__('Support')}</span>
        <span>{__('Faq')}</span>
      </TopBarTab>
    );
  }

  renderGreetingTopbar() {
    const { facebook, twitter, youtube } = this.props;

    return (
      <>
        <ErxesGreeting>
          <Links>
            <Socials>
              {this.renderLink(facebook, 'facebook-official')}
              {this.renderLink(twitter, 'twitter')}
              {this.renderLink(youtube, 'youtube-play')}
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
    if (this.props.showChatPreview) {
      return this.renderGreetingTopbar();
    }

    return this.renderTopBar();
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
