import { EMAPPEARANCE_SCHEMA } from '@/integrations/erxes-messenger/constants/emAppearanceSchema';
import { EM_CONFIG_SCHEMA } from '@/integrations/erxes-messenger/constants/emConfigSchema';
import { EMGREETING_SCHEMA } from '@/integrations/erxes-messenger/constants/emGreetingSchema';
import { EMHOURS_SCHEMA } from '@/integrations/erxes-messenger/constants/emHoursSchema';
import { EMINTRO_SCHEMA } from '@/integrations/erxes-messenger/constants/emIntroSchema';
import { EM_SETTINGS_SCHEMA } from '@/integrations/erxes-messenger/constants/emSettingsSchema';
import { STORAGE_KEYS } from '@/integrations/erxes-messenger/constants/emStatesDefaultValues';
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { z } from 'zod';

// Setup state atoms
export const erxesMessengerSetupStepAtom = atomWithStorage<number>(
  STORAGE_KEYS.SETUP_STEP,
  1,
);

export const erxesMessengerSetupSheetOpenAtom = atom(false);

export const erxesMessengerSetupEditSheetOpenAtom = atom<false | string>(false);

export const settedIntegrationDetailAtom = atomWithStorage(
  'settedIntegrationDetail',
  false,
);

// Step-specific atoms
export const erxesMessengerSetupAppearanceAtom = atomWithStorage<z.infer<
  typeof EMAPPEARANCE_SCHEMA
> | null>(STORAGE_KEYS.APPEARANCE, null, undefined, {
  getOnInit: true,
});

export const erxesMessengerSetupGreetingAtom = atomWithStorage<z.infer<
  typeof EMGREETING_SCHEMA
> | null>(STORAGE_KEYS.GREETING, null, undefined, {
  getOnInit: true,
});

export const erxesMessengerSetupIntroAtom = atomWithStorage<z.infer<
  typeof EMINTRO_SCHEMA
> | null>(STORAGE_KEYS.INTRO, null, undefined, {
  getOnInit: true,
});

export const erxesMessengerSetupHoursAtom = atomWithStorage<z.infer<
  typeof EMHOURS_SCHEMA
> | null>(STORAGE_KEYS.HOURS, null, undefined, {
  getOnInit: true,
});

export const erxesMessengerSetupSettingsAtom = atomWithStorage<z.infer<
  typeof EM_SETTINGS_SCHEMA
> | null>(STORAGE_KEYS.SETTINGS, null, undefined, {
  getOnInit: true,
});

export const erxesMessengerSetupConfigAtom = atomWithStorage<z.infer<
  typeof EM_CONFIG_SCHEMA
> | null>(STORAGE_KEYS.CONFIG, null, undefined, {
  getOnInit: true,
});
