import {
  ComponentProps,
  ComponentsContext,
  FloatingComposerController,
  FloatingThreadController,
  Thread,
  useComponentsContext,
  useBlockNoteEditor,
  useDictionary,
  useFocusWithin,
} from '@blocknote/react';
import {
  ComponentProps as ReactComponentProps,
  forwardRef,
  ReactNode,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Avatar, Button, Card, Skeleton, Textarea } from 'erxes-ui/components';
import { cn } from 'erxes-ui/lib';
import { useToast } from 'erxes-ui/hooks';

const readText = (value: unknown): string => {
  if (Array.isArray(value)) return value.map(readText).join('');
  if (!value || typeof value !== 'object') return '';
  if ('text' in value && typeof value.text === 'string') return value.text;
  if ('content' in value) return readText(value.content);
  return '';
};

const CommentInput = ({
  editor,
  autoFocus,
  onFocus,
  onBlur,
  className,
}: ComponentProps['Comments']['Editor']) => {
  const editorMountRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    editor.mount(editorMountRef.current);
    return () => editor.mount(undefined);
  }, [editor]);
  const [value, setValue] = useState(() =>
    editor.document.map(readText).join('\n'),
  );
  useEffect(
    () =>
      editor.onChange(() => {
        setValue(editor.document.map(readText).join('\n'));
      }),
    [editor],
  );
  return (
    <>
      <div ref={editorMountRef} hidden aria-hidden="true" />
      <Textarea
        className={cn(
          'erxes-block-controls min-h-24 resize-y border border-input text-sm',
          className,
        )}
        value={value}
        autoFocus={autoFocus}
        aria-label={editor.dictionary.placeholders.emptyDocument}
        placeholder={editor.dictionary.placeholders.emptyDocument}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={(event) => {
          const text = event.target.value;
          setValue(text);
          editor.replaceBlocks(
            editor.document,
            text
              .split('\n')
              .map((line) => ({ type: 'paragraph', content: line })),
          );
        }}
      />
    </>
  );
};

const CommentCard = forwardRef<
  HTMLDivElement,
  ComponentProps['Comments']['Card']
>(({ className, children, headerText, selected, ...props }, ref) => (
  <Card
    {...props}
    ref={ref}
    data-selected={selected}
    className={cn(
      'erxes-block-controls erxes-comment-card bg-background text-foreground w-80 max-w-[calc(100vw-2rem)] space-y-3 rounded-lg p-5 text-sm',
      className,
    )}
  >
    {headerText && (
      <p className="text-xs text-muted-foreground">{headerText}</p>
    )}
    {children}
  </Card>
));
CommentCard.displayName = 'CommentCard';

type CommentActionProps = ComponentProps['Generic']['Toolbar']['Button'] &
  Omit<ReactComponentProps<typeof Button>, 'size' | 'variant'>;

const CommentAction = forwardRef<HTMLButtonElement, CommentActionProps>(
  (
    {
      onClick,
      onMouseDown,
      isDisabled,
      children,
      icon,
      mainTooltip,
      secondaryTooltip,
      label,
      className,
      isSelected,
      variant,
      ...props
    },
    ref,
  ) => {
    const dictionary = useDictionary();
    const isSave = children === dictionary.comments.save_button_text;
    const isIcon = variant === 'compact' && typeof children !== 'string';
    return (
      <Button
        {...props}
        ref={ref}
        type="button"
        variant={isSave ? 'default' : 'ghost'}
        size={isIcon ? 'icon' : 'default'}
        className={cn(
          isSave
            ? 'erxes-comment-save'
            : isIcon
            ? 'erxes-comment-icon'
            : 'erxes-comment-secondary',
          className,
        )}
        onMouseDown={(event) => {
          if (isSave) event.preventDefault();
          onMouseDown?.(event);
        }}
        onClick={onClick}
        disabled={isDisabled || props.disabled}
        aria-pressed={isSelected}
        title={[mainTooltip, secondaryTooltip].filter(Boolean).join(' — ')}
        aria-label={label || mainTooltip}
      >
        {icon}
        {children}
      </Button>
    );
  },
);
CommentAction.displayName = 'CommentAction';

const CommentReaction = forwardRef<
  HTMLButtonElement,
  ComponentProps['Generic']['Badge']['Root']
>(
  (
    {
      className,
      text,
      icon,
      isSelected,
      mainTooltip,
      secondaryTooltip,
      onClick,
      onMouseEnter,
    },
    ref,
  ) => (
    <Button
      ref={ref}
      type="button"
      variant="outline"
      className={cn('erxes-comment-reaction rounded-full gap-1', className)}
      aria-pressed={isSelected}
      title={[mainTooltip, secondaryTooltip].filter(Boolean).join(' — ')}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      <span>{icon}</span>
      <span>{text}</span>
    </Button>
  ),
);
CommentReaction.displayName = 'CommentReaction';

