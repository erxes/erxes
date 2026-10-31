import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryState } from 'erxes-ui';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { usePermissionGroupOptions } from '@/settings/ldap/hooks/usePermissionGroupOptions';
import {
  APPROVE_GRANT_QUERY_KEY,
  useSupportAccessGrants,
  useSupportGrantActions,
} from '@/settings/support-access/hooks/useSupportAccessGrants';
import {
  SUPPORT_GRANT_APPROVAL_SCHEMA,
  TSupportGrantApprovalForm,
} from '@/settings/support-access/schema';

const DEFAULT_HOURS = 4;

export const useSupportAccessApprove = () => {
  const [grantId, setGrantId] = useQueryState<string>(APPROVE_GRANT_QUERY_KEY);
  const { pending } = useSupportAccessGrants();
  const { options } = usePermissionGroupOptions();
  const { approve, busy } = useSupportGrantActions();
  const grant = pending.find((item) => item._id === grantId);

  // A setup visit needs to change settings, so every app's admin group starts picked
  const adminGroupIds = useMemo(
    () =>
      options
        .filter((option) => option.value.endsWith(':admin'))
        .map((option) => option.value),
    [options],
  );

  const form = useForm<TSupportGrantApprovalForm>({
    resolver: zodResolver(SUPPORT_GRANT_APPROVAL_SCHEMA),
    defaultValues: { hours: DEFAULT_HOURS, permissionGroupIds: [] },
  });

  const grantKey = grant?._id;

  useEffect(() => {
    if (grantKey) {
      form.reset({ hours: DEFAULT_HOURS, permissionGroupIds: adminGroupIds });
    }
  }, [grantKey, adminGroupIds, form]);

  const close = () => setGrantId(null);

  const onSubmit = form.handleSubmit((values) => {
    if (grant) {
      approve({ _id: grant._id, ...values }, close);
    }
  });

  return { grant, form, options, approving: busy, onSubmit, close };
};
