import {
  Button,
  Popover,
  Tooltip,
  type IComposerActionProps,
  type IExtensionUIConfig,
} from 'erxes-ui';
import { useState } from 'react';
import { usePlacementContext } from './placementContext';
import { useExtensions } from './useExtensions';

type ComposerActionConfig = NonNullable<
  IExtensionUIConfig['composerActions']
>[number];

const ComposerAction = ({
  pluginName,
  action: { label, icon: ActionIcon, component: Component },
  disabled,
  insertText,
  ...props
}: IComposerActionProps & {
  pluginName: string;
  action: ComposerActionConfig;
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const { Boundary } = usePlacementContext();

  const actionProps: IComposerActionProps = {
    ...props,
    insertText: (text) => {
      insertText(text);
      setOpen(false);
    },
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <Popover.Trigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={label}
              className="size-8 rounded-lg text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
              disabled={disabled}
            >
              <ActionIcon className="size-4" />
            </Button>
          </Popover.Trigger>
        </Tooltip.Trigger>
        <Tooltip.Content>{label}</Tooltip.Content>
      </Tooltip>
      <Popover.Content align="start" className="w-auto p-2">
        <Boundary pluginName={pluginName}>
          <Component {...actionProps} />
        </Boundary>
      </Popover.Content>
    </Popover>
  );
};

/**
 * Every extension's `composerActions`, as buttons in a message composer's
 * toolbar. An action's component loads when its button is opened.
 */
export const ComposerActions = (
  props: IComposerActionProps & { disabled?: boolean },
) => {
  const extensions = useExtensions();

  return (
    <>
      {extensions.flatMap(({ pluginName, config }) =>
        (config.composerActions ?? []).map((action) => (
          <ComposerAction
            key={`${pluginName}.${action.id}`}
            pluginName={pluginName}
            action={action}
            {...props}
          />
        )),
      )}
    </>
  );
};
