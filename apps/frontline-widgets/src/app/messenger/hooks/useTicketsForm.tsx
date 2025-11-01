import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ticketSchema } from '../schema';
import { z } from 'zod';

export type ITicketsFormData = z.infer<typeof ticketSchema>;

export const useTicketsForm = (defaultValues?: ITicketsFormData) => {
  const form = useForm<ITicketsFormData>({
    mode: 'onBlur',
    defaultValues: defaultValues || {
      firstName: '',
      lastName: '',
    },
    resolver: zodResolver(ticketSchema as any),
  });

  return form;
};
