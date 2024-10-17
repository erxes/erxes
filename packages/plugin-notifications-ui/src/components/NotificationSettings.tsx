import Toggle from '@erxes/ui/src/components/Toggle';
import { __ } from '@erxes/ui/src/utils';
import HeaderDescription from '@erxes/ui/src/components/HeaderDescription';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import React from 'react';
import {
  NotificationConfig,
  NotificationModule,
} from '@erxes/ui-notifications/src/types';
import { Box, InlineItems, ModuleBox } from './styles';
import CollapseContent from '@erxes/ui/src/components/CollapseContent';
import Icon from '@erxes/ui/src/components/Icon';
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

const breadcrumb = [
  { title: __('Settings'), link: '/settings' },
  { title: __('Notification config') },
];

const headerDescription = (
  <HeaderDescription
    icon="/images/actions/28.svg"
    title={__("Notification config")}
    description={`${__(
      `This allows you to see erxes's real-time notification on all system`,
    )}`}
  />
);

const NotificationSettings = (props: Props) => {
  const {
    modules,
    configs,
    getNotificationByEmail,
    saveNotificationConfigurations,
    configGetNotificationByEmail,
  } = props;

  const onTypeChange = (e) => {
    // save config
    saveNotificationConfigurations({
      notifType: e.target.value,
      isAllowed: e.target.checked,
    });
  };

  const onEmailConfigChange = (e) => {
    // save get notification by email config
    configGetNotificationByEmail({ isAllowed: e.target.checked });
  };

  const isChecked = (notifType) => {
    const oldEntry = configs.find(
      (config) => config.notifType === notifType.name,
    );

    // if no previous configuration found then default is checked
    if (!oldEntry) {
      return true;
    }

    return oldEntry.isAllowed;
  };

  const renderNotifType = (type, typeIndex) => {
    return (
      <InlineItems key={typeIndex}>
        {type.text}
        <Toggle
          value={type.name}
          checked={isChecked(type)}
          onChange={onTypeChange}
          icons={{
            checked: null,
            unchecked: null,
          }}
        />
      </InlineItems>
    );
  };

  const renderModule = (module, moduleIndex) => {
    return (
      <CollapseContent
        key={moduleIndex}
        transparent={true}
        title={__(module.description)}
        beforeTitle={<Icon icon={module.icon} />}
      >
        {module.types.map((type, index) => renderNotifType(type, index))}
      </CollapseContent>
    );
  };

  const renderContent = () => {
    return (
      <Box>
        <CollapseContent
          transparent={true}
          title={__('Notifications')}
          beforeTitle={<Icon icon="bell" />}
        >
          <InlineItems>
            {__('Get notification by email')}
            <Toggle
              defaultChecked={getNotificationByEmail}
              onChange={onEmailConfigChange}
              icons={{
                checked: null,
                unchecked: null,
              }}
            />
          </InlineItems>
        </CollapseContent>

        <ModuleBox>
          {modules.map((module, index) => renderModule(module, index))}
        </ModuleBox>
      </Box>
    );
  };

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__('Notification configs')}
          breadcrumb={breadcrumb}
        />
      }
      actionBar={
        <Wrapper.ActionBar left={<Title>{__('Notification config')}</Title>} />
      }
      mainHead={headerDescription}
      content={renderContent()}
      transparent={true}
      hasBorder={true}
    />
  );
};

export default NotificationSettings;
