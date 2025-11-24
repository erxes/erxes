import { IRelationWidgetProps } from 'ui-modules';
import { RenderPluginsComponent } from '~/plugins/components/RenderPluginsComponent';
import { CoreWidgets } from '../core-widgets/CoreWidgets';

export const WidgetsComponent = (props: IRelationWidgetProps) => {
  const { module, pluginName } = props;

  if (pluginName === 'core') {
    return <CoreWidgets {...props} />;
  }

  return (
    <RenderPluginsComponent
      pluginName={`${pluginName}_ui`}
      remoteModuleName="relationWidget"
      props={props}
    />
  );
};
