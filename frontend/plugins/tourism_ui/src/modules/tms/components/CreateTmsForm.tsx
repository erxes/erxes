import { TmsCreateSheetHeader } from '@/tms/components/CreateTmsSheet';

import { Sheet, Form, Preview, Separator, Spinner, Resizable } from 'erxes-ui';
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
  icon: string;
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
    generalManager,
    managers,
    payment,
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
      generalManager: Array.isArray(generalManager) ? generalManager : [],
      managers: Array.isArray(managers) ? managers : [],
      payment: payment || '',
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
        erxesAppToken,
        permissionConfig,
      } = branchDetail;

      const updatedFormData = {
        name: branchName || '',
        color: uiOptions?.colors?.primary || '#4F46E5',
        logo: uiOptions?.logo || '',
        favIcon: uiOptions?.favIcon || '',
        generalManager: generalManagerIds || [],
        managers: managerIds || [],
        payment: Array.isArray(paymentIds) ? paymentIds[0] || '' : '',
        token: erxesAppToken || '',
        otherPayments: Array.isArray(permissionConfig)
          ? permissionConfig.map((config: PermissionConfig) => ({
              type: config.type || '',
              title: config.title || '',
              icon: config.icon || '',
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
    <Sheet.View className="p-0 sm:max-w-8xl">
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
          className="flex flex-col h-full"
        >
          <Resizable.PanelGroup direction="horizontal">
            <Resizable.Panel
              className="flex flex-col"
              defaultSize={100}
              minSize={30}
            >
              <TmsInformationFields
                form={form}
                onOpenChange={onOpenChange}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                isOpen={isOpen}
              />
            </Resizable.Panel>

            <Resizable.Handle className="hidden md:flex" />
            <Resizable.Panel
              className="hidden flex-col h-full md:flex"
              defaultSize={100}
              minSize={30}
            >
              <Preview>
                <div className="bg-background">
                  <Preview.Toolbar path="/tourism/tms/PreviewPage?inPreview=true" />
                </div>
                <Separator />
                <Preview.View iframeSrc="/tourism/tms/PreviewPage?inPreview=true" />
              </Preview>
            </Resizable.Panel>
          </Resizable.PanelGroup>
        </form>
      </Form>
    </Sheet.View>
  );
};

export default CreateTmsForm;
