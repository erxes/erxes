import { IUser } from 'modules/auth/types';
import { Messenger, MessengerPreview } from 'modules/engage/styles';
import { IMessagesItem } from 'modules/settings/integrations/types';
import { LogoContainer } from 'modules/settings/styles';
import * as React from 'react';
import WidgetPreview from './WidgetPreview';

type Props = {
  onChange: (key: any, value: string) => void;
  teamMembers: IUser[];
  color: string;
  logoPreviewStyle?: any;
  message: IMessagesItem;
  wallpaper: string;
  supporterIds?: string[];
  isOnline: boolean;
  logoPreviewUrl?: string;
  brandId?: string;
};

class CommonPreview extends React.Component<Props> {
  render() {
    const {
      logoPreviewStyle,
      logoPreviewUrl,
      color,
      wallpaper,
      isOnline,
      supporterIds,
      teamMembers,
      message,
      brandId
    } = this.props;

    return (
      <MessengerPreview>
        <Messenger>
          <WidgetPreview
            color={color}
            wallpaper={wallpaper}
            users={teamMembers}
            supporterIds={supporterIds}
            welcomeMessage={message.welcome}
            awayMessage={message.away}
            isOnline={isOnline}
            brandId={brandId}
          />

          <LogoContainer
            style={Object.assign(
              {
                backgroundColor: color,
                backgroundImage: `url(${logoPreviewUrl})`
              },
              logoPreviewStyle
            )}
          />
        </Messenger>
      </MessengerPreview>
    );
  }
}

export default CommonPreview;
