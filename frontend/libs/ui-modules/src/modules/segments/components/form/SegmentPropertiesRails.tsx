import { useSegmentGroup } from '../../context/SegmentGroupProvider';
import { SegmentPropertiesRailsButton } from './SegmentPropertiesRailsButton';

export const SegmentPropertiesRails = ({ index }: { index: number }) => {
  const { totalFields } = useSegmentGroup();
  if (totalFields < 2) {
    return null;
  }
  const lastIndex = totalFields - 1;

  const isFirst = index === 0;
  const isLast = index === lastIndex;

  return (
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
      <SegmentPropertiesRailsButton index={index} />
    </div>
  );
};
