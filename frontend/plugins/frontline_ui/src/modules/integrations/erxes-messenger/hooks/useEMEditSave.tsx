import { useIntegrationDraftSession } from '@/integrations/hooks/useIntegrationDraft';
import { useSidePanel } from 'ui-modules';
import { toast } from 'erxes-ui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { EM_CONFIG_SCHEMA } from '@/integrations/erxes-messenger/constants/emConfigSchema';
import { useEditMessenger } from '@/integrations/erxes-messenger/hooks/useEditMessenger';
import { resetErxesMessengerSetupAtom } from '@/integrations/erxes-messenger/states/EMSetupResetState';
import {
  erxesMessengerSetupConfigAtom,
  erxesMessengerSetupEditSheetOpenAtom,
  erxesMessengerSetupStepAtom,
} from '@/integrations/erxes-messenger/states/erxesMessengerSetupStates';

/** Validates and saves messenger configuration before closing its panel. */
export const useEMEditSave = () => {
  const { t } = useTranslation('frontline');
  const { close } = useSidePanel();
  const { captureRevision, acknowledgeRevision, isActive } =
    useIntegrationDraftSession();
  const idToEdit = useAtomValue(erxesMessengerSetupEditSheetOpenAtom);
  const config = useAtomValue(erxesMessengerSetupConfigAtom);
  const setStep = useSetAtom(erxesMessengerSetupStepAtom);
  const resetSetup = useSetAtom(resetErxesMessengerSetupAtom);
  const { editMessenger, loading } = useEditMessenger();

  /** Validates the config step and saves the selected messenger before closing. */
  const save = () => {
    if (!idToEdit) return;

    const parsed = EM_CONFIG_SCHEMA.safeParse(config ?? {});

    if (!parsed.success) {
      setStep(6);
      toast({
        title: t('messenger-config-incomplete', 'Fill in the config step'),
        variant: 'destructive',
      });
      return;
    }

    const submittedRevision = captureRevision();
    editMessenger(idToEdit, parsed.data, () => {
      if (!acknowledgeRevision(submittedRevision)) return;
      if (isActive()) {
        resetSetup();
        close();
      }
    });
  };

  return { canSave: Boolean(idToEdit), save, loading };
};
