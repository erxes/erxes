import { useBulkUpdateTickets } from '@/ticket/hooks/useBulkUpdateTickets';
import { IconChevronRight, IconTags } from '@tabler/icons-react';
import { Command } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TagsSelect } from 'ui-modules';

export const TicketsEditTagsTrigger = ({
  setCurrentContent,
}: {
  setCurrentContent: (currentContent: string) => void;
}) => {
  const { t } = useTranslation('frontline');
  return (
    <Command.Item
      className="flex justify-between"
      onSelect={() => setCurrentContent('tags')}
    >
      <div className="flex gap-2 items-center">
        <IconTags className="size-4" />
        {t('change-tags')}
      </div>
      <IconChevronRight className="size-4 text-muted-foreground" />
    </Command.Item>
  );
};

export const TicketsEditTagsContent = ({
  ticketIds,
  tagIds,
}: {
  ticketIds: string[];
  tagIds: string[];
}) => {
  const { t } = useTranslation('frontline');
  const { bulkUpdateTickets } = useBulkUpdateTickets();
  const [value, setValue] = useState<string[]>(tagIds);

  return (
    <TagsSelect.Provider
      mode="multiple"
      type="frontline:ticket"
      value={value}
      onValueChange={async (newTagIds: string[]) => {
        const previousTagIds = value;
        setValue(newTagIds);
        await bulkUpdateTickets(
          ticketIds,
          { tagIds: newTagIds },
          {
            successMessage: t('tickets-updated-successfully'),
            // The control holds one value for the whole selection, so it can
            // only go back when nothing was applied.
            onError: (failedIds) => {
              if (failedIds.length === ticketIds.length) {
                setValue(previousTagIds);
              }
            },
          },
        );
      }}
    >
      <TagsSelect.Content />
    </TagsSelect.Provider>
  );
};
