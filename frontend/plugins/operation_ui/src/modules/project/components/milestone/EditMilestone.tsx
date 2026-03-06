import { useUpdateMilestone } from '@/project/hooks/useUpdateMilestone';
import { IMilestone, IMilestoneProgress } from '@/project/types';
import { IconTrash } from '@tabler/icons-react';
import { format } from 'date-fns';
import { useFormContext } from 'react-hook-form';
import { MilestoneFields } from './MilestoneFields';
import { MilestoneInline } from './MilestoneInline';
import { useQueryState } from 'erxes-ui';

type Props = {
  milestone: IMilestone & IMilestoneProgress;
  extraContent?: React.ReactNode;
  isActive: boolean;
  setActiveMilestone: (milestoneId: string | null) => void;
};

export const EditMilestone = ({
  milestone,
  extraContent,
  isActive,
  setActiveMilestone,
}: Props) => {
  const { removeMilestone } = useUpdateMilestone();

  const { reset } = useFormContext();
  const [, setMilestoneId] = useQueryState('milestone');
  const handleClick = () => {
    setMilestoneId(milestone._id);
  };

  const onRemove = (e: React.MouseEvent) => {
    e.stopPropagation();

    removeMilestone({
      variables: {
        _id: milestone._id,
      },
      onCompleted: () => {
        reset();
        setActiveMilestone(null);
      },
    });
  };

  const triggerContent = (
    <div className="relative flex justify-between group">
      <div className="flex-1 min-w-0 max-w-[140px]">
        <div className="truncate">
          <MilestoneInline
            milestoneId={milestone._id}
            milestone={milestone}
            className="inline gap-1 items-center font-medium"
          />
          <span className="pl-2 text-xs text-muted-foreground whitespace-nowrap">
            {milestone.targetDate && format(milestone.targetDate, 'MMM d')}
          </span>
        </div>
      </div>

      <div className="flex gap-2 items-center shrink-0 transition-transform group-hover:-translate-x-7">
        {extraContent}
      </div>

      <div
        onClick={onRemove}
        className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-full group-hover:-translate-x-4 transition-transform"
      >
        <IconTrash className="size-4 cursor-pointer" />
      </div>
    </div>
  );

  return (
    <MilestoneFields
      isActive={isActive}
      triggerContent={triggerContent}
      onSubmit={() => undefined}
      onClick={handleClick}
      setActiveMilestone={setActiveMilestone}
    />
  );
};
