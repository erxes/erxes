import { workingHours } from '@/settings/structure/constants/work-days';
import { WORKING_HOURS_SCHEMA } from '@/settings/structure/schemas/workHoursSchema';
import { IWorkhoursForm } from '@/settings/structure/types/workhours';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

export const useWorkhoursForm = () => {
  const form = useForm<IWorkhoursForm>({
    mode: 'onBlur',
    defaultValues: workingHours,
    resolver: zodResolver(WORKING_HOURS_SCHEMA),
  });
  return { form };
};
