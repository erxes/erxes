import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { TEmails } from '../components/EmailField';

export const showEmailInputFamilyState = atomFamily((recordId: string) =>
  atom(false),
);

export const emailsFamilyState = atomFamily((recordId: string) =>
  atom<TEmails>([]),
);

export const editingEmailFamilyState = atomFamily((recordId: string) =>
  atom<string | null>(null),
);
