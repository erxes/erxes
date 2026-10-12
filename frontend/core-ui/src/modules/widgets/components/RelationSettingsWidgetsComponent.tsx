import { IRelationSettingsWidgetProps } from 'ui-modules';
import { RenderPluginsComponent } from '~/plugins/components/RenderPluginsComponent';

export const RelationSettingsWidgetsComponent = (
  props: IRelationSettingsWidgetProps,
) => (
  <RenderPluginsComponent
    pluginName={`${props.pluginName}_ui`}
    remoteModuleName="relationSettingsWidget"
    props={props}
  />
);
