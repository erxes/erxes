import { useSegmentGroup } from '../../context/SegmentGroupProvider';
import { SegmentProperty } from './SegmentProperty';

export const SegmentGroupConditionsList = () => {
  const { conditionFields } = useSegmentGroup();
  return (
    <div className="flex flex-col ">
      {(conditionFields || []).map((field, index) => (
        <div key={field.id}>
          <SegmentProperty index={index} />
        </div>
      ))}
    </div>
  );
};
