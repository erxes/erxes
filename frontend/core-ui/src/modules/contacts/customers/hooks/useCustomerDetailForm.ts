import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import {
  buildCustomerSchema,
  ICustomerDetail,
  ICustomerFormValues,
  ISystemFieldRules,
} from 'ui-modules';

const toFormValues = (
  customer?: ICustomerDetail | null,
): ICustomerFormValues => ({
  state: customer?.state || '',
  avatar: customer?.avatar || null,
  firstName: customer?.firstName || '',
  lastName: customer?.lastName || '',
  middleName: customer?.middleName || '',
  sex: customer?.sex ?? null,
  birthDate: customer?.birthDate ? new Date(customer.birthDate) : null,
  primaryEmail: customer?.primaryEmail || '',
  primaryPhone: customer?.primaryPhone || '',
  phones: (customer?.phones ?? []).filter((p): p is string => p != null),
  emails: (customer?.emails ?? []).filter((e): e is string => e != null),
  ownerId: customer?.ownerId || '',
  description: customer?.description || '',
  isSubscribed: customer?.isSubscribed || 'Yes',
  links: {},
  code: customer?.code || '',
  phoneValidationStatus: customer?.phoneValidationStatus || 'unknown',
});

export const useCustomerDetailForm = (
  customer: ICustomerDetail | null | undefined,
  rules: ISystemFieldRules,
) => {
  // Rules arrive after the form mounts; validate against the latest ones.
  const schemaRef = useRef(buildCustomerSchema(rules));
  schemaRef.current = useMemo(() => buildCustomerSchema(rules), [rules]);

  const values = useMemo(() => toFormValues(customer), [customer]);

  return useForm<ICustomerFormValues>({
    resolver: (formValues, context, options) =>
      zodResolver(schemaRef.current)(formValues, context, options),
    values,
  });
};
