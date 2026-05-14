import { useForm } from 'react-hook-form';
import { TTicketCheckProgressForm, TTicketForgotProgressForm } from '../types';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  TicketForgotProgressSchema,
  TicketCheckProgressSchema,
} from '../../schema';

export const useTicketProgressForms = () => {
  const method = useForm<TTicketCheckProgressForm>({
    mode: 'onBlur',
    resolver: zodResolver(TicketCheckProgressSchema),
  });
  const forgotMethod = useForm<TTicketForgotProgressForm>({
    mode: 'onBlur',
    resolver: zodResolver(TicketForgotProgressSchema),
  });

  return {
    method,
    forgotMethod,
  };
};
