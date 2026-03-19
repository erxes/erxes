import { useCreateMilestone } from '@/project/hooks/useCreateMilestone';
import { IconPlus } from '@tabler/icons-react';
import { useFormContext } from 'react-hook-form';
import { MilestoneFields } from './MilestoneFields';

type Props = {
  projectId: string;
  isActive: boolean;
  setActiveMilestone: (milestoneId: string | null) => void;
};

export const AddMilestone = ({
  projectId,
  isActive,
  setActiveMilestone,
}: Props) => {
  const { createMilestone } = useCreateMilestone();

  const { reset } = useFormContext();

  const onSubmit = async (data: any) => {
    createMilestone({
      variables: {
        ...data,
        projectId,
      },
      onCompleted: () => {
        reset();
        setActiveMilestone(null);
      },
    });
  };

  const handleClick = () => {
    reset();

    setActiveMilestone('');
  };

  const triggerContent = (
    <div className="flex items-center justify-between">
      Milestone <IconPlus size={16} strokeWidth={2} />
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
