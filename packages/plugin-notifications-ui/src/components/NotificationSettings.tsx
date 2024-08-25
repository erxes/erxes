import {
  NotificationConfig,
  NotificationModule
} from '@erxes/ui-notifications/src/types';
import { FlexRow, Title } from '@erxes/ui-settings/src/styles';
import Button from '@erxes/ui/src/components/Button';
import CollapseContent from '@erxes/ui/src/components/CollapseContent';
import HeaderDescription from '@erxes/ui/src/components/HeaderDescription';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Toggle from '@erxes/ui/src/components/Toggle';
import { RichTextEditor } from '@erxes/ui/src/components/richTextEditor/TEditor';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { LinkButton } from '@erxes/ui/src/styles/main';
import { __, router } from '@erxes/ui/src/utils';
import React, { useEffect, useState } from 'react';
import SideBar from './Sidebar';
import {
  Box,
  InlineItems,
  ModuleContent,
  ModuleContentMessage,
  ModuleContentWrapper
} from './styles';
import { ConfigManager } from './utils';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import WithPermission from '@erxes/ui/src/components/WithPermission';
import { IUser } from '@erxes/ui/src/auth/types';
import { can } from '@erxes/ui/src/utils/core';

type Props = {
  modules: NotificationModule[];
  config?: NotificationConfig;
  // save notification configurations
  saveNotificationConfigurations: (doc: any) => void;
  // save get notification by email action
  saveAsDefaultNotificationsConfigs: () => void;
  queryParams: any;
  currentUser: IUser;
};

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

const ActiveButton = ({
  isChecked,
  onClick
}: {
  isChecked?: boolean;
  onClick: () => void;
}) => {
  return (
    <Button btnStyle="white" onClick={onClick}>
      <Icon size={16} icon={isChecked ? 'bell-slash' : 'bell'} />
      {isChecked ? 'Deactive' : 'Active'}
    </Button>
  );
};

