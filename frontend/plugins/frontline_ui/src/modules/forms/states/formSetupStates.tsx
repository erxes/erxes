import { FORM_STORAGE_KEYS } from '@/forms/constants/formStatesDefaultValues';
import { atomWithStorage } from 'jotai/utils';
import {
  FORM_APPEARENCE_SCHEMA,
  FORM_CONTENT_SCHEMA,
} from '../constants/formSchema';
import { z } from 'zod';

export const formSetupStepAtom = atomWithStorage<number>(
  FORM_STORAGE_KEYS.STEP,
  1,
);

export const formSetupAppearanceAtom = atomWithStorage<
  z.infer<typeof FORM_APPEARENCE_SCHEMA>
>(
  FORM_STORAGE_KEYS.APPEARANCE,
  {
    primaryColor: '#000',
    appearance: 'iframe',
  },
  undefined,
  {
    getOnInit: true,
  },
);

export const formSetupContentAtom = atomWithStorage<
  z.infer<typeof FORM_CONTENT_SCHEMA>
>(
  FORM_STORAGE_KEYS.CONTENT,
  {
    title: '',
    description: '',
    buttonText: '',
    fields: [],
  },
  undefined,
  {
    getOnInit: true,
  },
);
