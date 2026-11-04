import {
  IntegrationDraftContext,
  createIntegrationAtomDraft,
} from '@/integrations/hooks/useIntegrationDraft';
import {
  erxesMessengerSetupAppearanceAtom,
  erxesMessengerSetupConfigAtom,
  erxesMessengerSetupEditSheetOpenAtom,
  erxesMessengerSetupGreetingAtom,
  erxesMessengerSetupHoursAtom,
  erxesMessengerSetupIntroAtom,
  erxesMessengerSetupSettingsAtom,
  erxesMessengerSetupStepAtom,
  settedIntegrationDetailAtom,
} from '../states/erxesMessengerSetupStates';
import { useSetAtom } from 'jotai';
import { useContext, useLayoutEffect, useState } from 'react';

const useAppearance = createIntegrationAtomDraft(
  erxesMessengerSetupAppearanceAtom,
  null,
);
const useConfig = createIntegrationAtomDraft(
  erxesMessengerSetupConfigAtom,
  null,
);
const useGreeting = createIntegrationAtomDraft(
  erxesMessengerSetupGreetingAtom,
  null,
);
const useHours = createIntegrationAtomDraft(erxesMessengerSetupHoursAtom, null);
const useIntro = createIntegrationAtomDraft(erxesMessengerSetupIntroAtom, null);
const useSettings = createIntegrationAtomDraft(
  erxesMessengerSetupSettingsAtom,
  null,
);
const useStep = createIntegrationAtomDraft(erxesMessengerSetupStepAtom, 1);
const usePopulated = createIntegrationAtomDraft(
  settedIntegrationDetailAtom,
  false,
);

/** Restores this messenger's memory draft before any editor effects write values. */
export const useMessengerDraft = (editId: string | false): boolean => {
  const key = useContext(IntegrationDraftContext);
  const [readyKey, setReadyKey] = useState<string>();
  useAppearance();
  useConfig();
  useGreeting();
  useHours();
  useIntro();
  useSettings();
  useStep();
  usePopulated();
  const setEditId = useSetAtom(erxesMessengerSetupEditSheetOpenAtom);
  useLayoutEffect(() => {
    setEditId(editId);
    setReadyKey(key);
    return () => setEditId(false);
  }, [editId, key, setEditId]);
  return readyKey === key;
};
