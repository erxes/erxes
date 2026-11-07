import { type UseFormReturn } from 'react-hook-form';
import { type IWorkhoursForm } from '@/settings/structure/types/workhours';
import { useQueryState } from 'erxes-ui';
import {
  usePagePanel,
  type PagePanelEntry,
} from '@/side-panel/hooks/usePagePanel';
import { useWorkhoursForm } from './useWorkhoursForm';

export const useWorkhoursPanel = (
  name: string,
): {
  workingHoursId: string | null;
  form: UseFormReturn<IWorkhoursForm>;
  pagePanel: PagePanelEntry;
  close: () => void;
} => {
  const [workingHoursId, setWorkingHoursId] =
    useQueryState<string>('workingHoursId');
  const { form } = useWorkhoursForm();
  const pagePanel = usePagePanel({
    expandable: false,
    name,
    identity: workingHoursId || 'new',
    open: Boolean(workingHoursId),
    onOpenChange: (isOpen) => {
      if (!isOpen) setWorkingHoursId(null);
    },
  });
  return {
    workingHoursId,
    form,
    pagePanel,
    close: () => setWorkingHoursId(null),
  };
};
