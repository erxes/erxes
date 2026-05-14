import { WidgetAccessProp } from './widget-provider/context/widgetContext';

export const resolveAccess = (
  access: WidgetAccessProp,
  moduleName: string,
): 'read' | 'write' => {
  if (typeof access === 'string') return access;

  return access[moduleName] ?? 'write';
};
