import { RenderPluginsComponent } from '~/plugins/components/RenderPluginsComponent';
import { IRecordPanelProps } from 'ui-modules';

// One view of a plugin's record, drawn by the plugin's `./recordPanel` remote.
export const PluginRecordPanel = ({
  pluginName,
  quiet,
  ...props
}: IRecordPanelProps & { pluginName: string; quiet?: boolean }) => (
  <RenderPluginsComponent
    pluginName={`${pluginName}_ui`}
    remoteModuleName="recordPanel"
    props={props}
    quiet={quiet}
  />
);
