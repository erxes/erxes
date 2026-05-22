import { useQuery, useMutation } from '@apollo/client';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { useToast } from 'erxes-ui';
import { GET_ERKHET_SYNC_GENERAL_CONFIG } from '../graphql/queries/syncErkhetGeneralConfigQueries';
import {
  CREATE_ERKHET_SYNC_GENERAL_CONFIG,
  UPDATE_ERKHET_SYNC_GENERAL_CONFIG,
} from '../graphql/mutations/syncErkhetGeneralConfigMutations';
import { SyncErkhetGeneralConfigFormData } from '../types/SyncErkhetGeneralConfigTypes';

export const DEFAULT_VALUES: SyncErkhetGeneralConfigFormData = {
  apiKey: '',
  apiSecret: '',
  apiToken: '',
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

  const mutationOptions = {
    onCompleted: () => {
      toast({
        title: 'Success',
        description: 'Erkhet sync general config updated successfully',
        variant: 'default',
      });
      setIsUpdating(false);
    },
    onError: (err: Error) => {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
      setIsUpdating(false);
    },
  };

  const [createConfig] = useMutation(
    CREATE_ERKHET_SYNC_GENERAL_CONFIG,
    mutationOptions,
  );
  const [updateConfig] = useMutation(
    UPDATE_ERKHET_SYNC_GENERAL_CONFIG,
    mutationOptions,
  );

  const { data, loading } = useQuery(GET_ERKHET_SYNC_GENERAL_CONFIG, {
    variables: { code: 'ERKHET' },
  });

  const config = data?.mnConfigs?.[0];

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

    if (config?._id) {
      await updateConfig({
        variables: {
          id: config._id,
          subId: config.subId || '',
          value: payload,
        },
      });
    } else {
      await createConfig({
        variables: { code: 'ERKHET', subId: '', value: payload },
      });
    }
  };

  useEffect(() => {
    if (loading || !config?.value) return;

    const raw = config.value;
    const value = typeof raw === 'string' ? JSON.parse(raw) : raw;

    const fieldGroup = toFormValue(value.fieldGroup);

    setSelectedFieldGroup(fieldGroup);

    form.reset({
      apiKey: value.apiKey || '',
      apiSecret: value.apiSecret || '',
      apiToken: value.apiToken || '',
      costAccount: value.costAccount || '',
      salesAccount: value.salesAccount || '',
      productCategoryCode: value.productCategoryCode || '',
      customerDefaultName: value.customerDefaultName || '',
      checkCompanyUrl: value.checkCompanyUrl || '',
      customerCategoryCode: value.customerCategoryCode || '',
      companyCategoryCode: value.companyCategoryCode || '',
      consumeDescription: value.consumeDescription || '',
      debtAccounts: value.debtAccounts || '',
      userEmail: value.userEmail || '',
      defaultCustomer: value.defaultCustomer || '',
    });
  }, [config?.value, loading, form]);

  return {
    form,
    selectedFieldGroup,
    loading,
    handleUpdate,
    handleFieldGroupChange,
    isUpdating,
  };
};
