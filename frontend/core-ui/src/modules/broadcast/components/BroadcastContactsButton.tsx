import { useTranslation } from 'react-i18next';
import { useBroadcastContacts } from '../hooks/useBroadcastContacts';
import { BroadcastMethod } from './list/BroadcastMethod';

/** Starts a campaign aimed at the customers picked in a contacts list. */
export const BroadcastContactsButton = ({
  customerIds,
}: {
  customerIds: string[];
}) => {
  const { t } = useTranslation('broadcasts');
  const { setContacts } = useBroadcastContacts();

  return (
    <BroadcastMethod
      label={t('actions.send-broadcast')}
      variant="secondary"
      onSelect={() => setContacts(customerIds)}
    />
  );
};
