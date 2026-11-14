import {
  TDashboardWidgetConfigFormProps,
  TDashboardWidgetDefinition,
  TDashboardWidgetProps,
} from '@/home/dashboard/types/dashboardTypes';
import { IconPuzzle } from '@tabler/icons-react';
import { ComponentType } from 'react';
import { IUIConfig } from 'erxes-ui';
import { IDashboardWidgetProps } from 'ui-modules';
import { RenderPluginsComponent } from '~/plugins/components/RenderPluginsComponent';

type TPluginDashboardWidget = NonNullable<
  NonNullable<IUIConfig['widgets']>['dashboardWidgets']
>[number];

const DEFAULT_MIN_SIZE = { w: 3, h: 3 };

// One pair per widget type, so a re-read of plugin configs doesn't remount
// every plugin tile on the dashboard.
const remoteComponents = new Map<
  string,
  {
    Component: ComponentType<TDashboardWidgetProps>;
    ConfigForm: ComponentType<TDashboardWidgetConfigFormProps>;
  }
>();

const getRemoteComponents = (pluginName: string, module: string) => {
  const key = `${pluginName}:${module}`;
  const cached = remoteComponents.get(key);

  if (cached) {
    return cached;
  }

  const renderRemote = (props: IDashboardWidgetProps) => (
    <RenderPluginsComponent
      pluginName={`${pluginName}_ui`}
      remoteModuleName="dashboardWidget"
      props={props}
    />
  );

  const Component = ({ config }: TDashboardWidgetProps) =>
    renderRemote({ mode: 'view', module, config });
  Component.displayName = `PluginDashboardWidget(${key})`;

  const ConfigForm = ({
    config,
    onSubmit,
    onCancel,
  }: TDashboardWidgetConfigFormProps) =>
    renderRemote({
      mode: 'config',
      module,
      config,
      onConfigSubmit: onSubmit,
      onConfigCancel: onCancel,
    });
  ConfigForm.displayName = `PluginDashboardWidgetConfig(${key})`;

  const pair = { Component, ConfigForm };
  remoteComponents.set(key, pair);

  return pair;
};

/** A plugin's `widgets.dashboardWidgets` entry as a dashboard widget. */
export const toPluginDashboardWidget = (
  pluginName: string,
  widget: TPluginDashboardWidget,
): TDashboardWidgetDefinition => {
  const { Component, ConfigForm } = getRemoteComponents(
    pluginName,
    widget.name,
  );

  return {
    type: `${pluginName}:${widget.name}`,
    ns: pluginName,
    labelKey: widget.label,
    descriptionKey: widget.description,
    icon: widget.icon || IconPuzzle,
    pluginName,
    defaultSize: widget.defaultSize,
    minSize: widget.minSize || DEFAULT_MIN_SIZE,
    maxSize: widget.maxSize,
    singleton: widget.singleton,
    preview: widget.preview,
    group: pluginName,
    Component,
    ConfigForm: widget.configurable ? ConfigForm : undefined,
  };
};
