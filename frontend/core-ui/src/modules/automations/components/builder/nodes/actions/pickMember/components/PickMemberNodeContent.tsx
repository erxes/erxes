import { NodeContentComponentProps } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { useTranslation } from 'react-i18next';
import { TPickMemberConfigForm } from '../states/pickMemberConfigForm';

export const PickMemberNodeContent = ({
  config,
}: NodeContentComponentProps<TPickMemberConfigForm>) => {
  const { t } = useTranslation('automations');
  const count = (config?.candidateIds || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean).length;

  if (!count) {
    return (
      <p className="text-xs text-muted-foreground italic">
        {t('pick-member-not-configured', 'No team members chosen')}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1 text-xs">
      <p>
        {config?.method === 'random'
          ? t('pick-member-random', 'At random')
          : t('pick-member-round-robin', 'Take turns')}
        {' · '}
        {t('pick-member-count', '{{count}} members', { count })}
      </p>
      {config?.fallbackUserId ? (
        <p className="text-muted-foreground">
          {t('pick-member-has-fallback', 'Has a fallback member')}
        </p>
      ) : null}
    </div>
  );
};
