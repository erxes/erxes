import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tip, Icon } from 'modules/common/components';
import { WidgetPreview } from '../';
import { MessengerPreview, Messenger } from 'modules/engage/styles';
import { LogoContainer } from 'modules/settings/styles';

const propTypes = {
  onChange: PropTypes.func,
  teamMembers: PropTypes.array.isRequired,
  color: PropTypes.string,
  logoPreviewStyle: PropTypes.object,
  welcomeMessage: PropTypes.string,
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
      isOnline,
      supporterIds,
      teamMembers
    } = this.props;

    const { __ } = this.context;

    return (
      <MessengerPreview fullHeight>
        <Messenger>
          <WidgetPreview
            color={color}
            wallpaper={wallpaper}
            users={teamMembers}
            supporterIds={supporterIds}
            welcomeMessage={welcomeMessage}
            isOnline={isOnline}
          />

          <Tip text={__('Choose a logo')}>
            <LogoContainer
              style={Object.assign(
                {
                  backgroundColor: color,
                  backgroundImage: `url(${logoPreviewUrl ||
                    '/images/erxes.png'})`
                },
                logoPreviewStyle
              )}
            >
              <label style={{ backgroundColor: color }}>
                <Icon icon="upload" />
                <input type="file" />
              </label>
            </LogoContainer>
          </Tip>
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
