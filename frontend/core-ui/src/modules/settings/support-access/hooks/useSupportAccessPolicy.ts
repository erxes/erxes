import { useMutation, useQuery } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  AUTH_SUPPORT_ACCESS_POLICY,
  AUTH_SUPPORT_ACCESS_POLICY_SAVE,
} from '@/settings/support-access/graphql';
import {
  SUPPORT_ACCESS_POLICY_SCHEMA,
  TSupportAccessPolicyForm,
} from '@/settings/support-access/schema';
import { ISupportAccessPolicy } from '@/settings/support-access/types';
import { formatGrantEnd } from '@/settings/support-access/utils';

export const useSupportAccessPolicy = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'support-access' });
  const { data, loading, error } = useQuery<{
    authSupportAccessPolicy: ISupportAccessPolicy;
  }>(AUTH_SUPPORT_ACCESS_POLICY);
  const [save, { loading: saving }] = useMutation<{
    authSupportAccessPolicySave: ISupportAccessPolicy;
  }>(AUTH_SUPPORT_ACCESS_POLICY_SAVE, {
    update: (cache, { data: saved }) => {
      if (!saved) return;

      cache.writeQuery({
        query: AUTH_SUPPORT_ACCESS_POLICY,
        data: { authSupportAccessPolicy: saved.authSupportAccessPolicySave },
      });
    },
  });

  const form = useForm<TSupportAccessPolicyForm>({
    resolver: zodResolver(SUPPORT_ACCESS_POLICY_SCHEMA),
    defaultValues: { mode: 'approval', allowUntil: null, permissionGroupIds: [] },
  });

  const policy = data?.authSupportAccessPolicy;

  useEffect(() => {
    if (policy) {
      form.reset({
        mode: policy.configuredMode,
        allowUntil: policy.allowUntil ? new Date(policy.allowUntil) : null,
        permissionGroupIds: policy.permissionGroupIds,
      });
    }
  }, [policy, form]);

  const onSubmit = form.handleSubmit((values) => {
    // Only the allow window has an end date and its own groups
    const allowing = values.mode === 'allow';

    save({
      variables: {
        mode: values.mode,
        allowUntil: allowing ? values.allowUntil : null,
        permissionGroupIds: allowing ? values.permissionGroupIds : [],
      },
      onCompleted: () => toast({ title: t('policy-saved'), variant: 'success' }),
      onError: (e) => toast({ title: e.message, variant: 'destructive' }),
    });
  });

  const allowEndedOn =
    policy?.configuredMode === 'allow' && policy.mode === 'approval'
      ? formatGrantEnd(policy.allowUntil)
      : '';

  return {
    form,
    mode: form.watch('mode'),
    available: policy?.available ?? false,
    allowEndedOn,
    loading,
    error,
    saving,
    onSubmit,
  };
};
