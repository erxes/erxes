import { Form, Spinner, useToast } from 'erxes-ui';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ApolloError } from '@apollo/client';
import { usePmsCreateBranch } from '@/pms/hooks/usePmsCreateBranch';
import { usePmsBranchDetail } from '@/pms/hooks/usePmsBranchDetail';
import { usePmsEditBranch } from '@/pms/hooks/usePmsEditBranch';
import {
  PmsBranchFormSchema,
  PmsBranchFormType,
} from '@/pms/constants/formSchema';
import {
  CreatePmsSheetContentLayout,
  PmsCreateSheetFooter,
  PmsCreateSheetHeader,
} from '@/pms/components/CreatePmsSheet';
import { CreatePmsFormContent } from '@/pms/components/CreatePmsFormContent';
import { nanoid } from 'nanoid';
import {
  IPmsPaymentType,
  IPmsUiOptions,
  IPmsPipelineConfig,
} from '@/pms/types/branch';
import { PmsCreateBranchVariables } from '@/pms/hooks/usePmsCreateBranch';

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
  const {
    branch,
    loading: detailLoading,
    error: detailError,
  } = usePmsBranchDetail(mode === 'edit' ? branchId || '' : '');

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
      websiteReservationLock: false,
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

  const buildPaymentTypes = (
    otherPayments: (Partial<IPmsPaymentType> | undefined)[] | undefined,
  ): IPmsPaymentType[] => {
    return (
      otherPayments
        ?.filter(
          (payment) =>
            payment && (payment.type?.trim() || payment.title?.trim()),
        )
        .map((payment) => ({
          _id: payment?._id || nanoid(),
          type: payment?.type || '',
          title: payment?.title || '',
          config: payment?.config || '',
        })) || []
    );
  };

  const buildDiscounts = (
    discounts: (Partial<IPmsPaymentType> | undefined)[] | undefined,
  ): IPmsPaymentType[] => {
    return (discounts || [])
      .filter(
        (discount) =>
          discount && (discount.type?.trim() || discount.title?.trim()),
      )
      .map((discount) => ({
        _id: discount?._id || nanoid(),
        type: discount?.type || '',
        title: discount?.title || '',
        config: discount?.config || '',
      }));
  };

  const buildUiOptions = (data: PmsBranchFormType): IPmsUiOptions => ({
    logo: data.logo || '',
    colors: {
      primary: data.primaryColor || '',
      secondary: data.secondaryColor || '',
      third: data.thirdColor || '',
    },
    website: data.website || '',
  });

  const buildPipelineConfig = (
    data: PmsBranchFormType,
  ): IPmsPipelineConfig => ({
    boardId: data.boardId || '',
    pipelineId: data.pipelineId || '',
    stageId: data.stageId || '',
  });

  const buildBaseVariables = (
    data: PmsBranchFormType,
    paymentTypes: IPmsPaymentType[],
    discounts: IPmsPaymentType[],
    uiOptions: IPmsUiOptions,
    pipelineConfig: IPmsPipelineConfig,
  ): Omit<PmsCreateBranchVariables, 'permissionConfig'> => ({
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
    websiteReservationLock: data.websiteReservationLock ?? false,
    time: data.websiteReservationLock ? data.time || '' : '',
    checkintime: data.checkInTime,
    checkouttime: data.checkOutTime,
    checkinamount: data.checkInAmount,
    checkoutamount: data.checkOutAmount,
  });

  const handleEditSubmit = (
    branchId: string,
    editVariables: PmsCreateBranchVariables,
  ): void => {
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
  };

  const handleCreateSubmit = (
    createVariables: PmsCreateBranchVariables,
  ): void => {
    createPmsBranch({
      variables: createVariables,
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

  const mapPaymentTypeItems = (items: IPmsPaymentType[] | undefined) => {
    return Array.isArray(items)
      ? items.map((item: IPmsPaymentType) => ({
          _id: item._id,
          type: item.type,
          title: item.title,
          icon: item.icon,
          config: item.config,
        }))
      : [];
  };

  const populateFormWithBranchData = useCallback(
    (branchData: typeof branch): void => {
      if (!branchData) return;

      form.reset({
        name: branchData.name || '',
        description: branchData.description || '',
        checkInTime: branchData.checkintime || '',
        checkOutTime: branchData.checkouttime || '',
        checkInAmount: branchData.checkinamount || 0,
        checkOutAmount: branchData.checkoutamount || 0,
        discount: mapPaymentTypeItems(branchData.discount),
        websiteReservationLock: branchData.websiteReservationLock ?? false,
        time: branchData.time || '',
        paymentIds: branchData.paymentIds || [],
        paymentTypes: branchData.paymentTypes || [],
        otherPayments: mapPaymentTypeItems(branchData.paymentTypes),
        erxesAppToken: branchData.erxesAppToken || '',
        user1Ids: branchData.user1Ids || [],
        user2Ids: branchData.user2Ids || [],
        user3Ids: branchData.user3Ids || [],
        user4Ids: branchData.user4Ids || [],
        user5Ids: branchData.user5Ids || [],
        permissionConfig: branchData.permissionConfig || {},
        uiOptions: branchData.uiOptions || {},
        pipelineConfig: branchData.pipelineConfig || {},
        extraProductCategories: branchData.extraProductCategories || [],
        roomCategories: branchData.roomCategories || [],
        logo: branchData.uiOptions?.logo || '',
        primaryColor: branchData.uiOptions?.colors?.primary || '#FFFFFF',
        secondaryColor: branchData.uiOptions?.colors?.secondary || '#6569DF',
        thirdColor: branchData.uiOptions?.colors?.third || '#3CCC38',
        website: branchData.uiOptions?.website || '',
        boardId: branchData.pipelineConfig?.boardId || '',
        pipelineId: branchData.pipelineConfig?.pipelineId || '',
        stageId: branchData.pipelineConfig?.stageId || '',
        roomsCategoryIds: branchData.roomCategories || [],
        extrasCategoryIds: branchData.extraProductCategories || [],
      });
    },
    [form],
  );

  useEffect(() => {
    if (mode !== 'edit' || !branch || !branchId || branch._id !== branchId) {
      return;
    }

    populateFormWithBranchData(branch);
  }, [branch, branchId, mode, populateFormWithBranchData]);

  const onSubmit = (data: PmsBranchFormType): void => {
    const paymentTypes = buildPaymentTypes(data.otherPayments);
    const discounts = buildDiscounts(data.discount);
    const uiOptions = buildUiOptions(data);
    const pipelineConfig = buildPipelineConfig(data);

    const baseVariables = buildBaseVariables(
      data,
      paymentTypes,
      discounts,
      uiOptions,
      pipelineConfig,
    );

    if (mode === 'edit') {
      if (!branchId) {
        toast({
          title: 'Error',
          description: 'Missing branchId for edit mode',
          variant: 'destructive',
        });
        return;
      }

      const editVariables: PmsCreateBranchVariables = {
        ...baseVariables,
        permissionConfig: data.permissionConfig || {},
      };

      handleEditSubmit(branchId, editVariables);
      return;
    }

    const createVariables: PmsCreateBranchVariables = {
      ...baseVariables,
      permissionConfig: data.permissionConfig || {},
    };

    handleCreateSubmit(createVariables);
  };

  const loading = mode === 'edit' ? editLoading : createLoading;

  return (
    <Form {...form}>
      <form className="flex flex-col h-full">
        <PmsCreateSheetHeader mode={mode} />
        <CreatePmsSheetContentLayout form={form}>
          {mode === 'edit' && detailLoading ? (
            <div className="flex justify-center items-center w-full h-full">
              <Spinner />
            </div>
          ) : mode === 'edit' && detailError ? (
            <div className="flex flex-col justify-center items-center w-full h-full text-destructive">
              <p>Failed to load branch details</p>
              <p className="text-sm">{detailError.message}</p>
            </div>
          ) : (
            <CreatePmsFormContent form={form} />
          )}
        </CreatePmsSheetContentLayout>
        <PmsCreateSheetFooter
          loading={loading}
          form={form}
          mode={mode}
          onSave={form.handleSubmit(onSubmit)}
        />
      </form>
    </Form>
  );
};

export default CreatePmsForm;
