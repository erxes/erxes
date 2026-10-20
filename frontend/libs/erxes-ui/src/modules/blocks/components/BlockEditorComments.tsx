import {
  ComponentProps,
  ComponentsContext,
  FloatingComposerController,
  FloatingThreadController,
  Thread,
  useComponentsContext,
  useDictionary,
  useFocusWithin,
} from '@blocknote/react';
import { components as blockNoteComponents } from '@blocknote/shadcn';
import {
  ComponentProps as ReactComponentProps,
  forwardRef,
  ReactNode,
  useMemo,
  useState,
} from 'react';
import { Avatar, Button, Card, Skeleton, Textarea } from 'erxes-ui/components';
import { cn } from 'erxes-ui/lib';
import { useBlockEditorCommentComposer } from '../hooks/useBlockEditorCommentComposer';

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
    let actionClass = 'erxes-comment-secondary';
    if (isSave) actionClass = 'erxes-comment-save';
    else if (isIcon) actionClass = 'erxes-comment-icon';
    return (
      <Button
        {...props}
        ref={ref}
        type="button"
        variant={isSave ? 'default' : 'ghost'}
        size={isIcon ? 'icon' : 'default'}
        className={cn(actionClass, className)}
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
    <article
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
    </article>
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
  const dictionary = useDictionary();
  const { value, setValue, saving, saveComment } =
    useBlockEditorCommentComposer();

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

const CommentEditor = (props: ComponentProps['Comments']['Editor']) => (
  <blockNoteComponents.Comments.Editor
    {...props}
    className={cn('erxes-block-controls', props.className)}
  />
);

const CommentToolbar = ({
  children,
}: ComponentProps['Generic']['Toolbar']['Root']) => (
  <div className="erxes-block-controls bn-action-toolbar flex items-center justify-end gap-2">
    {children}
  </div>
);

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
  const components = useMemo(
    () =>
      base && {
        ...base,
        Comments: {
          ...base.Comments,
          Card: CommentCard,
          CardSection: CommentSection,
          Comment: CommentDisplay,
          Editor: CommentEditor,
        },
        Generic: {
          ...base.Generic,
          Badge: {
            ...base.Generic.Badge,
            Root: CommentReaction,
          },
          Toolbar: {
            ...base.Generic.Toolbar,
            Root: CommentToolbar,
            Button: CommentAction,
          },
        },
      },
    [base],
  );
  if (!components) return children;
  return (
    <ComponentsContext.Provider value={components}>
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
