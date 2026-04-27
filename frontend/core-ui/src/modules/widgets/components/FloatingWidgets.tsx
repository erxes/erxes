import { RenderPluginsComponent } from '~/plugins/components/RenderPluginsComponent';
import { useFloatingWidgets } from '../hooks/useFloatingWidgets';

export const FloatingWidgets = () => {
  const floatingWidgets = useFloatingWidgets();

  return floatingWidgets.map((plugin) => (
    <RenderPluginsComponent
      key={plugin.name}
      pluginName={`${plugin.name}_ui`}
      remoteModuleName="floatingWidget"
      props={{ module: plugin.modules?.[0] }}
    />
  ));
};
