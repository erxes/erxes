import { RelationWidgetProps } from 'ui-modules';
import { RenderPluginsComponent } from '~/plugins/components/RenderPluginsComponent';

export const WidgetsComponent = (props: RelationWidgetProps) => {
  const { pluginName } = props;

  return (
    <RenderPluginsComponent
      pluginName={`${pluginName}_ui`}
      remoteModuleName="relationWidget"
      props={props}
    />
  );
};
