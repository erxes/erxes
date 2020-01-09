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
  logoPreviewStyle?: any;
  message?: IMessagesItem;
  wallpaper: string;
  supporterIds?: string[];
  isOnline: boolean;
  logoPreviewUrl?: string;
  brandId?: string;
  brands?: IBrand[];
  isGreeting?: boolean;
  facebook?: string;
  twitter?: string;
  youtube?: string;
};

class CommonPreview extends React.Component<Props> {
  renderContent() {
    const { isGreeting, isOnline, color, wallpaper, message } = this.props;

    if (isGreeting) {
      return <GreetingContent />;
    }

    return (
      <WidgetContent
        color={color}
        message={message}
        isOnline={isOnline}
        wallpaper={wallpaper}
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
