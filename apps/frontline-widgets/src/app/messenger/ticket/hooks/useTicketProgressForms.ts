import { useForm } from 'react-hook-form';
import { TTicketCheckProgressForm } from '../types';
import { zodResolver } from '@hookform/resolvers/zod';
import { TicketCheckProgressSchema } from '../../schema';

export const useTicketProgressForms = () => {
  const method = useForm<TTicketCheckProgressForm>({
    mode: 'onBlur',
    resolver: zodResolver(TicketCheckProgressSchema),
  });
  return { method };
};
