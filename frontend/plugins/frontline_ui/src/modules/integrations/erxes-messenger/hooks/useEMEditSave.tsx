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

/**
 * Lets an edit be saved from any step: every step already keeps its values in
 * its atom, so only the config step's required fields need checking.
 */
export const useEMEditSave = () => {
  const { t } = useTranslation('frontline');
  const idToEdit = useAtomValue(erxesMessengerSetupEditSheetOpenAtom);
  const config = useAtomValue(erxesMessengerSetupConfigAtom);
  const setStep = useSetAtom(erxesMessengerSetupStepAtom);
  const resetSetup = useSetAtom(resetErxesMessengerSetupAtom);
  const { editMessenger, loading } = useEditMessenger();

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

    editMessenger(idToEdit, parsed.data, () => resetSetup());
  };

  return { canSave: Boolean(idToEdit), save, loading };
};
