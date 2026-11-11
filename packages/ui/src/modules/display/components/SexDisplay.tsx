import { SexCodes } from 'erxes-ui/constants';
import { SexCode } from 'erxes-ui/types';

export const SexDisplay = ({
  value = SexCode.NOT_KNOWN,
}: {
  value: SexCode;
}) => {
  return value === SexCode.NOT_KNOWN ? '' : SexCodes[value]?.label ?? '';
};
