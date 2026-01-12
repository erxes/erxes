import {
  FORM_STATES_DEFAULT_VALUES,
  FORM_STORAGE_KEYS,
} from '@/forms/constants/formStatesDefaultValues';
import { atomWithStorage } from 'jotai/utils';
import {
  FORM_GENERAL_SCHEMA,
  FORM_CONTENT_SCHEMA,
  FORM_CONFIRMATION_SCHEMA,
} from '../constants/formSchema';
import { z } from 'zod';

export const formSetupStepAtom = atomWithStorage<number>(
  FORM_STORAGE_KEYS.STEP,
  1,
);

export const formSetupGeneralAtom = atomWithStorage<
  z.infer<typeof FORM_GENERAL_SCHEMA>
>(FORM_STORAGE_KEYS.GENERAL, FORM_STATES_DEFAULT_VALUES.GENERAL, undefined, {
  getOnInit: true,
});

export const formSetupContentAtom = atomWithStorage<
  z.infer<typeof FORM_CONTENT_SCHEMA>
>(FORM_STORAGE_KEYS.CONTENT, FORM_STATES_DEFAULT_VALUES.CONTENT, undefined, {
  getOnInit: true,
});

export const formSetupConfirmationAtom = atomWithStorage<
  z.infer<typeof FORM_CONFIRMATION_SCHEMA>
>(
  FORM_STORAGE_KEYS.CONFIRMATION,
  FORM_STATES_DEFAULT_VALUES.CONFIRMATION,
  undefined,
  {
    getOnInit: true,
  },
);
