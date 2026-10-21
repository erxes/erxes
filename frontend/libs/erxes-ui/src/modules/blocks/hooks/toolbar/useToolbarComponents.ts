import { useComponentsContext } from '@blocknote/react';
import { useMemo } from 'react';
import { ToolbarSelect } from 'erxes-ui/modules/blocks/components/toolbar/menus/ToolbarSelect';
import { ToolbarMenuItem } from 'erxes-ui/modules/blocks/components/toolbar/menus/ToolbarMenuItem';
import { ToolbarMenuDropdown } from 'erxes-ui/modules/blocks/components/toolbar/menus/ToolbarMenuDropdown';
import { ToolbarFormattingButton } from 'erxes-ui/modules/blocks/components/toolbar/buttons/ToolbarFormattingButton';
import { ToolbarRoot } from 'erxes-ui/modules/blocks/components/toolbar/ToolbarRoot';

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
