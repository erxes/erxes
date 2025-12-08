import { IPipelineLabel } from '@/deals/types/pipelines';
import { IconPlus } from '@tabler/icons-react';
import Labels from '@/deals/cards/components/detail/overview/label/Labels';
import { Popover } from 'erxes-ui';
import { SelectLabelsCommand, SelectLabelsProvider, SelectLabelsContent } from '~/modules/deals/components/common/filters/SelectLabel';
import { useState } from 'react';

const LabelChooser = ({ labels }: { labels: IPipelineLabel[] }) => {
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

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
          <SelectLabelsProvider
            value={selectedLabels}
            onValueChange={setSelectedLabels}
            mode="multiple"
          >
            <SelectLabelsContent />
          </SelectLabelsProvider>
        </Popover.Content>
      </Popover>
    </div>
  );
};

export default LabelChooser;
