import { useUpdateMilestone } from '@/project/hooks/useUpdateMilestone';
import { IMilestone, IMilestoneProgress } from '@/project/types';
import { format } from 'date-fns';
import { useFormContext } from 'react-hook-form';
import { MilestoneFields } from './MilestoneFields';
import { MilestoneInline } from './MilestoneInline';

type Props = {
  projectId: string;
  milestone: IMilestone & IMilestoneProgress;
  extraContent?: React.ReactNode;
  isActive: boolean;
  setActiveMilestone: (milestoneId: string | null) => void;
};

export const EditMilestone = ({
  projectId,
  milestone,
  extraContent,
  isActive,
  setActiveMilestone,
}: Props) => {
  const { updateMilestone } = useUpdateMilestone();

  const { reset, setValue } = useFormContext();

  const handleClick = () => {
    setValue('name', milestone.name);
    setValue('targetDate', new Date(milestone.targetDate));

    setActiveMilestone(milestone._id);
  };

  const onSubmit = async (data: any) => {
    updateMilestone({
      variables: {
        id: milestone._id,
        ...data,
        projectId,
      },
      onCompleted: () => {
        reset();
        setActiveMilestone(null);
      },
    });
  };

  const triggerContent = (
    <div>
      <span className="truncate">
        <MilestoneInline milestoneId={milestone._id} milestone={milestone} />
        <span className="pl-2 text-xs text-muted-foreground">
          {milestone.targetDate && format(milestone.targetDate, 'MMM d')}
        </span>
      </span>
      {extraContent}
    </div>
  );

  return (
    <MilestoneFields
      isActive={isActive}
      triggerContent={triggerContent}
      onSubmit={onSubmit}
      onClick={handleClick}
      setActiveMilestone={setActiveMilestone}
    />
  );
};
