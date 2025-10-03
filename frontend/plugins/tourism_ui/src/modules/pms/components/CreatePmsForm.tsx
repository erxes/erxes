import { Form, useToast } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ApolloError } from '@apollo/client';
import { usePmsCreateBranch } from '../hooks/usePmsCreateBranch';
import {
  PmsBranchFormSchema,
  PmsBranchFormType,
} from '../constants/formSchema';
import {
  CreatePmsSheetContentLayout,
  PmsCreateSheetFooter,
  PmsCreateSheetHeader,
} from './CreatePmsSheet';
import { CreatePmsFormContent } from './CreatePmsFormContent';

const CreatePmsForm = ({
  onOpenChange,
  onSuccess,
}: {
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}) => {
  const { createPmsBranch } = usePmsCreateBranch();

  const form = useForm<PmsBranchFormType>({
    resolver: zodResolver(PmsBranchFormSchema),
    defaultValues: {
      name: '',
      description: '',
      checkInTime: '',
      checkInAmount: 0,
      checkOutTime: '',
      checkOutAmount: 0,
      discounts: [],
      websiteReservationLock: false,
      time: '',
      paymentIds: [],
      erxesAppToken: '',
      otherPayments: [],
      generalManagerIds: [],
      managerIds: [],
      reservationManagerIds: [],
      receptionIds: [],
      housekeeperIds: [],
      logo: '',
      color: '',
      website: '',
      boardId: '',
      pipelineId: '',
      stageId: '',
      roomsCategoryId: '',
      extrasCategoryId: '',
    },
  });

  const { toast } = useToast();

  const onSubmit = (data: PmsBranchFormType) => {
    createPmsBranch({
      variables: {
        name: data.name,
        description: data.description || '',
        erxesAppToken: data.erxesAppToken || '',
        user1Ids: data.generalManagerIds || [],
        user2Ids: data.managerIds || [],
        user3Ids: data.reservationManagerIds || [],
        user4Ids: data.receptionIds || [],
        user5Ids: data.housekeeperIds || [],
        paymentIds: data.paymentIds || [],
        uiOptions: {
          logo: data.logo || '',
          colors: { primary: data.color || '' },
        },
        pipelineConfig: {
          boardId: data.boardId || '',
          pipelineId: data.pipelineId || '',
        },
        extraProductCategories:
          (data.extrasCategoryId && [data.extrasCategoryId]) || [],
        roomCategories: (data.roomsCategoryId && [data.roomsCategoryId]) || [],
        discount:
          data.discounts.map((discount) => ({
            _id: '',
            type: discount.type || '',
            title: discount.title || '',
            icon: discount.icon || '',
            config: discount.config || '',
          })) || [],
        time: data.time || '',
        checkintime: data.checkInTime,
        checkouttime: data.checkOutTime,
        checkinamount: data.checkInAmount,
        checkoutamount: data.checkOutAmount,
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
          description: 'PMS created successfully',
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
        <PmsCreateSheetHeader />
        <CreatePmsSheetContentLayout>
          <CreatePmsFormContent form={form} />
        </CreatePmsSheetContentLayout>
        <PmsCreateSheetFooter />
      </form>
    </Form>
  );
};

export default CreatePmsForm;
