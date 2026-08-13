import { useToggleTicketArchive } from '@/ticket/hooks/useToggleTicketArchive';
import { IconSquareToggle } from '@tabler/icons-react';
import { Command } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const TicketsArchive = ({
  ticketIds,
  archived,
  setOpen,
}: {
  ticketIds: string[];
  archived: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const { t } = useTranslation('frontline');
  const { toggleArchive } = useToggleTicketArchive();

  return (
    <Command.Item
      onSelect={() => {
        setOpen(false);
        toggleArchive(ticketIds, archived);
      }}
    >
      <IconSquareToggle className="size-4" />
      {archived ? t('unarchive') : t('archive')}
    </Command.Item>
  );
};
