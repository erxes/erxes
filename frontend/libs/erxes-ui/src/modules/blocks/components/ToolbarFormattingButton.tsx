import type { ToolbarFormattingButtonProps } from '../types/ToolbarFormattingButtonProps';
import { useCodeActive } from '../hooks/useCodeActive';
import { CODE_INCOMPATIBLE_CONTROLS } from '../constant/codeIncompatibleControls';
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
