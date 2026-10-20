import { IconAlertCircle, IconPlus, IconTrash } from '@tabler/icons-react';
import { Accordion, Button, Input, cn } from 'erxes-ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * A list of one-line rows that open one at a time, so long lists of fields,
 * topics or tools stay scannable.
 */
export const AiAgentRowList = ({
  openId,
  onOpenChange,
  search,
  onSearchChange,
  showSearch,
  hasNoMatch,
  isEmpty,
  errorMessage,
  addLabel,
  onAdd,
  children,
}: {
  openId: string;
  onOpenChange: (id: string) => void;
  search: string;
  onSearchChange: (search: string) => void;
  showSearch: boolean;
  hasNoMatch: boolean;
  isEmpty: boolean;
  errorMessage?: string;
  addLabel: string;
  onAdd: () => void;
  children: ReactNode;
}) => {
  const { t } = useTranslation('automations');

  return (
    <div className="flex flex-col gap-2">
      {showSearch && (
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t('ai-agent-search-items')}
        />
      )}
      {!isEmpty && (
        <Accordion
          type="single"
          collapsible
          value={openId}
          onValueChange={onOpenChange}
          className="overflow-hidden rounded-md border"
        >
          {children}
        </Accordion>
      )}
      {hasNoMatch && (
        <p className="px-1 text-sm text-muted-foreground">
          {t('ai-agent-no-matching-items', { search })}
        </p>
      )}
      {errorMessage && (
        <p className="px-1 text-sm text-destructive">{errorMessage}</p>
      )}
      <Button
        type="button"
        variant="secondary"
        className="self-start"
        onClick={onAdd}
      >
        <IconPlus />
        {addLabel}
      </Button>
    </div>
  );
};

export const AiAgentRow = ({
  value,
  title,
  badges,
  preview,
  hasError,
  onRemove,
  children,
}: {
  value: string;
  title: string;
  badges?: ReactNode;
  preview?: string;
  hasError: boolean;
  onRemove: () => void;
  children: ReactNode;
}) => {
  const { t } = useTranslation('automations');

  return (
    <Accordion.Item value={value} className="last:border-b-0">
      {/* Accordion.Trigger renders inside its own header element, which must
          shrink too or a long preview pushes the row past the panel */}
      <div className="flex items-center gap-1 pr-2 [&>h3]:min-w-0 [&>h3]:flex-1">
        <Accordion.Trigger className="w-full min-w-0 gap-2 px-3 py-2 font-normal hover:no-underline">
          <span className="flex min-w-0 flex-1 items-center gap-2">
            {hasError && (
              <IconAlertCircle className="size-4 shrink-0 text-destructive" />
            )}
            <span
              className={cn(
                'shrink-0 font-mono text-sm',
                !title && 'text-muted-foreground',
              )}
            >
              {title || t('ai-agent-untitled')}
            </span>
            {badges}
            {preview && (
              <span className="min-w-0 truncate text-sm text-muted-foreground">
                {preview}
              </span>
            )}
          </span>
        </Accordion.Trigger>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 text-muted-foreground"
          aria-label={t('ai-agent-remove-item')}
          onClick={onRemove}
        >
          <IconTrash />
        </Button>
      </div>
      <Accordion.Content className="flex flex-col gap-3 border-t bg-muted/20 px-3 pb-3 pt-3">
        {children}
      </Accordion.Content>
    </Accordion.Item>
  );
};