const NotificationSettings = (props: Props) => {
  const {
    modules,
    queryParams,
    currentUser,
    config,
    saveNotificationConfigurations,
    saveAsDefaultNotificationsConfigs
  } = props;

  const configManager = new ConfigManager(queryParams, modules, config);

  const selectedModule = configManager.getSelectedModule();

  const [isActive, setActive] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (selectedModule) {
      const { isDisabled } =
        (config?.pluginsConfigs || []).find(
          ({ type }) => type === selectedModule.name
        ) || {};

      setActive(!isDisabled);
    }
  }, [config]);

  // const onSave = doc => {
  //   saveNotificationConfigurations(doc);
  // };

  // const onTypeChange = e => {
  //   // save config
  //   saveNotificationConfigurations({
  //     notifType: e.target.value,
  //     isAllowed: e.target.checked
  //   });
  // };

  // const onEmailConfigChange = e => {
  //   // save get notification by email config
  //   configGetNotificationByEmail({ isAllowed: e.target.checked });
  // };

  const onChangeNotifTypes = ({
    type,
    field,
    value,
    selectedModule
  }: {
    type: string;
    field: string;
    value: string | boolean;
    selectedModule: NotificationModule;
  }) => {
    const updatedConfigs = configManager.updateNotifType(selectedModule, {
      type,
      name: field,
      value
    });
    saveNotificationConfigurations(updatedConfigs);
  };

  // const isChecked = notifType => {
  //   const oldEntry = config.find(
  //     config => config.notifType === notifType.name
  //   );

  //   // if no previous configuration found then default is checked
  //   if (!oldEntry) {
  //     return true;
  //   }

  //   return oldEntry.isAllowed;
  // };

  const renderForm = ({
    type,
    commonOnChangeObject,
    isAllowedEmail,
    isAllowedDesktop,
    customHtml
  }) => {
    const trigger = <Button icon="ellipsis-v" btnStyle="white" />;

    const content = ({}) => (
      <>
        <FlexRow>
          <InlineItems>
            <p>
              <Icon icon="envelope-alt" size={26} />
              {__('Email')}
            </p>
            <Toggle
              checked={isAllowedEmail}
              onChange={() =>
                onChangeNotifTypes({
                  ...commonOnChangeObject,
                  field: 'isAllowedEmail',
                  value: !isAllowedEmail
                })
              }
            />
          </InlineItems>
          <InlineItems>
            <p>
              <Icon icon="desktop" size={26} />
              {__('Desktop')}
            </p>
            <Toggle
              checked={isAllowedDesktop}
              onChange={() =>
                onChangeNotifTypes({
                  ...commonOnChangeObject,
                  field: 'isAllowedDesktop',
                  value: !isAllowedDesktop
                })
              }
            />
          </InlineItems>
        </FlexRow>
        <RichTextEditor
          content={customHtml}
          onChange={content =>
            onChangeNotifTypes({
              ...commonOnChangeObject,
              field: 'customHtml',
              value: !content
            })
          }
          contentType={selectedModule?.name}
        />
      </>
    );

    return (
      <ModalTrigger
        size="xl"
        trigger={trigger}
        content={content}
        title={`Edit ${type.text}`}
      />
    );
  };

  const renderNotifType = (type, typeIndex, selectedModule) => {
    const { isDisabled, customHtml, isAllowedEmail, isAllowedDesktop } =
      configManager.getNotifyTypeConfig(type.name, selectedModule) || {};

    const commonOnChangeObject = {
      selectedModule,
      type: type.name
    };

    return (
      <InlineItems key={typeIndex}>
        <p>
          {type.text}
          <span>{'Description section'}</span>
        </p>
        <div>
          <Toggle
            value={type.name}
            checked={!isDisabled}
            onChange={() =>
              onChangeNotifTypes({
                ...commonOnChangeObject,
                field: 'isDisabled',
                value: !isDisabled
              })
            }
            icons={{
              checked: null,
              unchecked: null
            }}
          />
          {renderForm({
            type,
            commonOnChangeObject,
            customHtml,
            isAllowedEmail,
            isAllowedDesktop
          })}
        </div>
      </InlineItems>
    );
  };

  const renderModuleContent = () => {
    return (
      <ModuleContentWrapper>
        <ModuleContent isToggled={isActive}>
          {(selectedModule?.types || []).map((type, index) =>
            renderNotifType(type, index, selectedModule)
          )}
        </ModuleContent>
        {!isActive && (
          <ModuleContentMessage>
            <Icon icon="bell" size={56} />{' '}
            {__(`${selectedModule?.description} notifications are disabled.`)}
          </ModuleContentMessage>
        )}
      </ModuleContentWrapper>
    );
  };

  const renderGeneralContent = () => {
    return (
      <>
        <InlineItems>
          <p>{'Get Notifications'}</p>
          <Toggle
            checked={!config?.isDisabled}
            onChange={() =>
              saveNotificationConfigurations({
                ...config,
                isDisabled: !config?.isDisabled
              })
            }
          />
        </InlineItems>
        <ModuleContent isToggled={isActive}>
          <InlineItems>
            <p>{'Get notification by email'}</p>
            <Toggle
              checked={config?.isAllowEmail}
              onChange={() =>
                saveNotificationConfigurations({
                  ...config,
                  isAllowEmail: !config?.isAllowEmail
                })
              }
            />
          </InlineItems>
          <InlineItems>
            <p>{'Get notification by desktop'}</p>
            <Toggle
              checked={config?.isAllowedDesktop}
              onChange={() =>
                saveNotificationConfigurations({
                  ...config,
                  isAllowedDesktop: !config?.isAllowedDesktop
                })
              }
            />
          </InlineItems>
        </ModuleContent>
      </>
    );
  };

  const toggleDefault = () => {
    let isDefault: boolean | undefined = true;
    if (queryParams?.isDefault) {
      isDefault = undefined;
    }

    router.setParams(navigate, location, { isDefault });
  };

  const rightActionBar = (
    <>
      {can('setNotification', currentUser) && (
        <Button btnStyle="white" icon="cog" onClick={toggleDefault}>
          {__(
            `Edit ${queryParams?.isDefault ? 'my' : 'default'} configurations`
          )}
        </Button>
      )}
      {!queryParams?.isDefault && (
        <Button
          btnStyle="white"
          icon="refresh-1"
          onClick={saveAsDefaultNotificationsConfigs}
        >
          {__(`Set as default`)}
        </Button>
      )}
      {selectedModule && (
        <ActiveButton
          isChecked={isActive}
          onClick={() =>
            saveNotificationConfigurations(
              configManager.disablePlugin(selectedModule, !!isActive)
            )
          }
        />
      )}
    </>
  );

  const leftActionBar = (
    <Title>
      {__(
        `${selectedModule ? selectedModule?.description : 'General'} Notification config ${queryParams?.isDefault ? '( DEFAULT )' : ''}`
      )}
    </Title>
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__(
            `${selectedModule ? selectedModule?.description : 'General'} Notification config`
          )}
          breadcrumb={breadcrumb}
        />
      }
      actionBar={
        <Wrapper.ActionBar left={leftActionBar} right={rightActionBar} />
      }
      mainHead={headerDescription}
      content={
        <Box>
          {selectedModule ? renderModuleContent() : renderGeneralContent()}
        </Box>
      }
      leftSidebar={
        <SideBar
          location={location}
          navigate={navigate}
          queryParams={queryParams}
          modules={modules}
        />
      }
      transparent={true}
      hasBorder={true}
    />
  );
};

export default NotificationSettings;
