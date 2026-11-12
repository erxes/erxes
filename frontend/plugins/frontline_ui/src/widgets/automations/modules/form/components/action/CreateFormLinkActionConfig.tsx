import { Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { AutomationActionNodeConfigProps } from 'ui-modules';
import { useFormDetail } from '@/forms/hooks/useFormDetail';
import { TCreateFormLinkActionForm } from '../../states/createFormLinkActionForm';

export const CreateFormLinkActionConfig = ({
  config,
}: AutomationActionNodeConfigProps<TCreateFormLinkActionForm>) => {
  const { t } = useTranslation('frontline');
  const { formDetail, loading } = useFormDetail({ formId: config?.formId || '' });
  const days = config?.expiresInDays || '30';

  return (
    <div className="flex flex-col gap-1 text-xs">
      <p className="truncate">
        {t('form', 'Form')}:{' '}
        {loading ? (
          <Skeleton className="inline-block w-20 h-3" />
        ) : (
          formDetail?.name || formDetail?.title || config?.formId || '-'
        )}
      </p>
      <p className="text-muted-foreground">
        {t('link-expires-in-days', 'Link valid for (days)')}: {days}
      </p>
    </div>
  );
};
