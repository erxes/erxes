import { keyedAtom } from 'erxes-ui/lib/keyed-atom';
import type { TPhones } from '../components/PhoneField';

export const showPhoneInputFamilyState = keyedAtom(false);

export const phonesFamilyState = keyedAtom<TPhones>([]);

export const editingPhoneFamilyState = keyedAtom<string | null>(null);
