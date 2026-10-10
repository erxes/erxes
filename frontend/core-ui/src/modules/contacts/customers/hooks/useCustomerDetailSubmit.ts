import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  ICustomerDetail,
  ICustomerFormValues,
  useCustomerEdit,
} from 'ui-modules';
import { useChangeCustomerState } from './useChangeCustomerState';

export const useCustomerDetailSubmit = (
  customer: ICustomerDetail | null | undefined,
) => {
  const { customerEdit } = useCustomerEdit();
  const { changeCustomerState } = useChangeCustomerState();
  const { t } = useTranslation('contact', { keyPrefix: 'customer' });
  const { toast } = useToast();

  const onError = (e: Error) =>
    toast({
      title: t('error', 'Update Failed'),
      description:
        e.message || t('error', 'Failed to update customer details.'),
      variant: 'destructive',
    });

  // Verification statuses and links have their own flows; this form never sends them.
  const submit = async (values: ICustomerFormValues) => {
    if (!customer) {
      return;
    }

    if (values.state !== (customer.state ?? '')) {
      await changeCustomerState([customer._id], values.state, { onError });
    }

    customerEdit({
      variables: {
        _id: customer._id,
        avatar: values.avatar ?? undefined,
        firstName: values.firstName,
        middleName: values.middleName,
        lastName: values.lastName,
        code: values.code,
        ownerId: values.ownerId,
        primaryEmail: values.primaryEmail,
        primaryPhone: values.primaryPhone,
        emails: values.emails,
        phones: values.phones,
        sex: values.sex ?? undefined,
        birthDate: values.birthDate ?? undefined,
        description: values.description,
        isSubscribed: values.isSubscribed,
      },
      onCompleted: () => {
        toast({
          title: t('saved', 'Customer details updated successfully.'),
          variant: 'success',
        });
      },
      onError,
    });
  };

  return { submit };
};
