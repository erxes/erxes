import React, { useRef } from 'react';

import { useRichTextEditorContext } from '../RichTextEditor.context';
import { RichTextEditorLabels } from '../labels';
import { EditorControl } from './styles';

export type RichTextEditorControlStylesNames = 'control';

export interface RichTextEditorControlProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Determines whether the control should have active state, false by default */
  active?: boolean;

  /** Determines whether the control can be interacted with, set `false` to make the control to act as a label */
  interactive?: boolean;
}

export const RichTextEditorControl = (props: RichTextEditorControlProps) => {
  const ref = useRef<HTMLButtonElement>(null);
  const { interactive, active, onMouseDown, ...others } = props;

  return (
    <EditorControl
      {...others}
      data-rich-text-editor-control
      tabIndex={interactive ? 0 : -1}
      data-interactive={interactive || undefined}
      data-active={active || undefined}
      aria-pressed={(active && interactive) || undefined}
      aria-hidden={!interactive || undefined}
      innerRef={ref}
      onMouseDown={event => {
        event.preventDefault();
        onMouseDown?.(event);
      }}
    />
  );
};

export interface RichTextEditorControlBaseProps
  extends RichTextEditorControlProps {
  icon?: React.FC<{ style: React.CSSProperties }>;
}

export const RichTextEditorControlBase = <
  HTMLButtonElement,
  RichTextEditorControlBaseProps
>({
  className,
  icon: Icon,
  ...others
}: any) => {
  return (
    <RichTextEditorControl {...others}>
      <Icon style={{ width: '1rem', height: '1rem' }} />
    </RichTextEditorControl>
  );
};

export interface CreateControlProps {
  label: keyof RichTextEditorLabels;
  icon: React.FC<{ style: React.CSSProperties }>;
  isActive?: { name: string | null; attributes?: Record<string, any> | string };
  operation: { name: string; attributes?: Record<string, any> | string };
}

export function createControl({
  label,
  isActive,
  operation,
  icon
}: CreateControlProps) {
  return <HTMLButtonElement, RichTextEditorControlBaseProps>(
    props: RichTextEditorControlBaseProps
  ) => {
    const { editor, labels } = useRichTextEditorContext();
    const _label = labels[label] as string;
    // const ref = useRef<HTMLButtonElement>(null);
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
