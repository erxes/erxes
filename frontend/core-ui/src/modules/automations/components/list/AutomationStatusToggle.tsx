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

/** The status as a coloured dot and a word, for dense lists. */
export const AutomationStatusDot = ({
  status,
  loading,
}: {
  status: string;
  loading?: boolean;
}) => {
  const { t } = useTranslation('automations');
  const isActive = status === 'active';

  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <span
        className={cn(
          'size-1.5 shrink-0 rounded-full',
          isActive ? 'bg-success' : 'bg-muted-foreground/50',
        )}
      />
      <span className={cn(!isActive && 'text-muted-foreground')}>
        {t(isActive ? 'active' : 'draft')}
      </span>
      {loading && <Spinner size="sm" containerClassName="flex-none" />}
    </span>
  );
};

export const AutomationStatusToggle = ({
  name,
  status,
  loading,
  setActive,
}: {
  name: string;
  status: string;
  loading: boolean;
  setActive: (isActive: boolean) => void;
}) => {
  const { t } = useTranslation('automations');

  return (
    <div className="w-full flex flex-col py-1 px-2 gap-1">
      <div className="flex gap-2">
        <AutomationStatusBadge status={status} />
        <Switch
          aria-label={t('status-switch-label', {
            name,
            defaultValue: 'Automation active: {{name}}',
          })}
          disabled={loading}
          checked={status === 'active'}
          onCheckedChange={setActive}
        />
      </div>
      {status === 'active' && (
        <p className="text-xs text-muted-foreground">
          {t(
            'status-switch-hint',
            'Turning this off stops new triggers from running.',
          )}
        </p>
      )}
    </div>
  );
};
