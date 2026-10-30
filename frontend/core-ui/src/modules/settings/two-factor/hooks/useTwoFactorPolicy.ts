import { useMutation, useQuery } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  AUTH_TWO_FACTOR_POLICY,
  AUTH_TWO_FACTOR_POLICY_SAVE,
} from '@/settings/two-factor/graphql';
import {
  TTwoFactorPolicyForm,
  TWO_FACTOR_POLICY_SCHEMA,
} from '@/settings/two-factor/schema';

export const useTwoFactorPolicy = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'two-factor' });
  const { data, loading, error } = useQuery<{
    authTwoFactorPolicy: TTwoFactorPolicyForm;
  }>(AUTH_TWO_FACTOR_POLICY);
  const [save, { loading: saving }] = useMutation<{
    authTwoFactorPolicySave: TTwoFactorPolicyForm;
  }>(AUTH_TWO_FACTOR_POLICY_SAVE, {
    update: (cache, { data: saved }) => {
      if (!saved) return;

      cache.writeQuery({
        query: AUTH_TWO_FACTOR_POLICY,
        data: { authTwoFactorPolicy: saved.authTwoFactorPolicySave },
      });
    },
  });

  const form = useForm<TTwoFactorPolicyForm>({
    resolver: zodResolver(TWO_FACTOR_POLICY_SCHEMA),
    defaultValues: { mode: 'off', permissionGroupIds: [] },
  });

  const policy = data?.authTwoFactorPolicy;

  useEffect(() => {
    if (policy) {
      form.reset({
        mode: policy.mode,
        permissionGroupIds: policy.permissionGroupIds,
      });
    }
  }, [policy, form]);

  const onSubmit = form.handleSubmit((values) =>
    save({
      variables: {
        mode: values.mode,
        // Groups only narrow "required"; other modes keep none
        permissionGroupIds:
          values.mode === 'required' ? values.permissionGroupIds : [],
      },
      onCompleted: () => toast({ title: t('policy-saved'), variant: 'success' }),
      onError: (e) => toast({ title: e.message, variant: 'destructive' }),
    }),
  );

  return { form, loading, error, saving, onSubmit };
};
