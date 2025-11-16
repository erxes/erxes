import { IconLoader, IconSearch } from '@tabler/icons-react';
import { cn } from 'erxes-ui';
import {
  type EmojiPickerListCategoryHeaderProps,
  type EmojiPickerListEmojiProps,
  type EmojiPickerListRowProps,
  EmojiPicker as EmojiPickerPrimitive,
} from 'frimousse';
import * as React from 'react';

const EmojiPickerRoot = React.forwardRef<
  React.ElementRef<typeof EmojiPickerPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof EmojiPickerPrimitive.Root>
>(({ className, ...props }, ref) => (
  <EmojiPickerPrimitive.Root
    ref={ref}
    className={cn(
      'bg-popover text-popover-foreground isolate flex h-full w-fit flex-col overflow-hidden rounded-md',
      className,
    )}
    data-slot="emoji-picker"
    {...props}
  />
));
EmojiPickerRoot.displayName = 'EmojiPicker';

const EmojiPickerSearch = React.forwardRef<
  React.ElementRef<typeof EmojiPickerPrimitive.Search>,
  React.ComponentPropsWithoutRef<typeof EmojiPickerPrimitive.Search>
>(({ className, ...props }, ref) => (
  <div
    className={cn('flex h-9 items-center gap-2 border-b px-3', className)}
    data-slot="emoji-picker-search-wrapper"
  >
    <IconSearch className="size-4 shrink-0 opacity-50" />
    <EmojiPickerPrimitive.Search
      ref={ref}
      className="outline-hidden placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
      data-slot="emoji-picker-search"
      {...props}
    />
  </div>
));
EmojiPickerSearch.displayName = 'EmojiPickerSearch';

function EmojiPickerRow({ children, ...props }: EmojiPickerListRowProps) {
  return (
    <div {...props} className="scroll-my-1 px-1" data-slot="emoji-picker-row">
      {children}
    </div>
  );
}

function EmojiPickerEmoji({
  emoji,
  className,
  ...props
}: EmojiPickerListEmojiProps) {
  return (
    <button
      {...props}
      className={cn(
        'data-[active]:bg-accent flex size-7 items-center justify-center rounded-sm text-base',
        className,
      )}
      data-slot="emoji-picker-emoji"
    >
      {emoji.emoji}
    </button>
  );
}

function EmojiPickerCategoryHeader({
  category,
  ...props
}: EmojiPickerListCategoryHeaderProps) {
  return (
    <div
      {...props}
      className="bg-background text-muted-foreground px-3 pb-2 pt-3.5 text-xs leading-none"
      data-slot="emoji-picker-category-header"
    >
      {category.label}
    </div>
  );
}

const EmojiPickerContent = React.forwardRef<
  React.ElementRef<typeof EmojiPickerPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof EmojiPickerPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <EmojiPickerPrimitive.Viewport
    ref={ref}
    className={cn('outline-hidden relative flex-1', className)}
    data-slot="emoji-picker-viewport"
    {...props}
  >
    <EmojiPickerPrimitive.Loading
      className="absolute inset-0 flex items-center justify-center text-muted-foreground"
      data-slot="emoji-picker-loading"
    >
      <IconLoader className="size-4 animate-spin" />
    </EmojiPickerPrimitive.Loading>
    <EmojiPickerPrimitive.Empty
      className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm"
      data-slot="emoji-picker-empty"
    >
      No emoji found.
    </EmojiPickerPrimitive.Empty>
    <EmojiPickerPrimitive.List
      className="select-none pb-1"
      components={{
        Row: EmojiPickerRow,
        Emoji: EmojiPickerEmoji,
        CategoryHeader: EmojiPickerCategoryHeader,
      }}
      data-slot="emoji-picker-list"
    />
  </EmojiPickerPrimitive.Viewport>
));
EmojiPickerContent.displayName = 'EmojiPickerContent';

function EmojiPickerFooter({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'max-w-(--frimousse-viewport-width) flex w-full min-w-0 items-center gap-1 border-t p-2',
        className,
      )}
      data-slot="emoji-picker-footer"
      {...props}
    >
      <EmojiPickerPrimitive.ActiveEmoji>
        {({ emoji }) =>
          emoji ? (
            <>
              <div className="flex size-7 flex-none items-center justify-center text-lg">
                {emoji.emoji}
              </div>
              <span className="text-secondary-foreground truncate text-xs">
                {emoji.label}
              </span>
            </>
          ) : (
            <span className="text-muted-foreground ml-1.5 flex h-7 items-center truncate text-xs">
              Select an emoji…
            </span>
          )
        }
      </EmojiPickerPrimitive.ActiveEmoji>
    </div>
  );
}

export const EmojiPicker = Object.assign(EmojiPickerRoot, {
  Search: EmojiPickerSearch,
  Content: EmojiPickerContent,
  Footer: EmojiPickerFooter,
  Primitive: EmojiPickerPrimitive,
});
