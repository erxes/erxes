import { FORM_STORAGE_KEYS } from '@/forms/constants/formStatesDefaultValues';
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
>(
  FORM_STORAGE_KEYS.GENERAL,
  {
    primaryColor: '#4f46e5',
    appearance: 'iframe',
    title: 'title',
    description: '',
    buttonText: '',
  },
  undefined,
  {
    getOnInit: true,
  },
);

export const formSetupContentAtom = atomWithStorage<
  z.infer<typeof FORM_CONTENT_SCHEMA>
>(FORM_STORAGE_KEYS.CONTENT, {
  steps: {
    initial: {
      name: 'Initial step',
      description: 'Initial step description',
      order: 1,
      fields: [],
    },
  },
});

export const formSetupConfirmationAtom = atomWithStorage<
  z.infer<typeof FORM_CONFIRMATION_SCHEMA>
>(FORM_STORAGE_KEYS.CONFIRMATION, {
  title: 'title',
  description: 'description',
  image: null,
});
