import { cn } from 'erxes-ui';
import { useWatch } from 'react-hook-form';
import { useSegment } from 'ui-modules/modules/segments/context/SegmentProvider';
import { SegmentGroup } from './SegmentGroup';
import { SegmentGroupsRails } from './SegmentGroupsRails';

export const SegmentGroups = () => {
  const { form } = useSegment();
  const { control, setValue } = form;
  const conditionSegments =
    useWatch({
      control,
      name: 'conditionSegments',
    }) || [];

  const total = conditionSegments?.length || 0;

  return (
    <>
      {conditionSegments.map((segment, index) => {
        const segmentKey = segment?.contentType
          ? `${segment.contentType}-${index}`
          : `segment-${index}`;
        return (
          <div key={segmentKey} className="relative min-w-2xl">
            <SegmentGroupsRails total={total} index={index} />
            <div className={cn('relative pt-4', { 'pl-12': total > 1 })}>
              <SegmentGroup
                parentFieldName={`conditionSegments.${index}`}
                onRemove={() =>
                  setValue(
                    'conditionSegments',
                    conditionSegments?.filter((_, i) => i !== index),
                  )
                }
              />
            </div>
          </div>
        );
      })}
    </>
  );
};
