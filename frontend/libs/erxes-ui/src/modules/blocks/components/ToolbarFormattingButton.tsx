import {
  useBlockNoteEditor,
  useEditorContentOrSelectionChange,
} from '@blocknote/react';
import type { ComponentProps } from '@blocknote/react';
import { components } from '@blocknote/shadcn';
import { useState } from 'react';

type ToolbarFormattingButtonProps =
  ComponentProps['FormattingToolbar']['Button'] & {
    'data-test'?: string;
    disabled?: boolean;
  };

export const ToolbarFormattingButton = (
  props: ToolbarFormattingButtonProps,
) => {
  const editor = useBlockNoteEditor();
  const [codeActive, setCodeActive] = useState(
    Boolean(editor.getActiveStyles().code),
  );

  useEditorContentOrSelectionChange(() => {
    setCodeActive(Boolean(editor.getActiveStyles().code));
  }, editor);

  const codeIncompatible = [
    'bold',
    'italic',
    'underline',
    'strike',
    'fontFamily',
    'colors',
    'createLink',
  ].includes(props['data-test'] ?? '');
  const disabledByCode = codeActive && codeIncompatible;

  const buttonProps = {
    ...props,
    disabled: props.disabled || props.isDisabled || disabledByCode,
    isDisabled: props.isDisabled || disabledByCode,
    isSelected:
      disabledByCode && props.isSelected !== undefined
        ? false
        : props.isSelected,
  };

  return <components.FormattingToolbar.Button {...buttonProps} />;
};
