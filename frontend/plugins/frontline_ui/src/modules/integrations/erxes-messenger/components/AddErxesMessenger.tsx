import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { IntegrationCreateButton } from '@/integrations/components/IntegrationPanelForm';
import { erxesMessengerSetupEditSheetOpenAtom } from '../states/erxesMessengerSetupStates';
import { EMSetup } from './EMSetup';
import { useMessengerDraft } from '../hooks/useMessengerDraft';

/** Opens Messenger creation with the edit identity cleared even during a pending read. */
export const AddErxesMessengerSheet = () => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  const setEditId = useSetAtom(erxesMessengerSetupEditSheetOpenAtom);
  return (
    <IntegrationCreateButton kind="messenger" onClick={() => setEditId(false)}>
      {t('add-messenger')}
    </IntegrationCreateButton>
  );
};

/** Restores the create draft before mounting Messenger setup. */
export const AddErxesMessengerPanelForm = () => {
  const ready = useMessengerDraft(false);
  return ready ? <EMSetup /> : null;
};
