import { useWatch } from 'react-hook-form';
import { useSegment } from '../context/SegmentProvider';
import { TConditionsConjunction } from '../types';

export const useSegmentGroupsRailsButton = ({
  total,
  index,
}: {
  total: number;
  index: number;
}) => {
  const { form } = useSegment();
  const { setValue } = form;
  const conditionsConjunction = useWatch({
    control: form.control,
    name: 'conditionsConjunction',
  });
  const hasTwoElement = total === 2;
  const isOdd = total % 2 === 0;
  const middleIndex = Math.round(total / 2) + (isOdd ? 1 : 0);
  const handleClick = () => {
    setValue(
      'conditionsConjunction',
      conditionsConjunction === TConditionsConjunction.OR
        ? TConditionsConjunction.AND
        : TConditionsConjunction.OR,
    );
  };

  const isAbleToShow =
    middleIndex === index + 1 || (hasTwoElement && index === 1);

  return {
    hasTwoElement,
    isOdd,
    middleIndex,
    isAbleToShow,
    conditionsConjunction,
    handleClick,
  };
};
