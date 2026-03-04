import { CustomerAddGeneralInformationFields } from '@/contacts/customers/components/CustomerAddGeneralInformationFields';
import { CustomerDetailSelectTag } from '@/contacts/customers/customer-detail/components/CustomerDetailSelectTag';
import {
  customerFormSchema,
  CustomerFormType,
} from '@/contacts/customers/constants/formSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, useToast } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useCustomerEdit } from 'ui-modules';
import { useCustomerDetailWithQuery } from '../../hooks/useCustomerDetailWithQuery';

export const CustomerDetailFields = () => {
  const { customerDetail } = useCustomerDetailWithQuery();
  const { customerEdit } = useCustomerEdit();
  const { t } = useTranslation('contact');
  const { toast } = useToast();

  if (!customerDetail) return null;

  const {
    primaryEmail,
    primaryPhone,
    emails,
    emailValidationStatus,
    tagIds,
    ownerId,
    code,
    _id,
    isSubscribed,
    description,
    phones,
    phoneValidationStatus,
    avatar,
    firstName,
    lastName,
    middleName,
    sex,
    links,
    state,
  } = customerDetail;

  const form = useForm<CustomerFormType>({
    resolver: zodResolver(customerFormSchema),
    values: {
      avatar: avatar || null,
      firstName: firstName || '',
      lastName: lastName || '',
      middleName: middleName || '',
      sex: sex || null,
      primaryEmail: primaryEmail || '',
      primaryPhone: primaryPhone || '',
      phones: phones || [],
      emails: emails || [],
      ownerId: ownerId || '',
      description: description || '',
      isSubscribed: isSubscribed || 'Yes',
      links: links || {},
      code: code || '',
      emailValidationStatus: emailValidationStatus || 'unknown',
      phoneValidationStatus: phoneValidationStatus || 'unknown',
      state: state || '',
    },
  });

  const onSubmit = (data: CustomerFormType) => {
    const { emailValidationStatus, phoneValidationStatus, sex, avatar, ...rest } = data;

    customerEdit({
      variables: {
        ...rest,
        sex: sex === null ? undefined : sex,
        avatar: avatar === null ? undefined : avatar,
        _id,
      },
      onCompleted: () => {
        toast({ title: t('saved') || 'Saved', variant: 'success' });
      },
      onError: (e) => {
        toast({
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <div className="py-8 space-y-6">
      <CustomerDetailSelectTag tagIds={tagIds || []} customerId={_id} />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-8">
          <CustomerAddGeneralInformationFields form={form} />
          <div className="flex justify-end">
            <Button type="submit">{t('save', 'Save')}</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
