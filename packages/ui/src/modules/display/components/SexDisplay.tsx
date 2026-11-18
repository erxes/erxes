import { useSexLabels } from 'erxes-ui/constants/SexCodes';
import { SexCode } from 'erxes-ui/types/SexCode';

/** A sex code as its label, or nothing when it is not known. */
export const SexDisplay = ({ value = SexCode.NOT_KNOWN }: { value?: SexCode }) => {
  const labels = useSexLabels();

  return value === SexCode.NOT_KNOWN ? '' : labels[value];
};
