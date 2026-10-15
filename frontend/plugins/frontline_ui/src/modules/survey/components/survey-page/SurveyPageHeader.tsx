import { IconChartBar } from '@tabler/icons-react';
import { Breadcrumb, Button, Separator, useIsMatchingLocation } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PageHeader, createFavoriteBreadcrumb } from 'ui-modules';
import { SurveysCreateButton } from '@/survey/components/survey-page/surveys-create';
import { FrontlinePaths } from '@/types/FrontlinePaths';

export const SurveyPageHeader = () => {
  const { t } = useTranslation('frontline');
  const isMatchingLocation = useIsMatchingLocation('/frontline');
  const isCreateRoute = isMatchingLocation(FrontlinePaths.SurveyCreate);
  const favoriteBreadcrumb = createFavoriteBreadcrumb(
    'Frontline',
    t('surveys', 'Surveys'),
  );

  return (
    <PageHeader>
      <PageHeader.Start>
        <Breadcrumb>
          <Breadcrumb.List className="gap-1">
            <Breadcrumb.Item>
              <Button variant="ghost" asChild>
                <Link to="/frontline/surveys">
                  <IconChartBar />
                  {t('surveys', 'Surveys')}
                </Link>
              </Button>
            </Breadcrumb.Item>
            {isCreateRoute && (
              <>
                <Breadcrumb.Separator />
                <Breadcrumb.Item>
                  <Button variant="ghost">
                    {t('create-survey', 'Create survey')}
                  </Button>
                </Breadcrumb.Item>
              </>
            )}
          </Breadcrumb.List>
        </Breadcrumb>
        {!isCreateRoute && (
          <>
            <Separator.Inline />
            <PageHeader.FavoriteToggleButton
              breadcrumb={favoriteBreadcrumb}
              icon="IconChartBar"
            />
          </>
        )}
      </PageHeader.Start>
      {!isCreateRoute && (
        <PageHeader.End>
          <SurveysCreateButton />
        </PageHeader.End>
      )}
    </PageHeader>
  );
};
