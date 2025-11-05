import { useToast } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { useSetAtom } from 'jotai';
import { useCreateBranch } from '@/tms/hooks/CreateBranch';
import { useBranchEdit } from '@/tms/hooks/BranchEdit';
import { TmsFormType } from '@/tms/constants/formSchema';
import { resetFormAtom, DEFAULT_TMS_FORM } from '@/tms/atoms/formAtoms';
import { currentStepAtom } from '@/tms/states/tmsInformationFieldsAtoms';

interface PermissionConfig {
  type: string;
  title: string;
  icon: string;
  config?: string;
}

interface UseBranchSubmitParams {
  isEditMode: boolean;
  branchId?: string;
  form: UseFormReturn<TmsFormType>;
  refetch?: () => Promise<any>;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export function useBranchSubmit({
  isEditMode,
  branchId,
  form,
  refetch,
  onOpenChange,
  onSuccess,
}: UseBranchSubmitParams) {
  const { toast } = useToast();
  const { createBranch, loading: createLoading } = useCreateBranch();

  const { editBranch, loading: editLoading } = useBranchEdit({
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
  const resetForm = useSetAtom(resetFormAtom);
  const setCurrentStep = useSetAtom(currentStepAtom);

  const isLoading = isEditMode ? editLoading : createLoading;

  const handleRefetch = async () => {
    if (refetch) {
      try {
        await refetch();
      } catch (error) {
        toast({
          title: 'Warning',
          description: error instanceof Error ? error.message : String(error),
          variant: 'destructive',
        });
      }
    }
  };

  const transformFormData = (data: TmsFormType) => {
    const permissionConfig =
      data.otherPayments?.map((payment: PermissionConfig) => ({
        type: payment.type,
        title: payment.title,
        icon: payment.icon,
        config: payment.config,
      })) || [];

    return {
      name: data.name,
      generalManagerIds: data.generalManager || [],
      managerIds: data.managers || [],
      paymentIds: data.payment ? [data.payment] : [],
      permissionConfig,
      erxesAppToken: data.token,
      uiOptions: {
        logo: data.logo || '',
        favIcon: data.favIcon || '',
        colors: {
          primary: data.color,
        },
      },
    };
  };

  const handleEditBranch = (variables: any) => {
    editBranch({
      variables: {
        id: branchId,
        ...variables,
      },
      onCompleted: async () => {
        toast({
          title: 'Success',
          description: 'Branch updated successfully',
        });
        onOpenChange?.(false);
        onSuccess?.();
        await handleRefetch();
      },
    });
  };

  const handleCreateBranch = (variables: any) => {
    createBranch({
      variables,
      onError: (error: unknown) => {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      },
      onCompleted: async () => {
        toast({
          title: 'Success',
          description: 'Branch created successfully',
        });
        resetForm();
        form.reset(DEFAULT_TMS_FORM);
        setCurrentStep(0);
        onOpenChange?.(false);
        onSuccess?.();
        await handleRefetch();
      },
    });
  };

  const handleSubmit = (data: TmsFormType) => {
    const variables = transformFormData(data);

    if (isEditMode) {
      handleEditBranch(variables);
    } else {
      handleCreateBranch(variables);
    }
  };

  return { handleSubmit, isLoading };
}
