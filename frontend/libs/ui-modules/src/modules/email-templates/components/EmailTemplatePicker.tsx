import { useEmailTemplatePicker } from '../hooks/useEmailTemplatePicker';
import type { EmailTemplatePickerOptions } from '../hooks/useEmailTemplatePicker';
import type { EmailTemplate } from '../types';
import type { ReactElement } from 'react';
import { Button, Command, Popover, Skeleton, Spinner } from 'erxes-ui';

export interface EmailTemplatePickerProps extends EmailTemplatePickerOptions {
  children: ReactElement;
  side?: 'top' | 'bottom';
  searchPlaceholder?: string;
  emptyLabel?: string;
  onContentSelect?: (template: EmailTemplate) => void;
  contentSelectLabel?: string;
}

export const EmailTemplatePicker = ({
  children,
  side = 'bottom',
  searchPlaceholder = 'Search email templates',
  emptyLabel = 'No email templates found.',
  onContentSelect,
  contentSelectLabel = 'Insert template content',
  ...options
}: EmailTemplatePickerProps) => {
  const {
    disabled,
    open,
    setOpen,
    search,
    setSearch,
    applyingId,
    applying,
    templates,
    hasNextPage,
    loading,
    error,
    refetch,
    select,
    loadMore,
  } = useEmailTemplatePicker(options);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild disabled={disabled || applying}>
        {children}
      </Popover.Trigger>
      <Popover.Content className="w-80 p-0" side={side} align="start">
        <Command shouldFilter={false}>
          <Command.Input
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={setSearch}
          />
          <Command.List className="max-h-72 overflow-y-auto">
            {loading && !templates.length && (
              <div className="space-y-2 p-2">
                <output className="sr-only">Loading email templates</output>
                {[0, 1, 2].map((row) => (
                  <Skeleton key={row} className="h-8 w-full" />
                ))}
              </div>
            )}
            {error && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => void refetch().catch(() => undefined)}
              >
                Could not load email templates. Retry
              </Button>
            )}
            {!loading && !error && !templates.length && (
              <Command.Empty>{emptyLabel}</Command.Empty>
            )}
            {templates.map((template) => (
              <Command.Item
                key={template._id}
                value={template._id}
                disabled={disabled || applying}
                onSelect={() => void select(template)}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate">{template.name}</p>
                  {template.description && (
                    <p className="truncate text-xs text-muted-foreground">
                      {template.description}
                    </p>
                  )}
                </div>
                {onContentSelect && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={disabled || applying}
                    aria-label={contentSelectLabel}
                    onClick={(event) => {
                      event.stopPropagation();
                      onContentSelect(template);
                    }}
                  >
                    +
                  </Button>
                )}
                {applyingId === template._id && (
                  <span className="ml-auto flex shrink-0">
                    <output className="sr-only">Inserting template</output>
                    <Spinner size="sm" />
                  </span>
                )}
              </Command.Item>
            ))}
            {hasNextPage && (
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                disabled={loading || applying}
                onClick={() => {
                  loadMore();
                }}
              >
                {loading ? <Spinner size="sm" /> : 'Load more'}
              </Button>
            )}
          </Command.List>
        </Command>
      </Popover.Content>
    </Popover>
  );
};
