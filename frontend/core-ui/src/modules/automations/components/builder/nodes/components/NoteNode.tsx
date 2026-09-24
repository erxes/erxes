import { NoteMarkdown } from '@/automations/components/builder/nodes/components/NoteMarkdown';
import {
  NOTE_COLORS,
  NOTE_DEFAULT_COLOR,
  NOTE_DRAG_HANDLE_CLASS,
  NOTE_MIN_HEIGHT,
  NOTE_MIN_WIDTH,
} from '@/automations/constants/notes';
import { useAutomationNoteActions } from '@/automations/hooks/useAutomationNotes';
import { IconGripHorizontal, IconTrash } from '@tabler/icons-react';
import {
  Node,
  NodeProps,
  NodeResizer,
  NodeToolbar,
  Position,
} from '@xyflow/react';
import { Button, cn, Separator, Textarea } from 'erxes-ui';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export type NoteNodeData = {
  content: string;
  color?: string;
  readOnly?: boolean;
};

/**
 * A markdown canvas annotation. It has no handles and is not part of the flow
 * graph, so it can never be connected, executed or validated as a step.
 *
 * Rendered by default and edited in place on double click, so the markdown
 * source is never what the reader sees.
 */
export const NoteNode = memo(
  ({ id, data, selected }: NodeProps<Node<NoteNodeData>>) => {
    const { t } = useTranslation('automations');
    const { updateNote, removeNote } = useAutomationNoteActions();
    const [content, setContent] = useState(data.content || '');
    // A note with nothing in it has nothing to render, so it opens straight
    // into writing. Derived from the saved value, never from the draft: keying
    // this off the live draft closed the editor on the first keystroke, and the
    // lost blur meant the text was never committed.
    const [isEditing, setIsEditing] = useState(!data.content?.trim());

    // Undo or a reload replaces the form value under us.
    useEffect(() => setContent(data.content || ''), [data.content]);

    const color = data.color || NOTE_DEFAULT_COLOR;
    const palette = NOTE_COLORS[color] || NOTE_COLORS[NOTE_DEFAULT_COLOR];
    const showEditor = !data.readOnly && isEditing;

    const commit = () => {
      setIsEditing(false);

      if (content !== data.content) {
        updateNote(id, { content });
      }
    };

    return (
      <>
        {/* Selection is already drawn by the resizer's lines and handles, so
            the note body adds no ring of its own. */}
        <NodeResizer
          isVisible={!!selected && !data.readOnly}
          minWidth={NOTE_MIN_WIDTH}
          minHeight={NOTE_MIN_HEIGHT}
          onResizeEnd={(_event, { width, height }) =>
            updateNote(id, { width, height })
          }
        />
        {/* Floats outside the note and keeps a constant screen size, so the
            controls never eat into the writing area or shrink when zoomed out. */}
        <NodeToolbar
          isVisible={!!selected && !data.readOnly}
          position={Position.Top}
          offset={8}
        >
          <div className="nodrag flex items-center gap-1 rounded-md border bg-background p-1 shadow-md">
            {Object.entries(NOTE_COLORS).map(([value, { swatch }]) => (
              <button
                key={value}
                type="button"
                aria-label={value}
                aria-pressed={color === value}
                className={cn(
                  'size-4 rounded-full ring-offset-1 ring-offset-background transition-shadow',
                  swatch,
                  color === value && 'ring-2 ring-foreground/40',
                )}
                onClick={() => updateNote(id, { color: value })}
              />
            ))}

            <Separator orientation="vertical" className="h-5" />

            <Button
              variant="ghost"
              size="icon"
              className="size-6 text-destructive hover:bg-destructive/10 hover:text-destructive"
              aria-label={t('delete')}
              onClick={() => removeNote(id)}
            >
              <IconTrash className="size-3.5" />
            </Button>
          </div>
        </NodeToolbar>

        <div
          className={cn(
            'group/note flex size-full flex-col overflow-hidden rounded-xl border-2',
            palette.body,
          )}
          onDoubleClick={() => !data.readOnly && setIsEditing(true)}
        >
          {!data.readOnly && (
            <div
              className={cn(
                NOTE_DRAG_HANDLE_CLASS,
                'flex h-5 shrink-0 cursor-grab items-center justify-center transition-opacity active:cursor-grabbing',
                selected
                  ? 'opacity-100'
                  : 'opacity-0 group-hover/note:opacity-60',
              )}
            >
              <IconGripHorizontal className="size-3.5 text-muted-foreground" />
            </div>
          )}
          {showEditor ? (
            <Textarea
              autoFocus={isEditing}
              value={content}
              placeholder={t('note-placeholder')}
              className="size-full resize-none border-0 bg-transparent px-3 pb-3 font-mono text-sm leading-relaxed shadow-none focus-visible:shadow-none"
              onChange={(event) => setContent(event.target.value)}
              onBlur={commit}
            />
          ) : (
            <NoteMarkdown content={content} />
          )}
        </div>
      </>
    );
  },
);

NoteNode.displayName = 'NoteNode';
