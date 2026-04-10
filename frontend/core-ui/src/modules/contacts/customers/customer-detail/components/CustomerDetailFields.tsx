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
import { Can, useCustomerEdit } from 'ui-modules';
import { useCustomerDetailWithQuery } from '../../hooks/useCustomerDetailWithQuery';

export const CustomerDetailFields = () => {
  const { customerDetail } = useCustomerDetailWithQuery();
  const { customerEdit } = useCustomerEdit();
  const { t } = useTranslation('contact');
  const { toast } = useToast();

  const form = useForm<CustomerFormType>({
    resolver: zodResolver(customerFormSchema),
    values: {
      avatar: customerDetail?.avatar || null,
      firstName: customerDetail?.firstName || '',
      lastName: customerDetail?.lastName || '',
      middleName: customerDetail?.middleName || '',
      sex: customerDetail?.sex || null,
      primaryEmail: customerDetail?.primaryEmail || '',
      primaryPhone: customerDetail?.primaryPhone || '',
      phones: customerDetail?.phones || [],
      emails: customerDetail?.emails || [],
      ownerId: customerDetail?.ownerId || '',
      description: customerDetail?.description || '',
      isSubscribed: customerDetail?.isSubscribed || 'Yes',
      links: customerDetail?.links || {},
      code: customerDetail?.code || '',
      emailValidationStatus: customerDetail?.emailValidationStatus || 'unknown',
      phoneValidationStatus: customerDetail?.phoneValidationStatus || 'unknown',
      state: customerDetail?.state || '',
    },
  });

  if (!customerDetail) return null;

  const {
    tagIds,
    _id,
  } = customerDetail;

  const onSubmit = (data: CustomerFormType) => {
    const {
      emailValidationStatus,
      phoneValidationStatus,
      sex,
      avatar,
      ...rest
    } = data;
    void emailValidationStatus;
    void phoneValidationStatus;

    customerEdit({
      variables: {
        ...rest,
        sex: sex === null ? undefined : sex,
        avatar: avatar === null ? undefined : avatar,
        _id,
      },
      onCompleted: () => {
        toast({ title: t('saved', 'Edited successfully'), variant: 'success' });
      },
      onError: (e) => {
        toast({
          title: t('error', 'Error'),
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
            <Can action="contactsUpdate">
              <Button type="submit">{t('save', 'Save')}</Button>
            </Can>
          </div>
        </form>
      </Form>
    </div>
  );
};
