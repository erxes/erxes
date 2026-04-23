import { useQuery, useMutation } from '@apollo/client';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { useToast } from 'erxes-ui';
import { GET_ERKHET_SYNC_GENERAL_CONFIG } from '../graphql/queries/syncErkhetGeneralConfigQueries';
import { UPDATE_ERKHET_SYNC_GENERAL_CONFIG } from '../graphql/mutations/syncErkhetGeneralConfigMutations';
import { SyncErkhetGeneralConfigFormData } from '../types/SyncErkhetGeneralConfigTypes';

const DEFAULT_VALUES: SyncErkhetGeneralConfigFormData = {
  apiKey: '',
  apiSecret: '',
  apiToken: '',
  getRemainderUrl: '',
  costAccount: '',
  salesAccount: '',
  productCategoryCode: '',
  consumeDescription: '',
  checkCompanyUrl: '',
  customerDefaultName: '',
  customerCategoryCode: '',
  companyCategoryCode: '',
  debtAccounts: '',
  userEmail: '',
  defaultCustomer: '',
};

export const useSyncErkhetGeneralConfig = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const form = useForm<SyncErkhetGeneralConfigFormData>({
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
  });

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

  const handleUpdate = async (formData: SyncErkhetGeneralConfigFormData) => {
    setIsUpdating(true);
    await updateConfig({ variables: { configsMap: { ERKHET: formData } } });
  };  

  useEffect(() => {
    if (loading || !data?.configsGetValue?.value) return;

    const raw = data.configsGetValue.value;
    const config: Partial<SyncErkhetGeneralConfigFormData> =
      typeof raw === 'string' ? JSON.parse(raw) : raw;

    form.reset({
      ...DEFAULT_VALUES,
      ...Object.fromEntries(
        Object.entries(config).map(([k, v]) => [k, v ?? '']),
      ),
    });
  }, [data?.configsGetValue?.value, loading, form]);

  return { form, loading, isUpdating, handleUpdate };
};
