import { IUser } from 'modules/auth/types';
import { Icon, Tip } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { IBrand } from 'modules/settings/brands/types';
import { IMessagesItem } from 'modules/settings/integrations/types';
import * as moment from 'moment';
import * as React from 'react';
import {
  ContentBox,
  ErxesAvatar,
  ErxesContent,
  ErxesDate,
  ErxesFromCustomer,
  ErxesGreeting,
  ErxesMessage,
  ErxesMessageSender,
  ErxesMessagesList,
  ErxesMiddle,
  ErxesMiddleTitle,
  ErxesSpacialMessage,
  ErxesStaffProfile,
  ErxesSupporters,
  ErxesTopbar,
  ErxesTopbarMiddle,
  FromCustomer,
  GreetingInfo,
  LeftSide,
  Links,
  RightSide,
  Socials,
  StateSpan,
  Supporters,
  WelcomeInfo,
  WidgetPreviewStyled
} from './styles';

type Props = {
  color: string;
  wallpaper: string;
  users: IUser[];
  supporterIds?: string[];
  isOnline?: boolean;
  prevHeight?: number;
  brandId?: string;
  brands?: IBrand[];
  isGreeting?: boolean;
  facebook?: string;
  twitter?: string;
  youtube?: string;
  message?: IMessagesItem;
};

type State = {
  headHeight: any;
};

class WidgetPreview extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { headHeight: props.prevHeight };
  }

  renderRightButton() {
    return (
      <a
        href="#"
        className="topbar-button right fade-in"
        title="End conversation"
      >
        <Icon icon="cancel" size={11} />
      </a>
    );
  }

  renderLeftButton() {
    return (
      <button className="topbar-button left fade-in">
        <Icon icon="leftarrow-3" />
      </button>
    );
  }

  renderName(currentBrand) {
    if (!currentBrand) {
      return null;
    }

    return <h3>{currentBrand.name}</h3>;
  }

  renderDesc(currentBrand) {
    if (!currentBrand) {
      return null;
    }

    return <span>{currentBrand.description}</span>;
  }

  renderSupporters() {
    const { isOnline, users, supporterIds } = this.props;

    const supporters = users.filter(user =>
      (supporterIds || []).includes(user._id || '')
    );

    let avatar = [
      <img key="1" src="/images/avatar-colored.svg" alt="avatar" />
    ];

    if (supporters.length > 0) {
      avatar = supporters.map(u => {
        const details = u.details || {};

        return (
          <ErxesStaffProfile key={u._id}>
            <Tip text={details.fullName} placement="top">
              <img src={details.avatar} alt={details.fullName} />
            </Tip>
            <StateSpan state={isOnline || false} />
          </ErxesStaffProfile>
        );
      });
    }

    return avatar;
  }

  renderTitle() {
    const { brands = [], brandId } = this.props;
    let currentBrand = {};

    brands.map(brand => {
      if (brand._id !== brandId) {
        return null;
      }

      return (currentBrand = brand);
    });

    return (
      <ErxesTopbarMiddle>
        <WelcomeInfo>
          {this.renderName(currentBrand)}
          {this.renderDesc(currentBrand)}
        </WelcomeInfo>
        <ErxesSupporters>{this.renderSupporters()}</ErxesSupporters>
      </ErxesTopbarMiddle>
    );
  }

  renderLink(value, icon) {
    let link = value;

    if (!value) {
      return null;
    }

    if (!value.includes('http')) {
      link = 'https://'.concat(value);
    }

    return (
      <a href={link} target="_blank">
        <Icon icon={icon} size={18} />
      </a>
    );
  }

  renderContent() {
    const {
      color,
      wallpaper,
      message,
      isOnline,
      isGreeting,
      facebook,
      twitter,
      youtube
    } = this.props;

    const renderMessage = msg => {
      if (!msg) {
        return null;
      }

      return <ErxesSpacialMessage>{msg}</ErxesSpacialMessage>;
    };

    const backgroundClasses = `background-${wallpaper}`;

    if (isGreeting) {
      return (
        <React.Fragment>
          <ErxesTopbar
            style={{ backgroundColor: color, height: this.state.headHeight }}
          >
            <ErxesMiddle>
              <ErxesGreeting>
                <Links>
                  <span>{moment(new Date()).format('lll')}</span>
                  <Socials>
                    {this.renderLink(facebook, 'facebook')}
                    {this.renderLink(twitter, 'twitter')}
                    {this.renderLink(youtube, 'youtube')}
                  </Socials>
                </Links>
                <GreetingInfo>
                  <h3>{message && message.greetings.title}</h3>
                  <p>{message && message.greetings.message}</p>
                </GreetingInfo>
                <Supporters>{this.renderSupporters()}</Supporters>
              </ErxesGreeting>
              {this.renderRightButton()}
            </ErxesMiddle>
          </ErxesTopbar>

          <ErxesContent>
            <ContentBox>
              <h4>{__('Recent conversations')}</h4>
              <ul>
                <li>
                  <LeftSide>
                    <span>
                      <Icon icon="plus" />
                    </span>
                  </LeftSide>
                  <RightSide>
                    <span>{__('Start new conversation')}</span>
                    <p>{__('Talk with support staff')}</p>
                  </RightSide>
                </li>
                <li>
                  <LeftSide>
                    <img
                      key="1"
                      src="/images/avatar-colored.svg"
                      alt="avatar"
                    />
                  </LeftSide>
                  <RightSide>
                    <div>{moment(new Date()).format('LT')}</div>
                    <span>{__('User')}</span>
                    <p>{__('We need your help!')}</p>
                  </RightSide>
                </li>
              </ul>
            </ContentBox>
          </ErxesContent>
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <ErxesTopbar
          style={{ backgroundColor: color, height: this.state.headHeight }}
        >
          <ErxesMiddle>
            {this.renderLeftButton()}
            <ErxesMiddleTitle>{this.renderTitle()}</ErxesMiddleTitle>
            {this.renderRightButton()}
          </ErxesMiddle>
        </ErxesTopbar>

        <ErxesMessagesList className={backgroundClasses}>
          {isOnline && renderMessage(message && message.welcome)}
          <li>
            <ErxesAvatar>
              <img src="/images/avatar-colored.svg" alt="avatar" />
            </ErxesAvatar>
            <ErxesMessage>{__('Hi, any questions?')}</ErxesMessage>
            <ErxesDate>{__('1 hour ago')}</ErxesDate>
          </li>
          <ErxesFromCustomer>
            <FromCustomer style={{ backgroundColor: color }}>
              {__('We need your help!')}
            </FromCustomer>
            <ErxesDate>{__('6 minutes ago')}</ErxesDate>
          </ErxesFromCustomer>
          {!isOnline && renderMessage(message && message.away)}
        </ErxesMessagesList>

        <ErxesMessageSender>
          <span>{__('Send a message')} ...</span>
        </ErxesMessageSender>
      </React.Fragment>
    );
  }

  render() {
    return <WidgetPreviewStyled>{this.renderContent()}</WidgetPreviewStyled>;
  }
}

export default WidgetPreview;
