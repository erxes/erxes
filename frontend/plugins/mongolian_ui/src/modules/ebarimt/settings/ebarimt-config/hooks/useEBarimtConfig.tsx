import { useQuery, useMutation } from '@apollo/client';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import {
  FIELD_GROUP_OPTIONS,
  getFieldDependentOptions,
  EBarimtFormData,
} from '@/ebarimt/settings/ebarimt-config/types/ebarimtConfigTypes';
import { useToast } from 'erxes-ui';

import { UPDATE_MN_CONFIG } from '@/ebarimt/settings/ebarimt-config/graphql/mutations/ebarimtConfigMutations';
import { GET_MN_CONFIGS } from '../graphql/queries/mnConfigs';

export const DEFAULT_VALUES: EBarimtFormData = {
  CompanyName: '',
  EbarimtUrl: '',
  CheckTaxpayerUrl: '',
  FieldGroup: 'empty',
  BillTypeChooser: 'empty',
  RegNoInput: 'empty',
  CompanyNameResponse: 'empty',
};

const toFormValue = (val?: string) => val || 'empty';
const toBackendValue = (val: string) => (val === 'empty' ? '' : val);

export const useEBarimtConfig = () => {
  const { toast } = useToast();

  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedFieldGroup, setSelectedFieldGroup] = useState('empty');

  const { data, loading } = useQuery(GET_MN_CONFIGS, {
    variables: { code: 'EBARIMT' },
  });

  const form = useForm<EBarimtFormData>({
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
  });

  const [updateConfig] = useMutation(UPDATE_MN_CONFIG);

  const handleFieldGroupChange = (value: string) => {
    setSelectedFieldGroup(value);

    const billType = value === 'basic' ? 'description' : 'empty';

    form.setValue('BillTypeChooser', billType);
    form.setValue('RegNoInput', 'empty');
    form.setValue('CompanyNameResponse', 'empty');
  };

  const handleUpdate = async (formData: EBarimtFormData) => {
    if (loading) return;

    setIsUpdating(true);

    const payload = {
      companyName: formData.CompanyName,
      ebarimtUrl: formData.EbarimtUrl,
      checkTaxpayerUrl: formData.CheckTaxpayerUrl,
      dealBillType: {
        groupId: toBackendValue(formData.FieldGroup),
        billType: toBackendValue(formData.BillTypeChooser),
        regNoField: toBackendValue(formData.RegNoInput),
        companyNameField: toBackendValue(formData.CompanyNameResponse),
      },
    };

    try {
      await updateConfig({
        variables: {
          id: data?.mnConfigs?.[0]?._id,
          subId: data?.mnConfigs?.[0]?.subId ?? null,
          value: payload,
        },
      });

      toast({
        title: 'Success',
        description: 'Ebarimt config saved successfully',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const configValue = data?.mnConfigs?.[0]?.value;

  useEffect(() => {
    if (loading || !configValue) return;

    const raw = configValue;
    const config = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const dealBillType = config.dealBillType || {};

    const fieldGroup = toFormValue(dealBillType.groupId);
    let billType = toFormValue(dealBillType.billType);

    if (fieldGroup === 'basic' && !dealBillType.billType) {
      billType = 'description';
    }

    setSelectedFieldGroup(fieldGroup);

    form.reset({
      CompanyName: config.companyName || '',
      EbarimtUrl: config.ebarimtUrl || '',
      CheckTaxpayerUrl: config.checkTaxpayerUrl || '',
      FieldGroup: fieldGroup,
      BillTypeChooser: billType,
      RegNoInput: toFormValue(dealBillType.regNoField),
      CompanyNameResponse: toFormValue(dealBillType.companyNameField),
    });
  }, [configValue, loading, form, data?.mnConfigs]);

  const getDependentOptions = (fieldName: string) =>
    getFieldDependentOptions(selectedFieldGroup, fieldName);

  return {
    form,
    loading,
    isUpdating,

    selectedFieldGroup,
    fieldGroupOptions: FIELD_GROUP_OPTIONS,

    getDependentOptions,
    handleFieldGroupChange,
    handleUpdate,
  };
};
