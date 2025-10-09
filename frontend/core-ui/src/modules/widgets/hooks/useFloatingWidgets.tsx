import { useAtom } from 'jotai';
import { pluginsConfigState } from 'ui-modules';

export const useFloatingWidgets = () => {
  const [pluginsMetaData] = useAtom(pluginsConfigState);

  if (!pluginsMetaData) {
    return [];
  }

  const plugins = Object.values(pluginsMetaData);

  return plugins.filter((module) => module.hasFloatingWidget);
};
