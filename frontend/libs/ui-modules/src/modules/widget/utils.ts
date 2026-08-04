import { WidgetAccessProp } from './widget-provider/context/widgetContext';

export const getRelationWidgetLabel = (module: {
  name: string;
  label?: string;
}): string =>
  module.label || module.name.charAt(0).toUpperCase() + module.name.slice(1);

export const resolveAccess = (
  access: WidgetAccessProp,
  moduleName: string,
): 'read' | 'write' => {
  if (typeof access === 'string') return access;

  return access[moduleName] ?? 'write';
};
