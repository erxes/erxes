import { IPipelineLabel } from '@/deals/types/pipelines';
import Labels from '@/deals/cards/components/detail/overview/label/Labels';
import { Popover } from 'erxes-ui';
import { SelectLabels } from '@/deals/components/common/filters/SelectLabel';

const LabelChooser = ({
  labels,
  targetId,
}: {
  labels: IPipelineLabel[];
  targetId: string;
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Labels labels={labels} />
      <Popover>
        <Popover.Trigger asChild>
          <SelectLabels.FilterBar
            filterKey=""
            mode="multiple"
            label="By Label"
            variant="card"
            targetId={targetId}
          />
        </Popover.Trigger>
      </Popover>
    </div>
  );
};

export default LabelChooser;
