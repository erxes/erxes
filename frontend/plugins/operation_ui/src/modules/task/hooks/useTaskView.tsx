import { tasksViewAtom } from '@/task/states/tasksViewState';
import { useAtomValue } from 'jotai';
import { useParams } from 'react-router';

export const useTaskView = () => {
  const { teamId } = useParams();
  const view = useAtomValue(tasksViewAtom);

  return view === 'list' || !teamId ? 'list' : view;
};
