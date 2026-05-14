import { useQuery, useMutation } from '@apollo/client';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { useToast } from 'erxes-ui';
import { GET_ERKHET_SYNC_GENERAL_CONFIG } from '../graphql/queries/syncErkhetGeneralConfigQueries';
import { UPDATE_ERKHET_SYNC_GENERAL_CONFIG } from '../graphql/mutations/syncErkhetGeneralConfigMutations';
import { SyncErkhetGeneralConfigFormData } from '../types/SyncErkhetGeneralConfigTypes';

export const DEFAULT_VALUES: SyncErkhetGeneralConfigFormData = {
  apiKey: '',
  apiSecret: '',
  apiToken: '',
  getRemainderUrl: '',
  costAccount: '',
  salesAccount: '',
  productCategoryCode: '',
  customerDefaultName: '',
  checkCompanyUrl: '',
  customerCategoryCode: '',
  companyCategoryCode: '',
  consumeDescription: '',
  debtAccounts: '',
  userEmail: '',
  defaultCustomer: '',
};

const toFormValue = (val?: string) => val || 'empty';

export const useSyncErkhetGeneralConfig = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedFieldGroup, setSelectedFieldGroup] = useState('empty');
  const { toast } = useToast();

  const [updateConfig] = useMutation(UPDATE_ERKHET_SYNC_GENERAL_CONFIG, {
    onCompleted: () => {
      toast({
        title: 'Success',
        description: 'Erkhet sync general config updated successfully',
        variant: 'default',
      });
      setIsUpdating(false);
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
      setIsUpdating(false);
    },
  });

  const { data, loading } = useQuery(GET_ERKHET_SYNC_GENERAL_CONFIG, {
    variables: { code: 'ERKHET' },
  });

  const form = useForm<SyncErkhetGeneralConfigFormData>({
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
  });

  const handleFieldGroupChange = (value: string) => {
    setSelectedFieldGroup(value);
  };

  const handleUpdate = async (formData: SyncErkhetGeneralConfigFormData) => {
    setIsUpdating(true);

    const payload = {
      apiKey: formData.apiKey,
      apiSecret: formData.apiSecret,
      apiToken: formData.apiToken,
      getRemainderUrl: formData.getRemainderUrl,
      costAccount: formData.costAccount,
      salesAccount: formData.salesAccount,
      productCategoryCode: formData.productCategoryCode,
      customerDefaultName: formData.customerDefaultName,
      checkCompanyUrl: formData.checkCompanyUrl,
      customerCategoryCode: formData.customerCategoryCode,
      companyCategoryCode: formData.companyCategoryCode,
      consumeDescription: formData.consumeDescription,
      debtAccounts: formData.debtAccounts,
      userEmail: formData.userEmail,
      defaultCustomer: formData.defaultCustomer,
    };

    await updateConfig({
      variables: { configsMap: { ERKHET: payload } },
    });
  };

  useEffect(() => {
    if (loading || !data?.configsGetValue?.value) return;

    const raw = data.configsGetValue.value;
    const config = typeof raw === 'string' ? JSON.parse(raw) : raw;

    const fieldGroup = toFormValue(config.fieldGroup);

    setSelectedFieldGroup(fieldGroup);

    form.reset({
      apiKey: config.apiKey || '',
      apiSecret: config.apiSecret || '',
      apiToken: config.apiToken || '',
      getRemainderUrl: config.getRemainderUrl || '',
      costAccount: config.costAccount || '',
      salesAccount: config.salesAccount || '',
      productCategoryCode: config.productCategoryCode || '',
      customerDefaultName: config.customerDefaultName || '',
      checkCompanyUrl: config.checkCompanyUrl || '',
      customerCategoryCode: config.customerCategoryCode || '',
      companyCategoryCode: config.companyCategoryCode || '',
      consumeDescription: config.consumeDescription || '',
      debtAccounts: config.debtAccounts || '',
      userEmail: config.userEmail || '',
      defaultCustomer: config.defaultCustomer || '',
    });
  }, [data?.configsGetValue?.value, loading, form]);

  return {
    form,
    selectedFieldGroup,
    loading,
    handleUpdate,
    handleFieldGroupChange,
    isUpdating,
  };
};
