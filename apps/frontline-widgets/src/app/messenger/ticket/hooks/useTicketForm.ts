import { useAtomValue } from 'jotai';
import { z } from 'zod';
import { selectedTicketConfigAtom } from '../../states';
import {
  MULTI_VALUE_PROPERTY_TYPES,
  generateTicketSchema,
} from '@libs/generateTicketSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { getLocalStorageItem } from '@libs/utils';

export const useTicketForm = () => {
  const ticketConfig = useAtomValue(selectedTicketConfigAtom);
  const ticketSchema = generateTicketSchema(ticketConfig);

  let erxes: any = {};
  try {
    erxes = JSON.parse(getLocalStorageItem('erxes') ?? '{}');
  } catch {
    erxes = {};
  }

  const propertiesData = (ticketConfig?.propertyFields ?? []).reduce<
    Record<string, string | string[] | boolean | undefined>
  >((acc, propertyField) => {
    if (MULTI_VALUE_PROPERTY_TYPES.includes(propertyField.type || '')) {
      acc[propertyField.fieldId] = [];
    } else if (propertyField.type === 'boolean') {
      acc[propertyField.fieldId] = false;
    } else if (propertyField.type === 'date') {
      acc[propertyField.fieldId] = undefined;
    } else {
      acc[propertyField.fieldId] = '';
    }

    return acc;
  }, {});

  const defaultValues =
    erxes?.emails?.length > 0
      ? {
          email: erxes?.visitorContactInfo?.email || erxes?.emails?.[0],
          phoneNumber: erxes?.visitorContactInfo?.phone || erxes?.phones?.[0],
          propertiesData,
        }
      : {
          phoneNumber: erxes?.visitorContactInfo?.phone || erxes?.phones?.[0],
          propertiesData,
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
