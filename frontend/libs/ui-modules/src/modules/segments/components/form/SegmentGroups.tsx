import { cn } from 'erxes-ui';
import { useFieldArray } from 'react-hook-form';
import { useSegment } from 'ui-modules/modules/segments/context/SegmentProvider';
import { SegmentGroup } from './SegmentGroup';

export const SegmentGroups = () => {
  const { form } = useSegment();
  const { watch, control, setValue } = form;
  const { fields, remove } = useFieldArray({
    control,
    name: 'conditionSegments',
  });

  const total = watch(`conditionSegments`)?.length || 0;

  return (
    <>
      {fields.map(({ id }, index) => {
        const isFirst = index === 0;
        const isLast = index === fields.length - 1;

        const renderAndOrBtn = () => {
          const hasTwoElement = total === 2;
          const isOdd = total % 2 === 0;
          const middleIndex = Math.round(total / 2) + (isOdd ? 1 : 0);

          if (middleIndex === index + 1 || (hasTwoElement && index === 1)) {
            const value = watch('conditionsConjunction');
            const handleClick = () => {
              setValue('conditionsConjunction', value === 'or' ? 'and' : 'or');
            };
            return (
              <div
                className={cn(
                  'absolute z-10 -left-1 cursor-pointer hover:bg-amber-200 text-amber-600/50 w-12 h-6 flex items-center justify-center rounded-full bg-amber-100 text-amber-600 text-xs font-medium transition',
                  {
                    '-top-5': isOdd,
                    'bg-green-100 text-green-600 hover:bg-green-100 hover:text-green-600/50':
                      value === 'and',
                  },
                )}
                onClick={handleClick}
              >
                {value?.toUpperCase()}
              </div>
            );
          }
        };

        return (
          <div key={id} className="relative">
            {total > 1 && (
              <div className="absolute left-0 flex items-center h-full">
                {/* Vertical line */}
                {!isFirst && (
                  <div className="absolute top-0 left-[24px] w-[1px] h-1/2 bg-gray-300"></div>
                )}
                {!isLast && (
                  <div className="absolute bottom-0 left-[24px] w-[1px] h-1/2 bg-gray-300"></div>
                )}

                {/* Horizontal line */}
                <div className="absolute left-[24px] w-[20px] h-[1px] bg-gray-300"></div>

                {/* OR label (only on second item) */}
                {renderAndOrBtn()}
              </div>
            )}
            <div className={cn('relative pt-4', { 'pl-12': total > 1 })}>
              <SegmentGroup
                parentFieldName={`conditionSegments.${index}`}
                onRemove={() => remove(index)}
              />
            </div>
          </div>
        );
      })}
    </>
  );
};
