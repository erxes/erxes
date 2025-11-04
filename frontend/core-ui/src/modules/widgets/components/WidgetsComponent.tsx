import { IRelationWidgetProps } from 'ui-modules';
import { RenderPluginsComponent } from '~/plugins/components/RenderPluginsComponent';

export const WidgetsComponent = (props: IRelationWidgetProps) => {
  const { module, pluginName } = props;

  console.log(props);

  if (pluginName === 'core') {
    return <div>123123</div>;
  }

  return (
    <RenderPluginsComponent
      pluginName={`${pluginName}_ui`}
      remoteModuleName="relationWidget"
      moduleName={module}
      props={props}
    />
  );
};
