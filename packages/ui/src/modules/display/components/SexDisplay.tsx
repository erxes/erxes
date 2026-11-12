import { SexCodes } from 'erxes-ui/constants/SexCodes';
import { SexCode } from 'erxes-ui/types/SexCode';

export const SexDisplay = ({ value = SexCode.NOT_KNOWN }: { value?: SexCode }) =>
  value === SexCode.NOT_KNOWN ? '' : SexCodes[value].label;
