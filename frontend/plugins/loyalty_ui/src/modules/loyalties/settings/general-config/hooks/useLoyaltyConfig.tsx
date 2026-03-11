import { useMutation, useQuery } from '@apollo/client';
import { useForm } from 'react-hook-form';
import React from 'react';

import { useToast } from 'erxes-ui';
import { UPDATE_LOYALTY_CONFIG } from '../graphql/mutations/loyaltyConfigMutations';
import { LOYALTY_CONFIGS_QUERY } from '../graphql/queries/loyaltyConfigQueries';
import { LoyaltyFormData } from '../types/loyaltyConfigTypes';

export const DEFAULT_VALUES: LoyaltyFormData = {
  loyaltyRatioCurrency: '',
  feeForScoreSharing: '',
};

export const useLoyaltyConfig = () => {
  const { toast } = useToast();

  const { data, loading: queryLoading } = useQuery(LOYALTY_CONFIGS_QUERY);

  const [updateConfig, { loading }] = useMutation(UPDATE_LOYALTY_CONFIG, {
    refetchQueries: [{ query: LOYALTY_CONFIGS_QUERY }],
    onCompleted: () => {
      toast({
        title: 'Success',
        description: 'Loyalty config updated successfully',
        variant: 'default',
      });
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    },
  });

  const form = useForm<LoyaltyFormData>({
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
  });

  React.useEffect(() => {
    if (data?.loyaltyConfigs?.length) {
      const loyaltyConfigObj = data.loyaltyConfigs.find(
        (config: any) => config.code === 'LOYALTY',
      );
      if (loyaltyConfigObj?.value) {
        const loyaltyConfig =
          typeof loyaltyConfigObj.value === 'string'
            ? JSON.parse(loyaltyConfigObj.value)
            : loyaltyConfigObj.value;

        form.reset({
          loyaltyRatioCurrency: loyaltyConfig.LoyaltyRatioCurrency || '',
          feeForScoreSharing: loyaltyConfig.ShareScoreFee || '',
        });
      }
    }
  }, [data, form]);

  const handleUpdate = async (formData: LoyaltyFormData) => {
    await updateConfig({
      variables: {
        configsMap: {
          LoyaltyRatioCurrency: formData.loyaltyRatioCurrency,
          ShareScoreFee: formData.feeForScoreSharing,
        },
      },
    });
  };

  return {
    form,
    handleUpdate,
    isUpdating: loading,
    isLoading: queryLoading,
  };
};
