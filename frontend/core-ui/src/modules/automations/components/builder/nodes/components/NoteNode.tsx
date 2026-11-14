import { NoteMarkdown } from '@/automations/components/builder/nodes/components/NoteMarkdown';
import {
  NOTE_DRAG_HANDLE_CLASS,
  NOTE_MIN_HEIGHT,
  NOTE_MIN_WIDTH,
} from '@/automations/constants/notes';
import { useNoteNode } from '@/automations/components/builder/nodes/hooks/useNoteNode';
import { IconGripHorizontal, IconTrash } from '@tabler/icons-react';
import {
  Node,
  NodeProps,
  NodeResizer,
  NodeToolbar,
  Position,
} from '@xyflow/react';
import { Button, cn, Separator, Textarea } from 'erxes-ui';
import { memo } from 'react';
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
    const {
      content,
      isEditing,
      showEditor,
      showControls,
      palette,
      swatches,
      commit,
      startEditing,
      onContentChange,
      onResizeEnd,
      remove,
    } = useNoteNode(id, data, selected);

    return (
      <>
        {/* Selection is already drawn by the resizer's lines and handles, so
            the note body adds no ring of its own. */}
        <NodeResizer
          isVisible={showControls}
          minWidth={NOTE_MIN_WIDTH}
          minHeight={NOTE_MIN_HEIGHT}
          onResizeEnd={onResizeEnd}
        />
        {/* Floats outside the note and keeps a constant screen size, so the
            controls never eat into the writing area or shrink when zoomed out. */}
        <NodeToolbar
          isVisible={showControls}
          position={Position.Top}
          offset={8}
        >
          <div className="nodrag flex items-center gap-1 rounded-md border bg-background p-1 shadow-md">
            {swatches.map((swatch) => (
              <button
                key={swatch.value}
                type="button"
                aria-label={swatch.value}
                aria-pressed={swatch.active}
                className={cn(
                  'size-4 rounded-full ring-offset-1 ring-offset-background transition-shadow',
                  swatch.swatch,
                  swatch.active && 'ring-2 ring-foreground/40',
                )}
                onClick={swatch.select}
              />
            ))}

            <Separator orientation="vertical" className="h-5" />

            <Button
              variant="ghost"
              size="icon"
              className="size-6 text-destructive hover:bg-destructive/10 hover:text-destructive"
              aria-label={t('delete')}
              onClick={remove}
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
          onDoubleClick={startEditing}
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
              onChange={onContentChange}
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
