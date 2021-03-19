import { IUser } from 'modules/auth/types';
import { WebPreview } from 'modules/engage/styles';
import { IBrand } from 'modules/settings/brands/types';
import { IMessagesItem } from 'modules/settings/integrations/types';
import React from 'react';
import GreetingContent from './GreetingContent';
import { Launcher, WidgetPreviewStyled } from './styles';
import TopBar from './TopBar';
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
  showChatPreview?: boolean;
  showVideoCallRequest?: boolean;
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
      showVideoCallRequest
    } = this.props;

    if (showChatPreview) {
      return <GreetingContent />;
    }

    return (
      <WidgetContent
        textColor={textColor}
        color={color}
        message={message}
        isOnline={isOnline}
        wallpaper={wallpaper}
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
