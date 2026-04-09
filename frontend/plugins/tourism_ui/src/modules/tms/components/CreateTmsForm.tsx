import { TmsCreateSheetHeader } from '@/tms/components/CreateTmsSheet';

import { Sheet, Form, Spinner } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { TmsFormSchema, TmsFormType } from '@/tms/constants/formSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { TmsInformationFields } from '@/tms/components/TmsInformationFields';
import { useBranchDetail } from '@/tms/hooks/BranchDetail';
import { useBranchSubmit } from '@/tms/hooks/useBranchSubmit';
import { useEffect } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { tmsFormAtom } from '@/tms/atoms/formAtoms';
import { currentStepAtom } from '@/tms/states/tmsInformationFieldsAtoms';

interface PermissionConfig {
  type: string;
  title: string;
  config?: string;
}

const CreateTmsForm = ({
  branchId,
  onOpenChange,
  onSuccess,
  refetch,
  isOpen,
}: {
  branchId?: string;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
  refetch?: () => Promise<any>;
  isOpen?: boolean;
}) => {
  const { branchDetail, loading: detailLoading } = useBranchDetail({
    id: branchId || '',
  });

  const isEditMode = !!branchId;
  const [formData] = useAtom(tmsFormAtom);
  const setFormAtom = useSetAtom(tmsFormAtom);
  const setCurrentStep = useSetAtom(currentStepAtom);

  const {
    name,
    color,
    logo,
    favIcon,
    language,
    mainLanguage,
    generalManager,
    managers,
    payment,
    prepaid,
    prepaidPercent,
    token,
    otherPayments,
  } = formData;

  const form = useForm<TmsFormType>({
    resolver: zodResolver(TmsFormSchema),
    defaultValues: {
      name: name || '',
      color: color || '#4F46E5',
      logo: logo || '',
      favIcon: favIcon || '',
      language: Array.isArray(language) ? language : [],
      mainLanguage: mainLanguage || '',
      generalManager: Array.isArray(generalManager) ? generalManager : [],
      managers: Array.isArray(managers) ? managers : [],
      payment: Array.isArray(payment) ? payment : [],
      prepaid: prepaid ?? false,
      prepaidPercent: prepaid ? prepaidPercent ?? undefined : undefined,
      token: token || '',
      otherPayments: Array.isArray(otherPayments) ? otherPayments : [],
    },
  });

  useEffect(() => {
    setCurrentStep(1);
  }, [setCurrentStep]);

  const { handleSubmit, isLoading } = useBranchSubmit({
    isEditMode,
    branchId,
    form,
    refetch,
    onOpenChange,
    onSuccess,
  });

  useEffect(() => {
    if (branchDetail) {
      const {
        name: branchName,
        uiOptions,
        generalManagerIds,
        managerIds,
        paymentIds,
        prepaid,
        prepaidPercent,
        erxesAppToken,
        permissionConfig,
        language: mainLanguageFromDetail,
        languages,
      } = branchDetail;

      const updatedFormData = {
        name: branchName || '',
        color: uiOptions?.colors?.primary || '#4F46E5',
        logo: uiOptions?.logo || '',
        favIcon: uiOptions?.favIcon || '',
        language: Array.isArray(languages)
          ? languages.filter((code): code is string => typeof code === 'string')
          : [],
        mainLanguage:
          typeof mainLanguageFromDetail === 'string'
            ? mainLanguageFromDetail
            : '',
        generalManager: generalManagerIds || [],
        managers: managerIds || [],
        payment: Array.isArray(paymentIds)
          ? paymentIds.filter((id): id is string => typeof id === 'string')
          : [],
        prepaid: prepaid ?? false,
        prepaidPercent: prepaid ? prepaidPercent ?? undefined : undefined,
        token: erxesAppToken || '',
        otherPayments: Array.isArray(permissionConfig)
          ? permissionConfig.map((config: PermissionConfig) => ({
              type: config.type || '',
              title: config.title || '',
              config: config.config || '',
            }))
          : [],
      };

      setFormAtom(updatedFormData);
      form.reset(updatedFormData);
    }
  }, [branchDetail, setFormAtom, form]);

  if (isEditMode && detailLoading) {
    return <Spinner />;
  }

  return (
    <Sheet.View className="p-0 w-[700px] md:w-[700px] sm:max-w-[700px] h-full">
      {isEditMode ? (
        <Sheet.Header>
          <Sheet.Title>Edit Tour Management System</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
      ) : (
        <TmsCreateSheetHeader />
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col w-full h-full"
        >
          <div className="flex flex-col w-full h-full min-h-0">
            <div className="flex flex-col w-full h-full min-h-0">
              <TmsInformationFields
                form={form}
                onOpenChange={onOpenChange}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                isOpen={isOpen}
              />
            </div>
          </div>
        </form>
      </Form>
    </Sheet.View>
  );
};

export default CreateTmsForm;
