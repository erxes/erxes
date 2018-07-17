import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { WidgetPreview } from '../';
import { MessengerPreview, Messenger } from 'modules/engage/styles';
import { LogoContainer } from 'modules/settings/styles';

const propTypes = {
  onChange: PropTypes.func,
  teamMembers: PropTypes.array.isRequired,
  color: PropTypes.string,
  logoPreviewStyle: PropTypes.object,
  welcomeMessage: PropTypes.string,
  awayMessage: PropTypes.string,
  wallpaper: PropTypes.string,
  supporterIds: PropTypes.array,
  isOnline: PropTypes.bool,
  logoPreviewUrl: PropTypes.string
};

class CommonPreview extends Component {
  render() {
    const {
      logoPreviewStyle,
      logoPreviewUrl,
      color,
      wallpaper,
      welcomeMessage,
      awayMessage,
      isOnline,
      supporterIds,
      teamMembers
    } = this.props;

    return (
      <MessengerPreview fullHeight>
        <Messenger>
          <WidgetPreview
            color={color}
            wallpaper={wallpaper}
            users={teamMembers}
            supporterIds={supporterIds}
            welcomeMessage={welcomeMessage}
            awayMessage={awayMessage}
            isOnline={isOnline}
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

CommonPreview.propTypes = propTypes;
CommonPreview.contextTypes = {
  __: PropTypes.func
};

export default CommonPreview;
