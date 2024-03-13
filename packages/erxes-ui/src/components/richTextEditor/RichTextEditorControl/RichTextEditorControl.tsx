import React, { useRef } from 'react';

import { useRichTextEditorContext } from '../RichTextEditor.context';
import { IRichTextEditorLabels } from '../labels';
import { EditorControl } from './styles';

export type RichTextEditorControlStylesNames = 'control';

export interface IRichTextEditorControlProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Determines whether the control should have active state, false by default */
  active?: boolean;

  /** Determines whether the control can be interacted with, set `false` to make the control to act as a label */
  interactive?: boolean;

  /** Determines whether the control is source mode toggler */
  isSourceControl?: boolean;
}

export const RichTextEditorControl = (props: IRichTextEditorControlProps) => {
  const { isSourceEnabled } = useRichTextEditorContext();
  const ref = useRef<HTMLButtonElement>(null);

  const {
    interactive,
    active,
    onMouseDown,
    isSourceControl,
    disabled,
    ...others
  } = props;

  return (
    <EditorControl
      {...others}
      type="button"
      disabled={isSourceControl ? false : disabled || isSourceEnabled}
      data-rich-text-editor-control={true}
      tabIndex={interactive ? 0 : -1}
      data-interactive={interactive || undefined}
      data-active={
        isSourceEnabled && isSourceControl ? true : active || undefined
      }
      aria-pressed={(active && interactive) || undefined}
      aria-hidden={!interactive || undefined}
      innerRef={ref}
      onMouseDown={(event) => {
        event.preventDefault();
        onMouseDown?.(event);
      }}
    />
  );
};

export interface IRichTextEditorControlBaseProps
  extends IRichTextEditorControlProps {
  icon?: React.FC<{ style: React.CSSProperties }>;
}

export const RichTextEditorControlBase = <
  HTMLButtonElement,
  RichTextEditorControlBaseProps,
>({
  className,
  icon: Icon,
  ...others
}: any) => {
  return (
    <RichTextEditorControl {...others}>
      {Icon && <Icon style={{ width: '1rem', height: '1rem' }} />}
    </RichTextEditorControl>
  );
};

export interface ICreateControlProps {
  label: keyof IRichTextEditorLabels;
  icon: React.FC<{ style: React.CSSProperties }>;
  isActive?: { name: string | null; attributes?: Record<string, any> | string };
  operation: { name: string; attributes?: Record<string, any> | string };
}

export function createControl({
  label,
  isActive,
  operation,
  icon,
}: ICreateControlProps) {
  return <HTMLButtonElement, RichTextEditorControlBaseProps>(
    props: RichTextEditorControlBaseProps,
  ) => {
    const { editor, labels } = useRichTextEditorContext();
    const _label = labels[label] as string;
    return (
      <RichTextEditorControlBase
        aria-label={_label}
        title={_label}
        active={
          isActive?.name
            ? editor?.isActive(isActive.name, isActive.attributes)
            : isActive?.attributes
              ? editor?.isActive(isActive.attributes)
              : false
        }
        onClick={() =>
          (editor as any)
            ?.chain()
            .focus()
            [operation.name](operation.attributes)
            .run()
        }
        icon={icon}
      />
    );
  };
}
