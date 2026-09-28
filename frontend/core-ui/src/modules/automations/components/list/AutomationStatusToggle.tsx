import { AUTOMATION_EDIT } from '@/automations/graphql/automationMutations';
import { ApolloError, useMutation } from '@apollo/client';
import { Badge, cn, Spinner, Switch, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

/**
 * Active/draft switching shared by the table's inline cell and the card.
 * The mutation returns _id and status, so Apollo normalization refreshes both
 * surfaces without a refetch.
 */
export const useAutomationStatusToggle = (
  automationId: string,
  onCompleted?: () => void,
) => {
  const [edit, { loading }] = useMutation(AUTOMATION_EDIT);
  const { toast } = useToast();
  const { t } = useTranslation('automations');

  const setActive = (isActive: boolean) =>
    edit({
      variables: { id: automationId, status: isActive ? 'active' : 'draft' },
      onCompleted: () => {
        onCompleted?.();
        toast({
          title: t('success'),
          description: t('status-updated'),
          variant: 'success',
        });
      },
      onError: (error: ApolloError) =>
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        }),
    });

  return { setActive, loading };
};

export const AutomationStatusBadge = ({
  status,
  loading,
  className,
}: {
  status: string;
  loading?: boolean;
  className?: string;
}) => (
  <Badge
    variant={status === 'active' ? 'success' : 'secondary'}
    className={cn(
      'font-bold',
      { 'text-accent-foreground': status !== 'active' },
      className,
    )}
  >
    {status}
    {loading && <Spinner />}
  </Badge>
);

export const AutomationStatusToggle = ({
  status,
  loading,
  setActive,
}: {
  status: string;
  loading: boolean;
  setActive: (isActive: boolean) => void;
}) => (
  <div className="w-full flex h-full py-1 px-2 gap-2">
    <AutomationStatusBadge status={status} />
    <Switch
      disabled={loading}
      checked={status === 'active'}
      onCheckedChange={setActive}
    />
  </div>
);
