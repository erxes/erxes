import { IResponseTemplate } from '../types';
import { useRemoveResponse } from '../hooks/useRemoveResponse';
import {
  IconDots,
  IconEdit,
  IconPaperclip,
  IconTrash,
} from '@tabler/icons-react';
import {
  Card,
  Combobox,
  Command,
  Popover,
  Spinner,
  Tooltip,
  useConfirm,
} from 'erxes-ui';
import { format } from 'date-fns';
import { useSidePanel } from 'ui-modules';
import { RESPONSE_TEMPLATE_CONTENT_TYPE } from '@/settings/constants/recordPanels';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const stripHtml = (html?: string) =>
  (html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const ResponseCardMenu = ({
  onEdit,
  onDelete,
  loading,
}: {
  onEdit: () => void;
  onDelete: () => void;
  loading: boolean;
}) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.response-template',
  });
  return (
    <Command shouldFilter={false}>
      <Command.List>
        <Command.Item value="edit" onSelect={onEdit}>
          <IconEdit /> {t('edit', 'Edit')}
        </Command.Item>
        <Command.Item
          value="delete"
          onSelect={onDelete}
          className="text-destructive"
        >
          {loading ? <Spinner size="sm" /> : <IconTrash />}{' '}
          {t('delete', 'Delete')}
        </Command.Item>
      </Command.List>
    </Command>
  );
};

const ResponseCardActions = ({ responseId }: { responseId: string }) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.response-template',
  });
  const { openRecord } = useSidePanel();
  const { removeResponse, loading } = useRemoveResponse();
  const { confirm } = useConfirm();

  const [open, setOpen] = useState(false);

  const handleEdit = () => {
    setOpen(false);
    openRecord({
      contentType: RESPONSE_TEMPLATE_CONTENT_TYPE,
      contentId: responseId,
    });
  };

  const handleDelete = () => {
    confirm({
      message: t(
        'confirm-delete-response',
        'Are you sure you want to delete this response?',
      ),
      options: { confirmationValue: 'delete' },
    }).then(() => {
      removeResponse({ variables: { id: responseId } });
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        onClick={(e) => e.stopPropagation()}
        className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100 data-[state=open]:opacity-100"
      >
        <IconDots size={16} />
      </Popover.Trigger>
      <Combobox.Content onClick={(e) => e.stopPropagation()}>
        <ResponseCardMenu
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
        />
      </Combobox.Content>
    </Popover>
  );
};

export const ResponseCard = ({ response }: { response: IResponseTemplate }) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.response-template',
  });
  const { openRecord } = useSidePanel();
  const { _id, name, content, createdAt, files } = response;

  const preview = stripHtml(content ?? undefined);
  const fileCount = files?.length ?? 0;

  const openDetails = () => {
    openRecord({ contentType: RESPONSE_TEMPLATE_CONTENT_TYPE, contentId: _id });
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={openDetails}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openDetails();
        }
      }}
      className="group flex flex-col gap-2 p-4 border border-border transition-colors hover:border-primary/40 hover:shadow-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="flex items-start gap-2">
        <Card.Title className="min-w-0 flex-1 truncate text-sm font-semibold leading-tight">
          {name}
        </Card.Title>
        <ResponseCardActions responseId={_id} />
      </div>

      <Card.Description className="line-clamp-3 min-h-[3rem] text-xs">
        {preview || (
          <span className="italic text-muted-foreground/70">
            {t('no-content', 'No content')}
          </span>
        )}
      </Card.Description>

      <div className="mt-auto flex items-center justify-between gap-2 pt-1">
        {fileCount > 0 ? (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <IconPaperclip size={14} />
            {fileCount}
          </span>
        ) : (
          <span />
        )}
        {createdAt && (
          <Tooltip.Provider>
            <Tooltip>
              <Tooltip.Trigger asChild>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(createdAt), 'MMM d, yyyy')}
                </span>
              </Tooltip.Trigger>
              <Tooltip.Content>
                {format(new Date(createdAt), 'MMM d, yyyy HH:mm')}
              </Tooltip.Content>
            </Tooltip>
          </Tooltip.Provider>
        )}
      </div>
    </Card>
  );
};
