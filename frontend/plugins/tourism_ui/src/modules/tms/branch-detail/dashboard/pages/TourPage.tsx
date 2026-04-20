import { IBranch } from '@/tms/types/branch';
import { TourFilter, ToursView, ToursViewControl } from '../tours';
import { PageSubHeader, ToggleGroup, useQueryState } from 'erxes-ui';

export const TourPage = ({ branch }: { branch: IBranch }) => {
  const [view] = useQueryState<string | undefined>('view');
  const [isGroup, setIsGroup] = useQueryState<boolean>('isGroup');
  return (
    <div className="flex flex-col h-full">
      <PageSubHeader>
        <TourFilter branchId={branch._id} />
        <div className="flex gap-2 items-center ml-auto">
          {(view || 'table') === 'table' && (
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
          )}
          <ToursViewControl />
        </div>
      </PageSubHeader>
      <div className="overflow-hidden flex-auto p-3 min-h-0">
        <div className="flex flex-col h-full min-h-0">
          <ToursView
            branchId={branch._id}
            branchLanguages={branch.languages}
            mainLanguage={branch.language}
          />
        </div>
      </div>
    </div>
  );
};
