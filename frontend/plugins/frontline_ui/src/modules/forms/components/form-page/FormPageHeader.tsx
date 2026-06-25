import { useFormDetail } from '@/forms/hooks/useFormDetail';
import { IconForms } from '@tabler/icons-react';
import { Breadcrumb, Button, Separator, Skeleton } from 'erxes-ui';
import { Link, useParams } from 'react-router';
import { PageHeader } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const FormDetailsBreadcrumbItem = ({ formId }: { formId: string }) => {
  const { loading, formDetail } = useFormDetail({ formId });
  if (loading) return <Skeleton className="size-4" />;
  if (!formDetail) return null;
  return (
    <>
      <Breadcrumb.Separator />
      <Breadcrumb.Item>
        <Button variant="ghost">{formDetail.name}</Button>
      </Breadcrumb.Item>
    </>
  );
};

export const FormPageHeader = () => {
  const { t } = useTranslation('frontline');
  const { formId } = useParams<{ formId: string }>();
  return (
    <PageHeader>
      <PageHeader.Start>
        <Breadcrumb>
          <Breadcrumb.List className="gap-1">
            <Breadcrumb.Item>
              <Button variant="ghost" asChild>
                <Link to="/frontline/forms">
                  <IconForms />
                  {t('forms')}
                </Link>
              </Button>
            </Breadcrumb.Item>
            <FormDetailsBreadcrumbItem formId={formId || ''} />
          </Breadcrumb.List>
        </Breadcrumb>
        {!formId && (
          <>
            <Separator.Inline />
            <PageHeader.FavoriteToggleButton />
          </>
        )}
      </PageHeader.Start>
    </PageHeader>
  );
};
