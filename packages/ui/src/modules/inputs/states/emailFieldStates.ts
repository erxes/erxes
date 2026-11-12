import { keyedAtom } from 'erxes-ui/lib/keyed-atom';
import type { TEmails } from '../components/EmailField';

export const showEmailInputFamilyState = keyedAtom(false);

export const emailsFamilyState = keyedAtom<TEmails>([]);

export const editingEmailFamilyState = keyedAtom<string | null>(null);
