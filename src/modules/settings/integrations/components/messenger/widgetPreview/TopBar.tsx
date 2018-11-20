import { IUser } from 'modules/auth/types';
import { Icon } from 'modules/common/components';
import { WebPreview } from 'modules/engage/styles';
import { IBrand } from 'modules/settings/brands/types';
import { IMessagesItem } from 'modules/settings/integrations/types';
import * as moment from 'moment';
import * as React from 'react';
import { GreetingMessage, Supporters as SupporterComponent } from './';
import {
  ErxesGreeting,
  ErxesMiddleTitle,
  ErxesTopbar,
  Links,
  Socials,
  TopBarIcon
} from './styles';

type Props = {
  color: string;
  message?: IMessagesItem;
  wallpaper: string;
  supporterIds?: string[];
  isOnline: boolean;
  logoPreviewUrl?: string;
  brandId?: string;
  brands?: IBrand[];
  teamMembers: IUser[];
  isGreeting?: boolean;
  facebook?: string;
  twitter?: string;
  youtube?: string;
};

class TopBar extends React.Component<Props> {
  renderIcons(icon: string, left?: boolean, size?: number) {
    return (
      <TopBarIcon isLeft={left || false}>
        <Icon icon={icon} size={size} />
      </TopBarIcon>
    );
  }

  renderLink(value, icon) {
    if (!value) {
      return null;
    }

    return (
      <a>
        <Icon icon={icon} size={18} />
      </a>
    );
  }

  renderSupporters() {
    const { supporterIds, isOnline, teamMembers, isGreeting } = this.props;

    return (
      <SupporterComponent
        supporterIds={supporterIds}
        isOnline={isOnline}
        teamMembers={teamMembers}
        isGreeting={isGreeting}
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
        {this.renderIcons('leftarrow-3', true)}
        <ErxesMiddleTitle>
          {currentBrand && <h3>{currentBrand.name}</h3>}
          {currentBrand && <span>{currentBrand.description}</span>}
          {this.renderSupporters()}
        </ErxesMiddleTitle>
        {this.renderIcons('cancel', false, 11)}
      </>
    );
  }

  renderGreetingTopbar() {
    const { facebook, twitter, youtube, message } = this.props;

    return (
      <>
        <ErxesGreeting>
          <Links>
            <span>{moment(new Date()).format('lll')}</span>
            <Socials>
              {this.renderLink(facebook, 'facebook')}
              {this.renderLink(twitter, 'twitter')}
              {this.renderLink(youtube, 'youtube')}
            </Socials>
          </Links>

          <GreetingMessage message={message} />

          {this.renderSupporters()}
        </ErxesGreeting>
        {this.renderIcons('cancel', false, 11)}
      </>
    );
  }

  renderContent() {
    if (this.props.isGreeting) {
      return this.renderGreetingTopbar();
    }

    return this.renderTopBar();
  }

  render() {
    return (
      <ErxesTopbar style={{ backgroundColor: this.props.color }}>
        {this.renderContent()}
      </ErxesTopbar>
    );
  }
}

export default TopBar;
