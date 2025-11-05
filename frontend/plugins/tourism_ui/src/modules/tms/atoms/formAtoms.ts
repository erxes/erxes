import { atom } from 'jotai';
import { atomWithStorage, RESET } from 'jotai/utils';

type TmsFormStorage = TmsForm;

export type TmsForm = {
  name: string;
  color: string;
  logo: string;
  favIcon: string;
  generalManager: string[];
  managers: string[];
  payment: string;
  token: string;
  otherPayments: Array<{
    type: string;
    title: string;
    icon: string;
    config?: string;
  }>;
};

const DEFAULT_STORAGE_FORM: TmsFormStorage = {
  name: '',
  color: '#4F46E5',
  logo: '',
  favIcon: '',
  generalManager: [],
  managers: [],
  payment: '',
  token: '',
  otherPayments: [],
};

export const DEFAULT_TMS_FORM: TmsForm = {
  name: '',
  color: '#4F46E5',
  logo: '',
  favIcon: '',
  generalManager: [],
  managers: [],
  payment: '',
  token: '',
  otherPayments: [],
};

const tmsFormStorageAtom = atomWithStorage<TmsFormStorage>(
  'tms_form_data',
  DEFAULT_STORAGE_FORM,
);

export const tmsFormAtom = atom(
  (get) => {
    const storage = get(tmsFormStorageAtom);
    return {
      ...DEFAULT_TMS_FORM,
      ...storage,
    };
  },
  (get, set, update: TmsForm) => {
    const prev = get(tmsFormStorageAtom);
    set(tmsFormStorageAtom, {
      ...prev,
      ...update,
    });
  },
);

export const resetFormAtom = atom(null, (get, set) => {
  set(tmsFormStorageAtom, RESET);
});
