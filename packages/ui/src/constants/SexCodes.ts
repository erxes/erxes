import { SexCode } from 'erxes-ui/types';

export const SexCodes: Record<SexCode, { label: string }> = {
  [SexCode.NOT_KNOWN]: {
    label: 'Not known',
  },
  [SexCode.MALE]: {
    label: 'Male',
  },
  [SexCode.FEMALE]: {
    label: 'Female',
  },
  [SexCode.NOT_APPLICABLE]: {
    label: 'Not applicable',
  },
};
