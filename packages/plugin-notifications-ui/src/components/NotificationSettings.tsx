import Toggle from '@erxes/ui/src/components/Toggle';
import { __ } from '@erxes/ui/src/utils';
import HeaderDescription from '@erxes/ui/src/components/HeaderDescription';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import React from 'react';
import {
  NotificationConfig,
  NotificationModule
} from '@erxes/ui-notifications/src/types';
import { Box, InlineItems, ModuleBox } from './styles';
import CollapseContent from '@erxes/ui/src/components/CollapseContent';
import Icon from '@erxes/ui/src/components/Icon';
import Info from '@erxes/ui/src/components/Info';
import { Title } from '@erxes/ui-settings/src/styles';

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
      <CollapseContent
        transparent={true}
        title={__(module.description)}
        beforeTitle={<Icon icon={module.icon} />}
      >
        {module.types.map((type, index) =>
          this.renderNotifType(type, `${mindex}${index}`)
        )}
      </CollapseContent>
    );
  }

  render() {
    const content = (
      <Box>
        <CollapseContent
          transparent={true}
          title={__('Notifications')}
          beforeTitle={<Icon icon="bell" />}
        >
          {/* <Info>
            {__('Get notified and notify others to keep everything up to date')}
          </Info> */}
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
        </CollapseContent>

        <ModuleBox>
          {this.props.modules.map((module, index) =>
            this.renderModule(module, index)
          )}
        </ModuleBox>
      </Box>
    );

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Notification config') }
    ];

    const headerDescription = (
      <HeaderDescription
        icon="/images/actions/28.svg"
        title="Notification config"
        description={`${__(
          `This allows you to see erxes's real-time notification on all system`
        )}`}
      />
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Notification configs')}
            breadcrumb={breadcrumb}
          />
        }
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{__('Notification config')}</Title>}
          />
        }
        mainHead={headerDescription}
        content={content}
        transparent={true}
        hasBorder={true}
      />
    );
  }
}

export default NotificationSettings;
