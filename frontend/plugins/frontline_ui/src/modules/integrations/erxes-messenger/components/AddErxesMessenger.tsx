import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { useSidePanel } from 'ui-modules';
import { useSocialIntegrationCreate } from '@/integrations/hooks/useSocialIntegrationCreate';
import { INTEGRATION_CONTENT_TYPE } from '@/integrations/components/IntegrationPanelForm';
import { useTranslation } from 'react-i18next';
import { IntegrationCreateButton } from '@/integrations/components/IntegrationPanelForm';
import { erxesMessengerSetupEditSheetOpenAtom } from '../states/erxesMessengerSetupStates';
import { EMSetup } from './EMSetup';
import { useMessengerDraft } from '../hooks/useMessengerDraft';

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

export const AddErxesMessengerPanelForm = () => {
  const ready = useMessengerDraft(false);
  const { openRecord } = useSidePanel();
  const { createdId, loading } = useSocialIntegrationCreate();
  useEffect(() => {
    if (createdId && !loading)
      openRecord(
        { contentType: INTEGRATION_CONTENT_TYPE, contentId: createdId },
        { replace: true },
      );
  }, [createdId, loading, openRecord]);
  return ready ? <EMSetup loading={loading} /> : null;
};