const CommentDisplay = ({
  authorInfo,
  timeString,
  edited,
  actions,
  showActions,
  children,
  className,
}: ComponentProps['Comments']['Comment']) => {
  const dictionary = useDictionary();
  const [hovered, setHovered] = useState(false);
  const { focused, ref } = useFocusWithin();
  const actionsVisible =
    showActions !== false && (showActions !== 'hover' || hovered || focused);
  return (
    <div
      ref={ref}
      className={cn('space-y-2', className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex min-w-0 items-center gap-2">
        {authorInfo === 'loading' ? (
          <>
            <Skeleton className="size-8 shrink-0 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </>
        ) : (
          <>
            <Avatar className="size-8 shrink-0">
              <Avatar.Image
                src={authorInfo.avatarUrl}
                alt={authorInfo.username}
              />
              <Avatar.Fallback>
                {authorInfo.username.slice(0, 1)}
              </Avatar.Fallback>
            </Avatar>
            <div className="flex min-w-0 items-baseline gap-2">
              <p className="truncate text-sm font-medium">
                {authorInfo.username}
              </p>
              <p className="shrink-0 text-xs text-muted-foreground">
                {timeString}
                {edited && ` (${dictionary.comments.edited})`}
              </p>
            </div>
          </>
        )}
        {actions && (
          <div
            className={cn(
              'ml-auto flex shrink-0 justify-end',
              !actionsVisible && 'invisible',
            )}
          >
            {actions}
          </div>
        )}
      </div>
      {children}
    </div>
  );
};

const CommentSection = ({
  className,
  children,
}: ComponentProps['Comments']['CardSection']) => (
  <div
    className={cn(
      'space-y-3',
      className?.includes('bn-thread-comments') && 'pb-2',
      className?.includes('bn-thread-composer') && 'pt-1',
      className,
    )}
  >
    {children}
  </div>
);

const CommentComposer = () => {
  const editor = useBlockNoteEditor();
  const dictionary = useDictionary();
  const { toast } = useToast();
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);

  const saveComment = async () => {
    const comments = editor.comments;
    if (!comments || !value.trim() || saving) return;
    setSaving(true);
    try {
      await comments.createThread({
        initialComment: {
          body: value.split('\n').map((text) => ({
            id: crypto.randomUUID(),
            type: 'paragraph',
            props: {},
            content: text ? [{ type: 'text', text, styles: {} }] : [],
            children: [],
          })),
        },
      });
      comments.stopPendingComment();
    } catch (error) {
      toast({
        title: 'Could not save comment',
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <CommentCard className="bn-thread">
      <Textarea
        autoFocus
        className="min-h-24 resize-y border border-input p-3 text-sm"
        placeholder={dictionary.placeholders.new_comment}
        aria-label={dictionary.placeholders.new_comment}
        value={value}
        disabled={saving}
        onChange={(event) => setValue(event.target.value)}
      />
      <div className="flex justify-end pt-4">
        <Button
          type="button"
          variant="default"
          size="default"
          className="erxes-comment-save"
          disabled={!value.trim() || saving}
          onClick={() => void saveComment()}
        >
          {dictionary.comments.save_button_text}
        </Button>
      </div>
    </CommentCard>
  );
};

const CommentThread = (props: ReactComponentProps<typeof Thread>) =>
  props.thread ? <Thread {...props} /> : null;

export const BlockEditorComments = ({
  children,
  enabled,
  floatingThread,
}: {
  children: ReactNode;
  enabled: boolean;
  floatingThread: boolean;
}) => {
  const base = useComponentsContext();
  const editor = useBlockNoteEditor();
  const editorKey = useMemo(() => crypto.randomUUID(), [editor]);
  const components = useMemo(
    () =>
      base && {
        ...base,
        Comments: {
          ...base.Comments,
          Card: CommentCard,
          CardSection: CommentSection,
          Comment: CommentDisplay,
          Editor: (props: ComponentProps['Comments']['Editor']) =>
            props.editable ? (
              <CommentInput {...props} />
            ) : (
              <base.Comments.Editor {...props} />
            ),
        },
        Generic: {
          ...base.Generic,
          Badge: {
            ...base.Generic.Badge,
            Root: CommentReaction,
          },
          Toolbar: {
            ...base.Generic.Toolbar,
            Root: ({
              children: actions,
            }: ComponentProps['Generic']['Toolbar']['Root']) => (
              <div className="erxes-block-controls bn-action-toolbar flex items-center justify-end gap-2">
                {actions}
              </div>
            ),
            Button: CommentAction,
          },
        },
      },
    [base],
  );
  if (!components) return children;
  return (
    <ComponentsContext.Provider key={editorKey} value={components}>
      {enabled && (
        <>
          <FloatingComposerController floatingComposer={CommentComposer} />
          {floatingThread && (
            <FloatingThreadController floatingThread={CommentThread} />
          )}
        </>
      )}
      {children}
    </ComponentsContext.Provider>
  );
};
