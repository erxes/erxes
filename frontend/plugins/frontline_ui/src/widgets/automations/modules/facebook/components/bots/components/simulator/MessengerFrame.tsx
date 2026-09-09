import {
  IconChevronLeft,
  IconMenu2,
  IconSend,
  IconX,
} from '@tabler/icons-react';
import { Avatar, cn } from 'erxes-ui';
import { ReactNode } from 'react';

export type TMessengerDevice = 'mobile' | 'desktop';

/**
 * The Messenger chrome a page visitor sees. The phone keeps a device-like
 * aspect ratio and the desktop variant is the docked chat window, so neither
 * stretches to whatever space the panel happens to have.
 */
export const MessengerFrame = ({
  device,
  pageName,
  profileUrl,
  isMenuOpen,
  onToggleMenu,
  composerValue,
  onComposerChange,
  children,
  overlay,
}: {
  device: TMessengerDevice;
  pageName: string;
  profileUrl?: string;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  // Typing here is how the preview tries a direct message.
  composerValue: string;
  onComposerChange: (value: string) => void;
  children: ReactNode;
  // Rendered between the thread and the composer, where Messenger stacks the
  // persistent menu and the Get Started button.
  overlay?: ReactNode;
}) => {
  const isMobile = device === 'mobile';

  return (
    <div
      className={cn(
        'flex shrink-0 flex-col overflow-hidden bg-background shadow-lg',
        isMobile
          ? 'h-[600px] w-[300px] rounded-[2rem] border-[6px] border-foreground/80'
          : 'h-[480px] w-[360px] rounded-lg border',
      )}
    >
      <div
        className={cn(
          'flex items-center gap-2 border-b px-3',
          isMobile ? 'py-2.5' : 'bg-muted/50 py-2',
        )}
      >
        {isMobile && (
          <IconChevronLeft className="size-4 shrink-0 text-muted-foreground" />
        )}
        <Avatar className="size-7">
          <Avatar.Image src={profileUrl} />
          <Avatar.Fallback>{(pageName || '?').charAt(0)}</Avatar.Fallback>
        </Avatar>
        <span className="truncate text-sm font-semibold">{pageName}</span>
        {!isMobile && (
          <div className="ml-auto flex items-center gap-1.5 text-muted-foreground">
            <span className="block h-0.5 w-3 bg-current" />
            <IconX className="size-3.5" />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3">{children}</div>

      {overlay}

      <div className="flex items-center gap-2 border-t px-3 py-2">
        <button
          type="button"
          onClick={onToggleMenu}
          className={cn(
            'flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors',
            isMenuOpen && 'bg-primary/10 text-primary',
          )}
          aria-label="Persistent menu"
        >
          {isMenuOpen ? (
            <IconX className="size-4" />
          ) : (
            <IconMenu2 className="size-4" />
          )}
        </button>
        <input
          value={composerValue}
          onChange={(event) => onComposerChange(event.currentTarget.value)}
          placeholder="Aa"
          className="min-w-0 flex-1 rounded-full bg-muted px-3 py-1.5 text-xs outline-hidden placeholder:text-muted-foreground"
        />
        <IconSend className="size-4 shrink-0 text-muted-foreground" />
      </div>
    </div>
  );
};
