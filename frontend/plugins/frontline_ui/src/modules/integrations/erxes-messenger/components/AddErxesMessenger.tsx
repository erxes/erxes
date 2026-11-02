import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import {
  IntegrationCreateButton,
  IntegrationFormSession,
} from '@/integrations/components/IntegrationPanelForm';
import { erxesMessengerSetupSheetOpenAtom } from '../states/erxesMessengerSetupStates';
import { resetErxesMessengerSetupAtom } from '../states/EMSetupResetState';
import { EMSetup } from './EMSetup';

export const AddErxesMessengerSheet = () => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  const reset = useSetAtom(resetErxesMessengerSetupAtom);
  return (
    <IntegrationCreateButton kind="messenger" onClick={() => reset()}>
      {t('add-messenger')}
    </IntegrationCreateButton>
  );
};

export const AddErxesMessengerPanelForm = () => (
  <IntegrationFormSession
    state={erxesMessengerSetupSheetOpenAtom}
    value={true}
    closedValue={false}
  >
    <EMSetup />
  </IntegrationFormSession>
);
