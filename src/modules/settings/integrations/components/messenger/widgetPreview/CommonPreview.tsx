import { IUser } from 'modules/auth/types';
import { WebPreview } from 'modules/engage/styles';
import { IBrand } from 'modules/settings/brands/types';
import { IMessagesItem } from 'modules/settings/integrations/types';
import * as React from 'react';
import { Launcher, Messenger } from './styles';
import WidgetPreview from './WidgetPreview';

type Props = {
  onChange: (key: any, value: string) => void;
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
  isStepActive?: boolean;
  facebook?: string;
  twitter?: string;
  youtube?: string;
};

class CommonPreview extends React.Component<Props> {
  render() {
    const {
      logoPreviewStyle,
      logoPreviewUrl,
      color,
      teamMembers,
      message,
      isStepActive
    } = this.props;

    return (
      <WebPreview>
        <Messenger>
          <WidgetPreview
            {...this.props}
            users={teamMembers}
            isGreeting={isStepActive}
          />

          <Launcher
            style={Object.assign(
              {
                backgroundColor: color,
                backgroundImage: `url(${logoPreviewUrl})`
              },
              logoPreviewStyle
            )}
          />
        </Messenger>
      </WebPreview>
    );
  }
}

export default CommonPreview;
