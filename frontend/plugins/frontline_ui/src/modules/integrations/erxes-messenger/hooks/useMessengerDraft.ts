import {
  IntegrationDraftContext,
  createIntegrationAtomDraft,
  createIntegrationDraftState,
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
import { useSetAtom, type useStore } from 'jotai';
import { getMessengerSetupValues } from '../states/EMSetupSetAtom';
import type { IEMIntegrationDetail } from '../types/EMStateTypes';
import { useContext, useLayoutEffect, useState } from 'react';

type Store = ReturnType<typeof useStore>;

export const useMessengerSaving = createIntegrationDraftState(false);

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

export const refreshMessengerDraft = (
  store: Store,
  key: string,
  integration: IEMIntegrationDetail,
  submitted?: ReturnType<typeof getMessengerDraftValues>,
): void => {
  const values = getMessengerSetupValues(integration);
  useAppearance.refresh(store, key, values.appearance, submitted?.appearance);
  useConfig.refresh(store, key, values.config, submitted?.config);
  useGreeting.refresh(store, key, values.greeting, submitted?.greeting);
  useHours.refresh(store, key, values.hours, submitted?.hours);
  useIntro.refresh(store, key, values.intro, submitted?.intro);
  useSettings.refresh(store, key, values.settings, submitted?.settings);
  usePopulated.refresh(store, key, true);
};

export const getMessengerDraftValues = (store: Store) => ({
  appearance: store.get(erxesMessengerSetupAppearanceAtom),
  config: store.get(erxesMessengerSetupConfigAtom),
  greeting: store.get(erxesMessengerSetupGreetingAtom),
  hours: store.get(erxesMessengerSetupHoursAtom),
  intro: store.get(erxesMessengerSetupIntroAtom),
  settings: store.get(erxesMessengerSetupSettingsAtom),
});

export const resolveMessengerDraft = (
  store: Store,
  key: string,
  integration: IEMIntegrationDetail,
  draft = getMessengerDraftValues(store),
) => {
  const values = getMessengerSetupValues(integration);
  return {
    appearance: useAppearance.resolve(
      store,
      key,
      values.appearance,
      draft.appearance,
    ),
    config: useConfig.resolve(store, key, values.config, draft.config),
    greeting: useGreeting.resolve(store, key, values.greeting, draft.greeting),
    hours: useHours.resolve(store, key, values.hours, draft.hours),
    intro: useIntro.resolve(store, key, values.intro, draft.intro),
    settings: useSettings.resolve(store, key, values.settings, draft.settings),
  };
};
