import { IconPlus } from '@tabler/icons-react';
import { Button, Combobox, Command } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

// Tasks and projects share the same stacked contact-connection picker.
export const ContactConnectionPicker = ({
  labels,
  search,
  onSearchChange,
  loading,
  connecting,
  error,
  onRetry,
  onClose,
  onCreate,
  children,
}: {
  labels: {
    title: string;
    help: string;
    search: string;
    list: string;
    connecting: string;
    create?: string;
  };
  search: string;
  onSearchChange: (value: string) => void;
  loading: boolean;
  connecting: boolean;
  error?: Error;
  onRetry: () => void;
  onClose: () => void;
  onCreate?: () => void;
  children: ReactNode;
}) => {
  const { t } = useTranslation('operation');
  return (
    <section
      aria-label={labels.title}
      className="flex min-h-0 min-w-0 flex-1 flex-col bg-background"
    >
      <div className="px-3 py-3">
        <p className="text-xs text-muted-foreground">{labels.help}</p>
      </div>
      <Command shouldFilter={false} className="min-h-0 flex-1 rounded-none">
        <div className="flex items-center gap-2 border-b pr-3">
          <Command.Input
            variant="primary"
            wrapperClassName="min-w-0 flex-1 border-0"
            placeholder={labels.search}
            aria-label={labels.search}
            value={search}
            onValueChange={onSearchChange}
            disabled={connecting}
            focusOnMount
          />
          {onCreate && (
            <Button
              variant="secondary"
              size="sm"
              className="shrink-0"
              disabled={connecting}
              onClick={onCreate}
              onKeyDown={(event) => {
                if (event.key === 'Enter') event.stopPropagation();
              }}
            >
              <IconPlus className="size-4" />
              {labels.create}
            </Button>
          )}
        </div>
        <Command.List aria-label={labels.list} className="max-h-none flex-1">
          {error ? (
            <div role="alert" className="p-4 text-sm text-muted-foreground">
              <p>{error.message}</p>
              <Button variant="ghost" size="sm" onClick={onRetry}>
                {t('retry', 'Retry')}
              </Button>
            </div>
          ) : (
            <>
              <Combobox.Empty loading={loading} />
              {children}
            </>
          )}
        </Command.List>
      </Command>
      <div className="flex items-center justify-between border-t p-3">
        {connecting ? (
          <output className="text-xs text-muted-foreground">
            {labels.connecting}
          </output>
        ) : (
          <span />
        )}
        <Button
          variant="secondary"
          size="sm"
          disabled={connecting}
          onClick={onClose}
        >
          {t('cancel', 'Cancel')}
        </Button>
      </div>
    </section>
  );
};
