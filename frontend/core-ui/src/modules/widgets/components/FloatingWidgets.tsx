import { RenderPluginsComponent } from '~/plugins/components/RenderPluginsComponent';
import { useFloatingWidgetsModules } from '../hooks/useFloatingWidgetsModules';

export const FloatingWidgets = () => {
  const modules = useFloatingWidgetsModules();

  return modules.map((module) => (
    <RenderPluginsComponent
      key={module.name}
      pluginName={`${module.pluginName}_ui`}
      remoteModuleName="floatingWidget"
      moduleName={module.name}
      props={{ module }}
    />
  ));
};
