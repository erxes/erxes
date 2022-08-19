import {
  IMessagesItem,
  ISkillData
} from '@erxes/ui-inbox/src/settings/integrations/types';
import { Launcher, WidgetPreviewStyled } from './styles';

import GreetingContent from './GreetingContent';
import { IBrand } from '@erxes/ui/src/brands/types';
import { IMessengerApps } from '@erxes/ui-inbox/src/settings/integrations/types';
import { IUser } from '@erxes/ui/src/auth/types';
import React from 'react';
import TopBar from './TopBar';
import { WebPreview } from '@erxes/ui-engage/src/styles';
import WidgetContent from './WidgetContent';

type Props = {
  teamMembers: IUser[];
  color: string;
  textColor: string;
  logoPreviewStyle?: any;
  message?: IMessagesItem;
  wallpaper: string;
  supporterIds?: string[];
  isOnline: boolean;
  logoPreviewUrl?: string;
  brandId?: string;
  brands?: IBrand[];
  timezone?: string;
  responseRate?: string;
  showTimezone?: boolean;
  skillData?: ISkillData;
  showChatPreview?: boolean;
  showVideoCallRequest?: boolean;
  messengerApps?: IMessengerApps;
  activeStep?: string;
  facebook?: string;
  twitter?: string;
  youtube?: string;
};

class CommonPreview extends React.Component<Props> {
  renderContent() {
    const {
      showChatPreview,
      isOnline,
      color,
      textColor,
      wallpaper,
      message,
      skillData,
      activeStep,
      messengerApps,
      showVideoCallRequest,
      responseRate
    } = this.props;

    if (showChatPreview) {
      return (
        <GreetingContent
          activeStep={activeStep}
          messengerApps={messengerApps}
          color={color}
          responseRate={responseRate}
        />
      );
    }

    return (
      <WidgetContent
        skillData={skillData}
        textColor={textColor}
        color={color}
        message={message}
        isOnline={isOnline}
        wallpaper={wallpaper}
        activeStep={activeStep}
        showVideoCallRequest={showVideoCallRequest}
      />
    );
  }

  render() {
    const { logoPreviewStyle, logoPreviewUrl, color } = this.props;

    return (
      <WebPreview>
        <WidgetPreviewStyled>
          <TopBar {...this.props} />
          {this.renderContent()}
        </WidgetPreviewStyled>

        <Launcher
          style={Object.assign(
            {
              backgroundColor: color,
              backgroundImage: `url(${logoPreviewUrl})`
            },
            logoPreviewStyle
          )}
        />
      </WebPreview>
    );
  }
}

export default CommonPreview;
