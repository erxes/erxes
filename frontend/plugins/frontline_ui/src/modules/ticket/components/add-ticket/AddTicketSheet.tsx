import { useCreateTicketRecord } from '@/ticket/hooks/useCreateTicketRecord';
import { TicketHotKeyScope } from '@/ticket/types/ticketHotkeyScope';
import { IconPlus } from '@tabler/icons-react';
import { Button, ButtonProps, Kbd, useScopedHotkeys } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const AddTicketSheet = ({
  onComplete,
  isRelation = false,
  contacts,
  defaults,
  ...props
}: {
  onComplete?: (ticketId: string) => void;
  contacts?: { customerId?: string; companyId?: string };
  defaults?: { channelId?: string; pipelineId?: string; statusId?: string };
  isRelation?: boolean;
} & ButtonProps) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.ticket' });
  const { openTicketDraft } = useCreateTicketRecord();
  const onOpen = () =>
    openTicketDraft({ ...defaults, ...contacts, onComplete }, isRelation);

  useScopedHotkeys(
    'c',
    () => {
      if (!isRelation) onOpen();
    },
    TicketHotKeyScope.TicketPage,
    [onOpen, isRelation],
  );

  return (
    <Button {...props} onClick={onOpen}>
      <IconPlus />
      {t('add-ticket', 'Add ticket')}
      {!isRelation && <Kbd>C</Kbd>}
    </Button>
  );
};
