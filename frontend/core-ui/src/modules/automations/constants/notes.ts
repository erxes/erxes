export const NOTE_NODE_TYPE = 'note';

/**
 * React Flow attaches its drag listener to the node's own element and walks up
 * from the event target to it, so a drag handle must live inside the node.
 * NodeToolbar portals into `.react-flow__renderer`, outside the node, which is
 * why the handle is a strip in the note body rather than a toolbar button.
 */
export const NOTE_DRAG_HANDLE_CLASS = 'note-drag-handle';

export const NOTE_MIN_WIDTH = 160;
export const NOTE_MIN_HEIGHT = 100;
export const NOTE_DEFAULT_WIDTH = 240;
export const NOTE_DEFAULT_HEIGHT = 160;
export const NOTE_DEFAULT_COLOR = 'yellow';

// `body` tints the whole note, so it stays light enough for the flow nodes
// sitting on top of it to keep their own contrast. `swatch` is the solid
// version used for the colour picker dots.
export const NOTE_COLORS: Record<string, { body: string; swatch: string }> = {
  yellow: { body: 'bg-warning/8 border-warning/25', swatch: 'bg-warning' },
  blue: { body: 'bg-primary/8 border-primary/20', swatch: 'bg-primary' },
  green: { body: 'bg-success/8 border-success/25', swatch: 'bg-success' },
  gray: { body: 'bg-muted/50 border-border', swatch: 'bg-muted-foreground' },
};
