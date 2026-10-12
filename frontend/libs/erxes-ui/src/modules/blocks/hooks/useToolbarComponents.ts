import { useComponentsContext } from '@blocknote/react';
import { useMemo } from 'react';
import { ToolbarSelect } from '../components/ToolbarSelect';
import { ToolbarMenuItem } from '../components/ToolbarMenuItem';
import { ToolbarMenuDropdown } from '../components/ToolbarMenuDropdown';
import { ToolbarFormattingButton } from '../components/ToolbarFormattingButton';
import { ToolbarRoot } from '../components/ToolbarRoot';

export const useToolbarComponents = (): ReturnType<
  typeof useComponentsContext
> => {
  const Components = useComponentsContext();
  return useMemo(
    () =>
      Components && {
        ...Components,
        FormattingToolbar: {
          ...Components.FormattingToolbar,
          Root: ToolbarRoot,
          Button: ToolbarFormattingButton,
          Select: ToolbarSelect,
        },
        Generic: {
          ...Components.Generic,
          Menu: {
            ...Components.Generic.Menu,
            Item: ToolbarMenuItem,
            Dropdown: ToolbarMenuDropdown,
          },
        },
      },
    [Components],
  );
};
