import ChecklistItem from './ChecklistItem';
import { useChecklists } from '@/deals/cards/hooks/useChecklists';

export const Checklists = () => {
  const { checklists } = useChecklists();

  return (
    <div className="p-5">
      {checklists?.map((checklist) => (
        <ChecklistItem key={checklist._id} item={checklist} />
      ))}
    </div>
  );
};
