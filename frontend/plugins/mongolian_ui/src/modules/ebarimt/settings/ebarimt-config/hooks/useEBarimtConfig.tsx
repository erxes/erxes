import { useQuery, useMutation } from '@apollo/client';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';

import { EBarimtFormData } from '@/ebarimt/settings/ebarimt-config/types/ebarimtConfigTypes';
import {
  FIELD_GROUP_OPTIONS,
  getFieldDependentOptions,
} from '@/ebarimt/settings/ebarimt-config/types/ebarimtConfigTypes';
import { useToast } from 'erxes-ui';
import { UPDATE_EBARIMT_CONFIG } from '@/ebarimt/settings/ebarimt-config/graphql/mutations/ebarimtConfigMutations';
import { GET_EBARIMT_CONFIG } from '@/ebarimt/settings/ebarimt-config/graphql/queries/ebarimtConfigQueries';

export const DEFAULT_VALUES: EBarimtFormData = {
  CompanyName: '',
  EbarimtUrl: '',
  CheckTaxpayerUrl: '',
  FieldGroup: 'empty',
  BillTypeChooser: 'empty',
  RegNoInput: 'empty',
  CompanyNameResponse: 'empty',
};

const toFormValue = (val?: string) => (val ? val : 'empty');
const toBackendValue = (val: string) => (val === 'empty' ? '' : val);

export const useEBarimtConfig = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedFieldGroup, setSelectedFieldGroup] = useState('empty');
  const { toast } = useToast();

  const [updateConfig] = useMutation(UPDATE_EBARIMT_CONFIG, {
    onCompleted: () => {
      toast({
        title: 'Success',
        description: 'Ebarimt config updated successfully',
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

  const { data, loading } = useQuery(GET_EBARIMT_CONFIG, {
    variables: { code: 'EBARIMT' },
  });

  const form = useForm<EBarimtFormData>({
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
  });

  const handleFieldGroupChange = (value: string) => {
    setSelectedFieldGroup(value);

    if (value === 'empty') {
      form.setValue('BillTypeChooser', 'empty');
      form.setValue('RegNoInput', 'empty');
      form.setValue('CompanyNameResponse', 'empty');
    } else if (value === 'basic') {
      form.setValue('BillTypeChooser', 'description');
      form.setValue('RegNoInput', 'empty');
      form.setValue('CompanyNameResponse', 'empty');
    } else if (value === 'relations') {
      form.setValue('BillTypeChooser', 'empty');
      form.setValue('RegNoInput', 'empty');
      form.setValue('CompanyNameResponse', 'empty');
    }
  };

  const handleUpdate = async (formData: EBarimtFormData) => {
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

    await updateConfig({
      variables: { configsMap: { EBARIMT: payload } },
    });
  };

  useEffect(() => {
    if (loading || !data?.configsGetValue?.value) return;

    const raw = data.configsGetValue.value;
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
  }, [data?.configsGetValue?.value, loading, form]);

  const getDependentOptions = (fieldName: string) =>
    getFieldDependentOptions(selectedFieldGroup, fieldName);

  return {
    form,
    selectedFieldGroup,
    fieldGroupOptions: FIELD_GROUP_OPTIONS,
    getDependentOptions,
    loading,
    handleUpdate,
    handleFieldGroupChange,
    isUpdating,
  };
};
