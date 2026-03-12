import { IBranch } from '@/tms/types/branch';
import { TourFilter, TourGroupList, TourRecordTable } from '../tours';
import { PageSubHeader, ToggleGroup, useQueryState } from 'erxes-ui';

export const TourPage = ({ branch }: { branch: IBranch }) => {
  const [isGroup, setIsGroup] = useQueryState<boolean>('isGroup');

  return (
    <>
      <PageSubHeader>
        <TourFilter />
        <div className="flex gap-2 items-center ml-auto">
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            value={isGroup ? 'grouped' : 'list'}
            onValueChange={(value) => {
              if (!value) return;
              setIsGroup(value === 'grouped' ? true : null);
            }}
          >
            <ToggleGroup.Item value="list">Tours</ToggleGroup.Item>
            <ToggleGroup.Item value="grouped">Grouped</ToggleGroup.Item>
          </ToggleGroup>
        </div>
      </PageSubHeader>
      <div className="overflow-hidden flex-auto p-3">
        <div className="h-full">
          {isGroup ? (
            <TourGroupList branchId={branch._id} />
          ) : (
            <TourRecordTable branchId={branch._id} />
          )}
        </div>
      </div>
    </>
  );
};
