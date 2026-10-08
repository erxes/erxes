import {
  ComponentsContext,
  FloatingComposer,
  FloatingComposerController,
  FloatingThreadController,
  ThreadsSidebar,
  useComponentsContext,
  useDictionary,
  useThreads,
} from '@blocknote/react';
import type { ComponentProps as NativeComponentProps } from '@blocknote/react';
import {
  Avatar,
  Button,
  Card,
  Popover,
  Spinner,
  Tooltip,
} from 'erxes-ui/components';
import { cn } from 'erxes-ui/lib';
import { toast } from 'erxes-ui';
import type { IBlockEditor } from 'erxes-ui';
import {
  forwardRef,
  type ForwardRefExoticComponent,
  memo,
  ReactNode,
  type RefAttributes,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const Composer = memo(FloatingComposer);

export const isDocumentCommentOverlay = (target: EventTarget | null): boolean =>
  target instanceof Element &&
  Boolean(target.closest('.document-comments-overlay'));

const CommentAction = forwardRef<
  HTMLButtonElement,
  NativeComponentProps['Generic']['Toolbar']['Button']
>(
  (
    {
      children,
      icon,
      label,
      mainTooltip,
      secondaryTooltip,
      isSelected,
      variant,
      isDisabled,
      onClick,
      className,
      ...props
    },
    ref,
  ) => {
    const pending = useRef(false);
    const [saving, setSaving] = useState(false);
    const dictionary = useDictionary();
    const isSave =
      children === dictionary.comments.save_button_text ||
      mainTooltip === 'Save';
    return (
      <Tooltip>
        <Tooltip.Trigger asChild>
          <Button
            {...props}
            ref={ref}
            className={cn(
              'document-comment-action',
              isSave
                ? 'border! border-[var(--comment-primary)]! bg-[var(--comment-primary)]! [color:var(--comment-primary-foreground)]! px-3! py-1! text-sm! font-medium! shadow-button-primary!'
                : 'px-2 py-1 text-xs font-medium',
              className,
            )}
            aria-label={label || mainTooltip}
            aria-pressed={isSelected}
            variant={isSave ? 'default' : 'ghost'}
            size={!isSave && variant === 'compact' ? 'sm' : 'default'}
            disabled={isDisabled || saving}
            onMouseDown={(event) => event.preventDefault()}
            onClick={async (event) => {
              if (!onClick || pending.current) return;
              pending.current = true;
              setSaving(true);
              const closesComposer = event.currentTarget
                .closest('.bn-comment-actions-wrapper')
                ?.parentElement?.classList.contains('bn-thread');
              let succeeded = false;
              try {
                await onClick(event);
                succeeded = true;
              } catch (error) {
                toast({
                  title: 'Could not update comment',
                  description:
                    error instanceof Error
                      ? error.message
                      : 'Please try again.',
                  variant: 'destructive',
                });
              } finally {
                if (!succeeded || !closesComposer) {
                  pending.current = false;
                  setSaving(false);
                }
              }
            }}
          >
            {saving ? <Spinner size="sm" /> : icon}
            {children}
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Content className="z-[7000]">
          {mainTooltip}
          {secondaryTooltip && <span>{secondaryTooltip}</span>}
        </Tooltip.Content>
      </Tooltip>
    );
  },
);
CommentAction.displayName = 'DocumentCommentAction';

const CommentCard = ({
  className,
  headerText,
  children,
  selected,
  ...props
}: NativeComponentProps['Comments']['Card']) => (
  <Card
    {...props}
    className={cn(
      'bg-background text-foreground rounded-md border border-border p-3 w-80 max-w-[calc(100vw-2rem)]',
      '[&_.bn-thread-comments]:p-0! [&_.bn-thread-comments]:gap-3! [&_.bn-thread-comments]:border-border!',
      '[&_.bn-thread-composer]:p-0! [&_.bn-thread-composer]:mt-3 [&_.bn-thread-composer]:border-border!',
      '[&_.bn-comment-actions-wrapper]:pt-2 [&_.bn-comment-actions-wrapper:empty]:hidden!',
      '[&_.bn-comment-actions]:border-0! [&_.bn-comment-actions]:bg-transparent! [&_.bn-comment-actions]:p-0! [&_.bn-comment-actions]:shadow-none!',
      '[&_.bn-comment-reactions]:pb-2',
      selected && 'border-primary',
      className,
    )}
  >
    {headerText && (
      <p className="mb-3 truncate text-xs font-medium text-muted-foreground">
        {headerText}
      </p>
    )}
    {children}
  </Card>
);

const CommentFrame = ({
  authorInfo,
  timeString,
  edited,
  actions,
  children,
  className,
}: NativeComponentProps['Comments']['Comment']) => {
  const dictionary = useDictionary();
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2 [&_.bn-comment-actions]:gap-0! [&_.bn-comment-actions]:rounded [&_.bn-comment-actions]:border! [&_.bn-comment-actions]:border-border! [&_.bn-comment-actions]:p-0.5! [&_.document-comment-action]:size-6 [&_.document-comment-action]:shrink-0 [&_.document-comment-action]:p-0">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {authorInfo === 'loading' ? (
            <Spinner size="sm" />
          ) : (
            <>
              <Avatar size="lg">
                <Avatar.Image src={authorInfo.avatarUrl} />
                <Avatar.Fallback>
                  {authorInfo.username.slice(0, 1)}
                </Avatar.Fallback>
              </Avatar>
              <span className="min-w-0 truncate text-sm font-semibold">
                {authorInfo.username}
              </span>
            </>
          )}
          <span className="shrink-0 text-xs text-muted-foreground">
            {timeString}
            {edited && ` (${dictionary.comments.edited})`}
          </span>
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
      {children}
    </div>
  );
};

