import { IPipelineLabel } from '@/deals/types/pipelines';
import { IconPlus } from '@tabler/icons-react';
import LabelOverlay from './LabelOverlay';
import Labels from '@/deals/cards/components/detail/overview/label/Labels';
import { Popover } from 'erxes-ui';

const LabelChooser = ({ labels }: { labels: IPipelineLabel[] }) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Labels labels={labels} />
      <Popover>
        <Popover.Trigger asChild>
          <div className="flex items-center gap-1 min-h-8 cursor-pointer">
            <IconPlus size={16} />
            Add label
          </div>
        </Popover.Trigger>

        <Popover.Content className="w-80">
          <LabelOverlay labels={labels} />
        </Popover.Content>
      </Popover>
    </div>
  );
};

export default LabelChooser;
