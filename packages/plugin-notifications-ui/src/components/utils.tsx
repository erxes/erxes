import {
  NotificationConfig,
  NotificationModule,
  NotifType,
  PluginConfig
} from '@erxes/ui-notifications/src/types';

const modifyPluginsConfigs = (pluginsConfigs: PluginConfig[]) => {
  return pluginsConfigs.map(({ type, isDisabled, notifTypes = [] }) => ({
    type,
    isDisabled,
    notifTypes: notifTypes.map(
      ({
        notifType,
        isDisabled,
        isAllowedEmail,
        isAllowedDesktop,
        customHtml
      }) => ({
        notifType,
        isDisabled,
        isAllowedEmail,
        isAllowedDesktop,
        customHtml
      })
    )
  }));
};

export class ConfigManager {
  private config?: NotificationConfig;
  private queryParams: any;
  private modules: NotificationModule[];

  constructor(
    queryParams: any,
    modules: NotificationModule[],
    config?: NotificationConfig
  ) {
    this.config = config;
    this.queryParams = queryParams;
    this.modules = modules;
  }

  getSelectedModule(): NotificationModule | undefined {
    return (this.modules || []).find(
      ({ name }) => this.queryParams?.type === name
    );
  }

  getNotifyTypeConfig(
    type: string,
    selectedModule: NotificationModule
  ): NotifType | undefined {
    const { notifTypes = [] } =
      (this.config?.pluginsConfigs || []).find(
        ({ type }) => type === selectedModule?.name
      ) || {};

    if (!notifTypes?.length) {
      return;
    }

    const result = notifTypes.find(({ notifType }) => notifType === type);

    return result;
  }

  disablePlugin(selectedModule: NotificationModule, value: boolean) {
    const updatePluginsConfigs = (this.config?.pluginsConfigs || []).map(
      pluginsConfig =>
        pluginsConfig.type === selectedModule.name
          ? { ...pluginsConfig, isDisabled: value }
          : pluginsConfig
    );

    return {
      ...this.config,
      pluginsConfigs: modifyPluginsConfigs(updatePluginsConfigs)
    };
  }

  updateNotifType(
    selectedModule: NotificationModule,
    {
      type,
      name,
      value
    }: { type: string; name: string; value: string | boolean }
  ) {
    let pluginsConfigs: any = this.config?.pluginsConfigs || [];

    let moduleConfig = pluginsConfigs.find(
      ({ type }) => selectedModule.name === type
    );

    if (!moduleConfig) {
      // Module not found, create a new entry
      pluginsConfigs.push({
        type: selectedModule.name,
        notifTypes: [{ notifType: type, [name]: value }]
      });
    } else {
      // Module found, update the existing entry
      const notifType = (moduleConfig?.notifTypes || []).find(
        ({ notifType }) => notifType === type
      );

      if (!notifType) {
        // Notification type not found, add a new one
        const notifTypes = [
          ...(moduleConfig?.notifTypes || []),
          { notifType: type, [name]: value }
        ];
        moduleConfig = { ...moduleConfig, notifTypes };
      } else {
        // Notification type found, update it
        moduleConfig.notifTypes = (moduleConfig?.notifTypes || []).map(nt =>
          nt.notifType === type ? { ...nt, [name]: value } : nt
        );
      }

      // Update the moduleConfig in the pluginsConfigs array
      pluginsConfigs = this.config?.pluginsConfigs.map(config =>
        config.type === selectedModule.name ? moduleConfig : config
      );
    }

    return {
      ...this.config,
      pluginsConfigs: modifyPluginsConfigs(pluginsConfigs)
    };
  }
}