const CommentPopover = ({
  opened,
  children,
}: NativeComponentProps['Generic']['Popover']['Root']) => (
  <Popover open={opened}>{children}</Popover>
);
const CommentPopoverTrigger = forwardRef<
  HTMLButtonElement,
  NativeComponentProps['Generic']['Popover']['Trigger']
>(({ children }, ref) => (
  <Popover.Trigger ref={ref} asChild>
    {children}
  </Popover.Trigger>
));
CommentPopoverTrigger.displayName = 'DocumentCommentPopoverTrigger';
const CommentPopoverContent = ({
  children,
  className,
}: NativeComponentProps['Generic']['Popover']['Content']) => (
  <Popover.Content
    className={cn(
      'document-comments-overlay z-[6000] w-fit p-0 bg-background text-foreground',
      className,
    )}
    onOpenAutoFocus={(event) => event.preventDefault()}
    onCloseAutoFocus={(event) => event.preventDefault()}
  >
    {children}
  </Popover.Content>
);

export const DocumentCommentsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const native = useComponentsContext();
  const components = useMemo(() => {
    if (!native) return undefined;
    const NativeBadge = native.Generic.Badge.Root as ForwardRefExoticComponent<
      NativeComponentProps['Generic']['Badge']['Root'] &
        RefAttributes<HTMLButtonElement>
    >;
    const Badge = forwardRef<
      HTMLButtonElement,
      NativeComponentProps['Generic']['Badge']['Root']
    >(({ mainTooltip, secondaryTooltip, ...props }, ref) => {
      const badge = (
        <NativeBadge
          {...props}
          ref={ref}
          className={cn(
            props.className,
            props.isSelected && 'border! border-[var(--comment-primary)]!',
          )}
        />
      );
      return mainTooltip ? (
        <Tooltip>
          <Tooltip.Trigger asChild>{badge}</Tooltip.Trigger>
          <Tooltip.Content className="z-[7000]">
            {mainTooltip}
            {secondaryTooltip && <span>{secondaryTooltip}</span>}
          </Tooltip.Content>
        </Tooltip>
      ) : (
        badge
      );
    });
    Badge.displayName = 'DocumentCommentBadge';
    const NativeMenuDropdown = native.Generic.Menu.Dropdown;
    const MenuDropdown = (
      props: NativeComponentProps['Generic']['Menu']['Dropdown'],
    ) => (
      <NativeMenuDropdown
        {...props}
        className={cn(
          'document-comments-overlay z-[6000] bg-[var(--comment-background)]! text-[var(--comment-foreground)]!',
          props.className,
        )}
      />
    );
    return {
      ...native,
      Comments: {
        ...native.Comments,
        Card: CommentCard,
        Comment: CommentFrame,
      },
      Generic: {
        ...native.Generic,
        Badge: { ...native.Generic.Badge, Root: Badge },
        Toolbar: { ...native.Generic.Toolbar, Button: CommentAction },
        Menu: { ...native.Generic.Menu, Dropdown: MenuDropdown },
        Popover: {
          Root: CommentPopover,
          Trigger: CommentPopoverTrigger,
          Content: CommentPopoverContent,
        },
      },
    };
  }, [native]);
  return (
    <ComponentsContext.Provider value={components}>
      <Tooltip.Provider>
        <div
          className="document-comments"
          onBlurCapture={(event) => {
            if (isDocumentCommentOverlay(event.relatedTarget))
              event.stopPropagation();
          }}
        >
          {children}
        </div>
      </Tooltip.Provider>
    </ComponentsContext.Provider>
  );
};

export const DocumentComments = ({
  editor,
  panelOpen,
}: {
  editor: IBlockEditor;
  panelOpen: boolean;
}) => {
  useEffect(() => {
    editor.comments?.stopPendingComment();
  }, [editor, panelOpen]);
  return (
    <>
      <FloatingComposerController floatingComposer={Composer} />
      {!panelOpen && (
        <FloatingThreadController
          floatingOptions={{
            onOpenChange: (open, event) => {
              if (open || isDocumentCommentOverlay(event?.target || null))
                return;
              editor.comments?.selectThread(undefined);
              editor.focus();
            },
          }}
        />
      )}
    </>
  );
};

export const DocumentCommentsPanel = ({ editor }: { editor: IBlockEditor }) => {
  const threads = useThreads(editor);
  return threads.size ? (
    <ThreadsSidebar filter="all" />
  ) : (
    <p className="p-2 text-sm text-muted-foreground">
      Select text and choose Add comment to start a discussion.
    </p>
  );
};
