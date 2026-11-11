import type { ToolbarFormattingButtonProps } from 'erxes-ui/modules/blocks/types/toolbar/ToolbarFormattingButtonProps';
import { useCodeActive } from 'erxes-ui/modules/blocks/hooks/toolbar/useCodeActive';
import { CODE_INCOMPATIBLE_CONTROLS } from 'erxes-ui/modules/blocks/constant/toolbar/codeIncompatibleControls';
import { components } from '@blocknote/shadcn';
import { forwardRef } from 'react';

export const ToolbarFormattingButton = forwardRef<
  HTMLButtonElement,
  ToolbarFormattingButtonProps
>((props, ref) => {
  const codeActive = useCodeActive();

  const codeIncompatible = CODE_INCOMPATIBLE_CONTROLS.includes(
    props['data-test'] ?? '',
  );
  const disabledByCode = codeActive && codeIncompatible;

  const buttonProps = {
    ...props,
    ref,
    disabled: props.disabled || props.isDisabled || disabledByCode,
    isDisabled: props.isDisabled || disabledByCode,
    isSelected:
      disabledByCode && props.isSelected !== undefined
        ? false
        : props.isSelected,
  };

  return <components.FormattingToolbar.Button {...buttonProps} />;
});

ToolbarFormattingButton.displayName = 'ToolbarFormattingButton';
