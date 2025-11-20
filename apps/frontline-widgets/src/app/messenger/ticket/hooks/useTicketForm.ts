import { useAtomValue } from 'jotai';
import { z } from 'zod';
import { ticketConfigAtom } from '../../states';
import { generateTicketSchema } from '@libs/generateTicketSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { getLocalStorageItem } from '@libs/utils';

export const useTicketForm = () => {
  const ticketConfig = useAtomValue(ticketConfigAtom);
  const ticketSchema = generateTicketSchema(ticketConfig);
  const erxes = JSON.parse(getLocalStorageItem('erxes') ?? '{}');

  const defaultValues =
    erxes?.emails?.length > 0
      ? {
          email: erxes?.visitorContactInfo?.email || erxes?.emails?.[0],
          phoneNumber: erxes?.visitorContactInfo?.phone || erxes?.phones?.[0],
        }
      : {
          phoneNumber: erxes?.visitorContactInfo?.phone || erxes?.phones?.[0],
        };

  const form = useForm<z.infer<typeof ticketSchema>>({
    mode: 'onBlur',
    defaultValues: defaultValues,
    resolver: zodResolver(ticketSchema as any),
  });

  return {
    form,
    ticketSchema,
  };
};
