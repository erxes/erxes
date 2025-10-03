import { TmsCreateSheetHeader } from '@/tms/components/CreateTmsSheet';

import { Sheet, Form, useToast } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { TmsFormSchema, TmsFormType } from '@/tms/constants/formSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { ApolloError } from '@apollo/client';
import { TmsInformationFields } from '@/tms/components/TmsInformationFields';
import Preview from '@/tms/components/Preview';
import { useCreateBranch } from '../hooks/CreateBranch';

const CreateTmsForm = ({
  onOpenChange,
  onSuccess,
}: {
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}) => {
  const { createBranch } = useCreateBranch();
  const form = useForm<TmsFormType>({
    resolver: zodResolver(TmsFormSchema),
    defaultValues: {
      name: '',
      color: '#4F46E5',
      logo: '',
      favIcon: '',
      generalManeger: '',
      manegers: [],
      payment: '',
      token: '',
      otherPayments: [],
    },
  });

  const watchedValues = form.watch();
  const { toast } = useToast();

  const onSubmit = (data: TmsFormType) => {
    createBranch({
      variables: {
        name: data.name,
        user1Ids: data.generalManeger ? [data.generalManeger] : undefined,
        user2Ids: data.manegers || undefined,
        paymentIds: data.payment ? [data.payment] : undefined,
        token: data.token,
        erxesAppToken: '',
        uiOptions: {
          logo: data.logo,
          favIcon: data.favIcon,
          colors: {
            primary: data.color,
          },
        },
      },
      onError: (e: ApolloError) => {
        toast({
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        });
      },
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Branch created successfully',
        });
        form.reset();
        onOpenChange?.(false);
        onSuccess?.();
      },
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col h-full"
      >
        <TmsCreateSheetHeader />
        <Sheet.Content className="grid grid-cols-2">
          <TmsInformationFields
            form={form}
            onOpenChange={onOpenChange}
            onSubmit={onSubmit}
          />
          <Preview formData={watchedValues} />
        </Sheet.Content>
      </form>
    </Form>
  );
};

export default CreateTmsForm;
