import { useAtomValue } from 'jotai';
import { z } from 'zod';
import { ticketConfigAtom } from '../../states';
import { generateTicketSchema } from '@libs/generateTicketSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

export const useTicketForm = () => {
  const ticketConfig = useAtomValue(ticketConfigAtom);
  const ticketSchema = generateTicketSchema(ticketConfig);

  const form = useForm<z.infer<typeof ticketSchema>>({
    mode: 'onBlur',
    defaultValues: {},
    resolver: zodResolver(ticketSchema as any),
  });

  return {
    form,
    ticketSchema,
  };
};
