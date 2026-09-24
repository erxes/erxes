import { useFormDetail } from '@/forms/hooks/useFormDetail';
import { IconForms } from '@tabler/icons-react';
import {
  Breadcrumb,
  Button,
  Separator,
  Skeleton,
  useIsMatchingLocation,
} from 'erxes-ui';
import { Link, useParams } from 'react-router';
import { PageHeader, createFavoriteBreadcrumb } from 'ui-modules';
import { useTranslation } from 'react-i18next';
import { FormsCreateButton } from './forms-create';
import { FrontlinePaths } from '@/types/FrontlinePaths';

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
  const isMatchingLocation = useIsMatchingLocation('/frontline');
  const isCreateRoute = isMatchingLocation(FrontlinePaths.FormCreate);
  const isFormsListRoute = !formId && !isCreateRoute;
  const favoriteBreadcrumb = createFavoriteBreadcrumb(
    'Frontline',
    t('forms', 'Forms'),
  );

  return (
    <PageHeader>
      <PageHeader.Start>
        <Breadcrumb>
          <Breadcrumb.List className="gap-1">
            <Breadcrumb.Item>
              <Button variant="ghost" asChild>
                <Link to="/frontline/forms">
                  <IconForms />
                  {t('forms', 'Forms')}
                </Link>
              </Button>
            </Breadcrumb.Item>
            {isCreateRoute ? (
              <>
                <Breadcrumb.Separator />
                <Breadcrumb.Item>
                  <Button variant="ghost">
                    {t('create-form', 'Create form')}
                  </Button>
                </Breadcrumb.Item>
              </>
            ) : (
              <FormDetailsBreadcrumbItem formId={formId || ''} />
            )}
          </Breadcrumb.List>
        </Breadcrumb>
        {isFormsListRoute && (
          <>
            <Separator.Inline />
            <PageHeader.FavoriteToggleButton
              breadcrumb={favoriteBreadcrumb}
              icon="IconBook"
            />
          </>
        )}
      </PageHeader.Start>
      {isFormsListRoute && (
        <PageHeader.End>
          <FormsCreateButton />
        </PageHeader.End>
      )}
    </PageHeader>
  );
};
