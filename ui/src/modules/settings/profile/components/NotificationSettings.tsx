import Toggle from 'modules/common/components/Toggle';
import { ScrollWrapper } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import React from 'react';
import {
  NotificationConfig,
  NotificationModule
} from '../../../notifications/types';
import {
  Description,
  InlineItems,
  ModuleBox,
  SubHeading,
  SubItem
} from '../../styles';

type Props = {
  modules: NotificationModule[];
  configs: NotificationConfig[];
  // save notification configurations
  saveNotificationConfigurations: (notify: {
    notifType: string;
    isAllowed: boolean;
  }) => void;
  // save get notification by email action
  configGetNotificationByEmail: (byEmail: { isAllowed: boolean }) => void;
  // previously configured value
  getNotificationByEmail: boolean;
};

class NotificationSettings extends React.Component<Props> {
  onTypeChange = e => {
    // save config
    this.props.saveNotificationConfigurations({
      notifType: e.target.value,
      isAllowed: e.target.checked
    });
  };

  onEmailConfigChange = e => {
    // save get notification by email config
    this.props.configGetNotificationByEmail({ isAllowed: e.target.checked });
  };

  isChecked(notifType) {
    const oldEntry = this.props.configs.find(
      config => config.notifType === notifType.name
    );

    // if no previous configuration found then default is checked
    if (!oldEntry) {
      return true;
    }

    return oldEntry.isAllowed;
  }

  renderNotifType(type, key) {
    return (
      <InlineItems key={key}>
        {type.text}
        <Toggle
          value={type.name}
          checked={this.isChecked(type)}
          onChange={this.onTypeChange}
          icons={{
            checked: null,
            unchecked: null
          }}
        />
      </InlineItems>
    );
  }

  renderModule(module, mindex) {
    return (
      <SubItem key={mindex}>
        <SubHeading>{module.description}</SubHeading>
        {module.types.map((type, index) =>
          this.renderNotifType(type, `${mindex}${index}`)
        )}
      </SubItem>
    );
  }

  render() {
    const content = (
      <React.Fragment>
        <SubHeading>
          {__('Notifications')}
          <span>
            {__('Get notified and notify others to keep everything up to date')}
          </span>
        </SubHeading>
        <InlineItems>
          {__('Get notification by email')}
          <Toggle
            defaultChecked={this.props.getNotificationByEmail}
            onChange={this.onEmailConfigChange}
            icons={{
              checked: null,
              unchecked: null
            }}
          />
        </InlineItems>
        <Description>
          {__(
            "If your team hasn't received messages that you sent on the site, we can send it to them via email"
          )}
        </Description>
        <ScrollWrapper calcHeight="365">
          <ModuleBox>
            {this.props.modules.map((module, index) =>
              this.renderModule(module, index)
            )}
          </ModuleBox>
        </ScrollWrapper>
      </React.Fragment>
    );

    return content;
  }
}

export default NotificationSettings;
