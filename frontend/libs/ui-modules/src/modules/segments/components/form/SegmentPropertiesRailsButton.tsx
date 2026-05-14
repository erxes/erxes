import { cn } from 'erxes-ui';
import { useSegment } from '../../context/SegmentProvider';
import { useWatch } from 'react-hook-form';
import { createFieldNameSafe } from '../../utils/segmentFormUtils';
import { TConditionsConjunction } from '../../types';
import { useSegmentGroup } from '../../context/SegmentGroupProvider';

export const SegmentPropertiesRailsButton = ({ index }: { index: number }) => {
  const { isAbleToShow, isOdd, conditionsConjunction, handleClick } =
    useSegmentPropertiesRailsButton({ index });
  if (!isAbleToShow) {
    return null;
  }
  return (
    <div
      className={cn(
        'absolute z-10 -left-1 cursor-pointer hover:bg-amber-200 text-amber-600/50 w-12 h-6 flex items-center justify-center rounded-full bg-amber-100 text-amber-600 text-xs font-medium transition',
        {
          '-top-3': isOdd,
          'bg-green-100 text-green-600 hover:bg-green-100 hover:text-green-600/50':
            conditionsConjunction === TConditionsConjunction.AND,
        },
      )}
      onClick={handleClick}
    >
      {conditionsConjunction.toUpperCase() || 'OR'}
    </div>
  );
};

type TConditionConjunctionField =
  | `conditionSegments.${number}.conditionsConjunction`
  | 'conditionsConjunction';

const useSegmentPropertiesRailsButton = ({ index }: { index: number }) => {
  const { form } = useSegment();
  const { totalFields, fieldPath } = useSegmentGroup();
  const { setValue } = form;
  const hasTwoElement = totalFields === 2;
  const isOdd = Math.round(totalFields) % 2 === 0;
  const middleIndex = Math.round(totalFields / 2) + (isOdd ? 1 : 0);
  const isAbleToShow =
    middleIndex === index + 1 || (hasTwoElement && index === 1);
  const fieldName = createFieldNameSafe<TConditionConjunctionField>(
    fieldPath,
    'conditionsConjunction',
  );
  const conditionsConjunction = useWatch({
    control: form.control,
    name: fieldName,
  });
  const handleClick = () => {
    setValue(
      fieldName,
      conditionsConjunction === TConditionsConjunction.AND
        ? TConditionsConjunction.OR
        : TConditionsConjunction.AND,
    );
  };
  return {
    hasTwoElement,
    isOdd,
    middleIndex,
    conditionsConjunction: conditionsConjunction ?? '',
    handleClick,
    isAbleToShow,
  };
};
