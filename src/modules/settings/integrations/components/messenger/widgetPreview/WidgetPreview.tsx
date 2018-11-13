import { IUser } from 'modules/auth/types';
import { Icon, Tip } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { IBrand } from 'modules/settings/brands/types';
import * as React from 'react';
import {
  ErxesAvatar,
  ErxesDate,
  ErxesFromCustomer,
  ErxesMessage,
  ErxesMessageSender,
  ErxesMessagesList,
  ErxesMiddle,
  ErxesMiddleTitle,
  ErxesSpacialMessage,
  ErxesStaffName,
  ErxesStaffProfile,
  ErxesState,
  ErxesSupporters,
  ErxesTopbar,
  ErxesTopbarMiddle,
  FromCustomer,
  StateSpan,
  WelcomeInfo,
  WidgetPreviewStyled
} from './styles';

type Props = {
  color: string;
  wallpaper: string;
  users: IUser[];
  supporterIds?: string[];
  welcomeMessage?: string;
  awayMessage?: string;
  isOnline?: boolean;
  prevHeight?: number;
  brandId?: string;
  brands?: IBrand[];
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
        <Icon icon="cancel" />
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

  renderTitle() {
    const { brands = [], brandId, users, isOnline, supporterIds } = this.props;
    let currentBrand = {};
    let avatar = [
      <img key="1" src="/images/avatar-colored.svg" alt="avatar" />
    ];

    const supporters = users.filter(user =>
      (supporterIds || []).includes(user._id || '')
    );

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
        <ErxesSupporters>{avatar}</ErxesSupporters>
      </ErxesTopbarMiddle>
    );
  }

  render() {
    const {
      color,
      wallpaper,
      welcomeMessage,
      awayMessage,
      isOnline
    } = this.props;

    const renderMessage = message => {
      if (!message) {
        return null;
      }
      return <ErxesSpacialMessage>{message}</ErxesSpacialMessage>;
    };

    const backgroundClasses = `background-${wallpaper}`;

    return (
      <WidgetPreviewStyled>
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
          {isOnline && renderMessage(welcomeMessage)}
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
          {!isOnline && renderMessage(awayMessage)}
        </ErxesMessagesList>

        <ErxesMessageSender>
          <span>{__('Send a message ...')}</span>
        </ErxesMessageSender>
      </WidgetPreviewStyled>
    );
  }
}

export default WidgetPreview;
