import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { TPhones } from '../components/PhoneField';

export const showPhoneInputFamilyState = atomFamily((recordId: string) =>
  atom(false),
);

export const phonesFamilyState = atomFamily((recordId: string) =>
  atom<TPhones>([]),
);

export const editingPhoneFamilyState = atomFamily((recordId: string) =>
  atom<string | null>(null),
);
