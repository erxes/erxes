import { Form, Spinner, useToast } from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ApolloError } from '@apollo/client';
import { usePmsCreateBranch } from '../hooks/usePmsCreateBranch';
import { usePmsBranchDetail } from '../hooks/usePmsBranchDetail';
import { usePmsEditBranch } from '../hooks/usePmsEditBranch';
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
import { nanoid } from 'nanoid';

const CreatePmsForm = ({
  onOpenChange,
  onSuccess,
  mode,
  branchId,
}: {
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
  mode: 'create' | 'edit';
  branchId?: string;
}) => {
  const { createPmsBranch, loading: createLoading } = usePmsCreateBranch();
  const { editBranch, loading: editLoading } = usePmsEditBranch();
  const { branch, loading: detailLoading } = usePmsBranchDetail(
    mode === 'edit' ? branchId || '' : '',
  );

  const form = useForm<PmsBranchFormType>({
    resolver: zodResolver(PmsBranchFormSchema),
    defaultValues: {
      name: '',
      description: '',
      checkInTime: '',
      checkInAmount: 0,
      checkOutTime: '',
      checkOutAmount: 0,
      discount: [],
      // websiteReservationLock: false,
      time: '',
      paymentIds: [],
      paymentTypes: [],
      erxesAppToken: '',
      otherPayments: [],
      user1Ids: [],
      user2Ids: [],
      user3Ids: [],
      user4Ids: [],
      user5Ids: [],
      departmentId: '',
      permissionConfig: {},
      uiOptions: {},
      pipelineConfig: {},
      extraProductCategories: [],
      roomCategories: [],
      logo: '',
      primaryColor: '#FFFFFF',
      secondaryColor: '#6569DF',
      thirdColor: '#3CCC38',
      website: '',
      boardId: '',
      pipelineId: '',
      stageId: '',
      roomsCategoryIds: [],
      extrasCategoryIds: [],
    },
  });

  const { toast } = useToast();

  useEffect(() => {
    if (mode !== 'edit') {
      return;
    }

    if (!branch || !branchId) {
      return;
    }

    form.reset({
      name: branch.name || '',
      description: branch.description || '',
      checkInTime: branch.checkintime || '',
      checkOutTime: branch.checkouttime || '',
      checkInAmount: branch.checkinamount || 0,
      checkOutAmount: branch.checkoutamount || 0,
      discount: Array.isArray(branch.discount)
        ? branch.discount.map(({ __typename, ...rest }: any) => rest)
        : [],
      // websiteReservationLock: branch.websiteReservationLock ?? false,
      time: branch.time || '',
      paymentIds: branch.paymentIds || [],
      paymentTypes: branch.paymentTypes || [],
      otherPayments: Array.isArray(branch.paymentTypes)
        ? branch.paymentTypes.map(({ __typename, ...rest }: any) => rest)
        : [],
      erxesAppToken: branch.erxesAppToken || '',
      user1Ids: branch.user1Ids || [],
      user2Ids: branch.user2Ids || [],
      user3Ids: branch.user3Ids || [],
      user4Ids: branch.user4Ids || [],
      user5Ids: branch.user5Ids || [],
      // departmentId: branch.departmentId || '',
      permissionConfig: branch.permissionConfig || {},
      uiOptions: branch.uiOptions || {},
      pipelineConfig: branch.pipelineConfig || {},
      extraProductCategories: branch.extraProductCategories || [],
      roomCategories: branch.roomCategories || [],
      logo: branch.uiOptions?.logo || '',
      primaryColor: branch.uiOptions?.colors?.primary || '#FFFFFF',
      secondaryColor: branch.uiOptions?.colors?.secondary || '#6569DF',
      thirdColor: branch.uiOptions?.colors?.third || '#3CCC38',
      website: branch.uiOptions?.website || '',
      boardId: branch.pipelineConfig?.boardId || '',
      pipelineId: branch.pipelineConfig?.pipelineId || '',
      stageId: branch.pipelineConfig?.stageId || '',
      roomsCategoryIds: branch.roomCategories || [],
      extrasCategoryIds: branch.extraProductCategories || [],
    });
  }, [branch, branchId, form, mode]);

  const onSubmit = (data: PmsBranchFormType) => {
    const paymentTypes =
      data.otherPayments?.map((payment) => ({
        _id: payment._id || nanoid(),
        type: payment.type || '',
        title: payment.title || '',
        config: payment.config || '',
      })) || [];

    const discounts = (data.discount || []).map((discount) => ({
      _id: discount._id || nanoid(),
      type: discount.type || '',
      title: discount.title || '',
      config: discount.config || '',
    }));

    const uiOptions = {
      logo: data.logo || '',
      colors: {
        primary: data.primaryColor || '',
        secondary: data.secondaryColor || '',
        third: data.thirdColor || '',
      },
      website: data.website || '',
    };

    const pipelineConfig = {
      boardId: data.boardId || '',
      pipelineId: data.pipelineId || '',
      stageId: data.stageId || '',
    };

    const createVariables = {
      name: data.name,
      description: data.description || '',
      erxesAppToken: data.erxesAppToken || '',
      user1Ids: data.user1Ids || [],
      user2Ids: data.user2Ids || [],
      user3Ids: data.user3Ids || [],
      user4Ids: data.user4Ids || [],
      user5Ids: data.user5Ids || [],
      paymentIds: data.paymentIds || [],
      paymentTypes,
      uiOptions,
      pipelineConfig,
      extraProductCategories: data.extrasCategoryIds || [],
      roomCategories: data.roomsCategoryIds || [],
      discount: discounts,
      time: data.time || '',
      checkintime: data.checkInTime,
      checkouttime: data.checkOutTime,
      checkinamount: data.checkInAmount,
      checkoutamount: data.checkOutAmount,
    };

    const editVariables = {
      name: data.name,
      description: data.description || '',
      erxesAppToken: data.erxesAppToken || '',
      user1Ids: data.user1Ids || [],
      user2Ids: data.user2Ids || [],
      user3Ids: data.user3Ids || [],
      user4Ids: data.user4Ids || [],
      user5Ids: data.user5Ids || [],
      paymentIds: data.paymentIds || [],
      paymentTypes,
      permissionConfig: data.permissionConfig || {},
      uiOptions,
      pipelineConfig,
      extraProductCategories: data.extrasCategoryIds || [],
      roomCategories: data.roomsCategoryIds || [],
      time: data.time || '',
      discount: discounts,
      checkintime: data.checkInTime,
      checkouttime: data.checkOutTime,
      checkinamount: data.checkInAmount,
      checkoutamount: data.checkOutAmount,
    };

    if (mode === 'edit') {
      if (!branchId) {
        toast({
          title: 'Error',
          description: 'Missing branchId for edit mode',
          variant: 'destructive',
        });
        return;
      }

      editBranch(branchId, editVariables)
        .then(() => {
          toast({
            title: 'Success',
            description: 'PMS updated successfully',
          });
          onOpenChange?.(false);
          onSuccess?.();
        })
        .catch((e: ApolloError) => {
          toast({
            title: 'Error',
            description: e.message,
            variant: 'destructive',
          });
        });
      return;
    }

    createPmsBranch({
      variables: createVariables as any,
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

  const loading =
    mode === 'edit' ? detailLoading || editLoading : createLoading;

  return (
    <Form {...form}>
      <form className="flex flex-col h-full">
        <PmsCreateSheetHeader mode={mode} />
        <CreatePmsSheetContentLayout form={form}>
          {mode === 'edit' && detailLoading ? (
            <div className="flex justify-center items-center w-full h-full">
              <Spinner />
            </div>
          ) : (
            <CreatePmsFormContent form={form} />
          )}
        </CreatePmsSheetContentLayout>
        <PmsCreateSheetFooter
          loading={loading}
          form={form}
          mode={mode}
          onSave={() => form.handleSubmit(onSubmit)()}
        />
      </form>
    </Form>
  );
};

export default CreatePmsForm;
