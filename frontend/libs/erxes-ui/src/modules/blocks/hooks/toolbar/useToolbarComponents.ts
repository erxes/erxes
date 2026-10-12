import { useComponentsContext } from '@blocknote/react';
import { useMemo } from 'react';
import { ToolbarSelect } from '../../components/toolbar/menus/ToolbarSelect';
import { ToolbarMenuItem } from '../../components/toolbar/menus/ToolbarMenuItem';
import { ToolbarMenuDropdown } from '../../components/toolbar/menus/ToolbarMenuDropdown';
import { ToolbarFormattingButton } from '../../components/toolbar/buttons/ToolbarFormattingButton';
import { ToolbarRoot } from '../../components/toolbar/ToolbarRoot';

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
